import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';
import { MapperService } from '../shared/mapper/mapper.service';
import { UserService } from '../user/user.service';

describe('Auth Controller', () => {
  let module: TestingModule;

  const mockUserService: Partial<UserService> = {};
  const mockAuthService: Partial<AuthService> = {};
  const mockTokenService: Partial<TokenService> = {};

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        MapperService,
      ],
    }).compile();
  });
  it('should be defined', () => {
    const controller: AuthController = module.get<AuthController>(
      AuthController,
    );
    expect(controller).toBeDefined();
  });
});
