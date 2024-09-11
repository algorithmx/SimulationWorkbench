import React from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import { ToolFlowTable } from './ToolFlowTable';
import { useToolFlowTables } from '../hooks/useToolFlowTables';

export function WorkArea({tables, toolOptions, toolScripts, setTables}) {
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