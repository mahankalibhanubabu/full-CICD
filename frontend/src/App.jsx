import React from 'react';
import './styles/global.css';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>CI/CD Dashboard</h1>
      </header>
      <main className="app-main">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
