// src/components/DraggableGrid.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import GridLayout from 'react-grid-layout';
import { useNavigate } from 'react-router-dom';
import {
  fetchLayout,
  saveLayout,
  fetchSensorData,
} from '../services/api';
import { computeRollingAverages } from '../utils/rollingAverages';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './DraggableGrid.css';
import MiniTileChart from './MiniTileChart';

const COLS = 6;       // Number of grid columns
const ROW_HEIGHT = 100;

const DraggableGrid = () => {
  const navigate = useNavigate();
  
  // State that holds all tiles in the dashboard
  const [tiles, setTiles] = useState([]);
  // A ref so we can access the most recent tiles from within intervals
  const tilesRef = useRef([]);
  useEffect(() => {
    tilesRef.current = tiles;
  }, [tiles]);

  // Force re-render keys for minicharts after resizing
  const [forceKeyMap, setForceKeyMap] = useState({});

  // Whether we are adding a new sensor tile
  const [isAddMode, setIsAddMode] = useState(false);

  // ---- (1) Container width measurement for responsiveness ----
  const gridRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (gridRef.current) {
        setContainerWidth(gridRef.current.clientWidth);
      }
    };
    // Measure immediately and whenever window resizes
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---- (2) Data fetching logic ----
  const updateAllTiles = useCallback(async () => {
    const currentTiles = tilesRef.current;
    if (!currentTiles.length) return;
    try {
      const updated = await Promise.all(
        currentTiles.map(async (tile) => {
          if (!tile.sensorType) return tile;
          try {
            const rawData = await fetchSensorData(tile.sensorType, { limit: 100 });
            const values = rawData.map((d) => d.value);
            const avg10 = computeRollingAverages(values, 10);

            return {
              ...tile,
              data: rawData.map((item, i) => ({
                ...item,
                avg10: avg10[i],
              })),
            };
          } catch (err) {
            console.error('Failed to fetch data for tile:', tile.id, err);
            return tile;
          }
        })
      );
      setTiles(updated);
    } catch (err) {
      console.error('Error updating tiles:', err);
    }
  }, []);

  // Initially load the layout and fetch sensor data
  useEffect(() => {
    (async () => {
      try {
        const layoutData = await fetchLayout();
        if (layoutData?.tiles) {
          const loaded = layoutData.tiles.map((t) => ({
            ...t,
            data: [],
          }));
          setTiles(loaded);
          // Fetch sensor data right away
          updateAllTiles();
        }
      } catch (err) {
        console.error('Error fetching layout:', err);
      }
    })();
  }, [updateAllTiles]);

  // Poll sensor data every second
  useEffect(() => {
    const timer = setInterval(() => {
      updateAllTiles();
    }, 1000);
    return () => clearInterval(timer);
  }, [updateAllTiles]);

  // ---- (3) Grid layout logic ----
  const layout = tiles.map((t) => ({
    i: t.id,
    x: t.layout.x,
    y: t.layout.y,
    w: t.layout.w,
    h: t.layout.h,
  }));

  const saveTilesToServer = async (updatedTiles) => {
    try {
      await saveLayout({
        tiles: updatedTiles.map((t) => ({
          id: t.id,
          title: t.title,
          sensorType: t.sensorType,
          layout: t.layout,
        })),
      });
    } catch (err) {
      console.error('Error saving layout:', err);
    }
  };

  const applyLayoutToTiles = (newLayout) => {
    return tiles.map((tile) => {
      const found = newLayout.find((l) => l.i === tile.id);
      if (!found) return tile;
      return {
        ...tile,
        layout: {
          x: found.x,
          y: found.y,
          w: found.w,
          h: found.h,
        },
      };
    });
  };

  const handleDragStop = (curLayout) => {
    const updated = applyLayoutToTiles(curLayout);
    setTiles(updated);
    saveTilesToServer(updated);
  };

  const handleResizeStop = (curLayout) => {
    const updated = applyLayoutToTiles(curLayout);
    setTiles(updated);
    // Force re-render the mini‐charts
    const newKeyMap = { ...forceKeyMap };
    curLayout.forEach((l) => {
      const tileId = l.i;
      newKeyMap[tileId] = (newKeyMap[tileId] || 0) + 1;
    });
    setForceKeyMap(newKeyMap);

    saveTilesToServer(updated);
  };

  // ---- (4) Add sensor logic ----
  const toggleAddMode = () => {
    setIsAddMode((prev) => !prev);
    setIsDrawing(false);
    setSnapRect(null);
  };

  const [isDrawing, setIsDrawing] = useState(false);
  const [snapRect, setSnapRect] = useState(null);

  const handleTileClick = (tileId) => {
    if (!isAddMode) {
      navigate(`/chart/${tileId}`);
    }
  };

  const pixelToGrid = (px, py) => {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return { gx: 0, gy: 0 };
    const offsetX = px - rect.left;
    const offsetY = py - rect.top;
    return {
      gx: Math.floor(offsetX / 200),
      gy: Math.floor(offsetY / ROW_HEIGHT),
    };
  };

  const handleMouseDown = (e) => {
    if (!isAddMode) return;
    e.preventDefault();
    setIsDrawing(true);
    const { gx, gy } = pixelToGrid(e.clientX, e.clientY);
    setSnapRect({ x: gx, y: gy, w: 1, h: 1 });
  };

  const handleMouseMove = (e) => {
    if (!isAddMode || !isDrawing || !snapRect) return;
    e.preventDefault();
    const { gx, gy } = pixelToGrid(e.clientX, e.clientY);
    const newX = Math.min(snapRect.x, gx);
    const newY = Math.min(snapRect.y, gy);
    const newW = Math.abs(snapRect.x - gx) + 1;
    const newH = Math.abs(snapRect.y - gy) + 1;
    setSnapRect({ x: newX, y: newY, w: newW, h: newH });
  };

  const handleMouseUp = async (e) => {
    if (!isAddMode || !isDrawing || !snapRect) return;
    e.preventDefault();
    setIsDrawing(false);

    const newTitle = window.prompt('Enter tile title:', 'New Sensor');
    if (!newTitle) {
      setSnapRect(null);
      return;
    }
    const newSensor = window.prompt('Enter sensor type:', 'temperature');
    if (!newSensor) {
      setSnapRect(null);
      return;
    }

    const tileId = `tile-${Date.now()}`;
    const newTile = {
      id: tileId,
      title: newTitle,
      sensorType: newSensor,
      data: [],
      layout: {
        x: snapRect.x,
        y: snapRect.y,
        w: snapRect.w,
        h: snapRect.h,
      },
    };

    const newTiles = [...tiles, newTile];
    setTiles(newTiles);
    setSnapRect(null);
    await saveTilesToServer(newTiles);
  };

  const snapRectStyle = () => {
    if (!snapRect || !gridRef.current) return { display: 'none' };
    const left = snapRect.x * 200;
    const top = snapRect.y * ROW_HEIGHT;
    const width = snapRect.w * 200;
    const height = snapRect.h * ROW_HEIGHT;
    return {
      position: 'absolute',
      left,
      top,
      width,
      height,
      border: '2px dashed red',
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
      pointerEvents: 'none',
      zIndex: 999,
    };
  };

  // ---- (5) Render ----
  return (
    <div className="draggable-grid-container">
      <button className="add-sensor-btn" onClick={toggleAddMode}>
        {isAddMode ? 'Cancel Add Sensor' : 'Add Sensor'}
      </button>

      <div className="grid-container" ref={gridRef}>
        <div style={snapRectStyle()} />
        <div
          className="page-overlay"
          style={{ pointerEvents: isAddMode ? 'auto' : 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
        {/* Pass the measured containerWidth to GridLayout. 
            This keeps the layout responsive. */}
        <GridLayout
          className="layout"
          layout={layout}
          cols={COLS}
          rowHeight={ROW_HEIGHT}
          width={containerWidth} 
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

export default DraggableGrid;

// Sub‐component for each tile
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
