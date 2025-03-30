/* src/pages/Dashboard.js */
import React from 'react';
import DraggableGrid from '../components/DraggableGrid';
import { DashboardProvider } from '../context/DashboardContext';

const Dashboard = () => {
  return (
    <DashboardProvider>
      <DraggableGrid />
    </DashboardProvider>
  );
};

export default Dashboard;
