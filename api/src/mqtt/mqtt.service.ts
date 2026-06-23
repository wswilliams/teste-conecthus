import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';

interface NotificationMessage {
  topic: string;
  payload: string;
}

@Injectable()
export class MqttService implements OnModuleDestroy {
  private static readonly MAX_QUEUE_SIZE = 1000;
  private static readonly RETRY_DELAY_MS = 1500;

  private readonly logger = new Logger(MqttService.name);
  private readonly client: MqttClient;
  private readonly queue: NotificationMessage[] = [];
  private processing = false;
  private retryTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.client = connect(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883', {
      reconnectPeriod: 1000,
      connectTimeout: 5000,
    });

    this.client.on('connect', () => {
      this.logger.log('MQTT broker connected');
      void this.processQueue();
    });

    this.client.on('reconnect', () => {
      this.logger.warn('MQTT reconnecting...');
    });

    this.client.on('offline', () => {
      this.logger.warn('MQTT broker is offline');
    });

    this.client.on('error', (error) => {
      this.logger.warn(`MQTT error: ${error.message}`);
    });
  }

  enqueueTaskCreatedNotification(userId: number, payload: Record<string, unknown>): void {
    const topic = `notifications/users/${userId}/tasks`;

    if (this.queue.length >= MqttService.MAX_QUEUE_SIZE) {
      this.queue.shift();
      this.logger.warn('MQTT queue limit reached. Dropping oldest notification.');
    }

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

    if (!this.client.connected) {
      this.scheduleRetry();
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      if (!this.client.connected) {
        this.scheduleRetry();
        break;
      }

      const message = this.queue[0];

      if (!message) {
        continue;
      }

      const published = await this.publish(message);

      if (!published) {
        this.scheduleRetry();
        break;
      }

      this.queue.shift();
    }

    this.processing = false;
  }

  private publish(message: NotificationMessage): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.client.publish(message.topic, message.payload, { qos: 1 }, (error?: Error) => {
        if (error) {
          this.logger.warn(`Failed to publish MQTT notification: ${error.message}`);
          resolve(false);
          return;
        }

        resolve(true);
      });
    });
  }

  private scheduleRetry(): void {
    if (this.retryTimer) {
      return;
    }

    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      void this.processQueue();
    }, MqttService.RETRY_DELAY_MS);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    await new Promise<void>((resolve) => this.client.end(false, {}, () => resolve()));
  }
}
