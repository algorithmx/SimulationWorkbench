import React, { useState, useCallback, useRef } from 'react';

export function MenuBar({ toolOptions, onUpdateToolOptions, tables, onUpdateTables }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [editableOptions, setEditableOptions] = useState(toolOptions);
    const [newTool, setNewTool] = useState('');

    // Move the exportStateToJSON function here
    const exportStateToJSON = useCallback(() => {
        const state = {
            toolOptions,
            tables
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
    }, [toolOptions, tables]);

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
                    if (importedState.toolOptions && importedState.tables) {
                        onUpdateToolOptions(importedState.toolOptions);
                        onUpdateTables(importedState.tables);
                        alert('State imported successfully!');
                    } else {
                        alert('Invalid JSON structure');
                    }
                } catch (error) {
                    alert('Error parsing JSON: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    }, [onUpdateToolOptions, onUpdateTables]);

    const handleToggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
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
        setIsDropdownOpen(false);
    };

    return (
        <nav className="menu-bar">
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
            <div className="dropdown">
                <button onClick={handleToggleDropdown}>Modify Tool Options</button>
                {isDropdownOpen && (
                    <div className="dropdown-content">
                        {editableOptions.map((option, index) => (
                            <input
                                key={index}
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                            />
                        ))}
                        <input
                            type="text"
                            value={newTool}
                            onChange={handleNewToolChange}
                            placeholder="Add new tool"
                        />
                        <button onClick={handleSaveChanges}>Save Changes</button>
                    </div>
                )}
            </div>
        </nav>
    );
}

