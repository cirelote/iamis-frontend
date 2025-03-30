// src/components/DraggableGrid.js
import React, { useState, useRef, useContext, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import { useNavigate } from 'react-router-dom';
import { DashboardContext } from '../context/DashboardContext';
import { useGlobalSettings } from '../context/GlobalSettingsContext';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './DraggableGrid.css';
import MiniTileChart from './MiniTileChart';

const DraggableGrid = () => {
  const navigate = useNavigate();
  const { tiles, updateTileLayout } = useContext(DashboardContext);
  const { numCols, numRows } = useGlobalSettings();
  const [forceKeyMap, setForceKeyMap] = useState({});
  const gridRef = useRef(null);
  const [gridHeight, setGridHeight] = useState(0);

  // Update gridHeight on mount and when window resizes
  useEffect(() => {
    const updateGridHeight = () => {
      if (gridRef.current) {
        setGridHeight(gridRef.current.clientHeight);
      }
    };
    updateGridHeight();
    window.addEventListener('resize', updateGridHeight);
    return () => window.removeEventListener('resize', updateGridHeight);
  }, []);

  // Calculate rowHeight dynamically based on grid container height and number of rows.
  const rowHeight = gridHeight && numRows ? gridHeight / numRows : 30;

  const layout = tiles.map((t) => ({
    i: t.id,
    x: t.layout.x,
    y: t.layout.y,
    w: t.layout.w,
    h: t.layout.h,
  }));

  const handleDragStop = (curLayout) => {
    updateTileLayout(curLayout);
  };

  const handleResizeStop = (curLayout) => {
    updateTileLayout(curLayout);
    const newKeyMap = { ...forceKeyMap };
    curLayout.forEach((l) => {
      newKeyMap[l.i] = (newKeyMap[l.i] || 0) + 1;
    });
    setForceKeyMap(newKeyMap);
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
              <TileView
                tile={tile}
                onClick={() => handleTileClick(tile.id)}
                forceKey={forceKeyMap[tile.id] || 0}
              />
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
};

const TileView = ({ tile, onClick, forceKey }) => {
  return (
    <div className="tile">
      <div className="tile-header">
        <h4>{tile.title}</h4>
      </div>
      <div className="tile-body" onClick={onClick}>
        <MiniTileChart key={`mini-${tile.id}-${forceKey}`} tile={tile} />
      </div>
    </div>
  );
};

export default DraggableGrid;
