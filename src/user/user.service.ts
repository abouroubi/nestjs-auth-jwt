import { Logger, Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcryptjs';
import { ReturnModelType } from '@typegoose/typegoose';
import { DocumentType } from '@typegoose/typegoose';
import { BaseService } from '../shared/base.service';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './models/user.model';
import { LoginVm } from '../auth/view-models/login-vm.model';

@Injectable()
export class UserService extends BaseService<User> {
  private readonly logger = new Logger('UserSerivce');

  constructor(
    @InjectModel(User.modelName) private readonly userModel: ReturnModelType<typeof User>,
  ) {
    super();
    this._model = userModel;
  }

  async login(loginObject: LoginVm): Promise<DocumentType<User>> {
    const { email, password } = loginObject;

    const user = await this.findOne({ email });

    if (!user) {
      // throw new Error('User not found');
      return Promise.resolve(null);
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new Error('Invalid credentials');
    }

    return user;
  }

  async register(user: User): Promise<User> {
    const { email, password, firstName, lastName } = user;

    const newUser = new this._model(); // InstanceType<User>
    newUser.email = email;
    newUser.password = await this.hashPassword(password);
    newUser.firstName = firstName;
    newUser.lastName = lastName;
    newUser.gender = user.gender;
    newUser.birthDate = user.birthDate;
    newUser.deviceId = user.deviceId;

    try {
      const result = await this.create(newUser);
      return result.toJSON();
    } catch (e) {
      // @todo: change this thrwo to typed exception that can be easily casted in controller
      throw e;
    }
  }

  protected async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(12);
    const hashedPassword = await hash(password, salt);

    return hashedPassword;
  }

  async exists(id: string): Promise<User> {
    try {
      return this.findById(id);
    } catch (error) {
      Logger.error(error);
      return null;
    }
  }
}
