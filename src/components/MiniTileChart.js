// src/components/MiniTileChart.js
import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Title,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Title
);

const MiniTileChart = ({ tile }) => {
  const { data } = tile;

  if (!data || !data.length) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 'auto' }}>
          No Data
        </div>
      </div>
    );
  }

  // The "current" is the last data item
  const currentValue = data[data.length - 1].value.toFixed(2);

  // Pre-compute min / max to apply scale factor
  const minVal = Math.min(...data.map((d) => d.value));
  const maxVal = Math.max(...data.map((d) => d.value));
  const range = maxVal - minVal || 1; // fall back to 1 if data are identical
  const scaleFactor = 2;
  const extra = (range * (scaleFactor - 1)) / 2; 
  const scaledMin = minVal - extra;
  const scaledMax = maxVal + extra;

  // Prepare chart
  const chartData = useMemo(() => {
    const labels = data.map((d) => new Date(d.timestamp).toLocaleTimeString());
    const values = data.map((d) => d.value);

    return {
      labels,
      datasets: [
        {
          label: tile.title,
          data: values,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'transparent',
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.5,
        },
      ],
    };
  }, [data, tile.title]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0, // no animation to avoid flicker on resize
      },
      layout: {
        padding: 5,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: false,
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(200,200,200,0.2)' },
          ticks: { display: false },
        },
        y: {
          grid: { color: 'rgba(200,200,200,0.2)' },
          ticks: { display: true },
          // lock the scale to scaledMin and scaledMax
          min: scaledMin,
          max: scaledMax,
        },
      },
    };
  }, [scaledMin, scaledMax]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Big current number */}
      <div
        style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          padding: '0.3rem 0',
          flexShrink: 0,
        }}
      >
        {currentValue}
      </div>
      {/* The mini chart */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default MiniTileChart;
