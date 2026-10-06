export default {
  files: [
    {
      path: 'App.jsx',
      content: `import React, { useState } from 'react';

const CITIES = [
  { name: 'San Francisco', temp: 68, condition: 'Sunny', high: 72, low: 55, humidity: '64%', wind: '9 mph', icon: '☀️' },
  { name: 'New York', temp: 75, condition: 'Partly Cloudy', high: 80, low: 66, humidity: '58%', wind: '12 mph', icon: '⛅' },
  { name: 'London', temp: 61, condition: 'Rainy', high: 64, low: 52, humidity: '82%', wind: '15 mph', icon: '🌧️' },
  { name: 'Tokyo', temp: 72, condition: 'Clear', high: 78, low: 63, humidity: '55%', wind: '8 mph', icon: '☀️' },
  { name: 'Paris', temp: 66, condition: 'Cloudy', high: 70, low: 57, humidity: '70%', wind: '10 mph', icon: '☁️' },
  { name: 'Sydney', temp: 64, condition: 'Sunny', high: 69, low: 53, humidity: '60%', wind: '14 mph', icon: '☀️' },
];

export default function App() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [unit, setUnit] = useState('F');

  const toDisplayTemp = (tempF) => {
    if (unit === 'C') {
      return Math.round(((tempF - 32) * 5) / 9);
    }
    return tempF;
  };

  return (
    <div className="weather-app">
      <div className="weather-card">
        <header className="header">
          <div className="city-selector">
            <select
              value={selectedCity.name}
              onChange={(e) => {
                const found = CITIES.find((c) => c.name === e.target.value);
                if (found) setSelectedCity(found);
              }}
            >
              {CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <button
            className="unit-toggle"
            onClick={() => setUnit(unit === 'F' ? 'C' : 'F')}
          >
            °{unit === 'F' ? 'C' : 'F'}
          </button>
        </header>

        <div className="current-weather">
          <div className="condition-icon">{selectedCity.icon}</div>
          <div className="temp-display">
            <span className="temp-val">{toDisplayTemp(selectedCity.temp)}</span>
            <span className="temp-unit">°{unit}</span>
          </div>
          <div className="condition-label">{selectedCity.condition}</div>
          <div className="high-low">
            H: {toDisplayTemp(selectedCity.high)}° • L: {toDisplayTemp(selectedCity.low)}°
          </div>
        </div>

        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-title">Humidity</span>
            <span className="detail-value">{selectedCity.humidity}</span>
          </div>
          <div className="detail-item">
            <span className="detail-title">Wind</span>
            <span className="detail-value">{selectedCity.wind}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
`,
    },
    {
      path: 'main.jsx',
      content: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
`,
    },
    {
      path: 'styles.css',
      content: `:root {
  --bg-gradient: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  --card-bg: rgba(255, 255, 255, 0.1);
  --border-color: rgba(255, 255, 255, 0.2);
  --text-main: #ffffff;
  --text-muted: rgba(255, 255, 255, 0.7);
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: #0f172a;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.weather-app {
  padding: 24px;
}

.weather-card {
  background: var(--bg-gradient);
  border: 1px solid var(--border-color);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 32px;
  width: 320px;
  color: var(--text-main);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

select {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid var(--border-color);
  color: #fff;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  cursor: pointer;
}

select option {
  background: #1e3c72;
  color: #fff;
}

.unit-toggle {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  padding: 8px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.unit-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
}

.current-weather {
  text-align: center;
  margin-bottom: 32px;
}

.condition-icon {
  font-size: 56px;
  margin-bottom: 8px;
}

.temp-display {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.temp-val {
  font-size: 64px;
  font-weight: 700;
  line-height: 1;
}

.temp-unit {
  font-size: 24px;
  font-weight: 500;
  margin-left: 4px;
}

.condition-label {
  font-size: 18px;
  margin-top: 8px;
  color: var(--text-muted);
}

.high-low {
  font-size: 14px;
  margin-top: 6px;
  color: var(--text-muted);
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 16px;
  padding: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-title {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  margin-top: 4px;
}
`,
    },
  ],
};
