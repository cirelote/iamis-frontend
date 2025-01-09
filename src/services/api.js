import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

export const fetchSensorData = async (sensorType) => {
  try {
    const response = await api.get(`/sensor-data/${sensorType}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sensor data:', error.message);
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

export const updateSettings = async (settings) => {
  try {
    const response = await api.post('/api/settings', settings);
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
