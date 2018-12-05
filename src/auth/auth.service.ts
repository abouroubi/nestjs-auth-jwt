import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import * as moment from 'moment';
import { SignOptions, sign } from 'jsonwebtoken';

import { ConfigurationService } from '../shared/configuration/configuration.service';
import { JwtPayload } from './jwt-payload';
import { LoginResponse } from './models/login-response';
import { TokenService } from './token/token.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  private readonly jwtOptions: SignOptions;
  private readonly jwtKey: string;

  private readonly usersExpired: number[] = [];

  private expiresInDefault;

  constructor(
    @Inject(forwardRef(() => TokenService))
    private readonly tokenService: TokenService,
    private readonly _configurationService: ConfigurationService,
  ) {
    this.jwtOptions = { expiresIn: this.expiresInDefault };
    this.jwtKey = this._configurationService.JWT.Key;
    this.expiresInDefault = this._configurationService.JWT.AccessTokenTtl;
  }

  async createAccessToken(payload: JwtPayload): Promise<LoginResponse> {
    const expires = this.expiresInDefault;
    // If expires is negative it means that token should not expire
    expires > 0
      ? (this.jwtOptions.expiresIn = expires)
      : delete this.jwtOptions.expiresIn;
    const signedPayload = sign(payload, this.jwtKey, this.jwtOptions);
    const token = new LoginResponse();
    token.accessToken = signedPayload;
    token.expiresIn = expires;

    return token;
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

  async logout(userId: string, refreshToken: string): Promise<any> {
    await this.tokenService.deleteByToken(userId, refreshToken);
    await this.revokeTokenForUser(userId);
  }

  /**
   * Logout the user from all the devices by invalidating all his refresh tokens
   * @param userId The user id to logout
   * @param type The type of the user (Admin, Client, etc...)
   */
  async logoutFromAll(userId: string, type: string): Promise<any> {
    await this.tokenService.deleteByUserId(userId);
    await this.revokeTokenForUser(userId);
  }

  async isBlackListed(id: string, expire: number): Promise<boolean> {
    return this.usersExpired[id] && expire < this.usersExpired[id];
  }

  private async revokeTokenForUser(userId: string): Promise<any> {
    this.usersExpired[userId] = moment()
      .add(this.expiresInDefault, 's')
      .unix();
  }
}
