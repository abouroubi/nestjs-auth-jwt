import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { NotFoundError } from '../shared/errors/not-found.error';
import { MapperService } from '../shared/mapper/mapper.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';
import { GrantType } from './view-models/grant-types.enum';
import { LoginResponseVm } from './view-models/login-response-vm.model';
import { LoginVm } from './view-models/login-vm.model';

describe('Auth Controller', () => {
  let module: TestingModule;
  let controller: AuthController;

  const mockEmail = 'user@mail.com';
  const mockPassword = 'password';
  const mockLoginResponse = {
    accessToken: 'accessToken',
    tokenType: 'bearer',
    expiresIn: 1,
    refreshToken: 'refreshToken',
  };
  const mockUser = {
    id: '1234',
    type: 'user',
  };

  const mockIp = '192.168.1.1';

  const mockRequest = {
    headers: {
      'x-forwarded-for': mockIp,
      authorization: 'Bearer ' + mockLoginResponse.accessToken,
    },
    user: mockUser,
  };

  const mockAuthService: Partial<AuthService> = {
    login: jest.fn(
      async (payLoad): Promise<LoginResponseVm> => {
        return mockLoginResponse;
      },
    ),
    logoutFromAll: jest.fn(),
    logout: jest.fn(),
  };
  const mockTokenService: Partial<TokenService> = {
    getAccessTokenFromRefreshToken: jest.fn(
      async (
        refreshToken,
        oldAccessToken,
        userId,
        ip,
      ): Promise<LoginResponseVm> => {
        if (
          refreshToken !== mockLoginResponse.refreshToken ||
          userId !== mockUser.id ||
          oldAccessToken !== mockLoginResponse.accessToken
        ) {
          throw new NotFoundError();
        }
        return mockLoginResponse;
      },
    ),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
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

    controller = module.get<AuthController>(AuthController);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Login', () => {
    it('should raise exception when passing login and password equals undefined', async () => {
      // Arrange
      const loginVm: LoginVm = {
        email: undefined,
        password: undefined,
      };

      try {
        // Act
        await controller.login(mockRequest, loginVm);
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message.statusCode).toEqual(401);
      }
    });

    it('should login when login and password are correct', async () => {
      // Arrange
      const loginVm: LoginVm = {
        email: mockEmail,
        password: mockPassword,
      };

      // Act
      const result = await controller.login(mockRequest, loginVm);

      // Assert
      expect(mockAuthService.login).toBeCalled();
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('Logout', () => {
    it('should raise exception when there is no refresh token', async () => {
      // Arrange

      const refreshToken = undefined;

      const req = {
        ...mockRequest,
        user: mockUser,
      };

      try {
        // Act
        await controller.logout(req, refreshToken);
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message.statusCode).toEqual(400);
      }
    });

    it('should logout from all', async () => {
      // Arrange

      // Act
      const result = await controller.logout(
        mockRequest,
        mockLoginResponse.refreshToken,
        true,
      );

      // Assert
      expect(mockAuthService.logoutFromAll).toBeCalled();
      expect(result).toEqual({ message: 'ok' });
    });

    it('should logout', async () => {
      // Arrange

      // Act
      const result = await controller.logout(
        mockRequest,
        mockLoginResponse.refreshToken,
      );

      // Assert
      expect(mockAuthService.logout).toBeCalled();
      expect(result).toEqual({ message: 'ok' });
    });
  });

  describe('Token', () => {
    it('should raise exception when passing undefined refresh token', async () => {
      // Arrange
      const refreshToken = undefined;

      const req: Partial<Request> = {
        ...mockRequest,
        user: {},
      };

      try {
        // Act
        await controller.token(
          req,
          mockIp,
          GrantType.RefreshToken,
          refreshToken,
        );
      } catch (error) {
        // Assert
        expect(mockTokenService.getAccessTokenFromRefreshToken).toBeCalled();
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message.statusCode).toEqual(400);
      }
    });

    it('should raise exception when passing undefined user', async () => {
      // Arrange
      const refreshToken = mockLoginResponse.refreshToken;

      const req: Partial<Request> = {
        ...mockRequest,
        user: undefined,
      };

      try {
        // Act
        await controller.token(
          req,
          mockIp,
          GrantType.RefreshToken,
          refreshToken,
        );
      } catch (error) {
        // Assert
        expect(mockTokenService.getAccessTokenFromRefreshToken).toBeCalled();
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message.statusCode).toEqual(400);
      }
    });

    it('should raise exception when grant type is not RefreshToken', async () => {
      // Arrange
      const refreshToken = undefined;

      const req: Partial<Request> = {
        ...mockRequest,
        user: {},
      };

      try {
        // Act
        await controller.token(req, GrantType.AuthorizationCode, refreshToken);
      } catch (error) {
        // Assert
        expect(mockTokenService.getAccessTokenFromRefreshToken).toBeCalled();
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message.statusCode).toEqual(400);
      }
    });

    it('should return acces token when user and refresh token are correct', async () => {
      // Arrange
      const refreshToken = mockLoginResponse.refreshToken;

      // Act
      const result = await controller.token(
        mockRequest,
        mockIp,
        GrantType.RefreshToken,
        refreshToken,
        mockUser.id,
      );

      // Assert
      expect(mockTokenService.getAccessTokenFromRefreshToken).toBeCalled();
      expect(result).toEqual(mockLoginResponse);
    });
  });
});
