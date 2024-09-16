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
import { ToolFlowCell } from './ToolFlowCell';
import { Tool } from '../utils/Tool';
import { CellValue } from '../utils/Table';
import styles from './ToolFlowTable.module.css';

interface ToolFlowHeaderProps {
    toolFlowRow: CellValue[]; // Change this line
    parametersRow: CellValue[];
    tools: Tool[];
    onCellChange: (row: number, col: number, value: string) => void;
    onAddColumn: (index: number) => void;
    onDeleteColumn: (index: number) => void;
    onAddTable: () => void;
    onDeleteTable: () => void;
    isOnlyTable: boolean;
    tableId: number;
    handleHashClick: (index: number, data: string[][], event: React.MouseEvent) => void;
}
export const ToolFlowHeader: React.FC<ToolFlowHeaderProps> = React.memo(({
    toolFlowRow,
    parametersRow,
    tools,
    onCellChange,
    onAddColumn,
    onDeleteColumn,
    onAddTable,
    onDeleteTable,
    isOnlyTable,
    tableId,
    handleHashClick,
}) => {
    return (
        <thead>
            <tr>
                {toolFlowRow.map((cell: CellValue, index: number) => (
                    <ToolFlowCell
                        key={index}
                        value={cell?.toString() ?? ''}
                        colspan={1} // Adjust this if needed
                        onCellChange={(value: string) => onCellChange(0, index, value)}
                        onAddTable={onAddTable}
                        onDeleteTable={onDeleteTable}
                        isOnlyTable={isOnlyTable}
                        tableId={tableId}
                        tools={tools}
                    />
                ))}
            </tr>
            <tr>
                {parametersRow.map((cell, index) => (
                    <th key={index} className={styles.parameterCell}>
                        <input
                            type="text"
                            value={String(cell ?? '')}
                            onChange={(e) => onCellChange(1, index, e.target.value)}
                            className={styles.parameterInput}
                        />
                        <div className={styles.parameterCellButtons}>
                            {/* Add aria-label for better accessibility */}
                            <button 
                                className={styles.deleteColumnBtn} 
                                onClick={() => onDeleteColumn(index)}
                                disabled={parametersRow.length === 1}
                                aria-label="Delete column"
                            >
                                -
                            </button>
                            <button 
                                className={styles.hashBtn}
                                onClick={(e) => handleHashClick(index, [], e)}
                                aria-label="Hash"
                            >
                                #
                            </button>
                            <button 
                                className={styles.addColumnBtn} 
                                onClick={() => onAddColumn(index)}
                                aria-label="Add column"
                            >
                                +
                            </button>
                        </div>
                    </th>
                ))}
            </tr>
        </thead>
    );
});

