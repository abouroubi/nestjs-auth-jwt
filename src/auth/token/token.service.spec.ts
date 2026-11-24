import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import moment from 'moment';
import { Types } from 'mongoose';
import { ConfigurationService } from '../../shared/configuration/configuration.service';
import { NotFoundError } from '../../shared/errors/not-found.error';
import { MapperService } from '../../shared/mapper/mapper.service';
import { RefreshToken } from '../models/refresh-token.model';
import { TokenService } from './token.service';

jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  verify: jest.fn(() => ({ sub: '507f1f77bcf86cd799439011' })),
}));

const createRefreshTokenModelMock = () =>
  Object.assign(jest.fn(), {
    findOneAndDelete: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  });

const execResolving = (value?: unknown) => ({
  exec: jest.fn().mockResolvedValue(value),
});

describe('TokenService', () => {
  let module: TestingModule;
  let service: TokenService;
  let refreshTokenModel: ReturnType<typeof createRefreshTokenModelMock>;

  const userId = '507f1f77bcf86cd799439011';
  const clientId = 'clientId';
  const ipAddress = '192.168.1.1';
  const oldAccessToken = 'oldAccessToken';
  const refreshToken = 'testRefreshToken';

  const persistedRefreshToken = () => refreshTokenModel.create.mock.calls[0][0];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: getModelToken(RefreshToken.modelName),
          useFactory: createRefreshTokenModelMock,
        },
        MapperService,
        ConfigurationService,
      ],
    }).compile();
    service = module.get<TokenService>(TokenService);
    refreshTokenModel = module.get(getModelToken(RefreshToken.modelName));
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Get access token with refresh token', () => {
    const refresh = () =>
      service.getAccessTokenFromRefreshToken(
        refreshToken,
        oldAccessToken,
        clientId,
        ipAddress,
      );

    const expectNoRotation = () => {
      expect(refreshTokenModel.findOneAndDelete).not.toHaveBeenCalled();
      expect(refreshTokenModel.create).not.toHaveBeenCalled();
    };

    it('should reject with NotFoundError when refresh token does not exist', async () => {
      refreshTokenModel.findOne.mockReturnValue(execResolving(null));

      const result = refresh();

      await expect(result).rejects.toBeInstanceOf(NotFoundError);
      await expect(result).rejects.toThrow('Refresh token not found');
      expectNoRotation();
    });

    it('should reject when refresh token expired', async () => {
      refreshTokenModel.findOne.mockReturnValue(
        execResolving({ expiresAt: moment().subtract(1, 'd').toDate() }),
      );

      await expect(refresh()).rejects.toThrow('Refresh token expired');
      expectNoRotation();
    });

    it('should rotate the refresh token and return a new access token when refresh token is valid', async () => {
      const storedTokenId = new Types.ObjectId().toHexString();
      refreshTokenModel.findOne.mockReturnValue(
        execResolving({
          id: storedTokenId,
          expiresAt: moment().add(1, 'd').toDate(),
        }),
      );
      refreshTokenModel.findOneAndDelete.mockReturnValue(execResolving());

      const result = await refresh();

      expect(refreshTokenModel.findOne).toHaveBeenCalledWith({
        value: refreshToken,
      });
      expect(refreshTokenModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: new Types.ObjectId(storedTokenId),
      });
      expect(result.accessToken).toEqual(expect.any(String));
      expect(result.refreshToken).toHaveLength(128);
      expect(persistedRefreshToken().value).toEqual(result.refreshToken);
    });
  });

  describe('Get refresh token', () => {
    it('should persist and return a 128-character refresh token', async () => {
      const result = await service.createRefreshToken({
        userId,
        clientId,
        ipAddress,
      });

      expect(result).toHaveLength(128);
      expect(persistedRefreshToken()).toMatchObject({
        value: result,
        userId: new Types.ObjectId(userId),
        clientId,
        ipAddress,
      });
      expect(persistedRefreshToken().expiresAt.getTime()).toBeGreaterThan(
        Date.now(),
      );
    });
  });

  describe('Delete refresh token', () => {
    const expectAccessTokensRevoked = async (revokedUserId: string) => {
      const issuedBeforeRevocation = { sub: revokedUserId, exp: 1 };
      expect(await service.validatePayload(issuedBeforeRevocation)).toBeNull();
    };

    beforeEach(() => {
      refreshTokenModel.deleteMany.mockReturnValue(execResolving());
    });

    it('should delete refresh tokens by userId and revoke their access tokens', async () => {
      const revokedUserId = new Types.ObjectId().toHexString();

      await service.deleteRefreshTokenForUser(revokedUserId);

      expect(refreshTokenModel.deleteMany).toHaveBeenCalledWith({
        userId: new Types.ObjectId(revokedUserId),
      });
      await expectAccessTokensRevoked(revokedUserId);
    });

    it('should delete refresh token by value and revoke the access tokens of its user', async () => {
      const revokedUserId = new Types.ObjectId().toHexString();
      const tokenValue = 'mockTokenValue';

      await service.deleteRefreshToken(revokedUserId, tokenValue);

      expect(refreshTokenModel.deleteMany).toHaveBeenCalledWith({
        value: tokenValue,
      });
      await expectAccessTokensRevoked(revokedUserId);
    });
  });
});
