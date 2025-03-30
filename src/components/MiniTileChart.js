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
import PropTypes from 'prop-types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Title);

const MiniTileChart = ({ tile }) => {
  const { data, title } = tile;

  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>No Data</span>
      </div>
    );
  }

  const currentValue = data[data.length - 1].value.toFixed(2);
  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const scaleFactor = 2;
  const extra = (range * (scaleFactor - 1)) / 2;
  const scaledMin = minVal - extra;
  const scaledMax = maxVal + extra;

  const chartData = useMemo(() => {
    const labels = data.map((d) => new Date(d.timestamp).toLocaleTimeString());
    return {
      labels,
      datasets: [
        {
          label: title,
          data: values,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'transparent',
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.5,
        },
      ],
    };
  }, [data, title, values]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    layout: { padding: 5 },
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { grid: { color: 'rgba(200,200,200,0.2)' }, ticks: { display: false } },
      y: { grid: { color: 'rgba(200,200,200,0.2)' }, ticks: { display: true }, min: scaledMin, max: scaledMax },
    },
  }), [scaledMin, scaledMax]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', padding: '0.3rem 0' }}>
        {currentValue}
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

MiniTileChart.propTypes = {
  tile: PropTypes.shape({
    title: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
      timestamp: PropTypes.string,
      value: PropTypes.number,
    })),
  }).isRequired,
};

export default MiniTileChart;
