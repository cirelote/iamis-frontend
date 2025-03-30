// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

// Sensor data
export const fetchSensorData = async (sensorType, { page = 1, limit = 20 } = {}) => {
  try {
    const response = await api.get(`/sensor-data/${sensorType}/`, { params: { page, limit } });
    // If reversing data is a presentation concern, consider doing it on the client
    return response.data.reverse();
  } catch (error) {
    console.error(`Error fetching sensor data for ${sensorType}:`, error.message);
    throw error;
  }
};

// Layout endpoints
export const fetchLayout = async () => {
  try {
    const response = await api.get('/api/layout');
    return response.data;
  } catch (error) {
    console.error('Error fetching layout:', error.message);
    throw error;
  }
};

export const saveLayout = async (layoutObj) => {
  try {
    const response = await api.post('/api/layout', layoutObj);
    return response.data;
  } catch (error) {
    console.error('Error saving layout:', error.message);
    throw error;
  }
};

export const createSensorData = async (data) => {
  try {
    const response = await api.post('/sensor-data/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating sensor data:', error.message);
    throw error;
  }
};

export const getSettings = async () => {
  try {
    const response = await api.get('/api/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error.message);
    throw error;
  }
};

export const patchSettings = async (changes) => {
  try {
    const response = await api.patch('/api/settings', changes);
    return response.data;
  } catch (error) {
    console.error('Error updating settings:', error.message);
    throw error;
  }
};

export const healthCheck = async () => {
  try {
    const response = await api.get('/health-check/');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error.message);
    throw error;
  }
};

export default api;
