import React, { useEffect, useState } from 'react';
import { getSettings, patchSettings } from '../services/api';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    temperatureThreshold: '',
    humidityThreshold: ''
  });
  const [initialSettings, setInitialSettings] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // Load settings from backend
    const loadSettings = async () => {
      try {
        const data = await getSettings();
        setSettings(data);
        setInitialSettings(data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        setStatusMessage('Error fetching settings.');
      }
    };
    loadSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const changes = {};
    // Only send changed fields to the server
    if (settings.temperatureThreshold !== initialSettings.temperatureThreshold) {
      changes.temperatureThreshold = Number(settings.temperatureThreshold);
    }
    if (settings.humidityThreshold !== initialSettings.humidityThreshold) {
      changes.humidityThreshold = Number(settings.humidityThreshold);
    }

    if (Object.keys(changes).length === 0) {
      setStatusMessage('No changes to update.');
      return;
    }

    try {
      await patchSettings(changes);
      setStatusMessage('Settings updated successfully!');
      setInitialSettings(settings);
    } catch (error) {
      console.error('Failed to update settings:', error);
      setStatusMessage('Failed to update settings.');
    }
  };

  return (
    <div className="settings">
      <h2>Settings</h2>
      <form onSubmit={handleSubmit} aria-label="Settings Form">
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
