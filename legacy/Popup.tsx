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

// import React from 'react';

export function makePopup(
    event: MouseEvent, 
    innerHTML_content: string
): HTMLDivElement {
    // Remove any existing popup
    const existingPopup = document.querySelector<HTMLDivElement>('.pop-up-window');
    existingPopup?.remove();

    // Create a pop-up window with the column values
    const popUpWindow = document.createElement('div');
    popUpWindow.className = 'pop-up-window';
    popUpWindow.innerHTML = innerHTML_content;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    popUpWindow.style.position = 'absolute';
    popUpWindow.style.left = `${rect.left}px`;
    popUpWindow.style.top = `${rect.bottom + 5}px`;

    return popUpWindow;
}
