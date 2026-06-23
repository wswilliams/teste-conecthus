import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { UserService } from '../service/user.service';
import { UserController } from './user.controller';

describe('User Controller', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn().mockReturnValue(of({ id: 1 })),
            login: jest.fn().mockReturnValue(of('token')),
            findAllForSelect: jest.fn().mockReturnValue(of([{ id: 1, name: 'Alice' }])),
            findOneBy: jest.fn().mockReturnValue(of({ id: 1 })),
            paginate: jest.fn().mockReturnValue(of({ items: [], links: {}, meta: {} })),
            paginateFilterByUsername: jest.fn().mockReturnValue(of({ items: [], links: {}, meta: {} })),
            deleteOne: jest.fn().mockReturnValue(of({ affected: 1 })),
            updateOne: jest.fn().mockReturnValue(of({ id: 1 })),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return lightweight users list for select', (done) => {
    controller.findAllForSelect().subscribe((result) => {
      expect(result).toEqual([{ id: 1, name: 'Alice' }]);
      done();
    });
  });
});
