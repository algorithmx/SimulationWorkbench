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


import { useState, useCallback, useRef } from 'react';
import { createParameterGrid, ParamInputRow } from '../utils/ParameterGridUtils';
import 'highlight.js/styles/atom-one-dark.css';
import { ScriptEditor } from './ScriptEditor';
import { Tool } from '../utils/Tool';
import { SimulationProject } from '../utils/SimulationProject';

interface MenuBarProps {
    tables: SimulationProject; 
    tools: Tool[];
    onUpdateTables: (tables: any) => void;
    onUpdateTools: (tools: Tool[]) => void;
    onUpdateWorkspaceTitle: (title: string) => void;
    onUpdateSystemMessage: (message: string) => void;
}

interface ParamValue {
    name: string;
    value: string;
}

export function MenuBar({
    tables,
    tools,
    onUpdateTables,
    onUpdateTools,
    onUpdateWorkspaceTitle,
    onUpdateSystemMessage
}: MenuBarProps) {
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
    const [editableOptions, setEditableOptions] = useState<{ [key: string]: Tool }>({});
    const [newTool, setNewTool] = useState<Tool>(new Tool('', '', '', 'python'));

    const exportStateToJSON = useCallback(() => {
        const state = { tools, tables, workspaceTitle: tables.getName() };
        const jsonString = JSON.stringify(state, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Use workspaceTitle for the filename, fallback to 'workspace' if empty
        const filename = (tables.getName().trim() || 'workspace').replace(/\s+/g, '_').toLowerCase();
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [tables, tools, tables.getName()]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const importStateFromJSON = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedState = JSON.parse(e.target?.result as string);
                    if (importedState.tools && importedState.tables && importedState.workspaceTitle) {
                        onUpdateTools(importedState.tools);
                        onUpdateTables(importedState.tables);
                        onUpdateWorkspaceTitle(importedState.workspaceTitle);
                        onUpdateSystemMessage(`Workspace "${importedState.workspaceTitle}" loaded successfully from file "${file.name}"!`);
                    } else {
                        throw new Error('Invalid JSON structure');
                    }
                } catch (error: any) {
                    alert('Error parsing JSON: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    }, []);

    const handleTogglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
        setEditableOptions(Object.fromEntries(tools.map(tool => [tool.name, tool])));
        setNewTool(new Tool('', '', '', 'python'));
        setCurrentEditingTool(null); // Add this line to close the "Edit Script" popup when toggling the main popup
    };

    const handleOptionChange = (tool: Tool, field: string, value: string) => {
        setEditableOptions(prevOptions => ({
            ...prevOptions,
            [tool.name]: { ...tool, [field]: value }
        }));
    };

    const handleSaveChanges = () => {
        const updatedTools = Object.values(editableOptions).filter(tool => 
            tool.name.trim() !== '' && tool.description.trim() !== ''
        );

        if (newTool.name.trim() !== '' && newTool.description.trim() !== '') {
            updatedTools.push(newTool);
        }

        onUpdateTools(updatedTools);
        setIsPopupOpen(false);
        setCurrentEditingTool(null);
    };

    const [currentEditingTool, setCurrentEditingTool] = useState<Tool | null>(null);

    const handleEditScript = useCallback((tool: Tool) => {
        setCurrentEditingTool(tool);
    }, []);

    const handleSaveScript = useCallback((tool: Tool, script: string, language: string) => {
        const updatedTool = { ...tool, scripts: script, language };
        onUpdateTools(tools.map(t => t.name === tool.name ? updatedTool : t));
        setCurrentEditingTool(null);
    }, [onUpdateTools, tools]);

    const [isParamGridPopupOpen, setIsParamGridPopupOpen] = useState(false);
    const [localParamValues, setLocalParamValues] = useState<ParamValue[]>([]);

    const handleToggleParamGridPopup = () => {
        setIsParamGridPopupOpen(!isParamGridPopupOpen);
        setLocalParamValues([]);
    };

    const handleParamChange = (index: number, field: keyof ParamValue, value: string) => {
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
        const newTable = createParameterGrid(localParamValues, Object.keys(tools)[0], tables.getNumberOfRows() + 1);
        if (newTable) {
            onUpdateTables(newTable);
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
                        {tools.map((tool) => (
                            <div key={tool.name} className="tool-option-row">
                                <input
                                    type="text"
                                    value={tool.name}
                                    onChange={(e) => handleOptionChange(tool, 'name', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={tool.description}
                                    onChange={(e) => handleOptionChange(tool, 'description', e.target.value)}
                                />
                                <button onClick={() => handleEditScript(tool)}>Edit Script</button>
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
                                onChange={(field: keyof ParamValue, value: string) => handleParamChange(index, field, value)}
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
                    tool={currentEditingTool.name}
                    script={currentEditingTool.scripts}
                    language={currentEditingTool.language}
                    onSave={(script: string, language: string) => handleSaveScript(currentEditingTool, script, language)}
                    onClose={() => setCurrentEditingTool(null)}
                />
            )}
        </>
    );
}

