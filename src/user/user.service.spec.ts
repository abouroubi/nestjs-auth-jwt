import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { TokenService } from '../auth/token/token.service';
import { MapperService } from '../shared/mapper/mapper.service';
import { getModelToken } from '@nestjs/mongoose';
import { ModelType } from 'typegoose';

describe('UserService', () => {
  let service: UserService;

  beforeAll(async () => {
    const mockUserModel: Partial<ModelType<User>> = {};
    const mockAuthService: Partial<AuthService> = {};
    const mockTokenService: Partial<TokenService> = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.modelName),
          useValue: mockUserModel,
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
    service = module.get<UserService>(UserService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
