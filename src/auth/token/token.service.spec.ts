import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { ModelType } from 'typegoose';
import { RefreshToken } from '../models/refresh-token.model';
import { AuthService } from '../auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { MapperService } from '../../shared/mapper/mapper.service';
import { ConfigurationService } from '../../shared/configuration/configuration.service';

describe('TokenService', () => {
  let service: TokenService;

  const mockTokenModel: Partial<ModelType<RefreshToken>> = {};
  const mockAuthService: Partial<AuthService> = {};

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: getModelToken(RefreshToken.modelName),
          useValue: mockTokenModel,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        MapperService,
        ConfigurationService,
      ],
    }).compile();
    service = module.get<TokenService>(TokenService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
