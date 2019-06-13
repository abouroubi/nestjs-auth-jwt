import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { sign, SignOptions, verify } from 'jsonwebtoken';
import * as moment from 'moment';
import { Types } from 'mongoose';
import { InstanceType, ModelType } from 'typegoose';
import { BaseService } from '../../shared/base.service';
import { ConfigurationService } from '../../shared/configuration/configuration.service';
import { NotFoundError } from '../../shared/errors/not-found.error';
import { MapperService } from '../../shared/mapper/mapper.service';
import { JwtPayload } from '../jwt-payload';
import { LoginResponse } from '../models/login-response';
import { RefreshToken } from '../models/refresh-token.model';
import { LoginResponseVm } from '../view-models/login-response-vm.model';
import uuid = require('uuid');

@Injectable()
export class TokenService extends BaseService<RefreshToken> {
  private readonly logger = new Logger(TokenService.name);

  private readonly jwtOptions: SignOptions;
  private readonly jwtKey: string;
  private refreshTokenTtl: number;
  private expiresInDefault: string | number;

  // @todo: should be put in redis cache
  private readonly usersExpired: number[] = [];

  constructor(
    @InjectModel(RefreshToken.modelName) tokenModel: ModelType<RefreshToken>,
    private readonly configurationService: ConfigurationService,
    private readonly mapperService: MapperService,
  ) {
    super();
    this._model = tokenModel;
    this.expiresInDefault = this.configurationService.JWT.AccessTokenTtl;
    this.jwtOptions = { expiresIn: this.expiresInDefault };
    this.jwtKey = this.configurationService.JWT.Key;
    this.refreshTokenTtl = this.configurationService.JWT.RefreshTokenTtl;

    this.mapperService.createMap(LoginResponse.name, LoginResponseVm.name);
  }

  async getAccessTokenFromRefreshToken(
    refreshToken: string,
    oldAccessToken: string,
    clientId: string,
    ipAddress: string,
  ): Promise<LoginResponseVm> {
    try {
      // check if refresh token exist in database
      const token = await this.findOne({ value: refreshToken });
      const currentDate = new Date();
      if (!token) {
        throw new NotFoundError('Refresh token not found');
      }
      if (token.expiresAt < currentDate) {
        throw new Error('Refresh token expired');
      }
      // Refresh token is still valid
      // Generate new access token
      const oldPayload = await this.validateToken(oldAccessToken, true);
      const payload = {
        sub: oldPayload.sub,
      };
      const accessToken = await this.createAccessToken(payload);
      // Remove old refresh token and generate a new one
      await this.deleteById(token.id);

      accessToken.refreshToken = await this.createRefreshToken({
        userId: oldPayload.sub,
        clientId,
        ipAddress,
      });

      return this.mapperService.map<LoginResponseVm>(
        accessToken,
        LoginResponseVm.name,
        LoginResponse.name,
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async createAccessToken(
    payload: JwtPayload,
    expires = this.expiresInDefault,
  ): Promise<LoginResponseVm> {
    // If expires is negative it means that token should not expire
    const options = this.jwtOptions;
    expires > 0 ? (options.expiresIn = expires) : delete options.expiresIn;
    // Generate unique id for this token
    options.jwtid = uuid();
    const signedPayload = sign(payload, this.jwtKey, options);
    const token: LoginResponse = {
      accessToken: signedPayload,
      expiresIn: expires,
    };

    return this.mapperService.map<LoginResponseVm>(
      token,
      LoginResponseVm.name,
      LoginResponse.name,
    );
  }

  async createRefreshToken(tokenContent: {
    userId: string;
    clientId: string;
    ipAddress: string;
  }): Promise<string> {
    const { userId, clientId, ipAddress } = tokenContent;

    const token: InstanceType<RefreshToken> = new RefreshToken.model();

    const refreshToken = randomBytes(64).toString('hex');

    token.userId = Types.ObjectId(userId);
    token.value = refreshToken;
    token.clientId = clientId;
    token.ipAddress = ipAddress;
    token.expiresAt = moment()
      .add(this.refreshTokenTtl, 'd')
      .toDate();

    await this.create(token);

    return refreshToken;
  }

  /**
   * Remove all the refresh tokens associated to a user
   * @param userId id of the user
   */
  async deleteRefreshTokenForUser(userId: string) {
    await this.delete({ userId: Types.ObjectId(userId) });
    await this.revokeTokenForUser(userId);
  }

  /**
   * Removes a refresh token, and invalidated all access tokens for the user
   * @param userId id of the user
   * @param value the value of the token to remove
   */
  async deleteRefreshToken(userId: string, value: string) {
    await this.delete({ value });
    await this.revokeTokenForUser(userId);
  }

  async decodeAndValidateJWT(token: string): Promise<any> {
    if (token) {
      try {
        const payload = await this.validateToken(token);
        return await this.validatePayload(payload);
      } catch (error) {
        return null;
      }
    }
  }

  async validatePayload(payload: JwtPayload): Promise<any> {
    const tokenBlacklisted = await this.isBlackListed(payload.sub, payload.exp);
    if (!tokenBlacklisted) {
      return {
        id: payload.sub,
      };
    }
    return null;
  }

  private async validateToken(
    token: string,
    ignoreExpiration: boolean = false,
  ): Promise<JwtPayload> {
    return verify(token, this.configurationService.JWT.Key, {
      ignoreExpiration,
    }) as JwtPayload;
  }

  private async isBlackListed(id: string, expire: number): Promise<boolean> {
    return this.usersExpired[id] && expire < this.usersExpired[id];
  }

  private async revokeTokenForUser(userId: string): Promise<any> {
    this.usersExpired[userId] = moment()
      .add(this.expiresInDefault, 's')
      .unix();
  }
}
