/* src/components/RightSidebar.js */
import React, { useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalSettings } from '../context/GlobalSettingsContext';
import { DashboardContext } from '../context/DashboardContext';
import './RightSidebar.css';

const RightSidebar = () => {
  const location = useLocation();
  const {
    numCols, setNumCols,
    numRows, setNumRows,
    chartScaleFactor, setChartScaleFactor,
    chartMin, chartMax, chartAvg
  } = useGlobalSettings();
  const { tiles, addTile, deleteTile } = useContext(DashboardContext);
  const [selectedTileId, setSelectedTileId] = useState(tiles.length > 0 ? tiles[0].id : '');

  const handleAddTile = async () => {
    const title = window.prompt('Enter tile title:', 'New Chart');
    if (!title) return;
    const sensorType = window.prompt('Enter sensor type:', 'temperature');
    if (!sensorType) return;
    const newTile = {
      id: `tile-${Date.now()}`,
      title,
      sensorType,
      data: [],
      // Default layout: auto-placed at the bottom with a default size.
      layout: { x: 0, y: Infinity, w: 4, h: 4 },
    };
    await addTile(newTile);
  };

  const handleDeleteTile = async () => {
    if (!selectedTileId) return;
    if (window.confirm('Are you sure you want to delete this tile?')) {
      await deleteTile(selectedTileId);
      if (tiles.length > 0) {
        setSelectedTileId(tiles[0].id);
      } else {
        setSelectedTileId('');
      }
    }
  };

  if (location.pathname.startsWith('/chart/')) {
    return (
      <aside className="right-sidebar">
        <div className="right-sidebar-content">
          <h3>Chart Stats</h3>
          <div className="stats-item">
            <strong>Min:</strong> {chartMin !== null ? chartMin.toFixed(2) : 'N/A'}
          </div>
          <div className="stats-item">
            <strong>Max:</strong> {chartMax !== null ? chartMax.toFixed(2) : 'N/A'}
          </div>
          <div className="stats-item">
            <strong>Avg:</strong> {chartAvg !== null ? chartAvg.toFixed(2) : 'N/A'}
          </div>
          <hr />
          <h4>Scale Factor</h4>
          <p>{chartScaleFactor.toFixed(2)}</p>
          <input
            type="range"
            min="1"
            max="10"
            step="0.1"
            value={chartScaleFactor}
            onChange={(e) => setChartScaleFactor(parseFloat(e.target.value))}
          />
        </div>
      </aside>
    );
  } else {
    return (
      <aside className="right-sidebar">
        <div className="right-sidebar-content">
          <h3>Settings</h3>
          <div className="form-group">
            <label>Number of columns:</label>
            <input
              type="number"
              min="1"
              value={numCols}
              onChange={(e) => setNumCols(parseInt(e.target.value, 10) || 1)}
            />
          </div>
          <div className="form-group">
            <label>Number of rows:</label>
            <input
              type="number"
              min="1"
              value={numRows}
              onChange={(e) => setNumRows(parseInt(e.target.value, 10) || 1)}
            />
          </div>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Adjust columns and rows for the draggable grid
          </p>
          <hr />
          <h3>Dashboard Tiles</h3>
          <button onClick={handleAddTile}>Add Tile</button>
          <div className="form-group">
            <label>Select Tile to Delete:</label>
            <select value={selectedTileId} onChange={(e) => setSelectedTileId(e.target.value)}>
              {tiles.map((tile) => (
                <option key={tile.id} value={tile.id}>{tile.title}</option>
              ))}
            </select>
          </div>
          <button onClick={handleDeleteTile}>Delete Selected Tile</button>
        </div>
      </aside>
    );
  }
};

export default RightSidebar;
