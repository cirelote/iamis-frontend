import React, { useState } from 'react';
import { updateSettings } from '../services/api';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    temperatureThreshold: 30,
    humidityThreshold: 70,
  });

  const [statusMessage, setStatusMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(settings);
      setStatusMessage('Settings updated successfully!');
    } catch (error) {
      setStatusMessage('Failed to update settings.');
    }
  };

  return (
    <div className="settings">
      <h2>Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="temperatureThreshold">Temperature Threshold (°C)</label>
          <input
            type="number"
            id="temperatureThreshold"
            name="temperatureThreshold"
            value={settings.temperatureThreshold}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="humidityThreshold">Humidity Threshold (%)</label>
          <input
            type="number"
            id="humidityThreshold"
            name="humidityThreshold"
            value={settings.humidityThreshold}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit" className="submit-button">
          Save Settings
        </button>
      </form>
      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </div>
  );
};

export default Settings;
