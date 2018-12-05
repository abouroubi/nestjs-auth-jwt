import { Injectable } from '@nestjs/common';
import 'automapper-ts/dist/automapper';
import { LoginVm } from '../../auth/view-models/login-vm.model';
import { Login } from '../../auth/models/login.model';
import { User } from '../../user/models/user.model';
import { UserVm } from '../../user/view-models/user-vm.model';
import { RegisterUserVm } from '../../user/view-models/register-user-vm.model';
import { LoginResponse } from '../../auth/models/login-response';
import { LoginResponseVm } from '../../auth/view-models/login-response-vm.model';

@Injectable()
export class MapperService {
  mapper: AutoMapperJs.AutoMapper;

  constructor() {
    this.mapper = automapper;
    this.initializeMapper();
  }

  private initializeMapper(): void {
    this.mapper.initialize(MapperService.configure);
  }

  private static configure(config: AutoMapperJs.IConfiguration): void {
    config.createMap(LoginVm.name, Login.name);
    config.createMap(LoginResponse.name, LoginResponseVm.name);
    config.createMap(RegisterUserVm.name, User.name);
    config
      .createMap(User.name, UserVm.name)
      .forSourceMember('_id', opts => opts.ignore())
      .forSourceMember('password', opts => opts.ignore())
      .forSourceMember('__v', opts => opts.ignore());
  }

  async map<K>(
    object: any | any[],
    sourceKey: string,
    destinationKey: string,
  ): Promise<K> {
    return this.mapper.map(sourceKey, destinationKey, object) as K;
  }
}
