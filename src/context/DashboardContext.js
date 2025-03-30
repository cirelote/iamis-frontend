/* src/context/DashboardContext.js */
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { fetchLayout, saveLayout, fetchSensorData } from '../services/api';
import { computeRollingAverages } from '../utils/rollingAverages';

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [tiles, setTiles] = useState([]);

  const loadTiles = useCallback(async () => {
    try {
      const layoutData = await fetchLayout();
      if (layoutData?.tiles) {
        const loaded = layoutData.tiles.map((t) => ({ ...t, data: [] }));
        setTiles(loaded);
      }
    } catch (err) {
      console.error('Error fetching layout:', err);
    }
  }, []);

  useEffect(() => {
    loadTiles();
  }, [loadTiles]);

  const updateAllTiles = useCallback(async () => {
    if (!tiles.length) return;
    try {
      const updated = await Promise.all(
        tiles.map(async (tile) => {
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
  }, [tiles]);

  useEffect(() => {
    const timer = setInterval(() => {
      updateAllTiles();
    }, 1000);
    return () => clearInterval(timer);
  }, [updateAllTiles]);

  const updateTileLayout = async (newLayout) => {
    const updated = tiles.map((tile) => {
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
    setTiles(updated);
    try {
      await saveLayout({
        tiles: updated.map((t) => ({
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

  const addTile = async (newTile) => {
    const updated = [...tiles, newTile];
    setTiles(updated);
    try {
      await saveLayout({
        tiles: updated.map((t) => ({
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

  const deleteTile = async (tileId) => {
    const updated = tiles.filter(tile => tile.id !== tileId);
    setTiles(updated);
    try {
      await saveLayout({
        tiles: updated.map((t) => ({
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

  return (
    <DashboardContext.Provider value={{ tiles, updateTileLayout, addTile, deleteTile }}>
      {children}
    </DashboardContext.Provider>
  );
};
