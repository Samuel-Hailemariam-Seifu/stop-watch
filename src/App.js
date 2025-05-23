import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const [bestLap, setBestLap] = useState(null);
  const [worstLap, setWorstLap] = useState(null);
  const [theme, setTheme] = useState('light');
  const [showMilliseconds, setShowMilliseconds] = useState(true);
  
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
    } else if (!running) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    if (laps.length >= 2) {
      const lapDiffs = [];
      for (let i = 1; i < laps.length; i++) {
        lapDiffs.push({
          index: i,
          diff: laps[i] - laps[i-1]
        });
      }
      
      if (lapDiffs.length > 0) {
        const bestLapIndex = lapDiffs.reduce((best, current) => 
          current.diff < lapDiffs[best].diff ? lapDiffs.indexOf(current) : best, 0);
        
        const worstLapIndex = lapDiffs.reduce((worst, current) => 
          current.diff > lapDiffs[worst].diff ? lapDiffs.indexOf(current) : worst, 0);
        
        setBestLap(bestLapIndex);
        setWorstLap(worstLapIndex);
      }
    } else {
      setBestLap(null);
      setWorstLap(null);
    }
  }, [laps]);

  useEffect(() => {
    if (running) {
      document.title = `⏱️ ${formatTime(time, true)} - Running`;
    } else if (time > 0) {
      document.title = `⏱️ ${formatTime(time, true)} - Paused`;
    } else {
      document.title = 'Precision Stopwatch';
    }
    
    return () => {
      document.title = 'Precision Stopwatch';
    };
  }, [time, running]);

  const handleStart = () => {
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
  };

  const handleReset = () => {
    setTime(0);
    setRunning(false);
    setLaps([]);
    setBestLap(null);
    setWorstLap(null);
  };

  const handleLap = () => {
    setLaps([...laps, time]);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleMilliseconds = () => {
    setShowMilliseconds(!showMilliseconds);
  };

  const formatTime = (timeInMs, includeMs = showMilliseconds) => {
    const ms = timeInMs || time;
    const minutes = Math.floor((ms / 60000) % 60);
    const seconds = Math.floor((ms / 1000) % 60);
    const milliseconds = Math.floor((ms / 10) % 100);

    return includeMs 
      ? `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`
      : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getLapDiff = (index) => {
    if (index === 0) return null;
    return laps[index] - laps[index - 1];
  };

  const getLapClass = (index) => {
    if (bestLap === index) return 'best-lap';
    if (worstLap === index) return 'worst-lap';
    return '';
  };

  return (
    <div className={`App ${theme}`}>
      <div className="theme-toggle">
        <button onClick={toggleTheme}>
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
        <button onClick={toggleMilliseconds}>
          {showMilliseconds ? 'Hide Milliseconds' : 'Show Milliseconds'}
        </button>
      </div>
      
      <div className="app-header">
        <div className="logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="40" height="40">
            <circle cx="32" cy="32" r="30" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2"/>
            <circle cx="32" cy="32" r="27" fill="none" stroke="#4caf50" strokeWidth="2"/>
            <circle cx="32" cy="32" r="3" fill="#f44336"/>
            <line x1="32" y1="32" x2="32" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="32" y1="32" x2="45" y2="32" stroke="#f44336" strokeWidth="2" strokeLinecap="round"/>
            <rect x="30" y="5" width="4" height="6" rx="1" fill="currentColor"/>
          </svg>
        </div>
        <h1>Precision Stopwatch</h1>
      </div>
      
      <div className="stopwatch">
        <div className="display">{formatTime()}</div>
        
        <div className="controls">
          {!running && <button className="start-btn" onClick={handleStart}>Start</button>}
          {running && <button className="stop-btn" onClick={handleStop}>Stop</button>}
          <button className="reset-btn" onClick={handleReset}>Reset</button>
          {running && <button className="lap-btn" onClick={handleLap}>Lap</button>}
        </div>
        
        {laps.length > 0 && (
          <div className="laps-container">
            <h3>Lap Times</h3>
            <div className="laps-header">
              <span>Lap</span>
              <span>Time</span>
              <span>Lap Time</span>
            </div>
            <ul className="laps-list">
              {laps.map((lapTime, index) => {
                const lapDiff = getLapDiff(index);
                const lapClass = getLapClass(index);
                
                return (
                  <li key={index} className={lapClass}>
                    <span className="lap-number">Lap {laps.length - index}</span>
                    <span className="lap-time">{formatTime(lapTime)}</span>
                    {index > 0 && (
                      <span className="lap-diff">
                        {formatTime(lapDiff)}
                        {lapClass === 'best-lap' && <span className="lap-badge">Fastest</span>}
                        {lapClass === 'worst-lap' && <span className="lap-badge">Slowest</span>}
                      </span>
                    )}
                  </li>
                );
              }).reverse()}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
