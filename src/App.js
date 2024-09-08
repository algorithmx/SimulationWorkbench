import React from 'react';
import './App.css';
import { MenuBar, ProjectDirectory, WorkArea, ColorChart } from './components';

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