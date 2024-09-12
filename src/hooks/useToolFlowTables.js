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


import { createNewTable, addColumn, deleteColumn } from '../utils/tableUtils';


export function useToolFlowTables({tables, setTables, toolOptions, toolScripts}) {
    const handleCellChange = (tableId, rowIndex, colIndex, value) => {
        setTables(prevTables =>
            prevTables.map(table =>
                table.id === tableId
                    ? {
                        ...table,
                        data: table.data.map((row, rIndex) =>
                            rIndex === rowIndex
                                ? row.map((cell, cIndex) => {
                                    if (cIndex === colIndex) {
                                        return rIndex === 0 ? { ...cell, value } : value;
                                    }
                                    return cell;
                                })
                                : row
                        )
                    }
                    : table
            )
        );
    };
    const handleAddColumn = (tableId, columnIndex, onUpdateSystemMessage) => {
        let tableToolName = '';
        setTables(prevTables => 
            prevTables.map(table => {
                if (table.id === tableId) {
                    // Ensure we're accessing the correct property and handle potential undefined values
                    tableToolName = table.data[0][0]?.value || table.data[0][0] || 'Unknown';
                    return addColumn(table, columnIndex, onUpdateSystemMessage);
                } else {
                    return table;
                }
            })
        );
        onUpdateSystemMessage(`Add column at index ${columnIndex} in table ${tableToolName} id=${tableId})`);
    };

    const handleDeleteColumn = (tableId, columnIndex, onUpdateSystemMessage) => {
        let tableToolName = '';
        setTables(prevTables =>
            prevTables.map(table => {
                if (table.id === tableId) {
                    // Ensure we're accessing the correct property and handle potential undefined values
                    tableToolName = table.data[0][0]?.value || table.data[0][0] || 'Unknown';
                    return deleteColumn(table, columnIndex, onUpdateSystemMessage);
                } else {
                    return table;
                }
            })
        );
        onUpdateSystemMessage(`Delete column at index ${columnIndex} in table ${tableToolName} (id=${tableId})`);
    };

    const handleAddTable = (tb, onUpdateSystemMessage) => {
        const newTable = createNewTable(toolOptions, tb.data, onUpdateSystemMessage);
        setTables(prevTables => {
            const index = prevTables.findIndex(table => table.id === tb.id);
            return [...prevTables.slice(0, index + 1), newTable, ...prevTables.slice(index + 1)];
        });
    };

    const handleDeleteTable = (tableId, onUpdateSystemMessage) => {
        let tableToolName = '';
        setTables(prevTables => {
            const tableToDelete = prevTables.find(table => table.id === tableId);
            if (tableToDelete) {
                tableToolName = tableToDelete.data[0][0]?.value || tableToDelete.data[0][0] || 'Unknown';
            }
            return prevTables.filter(table => table.id !== tableId);
        });
        onUpdateSystemMessage(`Delete table ${tableToolName} (id=${tableId})`);
    };

    const handleAddRow = (onUpdateSystemMessage) => {
        onUpdateSystemMessage(`Add new row at bottom.`)
        setTables(prevTables =>
            prevTables.map(table => ({
                ...table,
                data: [...table.data, new Array(table.data[1].length).fill('')]
            }))
        );
    };

    const handleDeleteRow = (rowIndex, onUpdateSystemMessage) => {
        onUpdateSystemMessage(`Delete row ${rowIndex}.`)
        setTables(prevTables =>
            prevTables.map(table => ({
                ...table,
                data: table.data.filter((_, index) => index !== rowIndex)
            }))
        );
    };

    const handleAddRowAbove = (rowIndex, onUpdateSystemMessage) => {
        onUpdateSystemMessage(`Add new row above row ${rowIndex}.`)
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

    const handleHashClick = (columnIndex, tabledata, event) => {
        // Function to get current unique column values
        const getUniqueColumnValues = () => {
            const columnValues = tabledata.slice(2).map(row => row[columnIndex]);
            return [...new Set(columnValues)].filter(value => value !== '');
        };

        let uniqueColumnValues = getUniqueColumnValues();
        let newlyAddedValues = [];
        
        // Remove any existing popup
        const existingPopup = document.querySelector('.pop-up-window');
        if (existingPopup) {
            existingPopup.remove();
        }
        
        // Create a pop-up window with the column values
        const popUpWindow = document.createElement('div');
        popUpWindow.className = 'pop-up-window';
        
        // Function to update the unique values list in the popup
        const updateUniqueValuesList = () => {
            const uniqueValuesList = popUpWindow.querySelector('.unique-values-list');
            if (uniqueValuesList) {
                uniqueValuesList.innerHTML = uniqueColumnValues.join('<br>');
            }
        };

        popUpWindow.innerHTML = `
            <div class="unique-values-list">${uniqueColumnValues.join('<br>')}</div>
            <div class="add-value-container">
                <input type="text" class="add-value-input" placeholder="Add new value">
                <button class="add-value-btn">Add</button>
            </div>
            <button class="close-btn">Close</button>
        `;
        
        // Position the popUpWindow near the hash button
        const rect = event.target.getBoundingClientRect();
        popUpWindow.style.position = 'absolute';
        popUpWindow.style.left = `${rect.left}px`;
        popUpWindow.style.top = `${rect.bottom + 5}px`;

        // Add the popUpWindow to the document body
        document.body.appendChild(popUpWindow);
        
        // Function to close the popup and update the table
        const closePopup = () => {
            popUpWindow.remove();
            if (newlyAddedValues.length > 0) {
                // Update the table with new values
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

        // Add click event to close button
        const closeButton = popUpWindow.querySelector('.close-btn');
        closeButton.addEventListener('click', closePopup);
        
        // Add click event to add value button
        const addValueButton = popUpWindow.querySelector('.add-value-btn');
        const addValueInput = popUpWindow.querySelector('.add-value-input');
        addValueButton.addEventListener('click', () => {
            const newValue = addValueInput.value.trim();
            if (newValue && !uniqueColumnValues.includes(newValue)) {
                uniqueColumnValues.push(newValue);
                newlyAddedValues.push(newValue);
                updateUniqueValuesList();
                addValueInput.value = '';
            }
        });
        
        // Handle Esc key press
        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                closePopup();
            }
        };
        
        // Close the popup when clicking outside
        const closePopupOnOutsideClick = (e) => {
            if (!popUpWindow.contains(e.target) && e.target !== event.target) {
                closePopup();
            }
        };
        
        // Add event listeners
        document.addEventListener('keydown', handleEscKey);
        
        // Prevent immediate closure and add the click event listener
        event.stopPropagation();
        setTimeout(() => {
            document.addEventListener('click', closePopupOnOutsideClick);
        }, 0);

        // Update unique values when tables change
        setTables(prevTables => {
            setTimeout(() => {
                uniqueColumnValues = getUniqueColumnValues();
                updateUniqueValuesList();
            }, 0);
            return prevTables;
        });
    };

    const maxRows = Math.max(...tables.map(table => table.data.length));

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
        maxRows,
    };
}