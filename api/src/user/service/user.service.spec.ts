import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AuthService } from 'src/auth/services/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  const prismaMock = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const redisMock = {
    getJson: jest.fn(),
    setJson: jest.fn(),
    del: jest.fn(),
  };

  const authServiceMock = {
    hashPassword: jest.fn(),
    comparePasswords: jest.fn(),
    generateJWT: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should return profile from cache when available', (done) => {
    redisMock.getJson.mockResolvedValue({
      id: 1,
      name: 'Cached User',
      username: 'cached',
      email: 'cached@mail.com',
      role: 'user',
      profileImage: null,
    });

    service.findOneBy(1).subscribe((result) => {
      expect(result.name).toBe('Cached User');
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      done();
    });
  });

  it('should load profile from database and cache it on cache miss', (done) => {
    redisMock.getJson.mockResolvedValue(null);
    redisMock.setJson.mockResolvedValue(undefined);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 2,
      name: 'Db User',
      username: 'db',
      email: 'db@mail.com',
      role: 'user',
      profileImage: null,
    });

    service.findOneBy(2).subscribe((result) => {
      expect(result.name).toBe('Db User');
      expect(prismaMock.user.findUnique).toHaveBeenCalled();
      expect(redisMock.setJson).toHaveBeenCalled();
      done();
    });
  });

  it('should invalidate user profile cache when updating profile', (done) => {
    prismaMock.user.update.mockResolvedValue({
      id: 4,
      name: 'Updated User',
      username: 'updated',
      email: 'updated@mail.com',
      role: 'user',
      profileImage: 'x.png',
    });
    redisMock.del.mockResolvedValue(undefined);

    service.updateOne(4, { name: 'Updated User' }).subscribe((result) => {
      expect(result.id).toBe(4);
      expect(redisMock.del).toHaveBeenCalledWith('user:profile:4');
      done();
    });
  });

  it('should return only id and name for select endpoint', (done) => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]);

    service.findAllForSelect().subscribe((result) => {
      expect(result).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
        },
      });
      done();
    });
  });
});
