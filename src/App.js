import React from 'react';
import './App.css';
import { MenuBar } from './components/MenuBar';
import { WorkArea } from './components/WorkArea';
import { ColorChart } from './components/ColorChart';

function App() {
  return (
    <div className="app">
      <header>
        <MenuBar />
      </header>
      <main>
        <WorkArea />
      </main>
      <footer>
        <ColorChart />
      </footer>
    </div>
  );
}

export default App;