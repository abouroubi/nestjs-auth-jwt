import {
  Controller,
  Get,
  HttpStatus,
  BadRequestException,
  Query,
  Req,
  UseGuards,
  Post,
  HttpCode,
  NotFoundException,
  InternalServerErrorException,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiModelProperty,
  ApiImplicitQuery,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginResponseVm } from './view-models/login-response-vm.model';
import { TokenService } from './token/token.service';
import { MapperService } from '../shared/mapper/mapper.service';
import { LoginResponse } from './models/login-response';
import { GetOperationId } from '../shared/utils/get-operation-id';
import { NotFoundError } from '../shared/errors/not-found.error';
import { LoginVm } from './view-models/login-vm.model';
import { Logger } from '@nestjs/common';
import { Login } from './models/login.model';
import { JwtPayload } from './jwt-payload';
import { UserService } from '../user/user.service';
import { GrantType } from './view-models/grant-types.enum';
import { EnumToArray } from '../shared/utils/enum-to-array';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly mapperService: MapperService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponseVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
  @ApiOperation(GetOperationId('Users', 'Login'))
  async login(
    @Req() request,
    @Body() credentials: LoginVm,
  ): Promise<LoginResponseVm> {
    let loginResults: string;

    const loginObject: Login = this.mapperService.mapper.map(
      LoginVm.name,
      Login.name,
      credentials,
    );

    loginObject.ipAddress =
      request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    loginResults = await this.userService.login(loginObject);

    if (!loginResults) {
      throw new NotFoundException(
        'This email, password combination was not found',
      );
    }

    const payload: JwtPayload = {
      sub: loginResults,
    };

    const loginResponse = await this.authService.createAccessToken(payload);

    // We save the user's refresh token
    const tokenContent = {
      userId: loginResults,
      clientId: loginObject.clientId,
      ipAddress: loginObject.ipAddress,
    };
    const refresh = await this.tokenService.generateRefreshToken(tokenContent);

    loginResponse.refreshToken = refresh;

    return this.mapperService.mapper.map(
      LoginResponse.name,
      LoginResponseVm.name,
      loginResponse,
    );
  }

  @Get('access_token')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponseVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: NotFoundException })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  @ApiImplicitQuery({ name: 'grant_type', enum: EnumToArray(GrantType) })
  @ApiImplicitQuery({ name: 'refresh_token', required: false })
  @ApiOperation({ title: 'Access Token', description: 'Get a refresh token' })
  async token(
    @Req() req,
    @Query('grant_type') grantType: GrantType,
    @Query('refresh_token') refreshToken?: string,
  ): Promise<LoginResponseVm> {
    // For now this endpoint only issues new tokens with refresh tokens
    let res;
    switch (grantType) {
      case GrantType.RefreshToken:
        try {
          res = await this.tokenService.getAccessTokenFromRefreshToken(
            refreshToken,
            req.user,
          );
        } catch (error) {
          if (error instanceof NotFoundError) {
            throw new NotFoundException('Please login again', error.message);
          }

          throw new InternalServerErrorException();
        }

        return this.mapperService.mapper.map(
          LoginResponse.name,
          LoginResponseVm.name,
          res,
        );
        break;

      default:
        throw new BadRequestException('Invalid grant type');
        break;
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
    @Req() req,
    @Query('refresh_token') refreshToken?: string,
    @Query('from_all') fromAll: boolean = false,
  ): Promise<any> {
    if (fromAll) {
      await this.authService.logoutFromAll(req.user.id, req.user.type);
    } else {
      if (!refreshToken) {
        throw new BadRequestException('No refresh token provided');
      }
      await this.authService.logout(refreshToken, req.user.id);
    }
    return { message: 'ok' };
  }
}
