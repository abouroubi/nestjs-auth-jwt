import { BaseModel, schemaOptions } from '../../shared/base.model';
import { prop, getModelForClass } from '@typegoose/typegoose';
import { Types } from 'mongoose';

export class RefreshToken extends BaseModel {
  @prop({
    required: [true, 'Token value is required'],
    unique: true,
  })
  value: string;

  @prop()
  userId: Types.ObjectId | string;

  @prop({required: true})
  expiresAt: Date;

  @prop()
  clientId: string;

  @prop()
  ipAddress: string;

  static get model() {
    return getModelForClass(RefreshToken, { schemaOptions });
  }

  static get modelName(): string {
    return this.model.modelName;
  }
}
