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

const COL_WIDTH = 200;
const ROW_HEIGHT = 100;

const DraggableGrid = () => {
  const navigate = useNavigate();

  const [tiles, setTiles] = useState([]);
  // Keep a ref to always have the latest tiles in the polling function:
  const tilesRef = useRef([]);
  useEffect(() => {
    tilesRef.current = tiles;
  }, [tiles]);

  // Force re-render keys for minicharts after resizing
  const [forceKeyMap, setForceKeyMap] = useState({});

  const [isAddMode, setIsAddMode] = useState(false);

  // ------------ Data Fetching Logic ------------
  const updateAllTiles = useCallback(async () => {
    const currentTiles = tilesRef.current;
    if (!currentTiles.length) return; // Avoid if no tiles
    try {
      const updated = await Promise.all(
        currentTiles.map(async (tile) => {
          if (!tile.sensorType) return tile;
          try {
            // get up to 100 data points, newest last
            const rawData = await fetchSensorData(tile.sensorType, { limit: 100 });
            // compute rolling avg
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

  // 1) Load layout from server, then immediately fetch data
  useEffect(() => {
    (async () => {
      try {
        const layoutData = await fetchLayout();
        if (layoutData?.tiles) {
          // Initialize all tile data arrays to empty
          const loaded = layoutData.tiles.map((t) => ({ ...t, data: [] }));
          setTiles(loaded);
          // Immediately fetch sensor data so we don't wait for the 2s interval
          updateAllTiles();
        }
      } catch (err) {
        console.error('Error fetching layout:', err);
      }
    })();
  }, [updateAllTiles]);

  // 2) Poll sensor data every 1 seconds, but only set up once
  useEffect(() => {
    const timer = setInterval(() => {
      updateAllTiles();
    }, 1000);

    // Clean up
    return () => clearInterval(timer);
  }, [updateAllTiles]);

  // ------------ Grid Layout / Saving Logic ------------
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

    // Bump the forceKey for each tile that changed
    const newKeyMap = { ...forceKeyMap };
    curLayout.forEach((l) => {
      const tileId = l.i;
      newKeyMap[tileId] = (newKeyMap[tileId] || 0) + 1;
    });

    setForceKeyMap(newKeyMap);
    saveTilesToServer(updated);
  };

  // ------------ Add Sensor Logic ------------
  const toggleAddMode = () => {
    setIsAddMode((prev) => !prev);
    setIsDrawing(false);
    setSnapRect(null);
  };

  const [isDrawing, setIsDrawing] = useState(false);
  const [snapRect, setSnapRect] = useState(null);
  const gridRef = useRef(null);

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
      gx: Math.floor(offsetX / COL_WIDTH),
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
        h: snapRect.h
      },
    };

    const newTiles = [...tiles, newTile];
    setTiles(newTiles);
    setSnapRect(null);
    await saveTilesToServer(newTiles);
  };

  const snapRectStyle = () => {
    if (!snapRect || !gridRef.current) return { display: 'none' };
    const left = snapRect.x * COL_WIDTH;
    const top = snapRect.y * ROW_HEIGHT;
    const width = snapRect.w * COL_WIDTH;
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

  // ------------ Render ------------
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

        <GridLayout
          className="layout"
          layout={layout}
          cols={6}
          rowHeight={ROW_HEIGHT}
          width={COL_WIDTH * 6}
          margin={[2, 2]}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
          // Only the header can be dragged
          draggableHandle=".tile-header"
        >
          {tiles.map((tile) => (
            <div key={tile.id} className="tile-wrapper">
              <TileView
                tile={tile}
                onClick={() => handleTileClick(tile.id)}
                forceKey={(forceKeyMap[tile.id] || 0)}
              />
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
};

export default DraggableGrid;

// The tile: header is drag handle, body is clickable -> open fullscreen
const TileView = ({ tile, onClick, forceKey }) => {
  return (
    <div className="tile">
      <div className="tile-header">
        <h4>{tile.title}</h4>
      </div>
      {/* Body => open fullscreen on click */}
      <div className="tile-body" onClick={onClick}>
        <MiniTileChart key={`mini-${tile.id}-${forceKey}`} tile={tile} />
      </div>
    </div>
  );
};
