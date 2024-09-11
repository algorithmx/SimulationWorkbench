import React, { useState, useCallback, useRef, useEffect } from 'react';

export function MenuBar({ tables, toolOptions, toolScripts, onUpdateToolOptions, onUpdateTables, onUpdateToolScript }) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [editableOptions, setEditableOptions] = useState(toolOptions);
    const [newTool, setNewTool] = useState('');
    // Remove the following line:
    // const [selectedTool, setSelectedTool] = useState(null);

    // Move the exportStateToJSON function here
    const exportStateToJSON = useCallback(() => {
        const state = {
            toolOptions,
            tables,
            toolScripts
        };
        const jsonString = JSON.stringify(state, null, 2);
        
        // Create a Blob with the JSON data
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create a link and trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'app-state.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [toolOptions, tables, toolScripts]);

    const fileInputRef = useRef(null);

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const importStateFromJSON = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedState = JSON.parse(e.target.result);
                    if (importedState.toolOptions && importedState.tables && importedState.toolScripts) {
                        onUpdateToolOptions(importedState.toolOptions);
                        onUpdateTables(importedState.tables);
                        Object.entries(importedState.toolScripts).forEach(([tool, script]) => {
                            onUpdateToolScript(tool, script);
                        });
                    } else {
                        alert('Invalid JSON structure');
                    }
                } catch (error) {
                    alert('Error parsing JSON: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    }, [onUpdateToolOptions, onUpdateTables, onUpdateToolScript]);

    const handleTogglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
        setEditableOptions(toolOptions);
        setNewTool('');
    };

    const handleOptionChange = (index, value) => {
        const updatedOptions = [...editableOptions];
        updatedOptions[index] = value;
        setEditableOptions(updatedOptions);
    };

    const handleNewToolChange = (e) => {
        setNewTool(e.target.value);
    };

    const handleSaveChanges = () => {
        const filteredOptions = editableOptions.filter(option => option.trim() !== '');
        const updatedOptions = [...filteredOptions];
        if (newTool.trim() !== '') {
            updatedOptions.push(newTool.trim());
        }
        onUpdateToolOptions(updatedOptions);
        setIsPopupOpen(false);
    };

    const handleEditScript = (tool) => {
        // Remove the following line:
        // setSelectedTool(tool);
        const script = toolScripts[tool] || '';
        const editorWindow = window.open('', 'Script Editor', 'width=800,height=600');
        editorWindow.document.write(`
            <html>
                <head>
                    <title>Edit Script for ${tool}</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        textarea { width: 100%; height: 80vh; }
                    </style>
                </head>
                <body>
                    <h2>Edit Script for ${tool}</h2>
                    <textarea id="scriptEditor">${script}</textarea>
                    <br>
                    <button onclick="saveScript()">Save</button>
                    <button onclick="window.close()">Cancel</button>
                    <script>
                        function saveScript() {
                            const script = document.getElementById('scriptEditor').value;
                            window.opener.postMessage({ type: 'SAVE_SCRIPT', tool: '${tool}', script: script }, '*');
                            window.close();
                        }
                    </script>
                </body>
            </html>
        `);
    };

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data.type === 'SAVE_SCRIPT') {
                onUpdateToolScript(event.data.tool, event.data.script);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onUpdateToolScript]);

    const [isParamGridPopupOpen, setIsParamGridPopupOpen] = useState(false);
    const [localParamValues, setLocalParamValues] = useState([]);

    const handleToggleParamGridPopup = () => {
        setIsParamGridPopupOpen(!isParamGridPopupOpen);
        setLocalParamValues([]);
    };

    const handleParamChange = (index, field, value) => {
        setLocalParamValues(prevValues => {
            const newValues = [...prevValues];
            newValues[index] = { ...newValues[index], [field]: value };
            return newValues;
        });
    };

    const addParameter = () => {
        setLocalParamValues(prevValues => [...prevValues, { name: '', value: '' }]);
    };

    const handleCreateParamGrid = () => {
        const validParams = localParamValues.filter(param => param.name.trim() !== '' && param.value.trim() !== '');
        
        if (validParams.length === 0) {
            alert('Please add at least one parameter with both name and value.');
            return;
        }

        const gridData = [
            [{ value: toolOptions[0], colspan: validParams.length }], // Default tool name
            validParams.map(param => param.name),
            ...generateCombinations(validParams)
        ];

        const newTable = {
            id: tables.length + 1,
            data: gridData
        };

        onUpdateTables([...tables, newTable]);
        setIsParamGridPopupOpen(false);
    };

    const generateCombinations = (paramValues) => {
        const values = paramValues.map(param => param.value.split(',').map(s => s.trim()));
        return cartesianProduct(values);
    };

    const cartesianProduct = (arrays) => {
        return arrays.reduce((acc, array) => (
            acc.flatMap(x => array.map(y => [...x, y]))
        ), [[]]);
    };

    return (
        <>
            <nav className="menu-bar">
                <button onClick={handleToggleParamGridPopup}>Create param grid</button>
                <button>Button 1</button>
                <button onClick={exportStateToJSON}>Export State</button>
                <button onClick={handleImportClick}>Import State</button>
                <input
                    type="file"
                    accept=".json"
                    onChange={importStateFromJSON}
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                />
                <button onClick={handleTogglePopup}>Modify Tool Options</button>
            </nav>
            {isPopupOpen && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Modify Tool Options</h2>
                        {editableOptions.map((option, index) => (
                            <div key={index} className="tool-option-row">
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                />
                                <button onClick={() => handleEditScript(option)}>Edit Script</button>
                            </div>
                        ))}
                        <input
                            type="text"
                            value={newTool}
                            onChange={handleNewToolChange}
                            placeholder="Add new tool"
                        />
                        <div className="popup-buttons">
                            <button onClick={handleSaveChanges}>Save Changes</button>
                            <button onClick={handleTogglePopup}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {isParamGridPopupOpen && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Create Parameter Grid</h2>
                        {localParamValues.map((param, index) => (
                            <ParamInputRow
                                key={index}
                                param={param}
                                onChange={(field, value) => handleParamChange(index, field, value)}
                            />
                        ))}
                        <button onClick={addParameter}>Add Parameter</button>
                        <div className="popup-buttons">
                            <button onClick={handleCreateParamGrid}>Create Grid</button>
                            <button onClick={handleToggleParamGridPopup}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {/* You can add a new component here for the script editor */}
        </>
    );
}

function ParamInputRow({ param, onChange }) {
    return (
        <div className="param-input-row">
            <input
                type="text"
                value={param.name}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="Parameter name"
                autoComplete="off"
            />
            <input
                type="text"
                value={param.value}
                onChange={(e) => onChange('value', e.target.value)}
                placeholder="Values (comma-separated)"
                autoComplete="off"
            />
        </div>
    );
}

