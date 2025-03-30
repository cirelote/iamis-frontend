// src/components/Chart.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Chart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Chart = ({ data, options }) => {
  if (!data) {
    return <div className="chart">No chart data</div>;
  }

  return (
    <div className="chart">
      <Line data={data} options={options} />
    </div>
  );
};

export default Chart;
