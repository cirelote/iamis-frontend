// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Header from './components/Header';
import Footer from './components/Footer';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import FullscreenChart from './components/FullscreenChart';
import { GlobalSettingsProvider } from './context/GlobalSettingsContext';
import { DashboardProvider } from './context/DashboardContext';
import './App.css';

const App = () => {
  return (
    <GlobalSettingsProvider>
      <DashboardProvider>
        <div className="app" aria-label="IAMIS Application Container">
          <Header />
          <div className="middle-section">
            <LeftSidebar />
            <div className="page-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/chart/:tileId" element={<FullscreenChart />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <RightSidebar />
          </div>
          <Footer />
        </div>
      </DashboardProvider>
    </GlobalSettingsProvider>
  );
};

export default App;
