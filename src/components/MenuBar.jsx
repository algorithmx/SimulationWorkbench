/*
 * This file is part of `Simulation Workbench`.
 * 
 * `Simulation Workbench` is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * `Simulation Workbench` is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with `Simulation Workbench`.  If not, see <https://www.gnu.org/licenses/>.
 * 
 * Copyright (C) [2024] [Yunlong Lian]
*/


import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createParameterGrid, ParamInputRow } from '../utils/ParameterGridUtils';
import 'highlight.js/styles/atom-one-dark.css';

export function MenuBar({ tables, toolOptions, toolScripts, onUpdateToolOptions, onUpdateTables, onUpdateToolScript, workspaceTitle, onUpdateWorkspaceTitle, onUpdateSystemMessage }) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [editableOptions, setEditableOptions] = useState(toolOptions);
    const [newTool, setNewTool] = useState('');
    const exportStateToJSON = useCallback(() => {
        const state = { toolOptions, tables, toolScripts, workspaceTitle };
        const jsonString = JSON.stringify(state, null, 2);
        
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        // Use workspaceTitle for the filename, fallback to 'workspace' if empty
        const filename = (workspaceTitle.trim() || 'workspace').replace(/\s+/g, '_').toLowerCase();
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [toolOptions, tables, toolScripts, workspaceTitle]);

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
                    if (importedState.toolOptions && importedState.tables && importedState.toolScripts && importedState.workspaceTitle) {
                        onUpdateToolOptions(importedState.toolOptions);
                        onUpdateTables(importedState.tables);
                        Object.entries(importedState.toolScripts).forEach(([tool, script]) => {
                            onUpdateToolScript(tool, script.script, script.language);
                        });
                        onUpdateWorkspaceTitle(importedState.workspaceTitle);
                        onUpdateSystemMessage(`Workspace "${importedState.workspaceTitle}" loaded successfully from file "${file.name}"!`);
                    } else {
                        alert('Invalid JSON structure');
                    }
                } catch (error) {
                    alert('Error parsing JSON: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    }, [onUpdateToolOptions, onUpdateTables, onUpdateToolScript, onUpdateWorkspaceTitle, onUpdateSystemMessage]);

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

    const handleEditScript = useCallback((tool) => {
        const { script, language } = toolScripts[tool] || { script: '', language: 'python' };
        const editorWindow = window.open('', 'Script Editor', 'width=800,height=600');
        if (editorWindow) {
            editorWindow.document.write(`
                <html>
                    <head>
                        <title>Edit Script for ${tool}</title>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css">
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
                        <style>
                            body { font-family: Arial, sans-serif; background-color: #1e1e1e; color: #d4d4d4; }
                            #scriptEditor { width: 100%; height: 60vh; background-color: #2d2d2d; color: #d4d4d4; border: 1px solid #3c3c3c; }
                            #highlightedCode { width: 100%; height: 60vh; overflow: auto; background-color: #282c34; }
                            select, button { margin: 10px 0; padding: 5px; background-color: #3c3c3c; color: #d4d4d4; border: none; }
                            button:hover { background-color: #4c4c4c; }
                        </style>
                    </head>
                    <body>
                        <h2>Edit Script for ${tool}</h2>
                        <select id="languageSelect" onchange="updateHighlight()">
                            <option value="python" ${language === 'python' ? 'selected' : ''}>Python</option>
                            <option value="julia" ${language === 'julia' ? 'selected' : ''}>Julia</option>
                            <option value="tcl" ${language === 'tcl' ? 'selected' : ''}>Tcl</option>
                            <option value="bash" ${language === 'bash' ? 'selected' : ''}>Bash</option>
                        </select>
                        <textarea id="scriptEditor" oninput="updateHighlight()">${script}</textarea>
                        <pre><code id="highlightedCode"></code></pre>
                        <button onclick="saveScript()">Save</button>
                        <button onclick="window.close()">Cancel</button>
                        <script>
                            function updateHighlight() {
                                const code = document.getElementById('scriptEditor').value;
                                const language = document.getElementById('languageSelect').value;
                                const highlightedCode = hljs.highlight(code, {language: language}).value;
                                document.getElementById('highlightedCode').innerHTML = highlightedCode;
                            }
                            function saveScript() {
                                const script = document.getElementById('scriptEditor').value;
                                const language = document.getElementById('languageSelect').value;
                                window.opener.postMessage({ type: 'SAVE_SCRIPT', tool: '${tool}', script: script, language: language }, '*');
                                window.close();
                            }
                            function handleTabKey(e) {
                                if (e.key === 'Tab') {
                                    e.preventDefault();
                                    const start = this.selectionStart;
                                    const end = this.selectionEnd;
                                    const spaces = '    ';
                                    this.value = this.value.substring(0, start) + spaces + this.value.substring(end);
                                    this.selectionStart = this.selectionEnd = start + spaces.length;
                                    updateHighlight();
                                }
                            }
                            const scriptEditor = document.getElementById('scriptEditor');
                            scriptEditor.addEventListener('keydown', handleTabKey);
                            hljs.highlightAll();
                            updateHighlight();
                        </script>
                    </body>
                </html>
            `);
        }
    }, [toolScripts]);

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data.type === 'SAVE_SCRIPT') {
                onUpdateToolScript(event.data.tool, event.data.script, event.data.language);
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
        const newTable = createParameterGrid(localParamValues, toolOptions[0], tables.length + 1);
        if (newTable) {
            onUpdateTables([...tables, newTable]);
            setIsParamGridPopupOpen(false);
        }
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

