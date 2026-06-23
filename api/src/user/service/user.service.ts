import { Injectable } from '@nestjs/common';
import { User, UserRole, UserSelectItem } from '../models/user.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { UpdateUserRoleDto } from '../dto/update-role.dto';
import { Observable, from, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { AuthService } from 'src/auth/services/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { Pagination, IPaginationOptions } from '../models/pagination.interface';

@Injectable()
export class UserService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
        private authService: AuthService
    ) {}

    create(user: CreateUserDto): Observable<User> {
        return this.authService.hashPassword(user.password).pipe(
            switchMap((passwordHash: string) => {
                return from(this.prisma.user.create({
                    data: {
                        name: user.name,
                        username: user.username,
                        email: user.email.toLowerCase(),
                        password: passwordHash,
                        role: UserRole.USER as any,
                    }
                })).pipe(
                    map((createdUser) => {
                        const user = createdUser as unknown as User;
                        const {password, ...result} = user;
                        return result;
                    }),
                    catchError((err) => {
                        throw err;
                    })
                )
            })
        )
    }

    findOneBy(id: number): Observable<User> {
        const cacheKey = this.buildUserProfileCacheKey(id);

        return from(this.redisService.getJson<User>(cacheKey)).pipe(
            switchMap((cachedUser) => {
                if (cachedUser) {
                    return of(cachedUser);
                }

                return from(this.prisma.user.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                        role: true,
                        profileImage: true,
                    }
                })).pipe(
                    map((foundUser) => {
                        const user = foundUser as unknown as User;
                        const {password, ...result} = user;
                        return result as User;
                    }),
                    switchMap((user) => {
                        if (!user) {
                            return of(user);
                        }

                        return from(this.redisService.setJson(cacheKey, user, 300)).pipe(
                            map(() => user)
                        );
                    })
                );
            })
        );
    }

    findAll(): Observable<User[]> {
        return from(this.prisma.user.findMany({
            orderBy: { id: 'asc' },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                role: true,
                profileImage: true,
            }
        })).pipe(map((users) => users as unknown as User[]));
    }

    findAllForSelect(): Observable<UserSelectItem[]> {
        return from(this.prisma.user.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
            }
        })).pipe(map((users) => users as UserSelectItem[]));
    }

    paginate(options: IPaginationOptions): Observable<Pagination<User>> {
        const page = Number(options.page) || 1;
        const limit = Number(options.limit) || 10;
        const skip = (page - 1) * limit;

        return from(
            Promise.all([
                this.prisma.user.findMany({
                    skip,
                    take: limit,
                    orderBy: { id: 'asc' },
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                        role: true,
                        profileImage: true,
                    }
                }),
                this.prisma.user.count()
            ])
        ).pipe(
            map(([users, totalUsers]) => this.buildPaginationResponse(users as unknown as User[], totalUsers, options))
        );
    }

    paginateFilterByUsername(options: IPaginationOptions, user: { username?: string }): Observable<Pagination<User>>{
        const page = Number(options.page) || 1;
        const limit = Number(options.limit) || 10;
        const skip = (page - 1) * limit;

        return from(
            Promise.all([
                this.prisma.user.findMany({
                    skip,
                    take: limit,
                    orderBy: { id: 'asc' },
                    where: {
                        username: {
                            contains: user.username || '',
                            mode: 'insensitive'
                        }
                    },
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                        role: true,
                        profileImage: true,
                    }
                }),
                this.prisma.user.count({
                    where: {
                        username: {
                            contains: user.username || '',
                            mode: 'insensitive'
                        }
                    }
                })
            ])
        ).pipe(
            map(([users, totalUsers]) => this.buildPaginationResponse(users as unknown as User[], totalUsers, options))
        )
    }

    deleteOne(id: number): Observable<any> {
        return from(this.prisma.user.delete({ where: { id } })).pipe(
            switchMap((deletedUser) => from(this.redisService.del(this.buildUserProfileCacheKey(id))).pipe(
                map(() => deletedUser)
            ))
        );
    }

    updateOne(id: number, user: UpdateUserDto): Observable<any> {
        const updateData: any = { ...user };
        delete updateData.email;
        delete updateData.password;
        delete updateData.role;

        return from(this.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                role: true,
                profileImage: true,
            }
        })).pipe(
            switchMap((updatedUser) => from(this.redisService.del(this.buildUserProfileCacheKey(id))).pipe(
                map(() => updatedUser)
            ))
        );
    }

    updateRoleOfUser(id: number, user: UpdateUserRoleDto): Observable<any> {
        return from(this.prisma.user.update({
            where: { id },
            data: { role: user.role as any },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                role: true,
                profileImage: true,
            }
        })).pipe(
            switchMap((updatedUser) => from(this.redisService.del(this.buildUserProfileCacheKey(id))).pipe(
                map(() => updatedUser)
            ))
        );
    }

    login(user: LoginUserDto): Observable<string> {
        return this.validateUser(user.email, user.password).pipe(
            switchMap((validatedUser) => {
                const user = validatedUser as User;
                if(user) {
                    return this.authService.generateJWT(user).pipe(map((jwt: string) => jwt));
                } else {
                    return of('Wrong Credentials');
                }
            })
        )
    }

    validateUser(email: string, password: string): Observable<User> {
        return from(this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                password: true,
                role: true,
                profileImage: true
            }
        })).pipe(
            switchMap((foundUser) => {
                const user = foundUser as unknown as User;
                if (!user || !user.password) {
                    throw Error;
                }

                return this.authService.comparePasswords(password, user.password).pipe(
                    map((match: boolean) => {
                        if (match) {
                            const { password, ...result } = user;
                            return result;
                        } else {
                            throw Error;
                        }
                    })
                );
            })
        )
    }

    findByMail(email: string): Observable<User> {
        return from(this.prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        })).pipe(map((user) => user as unknown as User));
    }

    private buildPaginationResponse(users: User[], totalUsers: number, options: IPaginationOptions): Pagination<User> {
        const page = Number(options.page) || 1;
        const limit = Number(options.limit) || 10;
        const totalPages = Math.ceil(totalUsers / limit) || 1;

        return {
            items: users,
            links: {
                first: `${options.route}?limit=${limit}&page=1`,
                previous: page > 1 ? `${options.route}?limit=${limit}&page=${page - 1}` : '',
                next: page < totalPages ? `${options.route}?limit=${limit}&page=${page + 1}` : '',
                last: `${options.route}?limit=${limit}&page=${totalPages}`
            },
            meta: {
                currentPage: page,
                itemCount: users.length,
                itemsPerPage: limit,
                totalItems: totalUsers,
                totalPages
            }
        };
    }

    private buildUserProfileCacheKey(id: number): string {
        return `user:profile:${id}`;
    }
}
