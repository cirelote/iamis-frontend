// src/pages/Dashboard.js
import React from 'react';
import DraggableGrid from '../components/DraggableGrid';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <h2>Tiled Dashboard (Resizable/Draggable)</h2>
      <DraggableGrid />
    </div>
  );
};

export default Dashboard;
