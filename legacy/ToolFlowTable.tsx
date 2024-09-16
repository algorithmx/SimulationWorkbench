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


import React, { useMemo } from 'react';
import { ToolFlowHeader } from './ToolFlowHeader';
import { ToolFlowBody } from './ToolFlowBody';
import { Tool } from '../utils/Tool';
import { SimulationProject } from '../utils/SimulationProject';
import styles from './ToolFlowTable.module.css';

interface ToolFlowTableProps {
    readonly tables: SimulationProject;
    readonly tableId: number;
    readonly tools: Tool[];
    onCellChange: (row: number, col: number, value: string) => void;
    onAddColumn: (index: number) => void;
    onDeleteColumn: (index: number) => void;
    onAddTable: () => void;
    onDeleteTable: () => void;
    isOnlyTable: boolean;
    onContextMenu: (event: React.MouseEvent, data: any) => void;
    handleHashClick: (index: number, data: string[][], event: React.MouseEvent) => void;
}

export const ToolFlowTable: React.FC<ToolFlowTableProps> = React.memo(({
    tables,
    tableId,
    tools,
    onCellChange,
    onAddColumn,
    onDeleteColumn,
    onAddTable,
    onDeleteTable,
    isOnlyTable,
    onContextMenu,
    handleHashClick,
}) => {
    const table = useMemo(() => tables.getTable(tableId), [tables, tableId]);
    const cellGroups = useMemo(() => tables.calculateCellGroups(tableId), [tables, tableId]);
    const [toolFlowRow, parametersRow, ...valueRows] = table.getData();

    return (
        <table className={styles.toolFlowTable}>
            <ToolFlowHeader
                toolFlowRow={toolFlowRow}
                parametersRow={parametersRow}
                tools={tools}
                onCellChange={onCellChange}
                onAddColumn={onAddColumn}
                onDeleteColumn={onDeleteColumn}
                onAddTable={onAddTable}
                onDeleteTable={onDeleteTable}
                isOnlyTable={isOnlyTable}
                tableId={tableId}
                handleHashClick={handleHashClick}
            />
            <ToolFlowBody
                valueRows={valueRows}
                parametersRow={parametersRow}
                cellGroups={cellGroups}
                onCellChange={onCellChange}
                onContextMenu={onContextMenu}
            />
        </table>
    );
});

ToolFlowTable.displayName = 'ToolFlowTable';
