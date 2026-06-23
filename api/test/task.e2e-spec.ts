import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { MqttService } from '../src/mqtt/mqtt.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { RedisService } from '../src/redis/redis.service';
import { TaskController } from '../src/task/controller/task.controller';
import { TaskService } from '../src/task/service/task.service';

describe('TaskModule (e2e)', () => {
  let app: INestApplication;

  const prismaMock = {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const redisMock = {
    getJson: jest.fn(),
    setJson: jest.fn(),
    delByPattern: jest.fn(),
  };

  const mqttMock = {
    enqueueTaskCreatedNotification: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        TaskService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
        { provide: MqttService, useValue: mqttMock },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /tasks should create and return a task', async () => {
    const now = new Date('2026-06-23T12:00:00.000Z');

    prismaMock.task.create.mockResolvedValue({
      id: 10,
      title: 'Task API',
      description: 'Criada via e2e',
      status: 'open',
      createat: now,
      userId: 4,
    });
    redisMock.delByPattern.mockResolvedValue(undefined);

    await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Task API',
        description: 'Criada via e2e',
        status: 'open',
        userId: 4,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBe(10);
        expect(res.body.title).toBe('Task API');
        expect(res.body.userId).toBe(4);
      });

    expect(mqttMock.enqueueTaskCreatedNotification).toHaveBeenCalledWith(
      4,
      expect.objectContaining({ event: 'task.created', taskId: 10 }),
    );
  });

  it('GET /tasks should return filtered task list', async () => {
    redisMock.getJson.mockResolvedValue(null);
    prismaMock.task.findMany.mockResolvedValue([
      { id: 1, title: 'A', description: 'B', status: 'open', createat: new Date(), userId: 3 },
    ]);
    redisMock.setJson.mockResolvedValue(undefined);

    await request(app.getHttpServer())
      .get('/tasks?status=open')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].status).toBe('open');
      });

    expect(prismaMock.task.findMany).toHaveBeenCalled();
  });
});
