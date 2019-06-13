import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtPayload } from './jwt-payload';
import { TokenService } from './token/token.service';
import { LoginResponseVm } from './view-models/login-response-vm.model';
import { LoginVm } from './view-models/login-vm.model';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {}

  async login(
    credentials: LoginVm,
    ipAddress: string,
  ): Promise<LoginResponseVm> {
    const loginResults = await this.userService.login(credentials);

    if (!loginResults) {
      return null;
    }

    const payload: JwtPayload = {
      sub: loginResults.id,
    };

    const loginResponse: LoginResponseVm = await this.tokenService.createAccessToken(
      payload,
    );

    // We save the user's refresh token
    const tokenContent = {
      userId: loginResults.id,
      clientId: credentials.clientId,
      ipAddress,
    };
    const refresh = await this.tokenService.createRefreshToken(tokenContent);

    loginResponse.refreshToken = refresh;

    return loginResponse;
  }

  async logout(userId: string, refreshToken: string): Promise<any> {
    await this.tokenService.deleteRefreshToken(userId, refreshToken);
  }

  /**
   * Logout the user from all the devices by invalidating all his refresh tokens
   * @param userId The user id to logout
   */
  async logoutFromAll(userId: string): Promise<any> {
    await this.tokenService.deleteRefreshTokenForUser(userId);
  }
}
