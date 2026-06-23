import { Injectable } from '@nestjs/common';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PrismaService } from 'src/prisma/prisma.service';
import { MqttService } from 'src/mqtt/mqtt.service';
import { RedisService } from 'src/redis/redis.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { FilterTaskDto } from '../dto/filter-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Task } from '../models/task.interface';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly mqttService: MqttService,
  ) {}

  create(task: CreateTaskDto): Observable<Task> {
    return from(this.prisma.task.create({ data: task })).pipe(
      switchMap((createdTask: Task) =>
        from(this.redisService.delByPattern('task:list:*')).pipe(
          map(() => {
            this.mqttService.enqueueTaskCreatedNotification(task.userId, {
              event: 'task.created',
              taskId: createdTask.id,
              title: createdTask.title,
              status: createdTask.status,
              createat: createdTask.createat,
            });

            return createdTask;
          }),
        ),
      )
    );
  }

  findAll(filters: FilterTaskDto): Observable<Task[]> {
    const cacheKey = this.buildTaskListCacheKey(filters);
    const where: any = {};

    if (filters.status) {
      where.status = {
        equals: filters.status,
        mode: 'insensitive',
      };
    }

    if (filters.title) {
      where.title = {
        contains: filters.title,
        mode: 'insensitive',
      };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createat = {};

      if (filters.dateFrom) {
        where.createat.gte = new Date(filters.dateFrom);
      }

      if (filters.dateTo) {
        where.createat.lte = new Date(filters.dateTo);
      }
    }

    return from(this.redisService.getJson<Task[]>(cacheKey)).pipe(
      switchMap((cachedTasks) => {
        if (cachedTasks) {
          return of(cachedTasks);
        }

        return from(this.prisma.task.findMany({ where, orderBy: { id: 'asc' } })).pipe(
          switchMap((tasks) =>
            from(this.redisService.setJson(cacheKey, tasks, 300)).pipe(map(() => tasks as Task[])),
          ),
        );
      }),
    );
  }

  findOneBy(id: number): Observable<Task> {
    return from(this.prisma.task.findUnique({ where: { id } }));
  }

  updateOne(id: number, task: UpdateTaskDto): Observable<Task> {
    return from(this.prisma.task.update({ where: { id }, data: task })).pipe(
      switchMap((updatedTask) =>
        from(this.redisService.delByPattern('task:list:*')).pipe(map(() => updatedTask as Task)),
      ),
    );
  }

  deleteOne(id: number): Observable<Task> {
    return from(this.prisma.task.delete({ where: { id } })).pipe(
      switchMap((deletedTask) =>
        from(this.redisService.delByPattern('task:list:*')).pipe(map(() => deletedTask as Task)),
      ),
    );
  }

  private buildTaskListCacheKey(filters: FilterTaskDto): string {
    const entries = Object.entries(filters || {})
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

    if (entries.length === 0) {
      return 'task:list:all';
    }

    return `task:list:${JSON.stringify(Object.fromEntries(entries))}`;
  }
}
