import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom } from 'rxjs';
import { MqttService } from 'src/mqtt/mqtt.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
        { provide: MqttService, useValue: mqttMock },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should create a task, invalidate cache and enqueue MQTT notification', async () => {
    const createdTask = {
      id: 1,
      title: 'Nova tarefa',
      description: 'Descricao',
      status: 'open',
      createat: new Date('2026-06-23T10:00:00.000Z'),
      userId: 7,
    };

    prismaMock.task.create.mockResolvedValue(createdTask);
    redisMock.delByPattern.mockResolvedValue(undefined);

    const result = await firstValueFrom(
      service.create({
        title: 'Nova tarefa',
        description: 'Descricao',
        status: 'open',
        userId: 7,
      }),
    );

    expect(result).toEqual(createdTask);
    expect(redisMock.delByPattern).toHaveBeenCalledWith('task:list:*');
    expect(mqttMock.enqueueTaskCreatedNotification).toHaveBeenCalledWith(7, {
      event: 'task.created',
      taskId: 1,
      title: 'Nova tarefa',
      status: 'open',
      createat: createdTask.createat,
    });
  });

  it('should return cached task list when cache exists', async () => {
    const cachedTasks = [{ id: 1, title: 'A', description: 'B', status: 'open', userId: 2 }];

    redisMock.getJson.mockResolvedValue(cachedTasks);

    const result = await firstValueFrom(service.findAll({ status: 'open' }));

    expect(result).toEqual(cachedTasks);
    expect(prismaMock.task.findMany).not.toHaveBeenCalled();
  });

  it('should query database and cache task list on cache miss', async () => {
    const dbTasks = [{ id: 2, title: 'T', description: 'D', status: 'done', userId: 5 }];

    redisMock.getJson.mockResolvedValue(null);
    prismaMock.task.findMany.mockResolvedValue(dbTasks);
    redisMock.setJson.mockResolvedValue(undefined);

    const result = await firstValueFrom(
      service.findAll({ status: 'done', dateFrom: '2026-06-01', dateTo: '2026-06-30' }),
    );

    expect(result).toEqual(dbTasks);
    expect(prismaMock.task.findMany).toHaveBeenCalled();
    expect(redisMock.setJson).toHaveBeenCalled();
  });

  it('should invalidate task list cache when updating a task', async () => {
    const updatedTask = { id: 3, title: 'Atualizada', description: 'D', status: 'open', userId: 1 };

    prismaMock.task.update.mockResolvedValue(updatedTask);
    redisMock.delByPattern.mockResolvedValue(undefined);

    const result = await firstValueFrom(service.updateOne(3, { title: 'Atualizada' }));

    expect(result).toEqual(updatedTask);
    expect(redisMock.delByPattern).toHaveBeenCalledWith('task:list:*');
  });

  it('should invalidate task list cache when deleting a task', async () => {
    const deletedTask = { id: 4, title: 'Removida', description: 'D', status: 'done', userId: 1 };

    prismaMock.task.delete.mockResolvedValue(deletedTask);
    redisMock.delByPattern.mockResolvedValue(undefined);

    const result = await firstValueFrom(service.deleteOne(4));

    expect(result).toEqual(deletedTask);
    expect(redisMock.delByPattern).toHaveBeenCalledWith('task:list:*');
  });
});
