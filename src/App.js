import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import FullscreenChart from './components/FullscreenChart';
import './App.css';

const App = () => {
  return (
    <div className="app" aria-label="IAMIS Application Container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <div className="page-content" aria-live="polite">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chart/:tileId" element={<FullscreenChart />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default App;
