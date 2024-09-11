import React, { useState } from 'react';
import './App.css';
import { MenuBar } from './components/MenuBar';
import { WorkArea } from './components/WorkArea';
import { ColorChart } from './components/ColorChart';

function App() {
  const [toolOptions, setToolOptions] = useState(['Tool A', 'Tool B', 'Tool C', 'Tool D']);
  const [toolScripts, setToolScripts] = useState({
    'Tool A': '',
    'Tool B': '',
    'Tool C': '',
    'Tool D': ''
  });
  const [tables, setTables] = useState([
    {
        id: 1,
        data: [
            [{ value: toolOptions[0], colspan: 1 }],
            ['P1'],
            ['']
        ]
    }
  ]);
  const [workspaceTitle, setWorkspaceTitle] = useState("Workspace");

  const updateToolOptions = (updatedOptions) => {
    setToolOptions(updatedOptions);
  };

  const updateTables = (updatedTables) => {
    setTables(updatedTables);
  };

  const updateToolScript = (tool, script) => {
    setToolScripts(prevScripts => ({
      ...prevScripts,
      [tool]: script
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
        />
      </main>
      <footer>
        <ColorChart />
      </footer>
    </div>
  );
}

export default App;