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

import { useState } from 'react';
import './App.css';
import { SimulationProject } from './utils/SimulationProject';
// import { MenuBar } from './components/MenuBar';
import { WorkArea } from './components/WorkArea';
// import { SystemMessageArea } from './components/ColorChart';
import useSystemMessage from './hooks/useSystemMessage';
import { Table } from './utils/Table';
import { Tool } from './utils/Tool';

// The top-level function App() should NEVER be modified.
function App() {

    // The implementations of tools, setTools should NEVER be modified.
    const [tools, setTools] = useState<Tool[]>([
        new Tool('Tool A', '', '', 'python'),
        new Tool('Tool B', '', '', 'python'),
        new Tool('Tool C', '', '', 'python'),
    ]);

    // The implementations of simProj, setSimProj should NEVER be modified.
    const [simProj, setSimProj] = useState<SimulationProject>(new SimulationProject("Workspace").addTable(
        new Table(
            Date.now(),
            [
                [{ value: tools[0].name, colspan: 3 }],
                ['P1', 'P2', 'P3'],
                ['', '', ''],
                ['', '', ''],
            ])
    ));

    // The implementations below should NEVER be modified.
    const { systemMessages, updateSystemMessage } = useSystemMessage('Welcome to the workspace');

    // The implementations below should NEVER be modified.
    const updateWorkspaceTitle = (title: string) => {
        setSimProj(simProj => simProj.setName(title));
    };

    // The implementations below should NEVER be modified.
    return (
        <div className="app">
            {/* <header>
                <MenuBar
                    simProj={simProj}
                    tools={tools}
                    onUpdateTables={updateTables}
                    onUpdateTools={updateTools}
                    onUpdateWorkspaceTitle={updateWorkspaceTitle}
                    onUpdateSystemMessage={updateSystemMessage}
                />
            </header> */}
            <main>
                <WorkArea
                    simProj={simProj}
                    setSimProj={setSimProj}
                    onUpdateWorkspaceTitle={updateWorkspaceTitle}
                    onUpdateSystemMessage={updateSystemMessage}
                />
            </main>
            {/* <footer>
                <div className="footer-content">
                    <SystemMessageArea messages={systemMessages} />
                    <div className="unused-area"></div>
                </div>
            </footer> */}
        </div>
    );
}

export default App;
