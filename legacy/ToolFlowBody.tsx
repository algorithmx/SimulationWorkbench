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

import React from 'react';
import { ContextMenuTrigger } from "rctx-contextmenu";
import { CellValue } from '../utils/Table';
import styles from './ToolFlowTable.module.css';

interface ToolFlowBodyProps {
    valueRows: CellValue[][];
    parametersRow: CellValue[];
    cellGroups: { start: number; end: number; value: CellValue; col: number }[];
    onCellChange: (row: number, col: number, value: string) => void;
    onContextMenu: (event: React.MouseEvent, data: any) => void;
}

export const ToolFlowBody: React.FC<ToolFlowBodyProps> = React.memo(({
    valueRows,
    parametersRow,
    cellGroups,
    onCellChange,
    onContextMenu
}) => {
    const getCellColor = (paramName: CellValue, cellValue: CellValue): string => {
        if (paramName) return '#f0f0f0'; // Light gray for parameter columns
        if (!cellValue) return 'white';
        switch (cellValue.toString().toLowerCase()) {
            case 'not started': return '#b3e5fc'; // light blue
            case 'success': return '#d4edda'; // light green
            case 'failure': return '#f8d7da'; // light red
            case 'pending': return '#ffc107'; // orange
            case 'running': return '#b39ddb'; // light purple
            default: return 'white';
        }
    };

    return (
        <tbody>
            {valueRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                    {row.map((cell, colIndex) => {
                        const isGrouped = cellGroups.some(
                            group => group.col === colIndex && 
                            rowIndex >= group.start && 
                            rowIndex <= group.end
                        );
                        const group = cellGroups.find(
                            group => group.col === colIndex && 
                            rowIndex >= group.start && 
                            rowIndex <= group.end
                        );

                        if (isGrouped && rowIndex > group!.start) {
                            return null; // Skip rendering for grouped cells
                        }

                        return (
                            <ContextMenuTrigger 
                                key={colIndex} 
                                id="cell-context-menu" 
                                attributes={{ data: { row: rowIndex, col: colIndex } }}
                            >
                                <td 
                                    className={styles.valueCell}
                                    style={{ 
                                        backgroundColor: getCellColor(parametersRow[colIndex], cell),
                                        ...(isGrouped && { rowSpan: group!.end - group!.start + 1 })
                                    }}
                                    onContextMenu={(e) => onContextMenu(e, { row: rowIndex, col: colIndex })}
                                >
                                    <input
                                        type="text"
                                        value={(cell ?? '').toString()}
                                        onChange={(e) => onCellChange(rowIndex + 2, colIndex, e.target.value)}
                                        className={styles.valueCellInput}
                                        aria-label={`Value for ${parametersRow[colIndex]}`}
                                    />
                                </td>
                            </ContextMenuTrigger>
                        );
                    })}
                </tr>
            ))}
        </tbody>
    );
});
