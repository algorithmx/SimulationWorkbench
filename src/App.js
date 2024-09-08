import React, { useState } from 'react';
import './App.css';
import { MenuBar } from './components/MenuBar';
import { WorkArea } from './components/WorkArea';
import { ColorChart } from './components/ColorChart';

function App() {
  const [toolOptions, setToolOptions] = useState(['Tool A', 'Tool B', 'Tool C', 'Tool D']);
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

  const updateToolOptions = (updatedOptions) => {
    setToolOptions(updatedOptions);
  };

  const updateTables = (updatedTables) => {
    setTables(updatedTables);
  };

  return (
    <div className="app">
      <header>
        <MenuBar 
          toolOptions={toolOptions} 
          onUpdateToolOptions={updateToolOptions}
          tables={tables}
          onUpdateTables={updateTables}
        />
      </header>
      <main>
        <WorkArea
          tables={tables}
          setTables={setTables}
        />
      </main>
      <footer>
        <ColorChart />
      </footer>
    </div>
  );
}

export default App;