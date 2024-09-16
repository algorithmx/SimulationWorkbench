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
import { Tool } from '../utils/Tool';
import { ContextMenuTrigger } from "rctx-contextmenu";
import { makePopup } from './Popup';


interface ToolFlowCellProps {
    value: string;
    colspan: number;
    onCellChange: (value: string) => void;
    onAddTable: () => void;
    onDeleteTable: () => void;
    isOnlyTable: boolean;
    tools: Tool[];
    tableId: number;
}

export function ToolFlowCell({ 
    value, 
    colspan, 
    onCellChange, 
    onAddTable, 
    onDeleteTable, 
    isOnlyTable, 
    tools, 
    tableId 
}: ToolFlowCellProps) {

    const handleHashClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        const popUpWindow = makePopup(event.nativeEvent, `
            <div class="tool-options-list">
                ${tools.map((t) => 
                    `<div class="tool-option">${t.name}: ${t.description}</div>`
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

        const handleToolSelect = (toolName: string) => {
            onCellChange(toolName);
            closePopup();
        };

        popUpWindow.querySelectorAll('.tool-option').forEach(option => {
            option.addEventListener('click', () => {
                const toolName = option.textContent?.split(':')[0];
                if (toolName) handleToolSelect(toolName);
            });
        });

        const closeButton = popUpWindow.querySelector('.close-btn');
        if (closeButton) closeButton.addEventListener('click', closePopup);

        const handleEscKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closePopup();
        };

        const closePopupOnOutsideClick = (e: MouseEvent) => {
            if (!popUpWindow.contains(e.target as Node) && e.target !== event.target) closePopup();
        };

        document.addEventListener('keydown', handleEscKey);
        setTimeout(() => document.addEventListener('click', closePopupOnOutsideClick), 0);
    };

    const cellRef = useRef<HTMLTableCellElement>(null);
    return (
        <th 
            colSpan={colspan || 1} 
            className="tool-flow-cell" 
            ref={cellRef}
        >
            <ContextMenuTrigger id="tool-flow-cell-menu">
                <div className="tool-flow-content">
                    <div className="tool-selector">
                        <span>{value || tools[0].name}</span>
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