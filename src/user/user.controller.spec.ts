import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { ClientService } from './client/client.service';

describe('User Controller', () => {
  let module: TestingModule;

  const mockClientService: Partial<ClientService> = {};

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: ClientService,
          useValue: mockClientService,
        },
      ],
    }).compile();
  });
  it('should be defined', () => {
    const controller: UserController = module.get<UserController>(
      UserController,
    );
    expect(controller).toBeDefined();
  });
});
