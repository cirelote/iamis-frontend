// src/components/LeftSidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './LeftSidebar.css';

const LeftSidebar = () => {
  return (
    <nav className="left-sidebar" aria-label="Main Navigation">
      <ul>
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/settings">Settings (Old)</Link>
          {/* Remove or update if desired */}
        </li>
      </ul>
    </nav>
  );
};

export default LeftSidebar;
