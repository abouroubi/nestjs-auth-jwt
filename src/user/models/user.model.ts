import { prop, ModelType } from 'typegoose';
import { BaseModel, schemaOptions } from '../../shared/base.model';
import { Constants } from '../../shared/utils/constants';
import { Gender } from './gender.enum';

export class User extends BaseModel {
  @prop()
  username?: string;

  @prop({
    required: [true, 'EMail is required'],
    unique: true,
    match: Constants.EmailRegex,
  })
  email: string;

  @prop({
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  })
  password: string;

  @prop({ default: null })
  lastLoginDate: Date;

  @prop()
  firstName?: string;

  @prop()
  lastName?: string;

  @prop()
  deviceId?: string;

  @prop({ default: false })
  socialLogin: boolean;

  @prop()
  socialId?: string;

  @prop()
  birthDate?: Date;

  @prop({ enum: Object.keys(Gender) })
  gender?: Gender;

  static get model(): ModelType<User> {
    return new User().getModelForClass(User, { schemaOptions });
  }

  static get modelName(): string {
    return this.model.modelName;
  }
}

export const ClientModel = User.model;
