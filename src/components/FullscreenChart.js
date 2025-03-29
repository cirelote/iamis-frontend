// src/components/FullscreenChart.js
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchLayout, fetchSensorData } from '../services/api';
import { computeRollingAverages } from '../utils/rollingAverages';
import Chart from './Chart';

const FullscreenChart = () => {
  const { tileId } = useParams();
  const [tile, setTile] = useState(null);
  const [data, setData] = useState([]);
  // scaleFactor now defaults to 5
  const [scaleFactor, setScaleFactor] = useState(5);

  useEffect(() => {
    (async () => {
      try {
        const layout = await fetchLayout();
        if (layout?.tiles) {
          const found = layout.tiles.find((t) => t.id === tileId);
          if (found) setTile(found);
        }
      } catch (err) {
        console.error('Error loading layout in fullscreen chart:', err);
      }
    })();
  }, [tileId]);

  useEffect(() => {
    if (!tile) return;
    let timer;
    const loadData = async () => {
      try {
        const rawData = await fetchSensorData(tile.sensorType, { limit: 400 });
        // do NOT reverse
        const values = rawData.map((d) => d.value);
        const avg10 = computeRollingAverages(values, 10);
        const avg30 = computeRollingAverages(values, 30);
        const avg90 = computeRollingAverages(values, 90);

        const merged = rawData.map((item, i) => ({
          ...item,
          avg10: avg10[i],
          avg30: avg30[i],
          avg90: avg90[i],
        }));
        setData(merged);
      } catch (err) {
        console.error('Error loading data in fullscreen chart:', err);
      }
    };

    loadData();
    timer = setInterval(loadData, 1000);
    return () => clearInterval(timer);
  }, [tile]);

  const minVal = data.length ? Math.min(...data.map((d) => d.value)) : null;
  const maxVal = data.length ? Math.max(...data.map((d) => d.value)) : null;
  const avgVal =
    data.length > 0
      ? data.reduce((sum, d) => sum + d.value, 0) / data.length
      : null;

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data.length) return null;
    const labels = data.map((d) => new Date(d.timestamp).toLocaleTimeString());
    return {
      labels,
      datasets: [
        {
          label: tile?.title ?? 'Sensor Value',
          data: data.map((d) => d.value),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'transparent',
          pointRadius: 0,
          pointHoverRadius: 2,
          borderWidth: 2,
          tension: 0.5,
        },
        {
          label: 'Avg(10)',
          data: data.map((d) => d.avg10 ?? null),
          borderColor: 'rgba(255, 99, 132, 0.3)',
          backgroundColor: 'transparent',
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.5,
        },
        {
          label: 'Avg(30)',
          data: data.map((d) => d.avg30 ?? null),
          borderColor: 'rgba(255, 159, 64, 0.3)',
          backgroundColor: 'transparent',
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.5,
        },
        {
          label: 'Avg(90)',
          data: data.map((d) => d.avg90 ?? null),
          borderColor: 'rgba(54, 162, 235, 0.3)',
          backgroundColor: 'transparent',
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.5,
        },
      ],
    };
  }, [data, tile]);

  // Calculate scaled min/max for y-axis
  const { scaledMin, scaledMax } = useMemo(() => {
    if (!data.length) {
      return { scaledMin: 0, scaledMax: 1 };
    }
    const range = maxVal - minVal || 1; // in case of identical values
    const extra = (range * (scaleFactor - 1)) / 2; // how much to pad
    return {
      scaledMin: minVal - extra,
      scaledMax: maxVal + extra,
    };
  }, [data, minVal, maxVal, scaleFactor]);

  // Chart options (uses scaled min/max for y)
  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 10 },
      animation: { duration: 0 }, // no animation to avoid flicker on resize
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
      },
      scales: {
        x: {
          grid: { color: 'rgba(200,200,200,0.2)' },
        },
        y: {
          grid: { color: 'rgba(200,200,200,0.2)' },
          // lock the scale to our scaledMin and scaledMax
          min: scaledMin,
          max: scaledMax,
        },
      },
    };
  }, [scaledMin, scaledMax]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '0.5rem' }}>
        <Link to="/">Back</Link>
      </div>
      {!tile ? (
        <p style={{ padding: '1rem' }}>Loading tile info...</p>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Big chart area */}
          <div
            style={{
              flex: 1,
              padding: '0.5rem',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {chartData ? (
              <Chart data={chartData} options={chartOptions} />
            ) : (
              <p>No data</p>
            )}
          </div>
          {/* Stats side panel */}
          <div
            style={{
              width: '250px',
              flexShrink: 0,
              borderLeft: '1px solid #ccc',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ width: '100%', marginBottom: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>{tile.title}</h3>
              <p>Sensor: {tile.sensorType}</p>
              <hr />
              <h4>Stats</h4>
              <p>Min: {minVal !== null ? minVal.toFixed(2) : 'N/A'}</p>
              <p>Max: {maxVal !== null ? maxVal.toFixed(2) : 'N/A'}</p>
              <p>Avg: {avgVal !== null ? avgVal.toFixed(2) : 'N/A'}</p>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <h4>Y-Axis Scale</h4>
              <p style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                Factor: {scaleFactor.toFixed(2)}
              </p>
              {/* Container to help with vertical alignment */}
              <div
                style={{
                  height: '150px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Range input rotated to appear vertical */}
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={scaleFactor}
                  onChange={(e) =>
                    setScaleFactor(parseFloat(e.target.value))
                  }
                  style={{
                    writingMode: 'bt-lr', // Or 'vertical-lr' for more modern browsers
                    transform: 'rotate(-90deg)', // rotate to keep min at bottom, max at top
                    height: '150px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullscreenChart;
