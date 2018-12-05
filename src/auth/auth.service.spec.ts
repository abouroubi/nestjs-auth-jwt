import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';
import { ConfigurationService } from '../shared/configuration/configuration.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockTokenService: Partial<TokenService> = {};

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        ConfigurationService,
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
