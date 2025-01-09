import React, { useEffect, useState } from 'react';
import SensorCard from '../components/SensorCard';
import Chart from '../components/Chart';
import useMQTT from '../hooks/useMQTT';
import { fetchSensorData } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [sensorData, setSensorData] = useState([]);
  const mqttData = useMQTT('ws://localhost:9001', 'sensor/data');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSensorData('temperature');
        setSensorData(data);
      } catch (error) {
        console.error('Failed to load sensor data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (mqttData) {
      setSensorData((prevData) => [...prevData, mqttData]);
    }
  }, [mqttData]);

  const chartData = {
    labels: sensorData.map((data) => new Date(data.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: sensorData[0]?.sensor_type || 'Undefined Sensor',
        data: sensorData.map((data) => data.value),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="sensor-cards">
        {sensorData.map((data) => (
          <SensorCard key={data.id} title={data.sensor_type} value={data.value} unit={data.unit} />
        ))}
      </div>
      <Chart data={chartData} options={{ responsive: true }} />
    </div>
  );
};

export default Dashboard;
