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
          <Link to="/History">History</Link>
        </li>
      </ul>
    </nav>
  );
};

export default LeftSidebar;
