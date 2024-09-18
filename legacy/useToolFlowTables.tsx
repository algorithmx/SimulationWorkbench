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

import { Table, TableData, HeaderCell } from '../utils/Table';
import { Tool } from '../utils/Tool';
import { SimulationProject } from '../utils/SimulationProject';
import { makePopup } from '../components/Popup';

interface UseToolFlowTablesProps {
    tables: SimulationProject; // Do not modify this line
    setTables: React.Dispatch<React.SetStateAction<SimulationProject>>;
    tools: Tool[];
}

export function useToolFlowTables({
    tables,
    setTables,
    tools
}: UseToolFlowTablesProps) {
    const handleCellChange = (tableId: number, rowIndex: number, colIndex: number, value: string): void => {
        setTables(prev => prev.updateCell(tableId, rowIndex, colIndex, value));
    };

    const handleAddColumn = (tableId: number, columnIndex: number, onUpdateSystemMessage: (message: string) => void): void => {
        onUpdateSystemMessage(`Add column at index ${columnIndex} in table [${tables.getTableToolName(tableId)}] (id=${tableId}).`);
        tables.addColumn(tableId, columnIndex);
    };

    const handleDeleteColumn = (tableId: number, columnIndex: number, onUpdateSystemMessage: (message: string) => void): void => {
        onUpdateSystemMessage(`Delete column at index ${columnIndex} in table [${tables.getTableToolName(tableId)}] (id=${tableId}).`);
        tables.deleteColumn(tableId, columnIndex);
    };

    const handleAddTable = (onUpdateSystemMessage: (message: string) => void): void => {
        onUpdateSystemMessage(`Add new table.`);
        setTables(prev => prev.addNewTable());
    };

    const handleDeleteTable = (tableId: number, onUpdateSystemMessage: (message: string) => void): void => {
        setTables(prev => {
            const tableToolName = prev.getTableToolName(tableId);
            onUpdateSystemMessage(`Delete table [${tableToolName}] (id=${tableId})`);
            return prev.deleteTable(tableId);
        });
    };

    const handleAddRow = (onUpdateSystemMessage: (message: string) => void): void => {
        onUpdateSystemMessage(`Add new row at bottom.`);
        setTables(prevTables =>
            prevTables.map(table => ({
                ...table,
                data: [...table.data, new Array(table.data[1].length).fill('')]
            }))
        );
    };

    const handleDeleteRow = (rowIndex: number, onUpdateSystemMessage: (message: string) => void): void => {
        onUpdateSystemMessage(`Delete row ${rowIndex}.`);
        setTables(prevTables =>
            prevTables.map(table => ({
                ...table,
                data: table.data.filter((_, index) => index !== rowIndex)
            }))
        );
    };

    const handleAddRowAbove = (rowIndex: number, onUpdateSystemMessage: (message: string) => void): void => {
        onUpdateSystemMessage(`Add new row above row ${rowIndex}.`);
        setTables(prevTables =>
            prevTables.map(table => ({
                ...table,
                data: [
                    ...table.data.slice(0, rowIndex),
                    new Array(table.data[1].length).fill(''),
                    ...table.data.slice(rowIndex)
                ]
            }))
        );
    };

    const handleHashClick = (columnIndex: number, tableId: number, event: React.MouseEvent): void => {
        let uniqueColumnValues = tables.getUniqueColumnValues(tableId, columnIndex);
        const popUpWindow = makePopup(event, `
            <div class="unique-values-list">${uniqueColumnValues.join('<br>')}</div>
            <div class="add-value-container">
                <input type="text" class="add-value-input" placeholder="Add new value">
                <button class="add-value-btn">Add</button>
            </div>
            <button class="close-btn">Close</button>
        `);

        document.body.appendChild(popUpWindow);

        const updateUniqueValuesList = (): void => {
            const uniqueValuesList = popUpWindow.querySelector('.unique-values-list');
            if (uniqueValuesList) {
                uniqueValuesList.innerHTML = uniqueColumnValues.join('<br>');
            }
        };

        let newlyAddedValues: string[] = [];
        const closePopup = (): void => {
            popUpWindow.remove();
            if (newlyAddedValues.length > 0) {
                newlyAddedValues.forEach(value => {
                    setTables(prevTables =>
                        prevTables.map(table => ({
                            ...table,
                            data: [...table.data, new Array(table.data[1].length).fill('').map((cell, index) => index === columnIndex ? value : cell)]
                        }))
                    );
                });
            }
            document.removeEventListener('keydown', handleEscKey);
            document.removeEventListener('click', closePopupOnOutsideClick);
        };

        const closeButton = popUpWindow.querySelector('.close-btn');
        closeButton?.addEventListener('click', closePopup);

        const addValueButton = popUpWindow.querySelector('.add-value-btn');
        const addValueInput = popUpWindow.querySelector('.add-value-input') as HTMLInputElement;
        addValueButton?.addEventListener('click', () => {
            const newValue = addValueInput.value.trim();
            if (newValue && !uniqueColumnValues.includes(newValue)) {
                uniqueColumnValues.push(newValue);
                newlyAddedValues.push(newValue);
                updateUniqueValuesList();
                addValueInput.value = '';
            }
        });

        const handleEscKey = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') {
                closePopup();
            }
        };
        
        const closePopupOnOutsideClick = (e: MouseEvent): void => {
            if (!popUpWindow.contains(e.target as Node) && e.target !== event.target) {
                closePopup();
            }
        };

        document.addEventListener('keydown', handleEscKey);

        event.stopPropagation();
        setTimeout(() => {
            document.addEventListener('click', closePopupOnOutsideClick);
        }, 0);

        setTables(prevTables => {
            setTimeout(() => {
                uniqueColumnValues = tables.getUniqueColumnValues(tableId, columnIndex);
                updateUniqueValuesList();
            }, 0);
            return prevTables;
        });
    };

    return {
        handleCellChange,
        handleAddColumn,
        handleDeleteColumn,
        handleAddTable,
        handleDeleteTable,
        handleAddRow,
        handleDeleteRow,
        handleAddRowAbove,
        handleHashClick,
    };
}