import { SchemaOptions } from 'mongoose';
import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { Typegoose, prop, pre } from 'typegoose';
/**
 * Mongo's base Model and Schema
 */

@pre<BaseModel>('update', function(next) {
  this.updatedAt = new Date(Date.now());
  next();
})
export class BaseModel extends Typegoose {
  @prop({ default: Date.now() })
  createdAt?: Date;

  @prop({ default: Date.now() })
  updatedAt?: Date;
}

export const schemaOptions: SchemaOptions = {
  toJSON: {
    virtuals: true,
    getters: true,
  },
  timestamps: true,
};

/**
 * View Models Base, will be exposed by API
 */
export class BaseModelVm {
  @ApiModelPropertyOptional({ type: String, format: 'date-time' })
  createdAt?: Date;
  @ApiModelPropertyOptional({ type: String, format: 'date-time' })
  updatedAt?: Date;
  @ApiModelPropertyOptional()
  id?: string;
}
