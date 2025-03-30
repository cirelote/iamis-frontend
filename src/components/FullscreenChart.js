// src/components/FullscreenChart.js
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchLayout, fetchSensorData } from '../services/api';
import { computeRollingAverages } from '../utils/rollingAverages';
import { useGlobalSettings } from '../context/GlobalSettingsContext';
import Chart from './Chart';

const FullscreenChart = () => {
  const { tileId } = useParams();

  const [tile, setTile] = useState(null);
  const [data, setData] = useState([]);

  // We'll read and write scaleFactor + min/max/avg into our context
  const {
    chartScaleFactor,
    setChartMin,
    setChartMax,
    setChartAvg,
  } = useGlobalSettings();

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

        if (values.length) {
          const minVal = Math.min(...values);
          const maxVal = Math.max(...values);
          const avgVal = values.reduce((sum, v) => sum + v, 0) / values.length;
          setChartMin(minVal);
          setChartMax(maxVal);
          setChartAvg(avgVal);
        } else {
          setChartMin(null);
          setChartMax(null);
          setChartAvg(null);
        }
      } catch (err) {
        console.error('Error loading data in fullscreen chart:', err);
      }
    };

    loadData();
    timer = setInterval(loadData, 1000);
    return () => clearInterval(timer);
  }, [tile, setChartMin, setChartMax, setChartAvg]);

  // Build chart data
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

  // Adjust y-scale based on chartScaleFactor
  const [scaledMin, scaledMax] = useMemo(() => {
    if (!data.length) return [0, 1];
    const values = data.map((d) => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    const extra = (range * (chartScaleFactor - 1)) / 2;
    return [
      minVal - extra,
      maxVal + extra,
    ];
  }, [data, chartScaleFactor]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 10 },
      animation: { duration: 0 },
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
          min: scaledMin,
          max: scaledMax,
        },
      },
    };
  }, [scaledMin, scaledMax]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {!tile ? (
          <p style={{ padding: '1rem' }}>Loading tile info...</p>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {chartData ? (
              <div style={{ flex: 1, position: 'relative', padding: '0.5rem' }}>
                <Chart data={chartData} options={chartOptions} />
              </div>
            ) : (
              <p>No data</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FullscreenChart;
