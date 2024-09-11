import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ContextMenuTrigger } from "react-contextmenu";

export function ToolFlowCell({ value, colspan, onCellChange, onAddTable, onDeleteTable, isOnlyTable, toolOptions, tableId }) {
    const [isOpen, setIsOpen] = useState(false);
    const cellRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (cellRef.current && !cellRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleEscKey);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, []);

    const togglePopup = (e) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
    };

    const handleSelect = (tool) => {
        onCellChange(tool);
        setIsOpen(false);
    };

    return (
        <th 
            colSpan={colspan || 1} 
            className="tool-flow-cell" 
            ref={cellRef}
        >
            <ContextMenuTrigger id="tool-flow-cell-menu" collect={() => ({ tableId })}>
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
                                        handleSelect(tool); 
                                    }}>
                                        {tool}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button className="add-table-btn" onClick={onAddTable}>+</button>
                </div>
            </ContextMenuTrigger>
        </th>
    );
}

ToolFlowCell.propTypes = {
    value: PropTypes.string,
    colspan: PropTypes.number,
    onCellChange: PropTypes.func.isRequired,
    onAddTable: PropTypes.func.isRequired,
    onDeleteTable: PropTypes.func.isRequired,
    isOnlyTable: PropTypes.bool.isRequired,
    toolOptions: PropTypes.array.isRequired,
    tableId: PropTypes.number.isRequired,
};