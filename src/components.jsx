import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

export function MenuBar() {
    return (
        <nav className="menu-bar">
            <button>Button 1</button>
            <button>Button 2</button>
            <button>Button 3</button>
        </nav>
    );
}

export function ProjectDirectory() {
    return (
        <aside className="project-directory">
            <h3>Project Director & Example Library</h3>
            {/* Add tree structure here */}
        </aside>
    );
}

const toolOptions = ['Tool A', 'Tool B', 'Tool C', 'Tool D'];

// Handles the selection of a tool from the dropdown
const handleSelect = (tool, onCellChange, setIsOpen) => {
    onCellChange(tool);
    setIsOpen(false);
};

function ToolFlowCell({ value, colspan, onCellChange, onAddTable, onDeleteTable, isOnlyTable }) {
    const [isOpen, setIsOpen] = useState(false);
    const cellRef = useRef(null);

    useEffect(() => {
        // Function to close the popup
        const closePopup = (e) => {
            if (cellRef.current && !cellRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        // Function to handle Esc key press
        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        // Add event listeners
        document.addEventListener('click', closePopup);
        document.addEventListener('keydown', handleEscKey);

        // Cleanup function
        return () => {
            document.removeEventListener('click', closePopup);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, []);

    // Toggles the visibility of the tool options popup
    const togglePopup = (e) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
    };

    return (
        <th colSpan={colspan || 1} className="tool-flow-cell" ref={cellRef}>
            <div className="tool-flow-header">
                <button 
                    className="delete-table-btn" 
                    onClick={onDeleteTable}
                    disabled={isOnlyTable}
                >
                    -
                </button>
                <div className="tool-selector" onClick={togglePopup}>
                    <span>{value || toolOptions[0]}</span>
                    {isOpen && (
                        <ul className="tool-options">
                            {toolOptions.map((tool, index) => (
                                <li key={index} onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleSelect(tool, onCellChange, setIsOpen); 
                                }}>
                                    {tool}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button className="add-table-btn" onClick={onAddTable}>+</button>
            </div>
        </th>
    );
}

// Add this new function to calculate the cell groupings
const calculateCellGroups = (data) => {
  const groups = [];
  const valueRows = data.slice(2);
  const columnCount = data[1].length;

  for (let col = 0; col < columnCount; col++) {
    let currentGroup = { start: 0, end: 0, value: valueRows[0][col] };
    
    for (let row = 0; row < valueRows.length; row++) {
      if (row === 0 || valueRows[row][col] === currentGroup.value) {
        currentGroup.end = row;
      } else {
        groups.push({ ...currentGroup, col });
        currentGroup = { start: row, end: row, value: valueRows[row][col] };
      }
    }
    
    groups.push({ ...currentGroup, col });
  }

  return groups;
};

function ToolFlowTable({ data, onCellChange, onAddColumn, onDeleteColumn, onAddTable, onDeleteTable, isOnlyTable, onContextMenu, handleHashClick }) {
    const toolFlowRow = data[0];
    const parametersRow = data[1];
    const valueRows = data.slice(2);
    const columnCount = parametersRow.length;
    const cellGroups = calculateCellGroups(data);

    return (
        <table className="tool-flow-table">
            <thead>
                <tr>
                    {toolFlowRow.map((cell, index) => (
                        <ToolFlowCell
                            key={index}
                            value={cell.value}
                            colspan={cell.colspan}
                            onCellChange={(value) => onCellChange(0, index, value)}
                            onAddTable={onAddTable}
                            onDeleteTable={onDeleteTable}
                            isOnlyTable={isOnlyTable}
                        />
                    ))}
                </tr>
                <tr>
                    {parametersRow.map((cell, index) => (
                        <th key={index}>
                            <div className="parameter-cell">
                                <div className="parameter-cell-line">
                                    <input
                                        type="text"
                                        value={cell}
                                        onChange={(e) => onCellChange(1, index, e.target.value)}
                                        className="parameter-input"
                                    />
                                </div>
                                <div className="parameter-cell-line">
                                    <div className="parameter-cell-buttons">
                                        <button 
                                            className="delete-column-btn" 
                                            onClick={() => onDeleteColumn(index)}
                                            disabled={columnCount === 1}
                                        >
                                            -
                                        </button>
                                        <button 
                                            className="hash-btn"
                                            onClick={(e) => handleHashClick(index, e)}
                                        >
                                            #
                                        </button>
                                        <button 
                                            className="add-column-btn" 
                                            onClick={() => onAddColumn(index)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {valueRows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {parametersRow.map((_, colIndex) => {
                            const group = cellGroups.find(g => g.col === colIndex && g.start <= rowIndex && g.end >= rowIndex);
                            const isGroupStart = group && group.start === rowIndex;
                            const isGroupEnd = group && group.end === rowIndex;
                            const isInGroup = !!group;

                            return (
                                <td 
                                    key={colIndex}
                                    className={`
                                        ${isGroupStart ? 'group-start' : ''}
                                        ${isGroupEnd ? 'group-end' : ''}
                                        ${isInGroup ? 'in-group' : ''}
                                        ${group && group.start === group.end ? 'single-cell-group' : ''}
                                    `}
                                >
                                    <ContextMenuTrigger
                                        id="cell-context-menu"
                                        collect={() => ({ rowIndex: rowIndex + 2, colIndex })}
                                    >
                                        <input
                                            type="text"
                                            value={row[colIndex] || ''}
                                            onChange={(e) => onCellChange(rowIndex + 2, colIndex, e.target.value)}
                                            className="cell-input"
                                        />
                                    </ContextMenuTrigger>
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// Creates a new table with default values
const createNewTable = (toolOptions, data) => ({
    id: Date.now(),
    data: [
        [{ value: toolOptions[0], colspan: 1 }],
        ['PNew'],
        ...data.slice(2).map(row => row.map(() => ''))
    ]
});

// Adds a new column to the table
const addColumn = (table, columnIndex) => ({
    ...table,
    data: table.data.map((row, rowIndex) => {
        if (rowIndex === 0) {
            return [{ ...row[0], colspan: row[0].colspan + 1 }];
        }
        const newCell = rowIndex === 1 ? 'PNew' : '';
        return [...row.slice(0, columnIndex + 1), newCell, ...row.slice(columnIndex + 1)];
    })
});

// Deletes a column from the table
const deleteColumn = (table, columnIndex) => {
    const columnCount = table.data[1].length;
    if (columnCount === 1) {
        return table;
    }
    return {
        ...table,
        data: table.data.map((row, rowIndex) => {
            if (rowIndex === 0) {
                return [{ ...row[0], colspan: row[0].colspan - 1 }];
            }
            return [...row.slice(0, columnIndex), ...row.slice(columnIndex + 1)];
        })
    };
};

export function WorkArea() {
    const [tables, setTables] = useState([
        {
            id: 1,
            data: [
                [{ value: toolOptions[0], colspan: 1 }],
                ['P1'],
                ['']
            ]
        }
    ]);

    // Handles changes to cell values
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

    const handleAddColumn = (tableId, columnIndex) => {
        setTables(prevTables =>
            prevTables.map(table =>
                table.id === tableId ? addColumn(table, columnIndex) : table
            )
        );
    };

    const handleDeleteColumn = (tableId, columnIndex) => {
        setTables(prevTables =>
            prevTables.map(table =>
                table.id === tableId ? deleteColumn(table, columnIndex) : table
            )
        );
    };

    const handleAddTable = (tb) => {
        const newTable = createNewTable(toolOptions, tb.data);
        setTables(prevTables => {
            const index = prevTables.findIndex(table => table.id === tb.id);
            return [...prevTables.slice(0, index + 1), newTable, ...prevTables.slice(index + 1)];
        });
    };

    const handleDeleteTable = (tableId) => {
        setTables(prevTables => prevTables.filter(table => table.id !== tableId));
    };

    const handleAddRow = () => {
        setTables(prevTables =>
            prevTables.map(table => ({
                ...table,
                data: [...table.data, new Array(table.data[1].length).fill('')]
            }))
        );
    };

    // Calculate the maximum number of rows across all tables
    const maxRows = Math.max(...tables.map(table => table.data.length));

    const handleContextMenu = (e, data) => {
        console.log(`Right-click on cell: row ${data.rowIndex}, column ${data.colIndex}`);
        // Add your context menu actions here
    };

    const handleDeleteRow = (rowIndex) => {
        setTables(prevTables =>
            prevTables.map(table => ({
                ...table,
                data: table.data.filter((_, index) => index !== rowIndex)
            }))
        );
    };

    const handleAddRowAbove = (rowIndex) => {
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

    const updateTablesWithNewValue = (newValue) => {
        setTables(prevTables =>
            prevTables.map(table => ({
                ...table,
                data: [...table.data, new Array(table.data[1].length).fill(newValue)]
            }))
        );
    };

    const handleHashClick = (columnIndex, event) => {
        const columnValues = tables.flatMap(table => table.data.slice(2).map(row => row[columnIndex]));
        const uniqueColumnValues = [...new Set(columnValues)].filter(value => value !== '');
        let newlyAddedValues = [];
        
        // Remove any existing popup
        const existingPopup = document.querySelector('.pop-up-window');
        if (existingPopup) {
            existingPopup.remove();
        }
        
        // Create a pop-up window with the column values
        const popUpWindow = document.createElement('div');
        popUpWindow.className = 'pop-up-window';
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
                    updateTablesWithNewValue(value);
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
        const uniqueValuesList = popUpWindow.querySelector('.unique-values-list');
        addValueButton.addEventListener('click', () => {
            const newValue = addValueInput.value.trim();
            if (newValue && !uniqueColumnValues.includes(newValue)) {
                uniqueColumnValues.push(newValue);
                newlyAddedValues.push(newValue);
                uniqueValuesList.innerHTML = uniqueColumnValues.join('<br>');
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
    };

    return (
        <section className="work-area">
            <h2>Workspace</h2>
            <div className="tool-flow-wrapper">
                <div className="index-column">
                    <div className="index-cell">Tools</div>
                    <div className="index-cell">Params</div>
                    {[...Array(maxRows - 2)].map((_, index) => (
                        <ContextMenuTrigger key={index} id="index-cell-menu" collect={() => ({ rowIndex: index + 2 })}>
                            <div className="index-cell">{index + 1}</div>
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
        </section>
    );
}

export function ColorChart() {
    return (
        <div className="color-chart">
            <h4>Color Chart - indicating the status of each node</h4>
            {/* Add color indicators here */}
        </div>
    );
}