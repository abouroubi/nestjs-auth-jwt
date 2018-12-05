import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelType } from 'typegoose';
import { Types } from 'mongoose';
import * as moment from 'moment';
import { randomBytes } from 'crypto';

import { AuthService } from '../auth.service';
import { JwtPayload } from '../jwt-payload';
import { LoginResponse } from '../models/login-response';
import { RefreshToken } from '../models/refresh-token.model';
import { BaseService } from '../../shared/base.service';
import { MapperService } from '../../shared/mapper/mapper.service';
import { NotFoundError } from '../../shared/errors/not-found.error';
import { ConfigurationService } from '../../shared/configuration/configuration.service';

@Injectable()
export class TokenService extends BaseService<RefreshToken> {
  private refreshTokenTtl: number;

  constructor(
    @InjectModel(RefreshToken.modelName) private readonly tokenModel: ModelType<RefreshToken>,
    @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
    private readonly configurationService: ConfigurationService,
    private readonly mapperService: MapperService,
  ) {
    super();
    this._model = tokenModel;
    this._mapper = mapperService.mapper;

    this.refreshTokenTtl = configurationService.JWT.RefreshTokenTtl;
  }

  async getAccessTokenFromRefreshToken(
    refreshToken: string,
    user: any,
  ): Promise<LoginResponse> {
    // check if refresh token exist in database
    const token = await this.findOne({ value: refreshToken, userId: user.id });
    const currentDate = new Date();
    if (!token) {
      throw new NotFoundError('Refresh token not found');
    }
    if (token.expiresAt > currentDate) {
      // Refresh token is still valid
      // Generate new access token
      const payload: JwtPayload = {
        sub: user.id,
        type: user.type,
      };
      const accessToken = await this.authService.createAccessToken(payload);
      // Update expires at
      token.expiresAt = moment()
        .add(this.refreshTokenTtl, 'd')
        .toDate();
      await this.update(token.id, token);

      return accessToken;
    } else {
      throw new Error('Refresh token expired');
    }
  }

  async generateRefreshToken(tokenContent: any): Promise<string> {
    const { userId, clientId, ipAddress } = tokenContent;

    const token = new this._model(); // InstanceType<Token>

    const refreshToken = randomBytes(64).toString('hex');

    token.userId = Types.ObjectId(userId);
    token.value = refreshToken;
    token.clientId = clientId;
    token.ipAddress = ipAddress;
    token.expiresAt = moment()
      .add(this.refreshTokenTtl, 'd')
      .toDate();

    await this._model.create(token);

    return refreshToken;
  }

  async deleteByUserId(userId: string) {
    await this.delete({ userId: Types.ObjectId(userId) });
  }

  async deleteByToken(userId: string, value: string) {
    await this.delete({ value });
  }
}
