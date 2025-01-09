import React from 'react';
import './SensorCard.css';

const SensorCard = ({ title, value, unit }) => {
  return (
    <div className="sensor-card">
      <h3>{title}</h3>
      <p>
        {value} <span>{unit}</span>
      </p>
    </div>
  );
};

export default SensorCard;
