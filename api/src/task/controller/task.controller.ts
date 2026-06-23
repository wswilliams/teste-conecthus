import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CreateTaskDto } from '../dto/create-task.dto';
import { FilterTaskDto } from '../dto/filter-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Task } from '../models/task.interface';
import { TaskService } from '../service/task.service';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body() task: CreateTaskDto): Observable<Task> {
    return this.taskService.create(task);
  }

  @Get()
  findAll(@Query() filters: FilterTaskDto): Observable<Task[]> {
    return this.taskService.findAll(filters);
  }

  @Get(':id')
  findOneBy(@Param('id') id: string): Observable<Task> {
    return this.taskService.findOneBy(Number(id));
  }

  @Put(':id')
  updateOne(@Param('id') id: string, @Body() task: UpdateTaskDto): Observable<Task> {
    return this.taskService.updateOne(Number(id), task);
  }

  @Delete(':id')
  deleteOne(@Param('id') id: string): Observable<Task> {
    return this.taskService.deleteOne(Number(id));
  }
}
