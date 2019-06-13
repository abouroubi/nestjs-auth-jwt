import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as moment from 'moment';
import { Types } from 'mongoose';
import { ModelType } from 'typegoose';
import { ConfigurationService } from '../../shared/configuration/configuration.service';
import { NotFoundError } from '../../shared/errors/not-found.error';
import { MapperService } from '../../shared/mapper/mapper.service';
import { AuthService } from '../auth.service';
import { RefreshToken } from '../models/refresh-token.model';
import { LoginResponseVm } from '../view-models/login-response-vm.model';
import { TokenService } from './token.service';
import * as jsonwebtoken from 'jsonwebtoken';
import { JwtPayload } from '../jwt-payload';

// Mock the jsonwebtoken module
// Maybe not the best way to do it but it works
(jsonwebtoken as any).verify = jest.fn(
  (): JwtPayload => ({
    sub: '507f1f77bcf86cd799439011',
  }),
);

describe('TokenService', () => {
  let module: TestingModule;
  let service: TokenService;
  let spyRefreshTokenModel;
  let spyAuthService: Partial<AuthService>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: getModelToken(RefreshToken.modelName),
          useFactory: () => ({
            findOneAndDelete: jest.fn(),
            findOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            create: jest.fn(),
            deleteMany: jest.fn(),
          }),
        },
        {
          provide: AuthService,
          useFactory: () => ({}),
        },
        MapperService,
        ConfigurationService,
      ],
    }).compile();
    service = module.get<TokenService>(TokenService);
    spyRefreshTokenModel = module.get(getModelToken(RefreshToken.modelName));
    spyAuthService = module.get<AuthService>(AuthService);
  });

  it('should be defined', async () => {
    // Arrange
    // Act
    // Assert
    expect(service).toBeDefined();
  });

  describe('Get access token with refresh token', () => {
    it('should return not found when refresh token does not exist', async () => {
      // Arrange

      const oldAccessToken = 'oldAccessToken';
      const refreshToken = 'testRefreshToken';
      const user = {
        id: '507f1f77bcf86cd799439011',
        ip: '192.168.1.1',
      };

      spyRefreshTokenModel.findOne = jest.fn(() => ({ exec: jest.fn() }));

      try {
        // Act
        await service.getAccessTokenFromRefreshToken(
          refreshToken,
          oldAccessToken,
          user.id,
          user.ip,
        );
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error.message).toBe('Refresh token not found');
      }
    });

    it('should return error when refresh token expired', async () => {
      // Arrange

      const oldAccessToken = 'oldAccessToken';
      const refreshToken = 'testRefreshToken';
      const user = {
        id: '507f1f77bcf86cd799439011',
        ip: '192.168.1.1',
      };

      spyRefreshTokenModel.findOne = jest.fn(() => ({
        exec: jest.fn(() => ({
          expiresAt: moment()
            .subtract(1, 'd')
            .toDate(),
        })),
      }));

      try {
        // Act
        await service.getAccessTokenFromRefreshToken(
          refreshToken,
          oldAccessToken,
          user.id,
          user.ip,
        );
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Refresh token expired');
      }
    });

    it('should return an access token when refresh token is valid', async () => {
      // Arrange
      const oldAccessToken = 'oldAccessToken';
      const refreshToken = 'testRefreshToken';
      const user = {
        id: 'userId',
        ip: '192.168.1.1',
      };

      const loginresponse: LoginResponseVm = {
        accessToken: 'mockAccessToken',
        expiresIn: 1,
        tokenType: 'bearer',
      };

      spyRefreshTokenModel.findOne = jest.fn(() => ({
        exec: jest.fn(() => ({
          expiresAt: moment()
            .add(1, 'd')
            .toDate(),
        })),
      }));
      spyRefreshTokenModel.create = jest.fn(() => ({
        exec: jest.fn(),
      }));

      spyRefreshTokenModel.findOneAndDelete = jest.fn(() => ({ exec: jest.fn() }));

      // Act
      const result = await service.getAccessTokenFromRefreshToken(
        refreshToken,
        oldAccessToken,
        user.id,
        user.ip,
      );

      // Assert
      expect(spyRefreshTokenModel.create).toBeCalled();
      expect(spyRefreshTokenModel.findOneAndDelete).toBeCalled();
      expect(spyRefreshTokenModel.findOne).toBeCalled();
      expect(result).toBeDefined();
    });
  });

  describe('Get refresh token', () => {
    it('should return refresh token', async () => {
      // Arrange
      const tokenContent = {
        userId: '507f1f77bcf86cd799439011',
        clientId: 'clientId',
        ipAddress: '8.8.8.8',
      };

      spyRefreshTokenModel.create = jest.fn(() => ({ exec: jest.fn() }));

      // Act
      const result = await service.createRefreshToken(tokenContent);

      // Assert
      expect(spyRefreshTokenModel.create).toBeCalled();
      expect(result).toHaveLength(128);
    });
  });

  describe('Delete refresh token', () => {
    beforeEach(async () => {
      spyRefreshTokenModel.deleteMany = jest.fn(() => ({ exec: jest.fn() }));
    });

    it('should delete refresh token by userId', async () => {
      // Arrange
      const tokenContent = {
        userId: '507f1f77bcf86cd799439011',
        clientId: 'clientId',
        ipAddress: '8.8.8.8',
      };

      // Act
      await service.deleteRefreshTokenForUser(tokenContent.userId);

      // Assert
      expect(spyRefreshTokenModel.deleteMany).toBeCalledWith({
        userId: Types.ObjectId(tokenContent.userId),
      });
    });

    it('should delete refresh token by value', async () => {
      // Arrange
      const tokenValue = 'mockTokenValue';
      const mockUserId = '507f1f77bcf86cd799439011';

      // Act
      const result = await service.deleteRefreshToken(mockUserId, tokenValue);

      // Assert
      expect(spyRefreshTokenModel.deleteMany).toBeCalledWith({
        value: tokenValue,
      });
    });
  });
});
