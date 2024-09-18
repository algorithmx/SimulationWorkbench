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
import { SystemMessageArea } from './components/Console';

// The top-level function App() should NEVER be modified.
function App() {
    const [data, setData] = useState<SimulationProject | null>(null);
    // The implementations below should NEVER be modified.
    const { systemMessages, updateSystemMessage } = useSystemMessage('Welcome to the workspace');

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
                    onDataChange={(newData) => setData(newData)}
                    onMessage={(newMessage) => updateSystemMessage(newMessage)}
                />
            </main>
            <footer>
                <div className="footer-content">
                    <SystemMessageArea messages={systemMessages} />
                    <div className="unused-area"></div>
                </div>
            </footer>
        </div>
    );
}

export default App;
