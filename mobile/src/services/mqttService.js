import Constants from 'expo-constants';
import * as Paho from 'paho-mqtt';
import { resolveLocalhostUrl } from '../utils/network';

const fallbackMqttUrl =
  Constants.expoConfig?.extra?.mqttUrl ||
  Constants.manifest?.extra?.mqttUrl ||
  'ws://localhost:9001/mqtt';

const MQTT_URL = resolveLocalhostUrl(process.env.EXPO_PUBLIC_MQTT_URL || fallbackMqttUrl);

function parseMqttUrl() {
  const parsed = new URL(MQTT_URL);
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || (parsed.protocol === 'wss:' ? 443 : 80),
    path: parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '/mqtt',
    useSSL: parsed.protocol === 'wss:',
  };
}

function buildPathCandidates(path) {
  const base = path && path !== '/' ? path : '/mqtt';
  const candidates = [base, '/'];
  return [...new Set(candidates)];
}

export function connectToTaskNotifications({ userId, onMessage, onStateChange }) {
  if (!userId) {
    return { disconnect: () => {} };
  }

  let client;
  let cancelled = false;

  try {
    const options = parseMqttUrl();
    const clientId = `mobile_${userId}_${Date.now()}`;
    const topic = `notifications/users/${userId}/tasks`;
    const paths = buildPathCandidates(options.path);
    let index = 0;

    const connectWithPath = () => {
      if (cancelled) {
        return;
      }

      const currentPath = paths[index];
      client = new Paho.Client(options.host, options.port, currentPath, clientId);

      client.onConnectionLost = () => {
        onStateChange?.('disconnected');
      };

      client.onMessageArrived = (mqttMessage) => {
        try {
          const payload = JSON.parse(mqttMessage.payloadString);
          onMessage?.(payload);
        } catch {
          onMessage?.({ raw: mqttMessage.payloadString });
        }
      };

      client.connect({
        useSSL: options.useSSL,
        reconnect: true,
        cleanSession: true,
        timeout: 5,
        keepAliveInterval: 30,
        onSuccess: () => {
          onStateChange?.('connected');
          client.subscribe(topic, { qos: 1 });
        },
        onFailure: () => {
          index += 1;
          if (index < paths.length) {
            connectWithPath();
            return;
          }
          onStateChange?.('error');
        },
      });
    };

    connectWithPath();
  } catch {
    onStateChange?.('error');
  }

  return {
    disconnect: () => {
      cancelled = true;
      if (client && client.isConnected()) {
        client.disconnect();
      }
    },
  };
}
