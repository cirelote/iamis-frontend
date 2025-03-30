// src/context/GlobalSettingsContext.js
import React, { createContext, useContext, useState } from 'react';

const GlobalSettingsContext = createContext();

export const GlobalSettingsProvider = ({ children }) => {
  // Dashboard settings
  const [numCols, setNumCols] = useState(6);
  const [numRows, setNumRows] = useState(4);

  // Fullscreen chart scale factor
  const [chartScaleFactor, setChartScaleFactor] = useState(5);

  // Fullscreen chart stats (min, max, avg)
  const [chartMin, setChartMin] = useState(null);
  const [chartMax, setChartMax] = useState(null);
  const [chartAvg, setChartAvg] = useState(null);

  const value = {
    // Dashboard settings
    numCols,
    setNumCols,
    numRows,
    setNumRows,

    // Chart scale factor
    chartScaleFactor,
    setChartScaleFactor,

    // Chart stats
    chartMin,
    setChartMin,
    chartMax,
    setChartMax,
    chartAvg,
    setChartAvg,
  };

  return (
    <GlobalSettingsContext.Provider value={value}>
      {children}
    </GlobalSettingsContext.Provider>
  );
};

export const useGlobalSettings = () => useContext(GlobalSettingsContext);
