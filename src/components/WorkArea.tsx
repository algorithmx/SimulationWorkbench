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

import React, { useState, useCallback, useEffect } from 'react';
import { ReactGrid, Column, Row, CellChange, Id, HeaderCell, TextCell, 
    ReactGridProps, CellTemplate, Compatible, Uncertain, CellTemplates } from '@silevis/reactgrid';
import '@silevis/reactgrid/styles.css';
import { SimulationProject, CustomCell } from '../utils/SimulationProject';

interface WorkAreaProps {
    simProj: SimulationProject;
    setSimProj: (simProj: SimulationProject) => void;
    onUpdateWorkspaceTitle: (title: string) => void;
    onUpdateSystemMessage: (message: string) => void;
}

export function WorkArea({
    simProj,
    // @ts-ignore
    setSimProj,
    onUpdateWorkspaceTitle,
    onUpdateSystemMessage
}: WorkAreaProps) {
    const [localTitle, setLocalTitle] = useState(simProj.getName());

    const { columns, rows } = simProj.getColumnsAndRows();
    console.log('Raw columns:', columns);
    console.log('Raw rows:', rows);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setLocalTitle(newTitle);
        onUpdateWorkspaceTitle(newTitle);
        onUpdateSystemMessage(`Workspace title updated to "${newTitle}"`);
    };

    return (
        <section className="work-area">
            <input
                type="text"
                className="workspace-title-input"
                value={localTitle}
                onChange={handleTitleChange}
            />
            <ReactGrid
                rows={rows}
                columns={columns}
            />
        </section>
    );
}
