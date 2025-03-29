import axios from 'axios';

// Base config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

// --- Pagination example: GET /sensor-data/{sensor_type}/?page=1&limit=100

// Sensor data
export const fetchSensorData = async (sensorType, { page = 1, limit = 20 } = {}) => {
  const response = await api.get(`/sensor-data/${sensorType}/`, {
    params: { page, limit },
  });
  return response.data.reverse();
};

// Layout endpoints
export const fetchLayout = async () => {
  const response = await api.get('/api/layout');
  return response.data;
};

export const saveLayout = async (layoutObj) => {
  const response = await api.post('/api/layout', layoutObj);
  return response.data;
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

// Patch only changed fields
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
