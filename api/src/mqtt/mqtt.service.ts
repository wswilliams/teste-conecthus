import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';

interface NotificationMessage {
  topic: string;
  payload: string;
}

@Injectable()
export class MqttService implements OnModuleDestroy {
  private readonly client: MqttClient;
  private readonly queue: NotificationMessage[] = [];
  private processing = false;

  constructor() {
    this.client = connect(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883', {
      reconnectPeriod: 1000,
      connectTimeout: 5000,
    });
  }

  enqueueTaskCreatedNotification(userId: number, payload: Record<string, unknown>): void {
    const topic = `notifications/users/${userId}/tasks`;

    this.queue.push({
      topic,
      payload: JSON.stringify(payload),
    });

    void this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const message = this.queue.shift();

      if (!message) {
        continue;
      }

      await new Promise<void>((resolve) => {
        this.client.publish(message.topic, message.payload, { qos: 1 }, () => {
          resolve();
        });
      });
    }

    this.processing = false;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.connected) {
      await new Promise<void>((resolve) => this.client.end(false, {}, () => resolve()));
    }
  }
}
