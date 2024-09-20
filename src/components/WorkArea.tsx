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

import React, { useState, useCallback, useEffect } from 'react';
import {
    ReactGrid, Column, Row, CellChange, DefaultCellTypes,
    Id, HeaderCell, TextCell, NumberCell, DropdownCell,
    MenuOption, CellLocation, SelectionMode,
    NumberCellTemplate, TextCellTemplate, DropdownCellTemplate,
    ReactGridProps, CellTemplate, Compatible, Uncertain, CellTemplates
} from '@silevis/reactgrid';
import '@silevis/reactgrid/styles.css';
import { SimulationProject, AllCellTypes, CustomRow, toIndexes } from '../utils/SimulationProject';
import { Table, ToolCell } from '../utils/Table';
import { Tool } from '../utils/Tool';
import { MenuBar, MenuBarProps } from './MenuBar';
const MemoizedMenuBar = React.memo(MenuBar);

export const AllCellTemplates: CellTemplates = {
    'number': new NumberCellTemplate(),
    'text': new TextCellTemplate(),
    'dropdown': new DropdownCellTemplate(),
}

interface WorkAreaProps {
    onDataChange: (newData: SimulationProject | null) => void;
    onMessage: (message: string) => void;
}

function getCellChangeString(change: CellChange<AllCellTypes>): string {
    const { rowId, columnId, newCell } = change;
    if (newCell.type === 'text') {
        return `(${rowId},${columnId})[${newCell.text}]`;
    } else if (newCell.type === 'number') {
        return `(${rowId},${columnId})[${newCell.value.toString()}]`;
    } else if (newCell.type === 'dropdown') {
        return `(${rowId},${columnId})[${newCell.selectedValue},${newCell.isOpen}]`;
    } else {
        return `(${rowId},${columnId})[??]`;
    }
}

function genStartingSim(tools: Tool[]): SimulationProject {
    return new SimulationProject("Workspace", tools)
        .addTable(
            new Table(
                Date.now(),
                [
                    [{ toolname: tools[0].name, colspan: 3, isOpen: false }],
                    ['P1', 'P2', 'P3'],
                    ['', '', ''],
                    ['', '', ''],
                ]))
        .addTable(
            new Table(
                Date.now(),
                [
                    [{ toolname: tools[0].name, colspan: 2, isOpen: false }],
                    ['P4', 'P5'],
                    ['', ''],
                    ['', ''],
                ])
        );
}

export function WorkArea({
    onDataChange,
    onMessage
}: WorkAreaProps) {

    // The implementations of tools, setTools should NEVER be modified.
    const [tools, setTools] = useState<Tool[]>([
        new Tool('Tool A', '', '', 'python'),
        new Tool('Tool B', '', '', 'python'),
        new Tool('Tool C', '', '', 'python'),
    ]);
    // The implementations of simProj, setSimProj should NEVER be modified.
    const [simProj, setSimProj] = useState<SimulationProject>(genStartingSim(tools));
    const [localTitle, setLocalTitle] = useState(simProj.getName());
    const [localAuthor, setLocalAuthor] = useState(simProj.getAuthor());
    const [localVersion, setLocalVersion] = useState(simProj.getVersion());
    const [columns, setColumns] = useState<Column[]>(simProj.getColumns());
    const [rows, setRows] = useState<CustomRow[]>(simProj.getRows());
    const [focusCell, setFucusCell] = useState<CellLocation | null>(null);

    // Use useEffect to notify parent about data change
    useEffect(() => {
        if (simProj) {
            const { columns: newColumns, rows: newRows } = simProj.getColumnsAndRows();
            setColumns(newColumns);
            setRows(newRows);
            onDataChange(simProj);
        }
    }, [simProj]);

    const handleChanges = (changes: CellChange<DefaultCellTypes>[]) => {
        setSimProj((prev: SimulationProject) => {
            const updatedProj = prev.applyChanges(changes as CellChange<AllCellTypes>[]);
            const { columns: newColumns, rows: newRows } = updatedProj.getColumnsAndRows();
            setColumns(newColumns);
            setRows(newRows);
            return updatedProj;
        });
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalTitle(e.target.value);
    };

    const handleTitleBlur = () => {
        setSimProj(prev => prev.setName(localTitle));
        onMessage(`Workspace title updated to "${localTitle}"`);
    };

    const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalAuthor(e.target.value);
    };

    const handleAuthorBlur = () => {
        setSimProj(prev => prev.setAuthor(localAuthor));
        onMessage(`Workspace author updated to "${localAuthor}"`);
    };

    const handleVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalVersion(e.target.value);
    };

    const handleVersionBlur = () => {
        setSimProj(prev => prev.setVersion(localVersion));
        onMessage(`Workspace version updated to "${localVersion}"`);
    };

    if (!columns || columns.length === 0 || !rows || rows.length === 0) {
        console.error('Invalid data for ReactGrid');
        return <div>Error: Unable to render grid. Check console for details.</div>;
    }

    const handleSimProjUpdate = useCallback((updatedSimProj: SimulationProject) => {
        setSimProj(_ => {
            const { columns: newColumns, rows: newRows } = updatedSimProj.getColumnsAndRows();
            setColumns(newColumns);
            setRows(newRows);
            return updatedSimProj;
        });
    }, []);

    const handleToolsChange = useCallback((updatedTools: Tool[]) => {
        setTools(updatedTools);
        setSimProj((prev: SimulationProject) => prev.updateTools(updatedTools));
    }, []);

    const handleSaveScript = useCallback((toolName: string, newScript: string, newLanguage: string) => {
        setSimProj((prevSimProj) => {
            const updatedTools = prevSimProj.getTools().map((tool: Tool) =>
                tool.name === toolName ? new Tool(tool.name, tool.description, newScript, newLanguage) : tool
            );
            return prevSimProj.updateTools(updatedTools);
        });
        setTools((prevTools) => prevTools.map(tool =>
            tool.name === toolName ? new Tool(tool.name, tool.description, newScript, newLanguage) : tool
        ));
        onMessage(`Script updated for tool "${toolName}"`);
    }, [setSimProj, setTools, onMessage]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.shiftKey) {
                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    if (focusCell && Number(focusCell.rowId) >= 1) {
                        onMessage(`Add row below ${focusCell.rowId}`);
                        handleSimProjUpdate(simProj.addRowAbove(Number(focusCell.rowId)+1));
                    }
                } else if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    if (focusCell) {
                        const { tab, col } = toIndexes(focusCell.columnId.toString());
                        handleSimProjUpdate(simProj.addColumn(tab, col));
                        onMessage(`Added new column to table ${tab} after column ${col}`);
                    }
                } else if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    if (focusCell) {
                        const { tab, col } = toIndexes(focusCell.columnId.toString());
                        handleSimProjUpdate(simProj.addColumn(tab, col-1));
                        onMessage(`Added new column to table ${tab} before column ${col}`);
                    }
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [focusCell, simProj, handleSimProjUpdate]);

    const handleFocusLocationChanged = (location: CellLocation) => {
        setFucusCell(location);
    };

    const handleContextMenu = (
        // @ts-ignore
        selectedRowIds: Id[],
        // @ts-ignore
        selectedColIds: Id[],
        // @ts-ignore
        selectionMode: SelectionMode,
        // @ts-ignore
        menuOptions: MenuOption[],
        // @ts-ignore
        selectedRanges: Array<CellLocation[]>
    ): MenuOption[] => {
        menuOptions = [
            {
                id: 'deleteTable',
                label: 'Delete Table',
                // @ts-ignore
                handler: (selectedRowIds: Id[], selectedColIds: Id[], selectionMode: SelectionMode, selectedRanges: Array<CellLocation[]>) => {
                    if (selectionMode === 'range' && selectedRanges.length > 0) {
                        const lastRange = selectedRanges[selectedRanges.length - 1];
                        const lastCell = lastRange[lastRange.length - 1];
                        const { tab, col } = toIndexes(lastCell.columnId.toString());
                        if (simProj.getNumberOfTables() > 1) {
                            simProj.deleteTable(tab);
                            handleSimProjUpdate(simProj);
                            onMessage(`Deleted table ${tab}`);
                        }
                    }
                }
            },
            {
                id: 'deleteRow',
                label: 'Delete Row',
                // @ts-ignore
                handler: (selectedRowIds: Id[], selectedColIds: Id[], selectionMode: SelectionMode, selectedRanges: Array<CellLocation[]>) => {
                    if (selectionMode === 'range' && selectedRanges.length > 0) {
                        const lastRange = selectedRanges[selectedRanges.length - 1];
                        const lastCell = lastRange[lastRange.length - 1];
                        const rowIndex = parseInt(lastCell.rowId.toString());
                        if (rowIndex > 1) {
                            const { tab, col } = toIndexes(lastCell.columnId.toString());
                            onMessage(`Deleted row ${rowIndex} from table ${tab}`);
                            handleSimProjUpdate(simProj.deleteRow(rowIndex));
                        }
                    }
                }
            },
            {
                id: 'addRowAbove',
                label: 'Add Row Above',
                // @ts-ignore
                handler: (selectedRowIds: Id[], selectedColIds: Id[], selectionMode: SelectionMode, selectedRanges: Array<CellLocation[]>) => {
                    if (selectionMode === 'range' && selectedRanges.length > 0) {
                        const lastRange = selectedRanges[selectedRanges.length - 1];
                        const lastCell = lastRange[lastRange.length - 1];
                        const rowIndex = parseInt(lastCell.rowId.toString());
                        if (rowIndex > 1) {
                            onMessage(`Added row above ${rowIndex}`);
                            handleSimProjUpdate(simProj.addRowAbove(rowIndex));
                        }
                    }
                }
            },
            {
                id: 'addRowBelow',
                label: 'Add Row Below',
                // @ts-ignore
                handler: (selectedRowIds: Id[], selectedColIds: Id[], selectionMode: SelectionMode, selectedRanges: Array<CellLocation[]>) => {
                    if (selectionMode === 'range' && selectedRanges.length > 0) {
                        const lastRange = selectedRanges[selectedRanges.length - 1];
                        const lastCell = lastRange[lastRange.length - 1];
                        const rowIndex = parseInt(lastCell.rowId.toString());
                        if (rowIndex > 0) {
                            onMessage(`Added row below ${rowIndex}`);
                            handleSimProjUpdate(simProj.addRowAbove(rowIndex + 1));
                        }
                    }
                }
            },
            {
                id: 'deleteColumn',
                label: 'Delete Column',
                // @ts-ignore
                handler: (selectedRowIds: Id[], selectedColIds: Id[], selectionMode: SelectionMode, selectedRanges: Array<CellLocation[]>) => {
                    if (selectionMode === 'range' && selectedRanges.length > 0) {
                        const lastRange = selectedRanges[selectedRanges.length - 1];
                        const lastCell = lastRange[lastRange.length - 1];
                        const { tab, col } = toIndexes(lastCell.columnId.toString());
                        if (simProj.getNumberOfColumns(tab) > 1) {
                            handleSimProjUpdate(simProj.deleteColumn(tab, col));
                            onMessage(`Deleted column ${col} from table ${tab}`);
                        }
                    }
                }
            },
            {
                id: 'addColumnAfter',
                label: 'Add Column =>',
                // @ts-ignore
                handler: (selectedRowIds: Id[], selectedColIds: Id[], selectionMode: SelectionMode, selectedRanges: Array<CellLocation[]>) => {
                    if (selectionMode === 'range' && selectedRanges.length > 0) {
                        const lastRange = selectedRanges[selectedRanges.length - 1];
                        const lastCell = lastRange[lastRange.length - 1];
                        const { tab, col } = toIndexes(lastCell.columnId.toString());
                        handleSimProjUpdate(simProj.addColumn(tab, col));
                        onMessage(`Added new column to table ${tab} after column ${col}`);
                    }
                }
            },
            {
                id: 'addColumnBefore',
                label: '<= Add Column',
                handler: (
                    // @ts-ignore
                    selectedRowIds: Id[],
                    // @ts-ignore
                    selectedColIds: Id[],
                    selectionMode: SelectionMode,
                    selectedRanges: Array<CellLocation[]>) => {
                    if (selectionMode === 'range' && selectedRanges.length > 0) {
                        const lastRange = selectedRanges[selectedRanges.length - 1];
                        const lastCell = lastRange[lastRange.length - 1];
                        const { tab, col } = toIndexes(lastCell.columnId.toString());
                        handleSimProjUpdate(simProj.addColumn(tab, col - 1));
                        onMessage(`Added new column to table ${tab} before column ${col}`);
                    }
                }
            },
            {
                id: 'addTableBefore',
                label: '<= Add Table',
                // @ts-ignore
                handler: (
                    // @ts-ignore
                    selectedRowIds: Id[],
                    // @ts-ignore
                    selectedColIds: Id[],
                    selectionMode: SelectionMode,
                    selectedRanges: Array<CellLocation[]>) => {
                    if (selectionMode === 'range' && selectedRanges.length > 0) {
                        const lastRange = selectedRanges[selectedRanges.length - 1];
                        const lastCell = lastRange[lastRange.length - 1];
                        const { tab, col } = toIndexes(lastCell.columnId.toString());
                        handleSimProjUpdate(simProj.addNewTable(tab));
                        onMessage(`Added new table before table ${tab}`);
                    }
                }
            },
            {
                id: 'addTableAfter',
                label: 'Add Table =>',
                // @ts-ignore
                handler: (
                    // @ts-ignore
                    selectedRowIds: Id[],
                    // @ts-ignore
                    selectedColIds: Id[],
                    selectionMode: SelectionMode,
                    selectedRanges: Array<CellLocation[]>) => {
                    if (selectionMode === 'range' && selectedRanges.length > 0) {
                        const lastRange = selectedRanges[selectedRanges.length - 1];
                        const lastCell = lastRange[lastRange.length - 1];
                        const { tab, col } = toIndexes(lastCell.columnId.toString());
                        handleSimProjUpdate(simProj.addNewTable(tab + 1));
                        onMessage(`Added new table after table ${tab}`);
                    }
                }
            },
        ];
        return menuOptions;
    }

    return (
        <section className="work-area">
            <MemoizedMenuBar
                simProj={simProj}
                tools={tools}
                onUpdateSimProj={handleSimProjUpdate}
                onUpdateTools={handleToolsChange}
                onUpdateWorkspaceTitle={setLocalTitle}
                onUpdateWorkspaceAuthor={setLocalAuthor}
                onUpdateWorkspaceVersion={setLocalVersion}
                onUpdateSystemMessage={onMessage}
            />
            <input
                type="text"
                className="workspace-title-input"
                value={localTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
            />
            <div className="workspace-info">
                <span>Author: </span><input
                    type="text"
                    className="workspace-author"
                    value={localAuthor}
                    onChange={handleAuthorChange}
                    onBlur={handleAuthorBlur}
                /><span>  Version: </span><input
                    type="text"
                    className="workspace-version"
                    value={localVersion}
                    onChange={handleVersionChange}
                    onBlur={handleVersionBlur}
                />
            </div>
            <ReactGrid
                rows={rows}
                columns={columns}
                onCellsChanged={handleChanges}
                customCellTemplates={AllCellTemplates}
                onContextMenu={handleContextMenu}
                enableRowSelection={false}
                enableColumnSelection={false}
                enableRangeSelection={false}
                initialFocusLocation={{ columnId: 'tab_0__col_0', rowId: '1' }}
                onFocusLocationChanged={handleFocusLocationChanged}
            />
        </section>
    );
}
