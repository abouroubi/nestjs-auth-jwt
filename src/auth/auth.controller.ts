import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiImplicitQuery,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ExtractJwt } from 'passport-jwt';
import { Ip } from '../shared/decorators/ip.decorator';
import { User } from '../shared/decorators/user.decorator';
import { NotFoundError } from '../shared/errors/not-found.error';
import { EnumToArray } from '../shared/utils/enum-to-array';
import { GetOperationId } from '../shared/utils/get-operation-id';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';
import { GrantType } from './view-models/grant-types.enum';
import { LoginResponseVm } from './view-models/login-response-vm.model';
import { LoginVm } from './view-models/login-vm.model';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponseVm })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
  @ApiOperation(GetOperationId('Users', 'Login'))
  async login(
    @Ip() userIp,
    @Body() credentials: LoginVm,
  ): Promise<LoginResponseVm> {
    // Login route is common to all type of users
    // We try each of them and return the one that matches

    const loginResults = await this.authService.login(credentials, userIp);

    if (!loginResults) {
      throw new UnauthorizedException(
        'This email, password combination was not found',
      );
    }

    return loginResults;
  }

  @Get('access_token')
  // Needed to test with swagger page
  @ApiBearerAuth()
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponseVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  @ApiImplicitQuery({ name: 'grant_type', enum: EnumToArray(GrantType) })
  @ApiImplicitQuery({ name: 'refresh_token', required: false })
  @ApiImplicitQuery({ name: 'client_id', required: false })
  @ApiOperation({ title: 'AccessToken', description: 'Get a refresh token' })
  async token(
    @Req() req,
    @Ip() userIp,
    @Query('grant_type') grantType: GrantType,
    @Query('refresh_token') refreshToken?: string,
    @Query('client_id') clientId?: string,
  ): Promise<LoginResponseVm> {
    // For now this endpoint only issues new tokens with refresh tokens
    let res: LoginResponseVm;

    switch (grantType) {
      case GrantType.RefreshToken:
        try {
          // Get old access token
          const oldAccessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
          res = await this.tokenService.getAccessTokenFromRefreshToken(
            refreshToken,
            oldAccessToken,
            clientId,
            userIp,
          );
        } catch (error) {
          if (error instanceof NotFoundError) {
            throw new BadRequestException('invalid_grant', error.message);
          }

          throw new InternalServerErrorException('invalid_grant');
        }

        return res;

      default:
        throw new BadRequestException('invalid_grant');
    }
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  @ApiOperation(GetOperationId('Users', 'Logout'))
  async logout(
    @User('id') userId,
    @Query('refresh_token') refreshToken?: string,
    @Query('from_all') fromAll: boolean = false,
  ): Promise<any> {
    if (fromAll) {
      await this.authService.logoutFromAll(userId);
    } else {
      if (!refreshToken) {
        throw new BadRequestException('No refresh token provided');
      }
      await this.authService.logout(refreshToken, userId);
    }
    return { message: 'ok' };
  }
}
