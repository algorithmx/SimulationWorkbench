import React from 'react';
import PropTypes from 'prop-types';
import { ContextMenuTrigger } from "react-contextmenu";
import { ToolFlowCell } from './ToolFlowCell';
import { calculateCellGroups } from '../utils/tableUtils';

export function ToolFlowTable({ 
    data, 
    onCellChange, 
    onAddColumn, 
    onDeleteColumn, 
    onAddTable, 
    onDeleteTable, 
    isOnlyTable, 
    onContextMenu, 
    handleHashClick 
}) {
    const [toolFlowRow, parametersRow, ...valueRows] = data;
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
                                            onClick={(e) => handleHashClick(index, data, e)}
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

ToolFlowTable.propTypes = {
    data: PropTypes.arrayOf(PropTypes.array).isRequired,
    onCellChange: PropTypes.func.isRequired,
    onAddColumn: PropTypes.func.isRequired,
    onDeleteColumn: PropTypes.func.isRequired,
    onAddTable: PropTypes.func.isRequired,
    onDeleteTable: PropTypes.func.isRequired,
    isOnlyTable: PropTypes.bool.isRequired,
    onContextMenu: PropTypes.func.isRequired,
    handleHashClick: PropTypes.func.isRequired,
};