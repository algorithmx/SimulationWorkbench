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


import React, { useState } from 'react';
import './App.css';
import { MenuBar } from './components/MenuBar';
import { WorkArea } from './components/WorkArea';
import { SystemMessageArea } from './components/ColorChart';
import useSystemMessage from './hooks/useSystemMessage';

function App() {
  const [toolOptions, setToolOptions] = useState({
    'Tool A': 'Description for Tool A',
    'Tool B': 'Description for Tool B',
    'Tool C': 'Description for Tool C',
    'Tool D': 'Description for Tool D'
  });
  const [toolScripts, setToolScripts] = useState({
    'Tool A': { language: 'python', script: '' },
    'Tool B': { language: 'python', script: '' },
    'Tool C': { language: 'python', script: '' },
    'Tool D': { language: 'python', script: '' }
  });
  const [tables, setTables] = useState([
    {
        id: Date.now(),
        data: [
            [{ value: Object.keys(toolOptions)[0], colspan: 1 }],
            ['P1'],
            ['']
        ]
    }
  ]);
  const [workspaceTitle, setWorkspaceTitle] = useState("Workspace");
  const { systemMessages, updateSystemMessage } = useSystemMessage('Welcome to the workspace');

  const updateToolOptions = (updatedOptions) => {
    setToolOptions(updatedOptions);
  };

  const updateTables = (updatedTables) => {
    setTables(updatedTables);
  };

  const updateToolScript = (tool, script, language) => {
    setToolScripts(prevScripts => ({
      ...prevScripts,
      [tool]: { language, script }
    }));
  };

  const updateWorkspaceTitle = (title) => {
    setWorkspaceTitle(title);
  };

  return (
    <div className="app">
      <header>
        <MenuBar 
          tables={tables}
          toolOptions={toolOptions} 
          toolScripts={toolScripts}
          workspaceTitle={workspaceTitle}
          onUpdateToolOptions={updateToolOptions}
          onUpdateTables={updateTables}
          onUpdateToolScript={updateToolScript}
          onUpdateWorkspaceTitle={updateWorkspaceTitle}
          onUpdateSystemMessage={updateSystemMessage}
        />
      </header>
      <main>
        <WorkArea
          tables={tables}
          toolOptions={toolOptions}
          toolScripts={toolScripts}
          setTables={setTables}
          workspaceTitle={workspaceTitle}
          setWorkspaceTitle={setWorkspaceTitle}
          onUpdateSystemMessage={updateSystemMessage}
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