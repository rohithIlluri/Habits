import React from 'react';
import Portfolio from './components/Portfolio/Portfolio';
import Bot from './components/Bot/Bot';
import './App.css';
import MatrixBackground from './components/Backgrounds/MatrixBackground';

function App() {
  return (
    <div className="App">
      {/* Matrix-style Background */}
      <MatrixBackground />

      {/* Content Wrapper */}
      <div className="content-wrapper">
        {/* Bot Section */}
        <div className="bot-section">
          <Bot />
        </div>

        {/* Separator Line */}
        <div className="separator-line"></div>

        {/* Portfolio Section */}
        <div className="portfolio-section">
          <Portfolio />
        </div>
      </div>
    </div>
  );
}

export default App;
