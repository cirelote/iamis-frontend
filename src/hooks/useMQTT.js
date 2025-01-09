import { useState, useEffect } from 'react';
import mqtt from 'mqtt/dist/mqtt.min';

const useMQTT = (brokerUrl, topic) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const client = mqtt.connect(brokerUrl);

    client.on('connect', () => {
      console.log(`Connected to MQTT broker at ${brokerUrl}`);
      client.subscribe(topic, (err) => {
        if (err) console.error(`Failed to subscribe to topic: ${topic}`);
      });
    });

    client.on('message', (receivedTopic, message) => {
      if (receivedTopic === topic) {
        try {
          const parsedMessage = JSON.parse(message.toString());
          setData(parsedMessage);
        } catch (error) {
          console.error('Failed to parse MQTT message:', error);
        }
      }
    });

    return () => {
      client.end();
    };
  }, [brokerUrl, topic]);

  return data;
};

export default useMQTT;
