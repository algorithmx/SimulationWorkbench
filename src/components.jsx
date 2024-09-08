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

function ToolFlowCell({ value, colspan, onCellChange, onAddTable, onDeleteTable, isOnlyTable }) {
    const [isOpen, setIsOpen] = useState(false);
    const cellRef = useRef(null);

    const handleSelect = (tool) => {
        onCellChange(tool);
        setIsOpen(false);
    };

    const togglePopup = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const closePopup = (e) => {
            if (cellRef.current && !cellRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('click', closePopup);
        return () => document.removeEventListener('click', closePopup);
    }, []);

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
                                <li key={index} onClick={(e) => { e.stopPropagation(); handleSelect(tool); }}>
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

function ToolFlowTable({ data, onCellChange, onAddColumn, onDeleteColumn, onAddTable, onDeleteTable, isOnlyTable, onContextMenu }) {
    const toolFlowRow = data[0];
    const parametersRow = data[1];
    const valueRows = data.slice(2);
    const columnCount = parametersRow.length;

    const handleHashClick = (columnIndex) => {
        // Empty function for now
        console.log(`Hash button clicked for column ${columnIndex}`);
    };

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
                                    <span
                                        contentEditable
                                        onBlur={(e) => onCellChange(1, index, e.target.textContent)}
                                    >
                                        {cell}
                                    </span>
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
                                            onClick={() => handleHashClick(index)}
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
                        {row.map((cell, colIndex) => (
                            rowIndex >= 2 ? (
                                <ContextMenuTrigger
                                    key={colIndex}
                                    id="cell-context-menu"
                                    collect={() => ({ rowIndex: rowIndex + 2, colIndex })}
                                >
                                    <td
                                        contentEditable
                                        onBlur={(e) => onCellChange(rowIndex + 2, colIndex, e.target.textContent)}
                                    >
                                        {cell}
                                    </td>
                                </ContextMenuTrigger>
                            ) : (
                                <td
                                    key={colIndex}
                                    contentEditable
                                    onBlur={(e) => onCellChange(rowIndex + 2, colIndex, e.target.textContent)}
                                >
                                    {cell}
                                </td>
                            )
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export function WorkArea() {
    const [tables, setTables] = useState([
        {
            id: 1,
            data: [
                [{ value: toolOptions[0], colspan: 3 }],
                ['P1', 'P2', 'P3'],
                ['', '', ''],
                ['', '', ''],
                ['', '', ''],
            ]
        },
        {
            id: 2,
            data: [
                [{ value: toolOptions[0], colspan: 2 }],
                ['P4', 'P5'],
                ['', ''],
                ['', ''],
                ['', ''],
            ]
        }
    ]);

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

    const addColumn = (table, columnIndex) => {
        const numRows = table.data.length;
        const ret = {
            ...table,
            data: table.data.map((row, rowIndex) => {
                if (rowIndex === 0) {
                    // Increase colspan for the tool row
                    return [{ ...row[0], colspan: row[0].colspan + 1 }];
                }
                // Add a new cell to other rows at the specified index
                const newCell = rowIndex === 1 ? 'PNew' : '';
                return [...row.slice(0, columnIndex + 1), newCell, ...row.slice(columnIndex + 1)];
            })
        };
        console.log(ret);
        return ret;
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
            prevTables.map(table => {
                if (table.id === tableId) {
                    const columnCount = table.data[1].length;
                    if (columnCount === 1) {
                        // Don't delete if it's the last column
                        return table;
                    }
                    return {
                        ...table,
                        data: table.data.map((row, rowIndex) => {
                            if (rowIndex === 0) {
                                // Decrease colspan for the tool row
                                return [{ ...row[0], colspan: row[0].colspan - 1 }];
                            }
                            // Remove the cell at the specified index
                            return [...row.slice(0, columnIndex), ...row.slice(columnIndex + 1)];
                        })
                    };
                }
                return table;
            })
        );
    };

    const handleAddTable = (tableId) => {
        const newTable = {
            id: Date.now(), // Use a unique ID
            data: [
                [{ value: toolOptions[0], colspan: 1 }],
                ['PNew'],
                [''],
                [''],
                ['']
            ]
        };
        setTables(prevTables => {
            const index = prevTables.findIndex(table => table.id === tableId);
            return [...prevTables.slice(0, index + 1), newTable, ...prevTables.slice(index + 1)];
        });
    };

    const handleDeleteTable = (tableId) => {
        setTables(prevTables => prevTables.filter(table => table.id !== tableId));
    };

    // Calculate the maximum number of rows across all tables
    const maxRows = Math.max(...tables.map(table => table.data.length));

    const handleContextMenu = (e, data) => {
        console.log(`Right-click on cell: row ${data.rowIndex}, column ${data.colIndex}`);
        // Add your context menu actions here
    };

    return (
        <section className="work-area">
            <h2>Workspace</h2>
            <div className="tool-flow-wrapper">
                <div className="index-column">
                    <div className="index-cell">Tools</div>
                    <div className="index-cell">Params</div>
                    {[...Array(maxRows - 2)].map((_, index) => (
                        <div key={index} className="index-cell">{index + 1}</div>
                    ))}
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
                                onAddTable={() => handleAddTable(table.id)}
                                onDeleteTable={() => handleDeleteTable(table.id)}
                                isOnlyTable={tables.length === 1}
                                onContextMenu={handleContextMenu}
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