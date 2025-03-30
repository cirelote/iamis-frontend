// src/components/DraggableGrid.js
import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';
import GridLayout from 'react-grid-layout';
import { useNavigate } from 'react-router-dom';
import { DashboardContext } from '../context/DashboardContext';
import { useGlobalSettings } from '../context/GlobalSettingsContext';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './DraggableGrid.css';
import MiniTileChart from './MiniTileChart';

// Simple debounce function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const DraggableGrid = () => {
  const navigate = useNavigate();
  const { tiles, updateTileLayout } = useContext(DashboardContext);
  const { numCols, numRows } = useGlobalSettings();
  const [gridHeight, setGridHeight] = useState(0);
  const gridRef = useRef(null);

  const updateGridHeight = useCallback(() => {
    if (gridRef.current) {
      setGridHeight(gridRef.current.clientHeight);
    }
  }, []);

  useEffect(() => {
    updateGridHeight();
    const debouncedResize = debounce(updateGridHeight, 200);
    window.addEventListener('resize', debouncedResize);
    return () => window.removeEventListener('resize', debouncedResize);
  }, [updateGridHeight]);

  const rowHeight = gridHeight && numRows ? gridHeight / numRows : 30;

  const layout = tiles.map((tile) => ({
    i: tile.id,
    x: tile.layout.x,
    y: tile.layout.y,
    w: tile.layout.w,
    h: tile.layout.h,
  }));

  const handleDragStop = (curLayout) => {
    updateTileLayout(curLayout);
  };

  const handleResizeStop = (curLayout) => {
    updateTileLayout(curLayout);
  };

  const handleTileClick = (tileId) => {
    navigate(`/chart/${tileId}`);
  };

  return (
    <div className="draggable-grid-container">
      <div className="grid-container" ref={gridRef}>
        <GridLayout
          className="layout"
          layout={layout}
          cols={numCols}
          rowHeight={rowHeight}
          width={gridRef.current?.clientWidth || 800}
          margin={[2, 2]}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
          draggableHandle=".tile-header"
        >
          {tiles.map((tile) => (
            <div key={tile.id} className="tile-wrapper">
              <TileView tile={tile} onClick={() => handleTileClick(tile.id)} />
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
};

const TileView = ({ tile, onClick }) => (
  <div className="tile">
    <div className="tile-header">
      <h4>{tile.title}</h4>
    </div>
    <div className="tile-body" onClick={onClick}>
      <MiniTileChart tile={tile} />
    </div>
  </div>
);

export default DraggableGrid;
