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


import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { ContextMenuTrigger } from "react-contextmenu";
import { makePopup } from './Popup';

export function ToolFlowCell({ value, colspan, onCellChange, onAddTable, onDeleteTable, isOnlyTable, toolOptions, tableId }) {
    const cellRef = useRef(null);

    const handleHashClick = (event) => {
        event.stopPropagation();
        const toolEntries = Object.entries(toolOptions);
        
        const popUpWindow = makePopup(event, `
            <div class="tool-options-list">
                ${toolEntries.map(([toolName, description]) => 
                    `<div class="tool-option">${toolName}: ${description}</div>`
                ).join('')}
            </div>
            <button class="close-btn">Close</button>
        `);

        document.body.appendChild(popUpWindow);

        const closePopup = () => {
            popUpWindow.remove();
            document.removeEventListener('keydown', handleEscKey);
            document.removeEventListener('click', closePopupOnOutsideClick);
        };

        const handleToolSelect = (toolName) => {
            onCellChange(toolName);
            closePopup();
        };

        popUpWindow.querySelectorAll('.tool-option').forEach(option => {
            option.addEventListener('click', () => handleToolSelect(option.textContent.split(':')[0]));
        });

        const closeButton = popUpWindow.querySelector('.close-btn');
        closeButton.addEventListener('click', closePopup);

        const handleEscKey = (e) => {
            if (e.key === 'Escape') closePopup();
        };

        const closePopupOnOutsideClick = (e) => {
            if (!popUpWindow.contains(e.target) && e.target !== event.target) closePopup();
        };

        document.addEventListener('keydown', handleEscKey);
        setTimeout(() => document.addEventListener('click', closePopupOnOutsideClick), 0);
    };

    return (
        <th 
            colSpan={colspan || 1} 
            className="tool-flow-cell" 
            ref={cellRef}
        >
            <ContextMenuTrigger id="tool-flow-cell-menu" collect={() => ({ tableId })}>
                <div className="tool-flow-content">
                    <div className="tool-selector">
                        <span>{value || Object.keys(toolOptions)[0]}</span>
                    </div>
                    <div className="tool-flow-buttons">
                        <button 
                            className="delete-table-btn" 
                            onClick={onDeleteTable}
                            disabled={isOnlyTable}
                        >
                            -
                        </button>
                        <button className="hash-btn" onClick={handleHashClick}>#</button>
                        <button className="add-table-btn" onClick={onAddTable}>+</button>
                    </div>
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
    toolOptions: PropTypes.objectOf(PropTypes.string).isRequired,
    tableId: PropTypes.number.isRequired,
};