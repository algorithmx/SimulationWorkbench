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


import React, { useState, useCallback, useRef } from 'react';
import { createParameterGrid, ParamInputRow } from '../utils/ParameterGridUtils';
import 'highlight.js/styles/atom-one-dark.css';
import { ScriptEditor } from './ScriptEditor';

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
        setCurrentEditingTool(null); // Add this line to close the "Edit Script" popup when toggling the main popup
    };

    const handleOptionChange = (toolName, field, value) => {
        setEditableOptions(prevOptions => ({
            ...prevOptions,
            [toolName]: field === 'name' 
                ? { ...prevOptions[toolName], [value]: prevOptions[toolName] }
                : (typeof value === 'string' ? value : JSON.stringify(value))
        }));
    };

    const handleSaveChanges = () => {
        const updatedOptions = Object.entries(editableOptions)
            .filter(([toolName, description]) => 
                toolName.trim() !== '' && 
                (typeof description === 'string' ? description.trim() !== '' : true)
            )
            .reduce((acc, [toolName, description]) => {
                acc[toolName] = description;
                return acc;
            }, {});

        if (newTool.name && newTool.name.trim() !== '' && newTool.description && newTool.description.trim() !== '') {
            updatedOptions[newTool.name.trim()] = newTool.description.trim();
        }

        onUpdateToolOptions(updatedOptions);
        setIsPopupOpen(false);
        setCurrentEditingTool(null); // Add this line to close the "Edit Script" popup
    };

    const [currentEditingTool, setCurrentEditingTool] = useState(null);

    const handleEditScript = useCallback((tool) => {
        setCurrentEditingTool(tool);
    }, []);

    const handleSaveScript = useCallback((tool, script, language) => {
        onUpdateToolScript(tool, script, language);
        setCurrentEditingTool(null);
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
        const newTable = createParameterGrid(localParamValues, Object.keys(toolOptions)[0], tables.length + 1);
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
                        {Object.entries(editableOptions).map(([toolName, description]) => (
                            <div key={toolName} className="tool-option-row">
                                <input
                                    type="text"
                                    value={toolName}
                                    onChange={(e) => handleOptionChange(toolName, 'name', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => handleOptionChange(toolName, 'description', e.target.value)}
                                />
                                <button onClick={() => handleEditScript(toolName)}>Edit Script</button>
                            </div>
                        ))}
                        <input
                            type="text"
                            value={newTool.name}
                            onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                            placeholder="Add new tool name"
                        />
                        <input
                            type="text"
                            value={newTool.description}
                            onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                            placeholder="Add new tool description"
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
            {currentEditingTool && (
                <ScriptEditor
                    tool={currentEditingTool}
                    script={toolScripts[currentEditingTool]?.script || ''}
                    language={toolScripts[currentEditingTool]?.language || 'python'}
                    onSave={handleSaveScript}
                />
            )}
        </>
    );
}

