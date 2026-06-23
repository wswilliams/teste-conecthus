import { Controller, Post, Body, Get, Param, Delete, Put, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from '../service/user.service';
import { User, UserRole, UserSelectItem } from '../models/user.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { Pagination } from '../models/pagination.interface';
import { UserIsUserGuard } from 'src/auth/guards/UserIsUser.guard';

@Controller('users')
export class UserController {

    constructor(private userService: UserService) { }

    @Post()
    create(@Body() user: CreateUserDto): Observable<User | Object> {
        return this.userService.create(user).pipe(
            map((user: User) => user),
            catchError(err => of({ error: err.message }))
        );
    }

    @Post('login')
    login(@Body() user: LoginUserDto): Observable<Object> {
        return this.userService.login(user).pipe(
            map((jwt: string) => {
                return { access_token: jwt };
            })
        )
    }

    @UseGuards(JwtAuthGuard)
    @Get('select')
    @ApiBearerAuth('JWT')
    findAllForSelect(): Observable<UserSelectItem[]> {
        return this.userService.findAllForSelect();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    @ApiBearerAuth('JWT')
    findOneBy(@Param('id') id: string): Observable<User> {
        return this.userService.findOneBy(Number(id));
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    index(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('username') username: string
    ): Observable<Pagination<User>> {
        limit = limit > 100 ? 100 : limit;

        if (username === null || username === undefined) {
            return this.userService.paginate({ page: Number(page), limit: Number(limit), route: 'http://localhost:3000/api/users' });
        } else {
            return this.userService.paginateFilterByUsername(
                { page: Number(page), limit: Number(limit), route: 'http://localhost:3000/api/users' },
                { username }
            )
        }
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @ApiBearerAuth('JWT')
    deleteOne(@Param('id') id: string): Observable<any> {
        return this.userService.deleteOne(Number(id));
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    @ApiBearerAuth('JWT')
    updateOne(@Param('id') id: string, @Body() user: UpdateUserDto): Observable<any> {
        return this.userService.updateOne(Number(id), user);
    }

    }

