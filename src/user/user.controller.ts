import {
  Controller,
  Post,
  Body,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

import { UserService } from './user.service';
import { RegisterUserVm } from './view-models/register-user-vm.model';
import { UserVm } from './view-models/user-vm.model';
import { GetOperationId } from '../shared/utils/get-operation-id';
import { User } from './models/user.model';
import { MapperService } from '../shared/mapper/mapper.service';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mapperService: MapperService,
  ) {
    this.mapperService.createMap(RegisterUserVm.name, User.name);
    this.mapperService
      .createMap(User.name, UserVm.name)
      .forSourceMember('_id', opts => opts.ignore())
      .forSourceMember('password', opts => opts.ignore())
      .forSourceMember('__v', opts => opts.ignore());
  }

  @Post('user/register')
  @ApiResponse({ status: HttpStatus.CREATED, type: UserVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
  @ApiOperation(GetOperationId('User', 'Register'))
  async registerClient(@Body() registerVm: RegisterUserVm): Promise<UserVm> {
    const { email } = registerVm;

    let exist;
    try {
      exist = await this.userService.findOne({ email });
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException('Error while creating user');
    }

    if (exist) {
      throw new BadRequestException(`${email} already exists`);
    }

    const userModel = await this.mapperService.map<User>(
      registerVm,
      RegisterUserVm.name,
      User.name,
    );
    const newUser = await this.userService.register(userModel);
    return this.mapperService.map<UserVm>(newUser, User.name, UserVm.name);
  }
}
