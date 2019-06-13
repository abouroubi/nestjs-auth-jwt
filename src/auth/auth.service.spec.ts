import { Test, TestingModule } from '@nestjs/testing';
import { MapperService } from '../shared/mapper/mapper.service';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockTokenService: Partial<TokenService> = {
    deleteRefreshToken: jest.fn(),
    deleteRefreshTokenForUser: jest.fn(),
  };
  const mockConfigService: Partial<UserService> = {};

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        MapperService,
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: UserService,
          useValue: mockConfigService,
        },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Should login', () => {
    it('should logout', async () => {
      // Arrange
      const userId = 'mockuserId';
      const refreshToken = 'mockRefreshToken';

      // Act
      await service.logout(userId, refreshToken);

      // Assert
      expect(mockTokenService.deleteRefreshToken).toBeCalled();
    });

    it('should logout from all', async () => {
      // Arrange
      const userId = 'mockuserId';
      const type = 'Client';

      // Act
      await service.logoutFromAll(userId);

      // Assert
      expect(mockTokenService.deleteRefreshTokenForUser).toBeCalled();
    });
  });
});
