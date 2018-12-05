import { BaseModel, schemaOptions } from '../../shared/base.model';
import { prop, ModelType } from 'typegoose';
import { ObjectID } from 'mongodb';

export class RefreshToken extends BaseModel {
  @prop({
    required: [true, 'Token value is required'],
    unique: true,
  })
  value: string;

  @prop()
  userId: ObjectID | string;

  @prop({required: true})
  expiresAt: Date;

  @prop()
  clientId: string;

  @prop()
  ipAddress: string;

  static get model(): ModelType<RefreshToken> {
    return new RefreshToken().getModelForClass(RefreshToken, { schemaOptions });
  }

  static get modelName(): string {
    return this.model.modelName;
  }
}
