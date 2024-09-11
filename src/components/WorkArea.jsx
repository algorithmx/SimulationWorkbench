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


import React, { useState } from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import { ToolFlowTable } from './ToolFlowTable';
import { useToolFlowTables } from '../hooks/useToolFlowTables';

export function WorkArea({tables, toolOptions, toolScripts, setTables, workspaceTitle, setWorkspaceTitle}) {
    const {
        handleCellChange,
        handleAddColumn,
        handleDeleteColumn,
        handleAddTable,
        handleDeleteTable,
        handleAddRow,
        handleDeleteRow,
        handleAddRowAbove,
        handleHashClick,
        maxRows,
    } = useToolFlowTables({tables, setTables, toolOptions, toolScripts});

    const [runningRows, setRunningRows] = useState({});

    const toggleRowExecution = (rowIndex) => {
        setRunningRows(prev => ({
            ...prev,
            [rowIndex]: !prev[rowIndex]
        }));
    };

    const runRow = (rowIndex) => {
        console.log(`Running row ${rowIndex}`);
        toggleRowExecution(rowIndex);
        // Implement row execution logic here
    };

    const stopRow = (rowIndex) => {
        console.log(`Stopping row ${rowIndex}`);
        toggleRowExecution(rowIndex);
        // Implement row stopping logic here
    };

    const handleContextMenu = (e, data) => {
        console.log(`Right-click on cell: row ${data.rowIndex}, column ${data.colIndex}`);
        // Add your context menu actions here
    };

    const handleToolFlowCellAction = (e, data) => {
        console.log(`Tool flow cell action on table ${data.tableId}`);
        // Add your tool flow cell context menu actions here
    };

    return (
        <section className="work-area">
            <input 
                type="text"
                className="workspace-title-input"
                value={workspaceTitle}
                onChange={(e) => setWorkspaceTitle(e.target.value)}
            />
            <div className="tool-flow-wrapper">
                <div className="index-column">
                    <div className="index-cell">Tools</div>
                    <div className="index-cell">Params</div>
                    {[...Array(maxRows - 2)].map((_, index) => (
                        <ContextMenuTrigger key={index} id="index-cell-menu" collect={() => ({ rowIndex: index + 2 })}>
                            <div className="index-cell">
                                <span>{index + 1}</span>
                                <button 
                                    className={`row-execution-btn ${runningRows[index + 2] ? 'stop' : 'play'}`}
                                    onClick={() => runningRows[index + 2] ? stopRow(index + 2) : runRow(index + 2)}
                                >
                                    {runningRows[index + 2] ? '⏹' : '▶'}
                                </button>
                            </div>
                        </ContextMenuTrigger>
                    ))}
                    <div className="index-cell">
                        <button className="add-row-btn" onClick={handleAddRow}>+</button>
                    </div>
                </div>
                <div className="tables-container">
                    {tables.map(table => (
                        <div key={table.id} className="table-container">
                            <ToolFlowTable
                                data={table.data}
                                onCellChange={(rowIndex, colIndex, value) =>
                                    handleCellChange(table.id, rowIndex, colIndex, value)
                                }
                                onAddColumn={(columnIndex) => handleAddColumn(table.id, columnIndex)}
                                onDeleteColumn={(columnIndex) => handleDeleteColumn(table.id, columnIndex)}
                                onAddTable={() => handleAddTable(table)}
                                onDeleteTable={() => handleDeleteTable(table.id)}
                                isOnlyTable={tables.length === 1}
                                onContextMenu={handleContextMenu}
                                handleHashClick={handleHashClick}
                                toolOptions={toolOptions}
                                tableId={table.id}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <ContextMenu id="cell-context-menu">
                <MenuItem onClick={handleContextMenu}>
                    Context Menu Item 1
                </MenuItem>
                <MenuItem onClick={handleContextMenu}>
                    Context Menu Item 2
                </MenuItem>
            </ContextMenu>
            <ContextMenu id="index-cell-menu">
                <MenuItem onClick={(e, data) => handleAddRowAbove(data.rowIndex)}>
                    Add Row Above
                </MenuItem>
                <MenuItem onClick={(e, data) => handleDeleteRow(data.rowIndex)}>
                    Remove Row
                </MenuItem>
            </ContextMenu>
            <ContextMenu id="tool-flow-cell-menu">
                <MenuItem onClick={handleToolFlowCellAction}>
                    Reserved Item 1
                </MenuItem>
                <MenuItem onClick={handleToolFlowCellAction}>
                    Reserved Item 2
                </MenuItem>
            </ContextMenu>
        </section>
    );
}