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
    NumberCellTemplate, TextCellTemplate, DropdownCellTemplate,
    ReactGridProps, CellTemplate, Compatible, Uncertain, CellTemplates
} from '@silevis/reactgrid';
import '@silevis/reactgrid/styles.css';
import { SimulationProject, AllCellTypes, CustomRow } from '../utils/SimulationProject';
import { Table, ToolCell } from '../utils/Table';
import { Tool } from '../utils/Tool';
import { MenuBar, MenuBarProps } from './MenuBar'; // Update this import
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
    const [columns, setColumns] = useState<Column[]>(simProj.getColumns());
    const [rows, setRows] = useState<CustomRow[]>(simProj.getRows());

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
        // onMessage(`Changes ${changes.map(
        //     c => getCellChangeString(c as CellChange<AllCellTypes>)
        // ).join(', ')} applied.`);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalTitle(e.target.value);
    };

    const handleTitleBlur = () => {
        setLocalTitle(localTitle);
        onMessage(`Workspace title updated to "${localTitle}"`);
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

    return (
        <section className="work-area">
            <MenuBar
                simProj={simProj}
                tools={tools}
                onUpdateSimProj={handleSimProjUpdate}
                onUpdateTools={handleToolsChange}
                onUpdateWorkspaceTitle={setLocalTitle}
                onUpdateSystemMessage={onMessage}
            />
            <input
                type="text"
                className="workspace-title-input"
                value={localTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
            />
            <ReactGrid
                rows={rows}
                columns={columns}
                onCellsChanged={handleChanges}
                customCellTemplates={AllCellTemplates}
                enableRowSelection={false}
                enableColumnSelection={false}
                enableRangeSelection={false}
            />
        </section>
    );
}
