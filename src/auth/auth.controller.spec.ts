import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundError } from '../shared/errors/not-found.error';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';
import { GrantType } from './view-models/grant-types.enum';
import { LoginResponseVm } from './view-models/login-response-vm.model';
import { LoginVm } from './view-models/login-vm.model';

describe('Auth Controller', () => {
  let module: TestingModule;
  let controller: AuthController;

  const mockLoginResponse: LoginResponseVm = {
    accessToken: 'accessToken',
    tokenType: 'bearer',
    expiresIn: 1,
    refreshToken: 'refreshToken',
  };
  const mockUserId = '1234';
  const mockClientId = 'clientId';
  const mockIp = '192.168.1.1';
  const mockRequest = {
    headers: {
      authorization: `Bearer ${mockLoginResponse.accessToken}`,
    },
  };
  const credentials: LoginVm = {
    email: 'user@mail.com',
    password: 'password',
  };

  const mockAuthService = {
    login: jest.fn(),
    logoutFromAll: jest.fn(),
    logout: jest.fn(),
  };
  const mockTokenService = {
    getAccessTokenFromRefreshToken: jest.fn(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Login', () => {
    it('should raise UnauthorizedException when credentials do not match a user', async () => {
      mockAuthService.login.mockResolvedValue(null);

      await expect(controller.login(mockIp, credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return the login response when credentials are correct', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(mockIp, credentials);

      expect(mockAuthService.login).toHaveBeenCalledWith(credentials, mockIp);
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('Logout', () => {
    it('should raise BadRequestException when there is no refresh token', async () => {
      await expect(controller.logout(mockUserId, undefined)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockAuthService.logout).not.toHaveBeenCalled();
    });

    it('should logout from all devices', async () => {
      const result = await controller.logout(
        mockUserId,
        mockLoginResponse.refreshToken,
        true,
      );

      expect(mockAuthService.logoutFromAll).toHaveBeenCalledWith(mockUserId);
      expect(mockAuthService.logout).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'ok' });
    });

    it('should logout', async () => {
      const result = await controller.logout(
        mockUserId,
        mockLoginResponse.refreshToken,
      );

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockAuthService.logoutFromAll).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'ok' });
    });
  });

  describe('Token', () => {
    const requestToken = (
      grantType: GrantType,
      refreshToken: string | undefined = mockLoginResponse.refreshToken,
    ) =>
      controller.token(
        mockRequest,
        mockIp,
        grantType,
        refreshToken,
        mockClientId,
      );

    it('should raise BadRequestException when the token service cannot find the refresh token', async () => {
      mockTokenService.getAccessTokenFromRefreshToken.mockRejectedValue(
        new NotFoundError('Refresh token not found'),
      );

      await expect(
        requestToken(GrantType.RefreshToken, undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('should raise InternalServerErrorException when the token service fails for any other reason', async () => {
      mockTokenService.getAccessTokenFromRefreshToken.mockRejectedValue(
        new Error('Refresh token expired'),
      );

      await expect(requestToken(GrantType.RefreshToken)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should raise BadRequestException when grant type is not RefreshToken', async () => {
      await expect(requestToken(GrantType.AuthorizationCode)).rejects.toThrow(
        BadRequestException,
      );
      expect(
        mockTokenService.getAccessTokenFromRefreshToken,
      ).not.toHaveBeenCalled();
    });

    it('should return a new access token when the refresh token is valid', async () => {
      mockTokenService.getAccessTokenFromRefreshToken.mockResolvedValue(
        mockLoginResponse,
      );

      const result = await requestToken(GrantType.RefreshToken);

      expect(
        mockTokenService.getAccessTokenFromRefreshToken,
      ).toHaveBeenCalledWith(
        mockLoginResponse.refreshToken,
        mockLoginResponse.accessToken,
        mockClientId,
        mockIp,
      );
      expect(result).toEqual(mockLoginResponse);
    });
  });
});
