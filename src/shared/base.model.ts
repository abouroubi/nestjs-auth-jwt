import { SchemaOptions } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { prop, modelOptions } from '@typegoose/typegoose';

/**
 * Mongo's base Model and Schema
 */
@modelOptions({
  schemaOptions: {
    toJSON: {
      virtuals: true,
      getters: true,
    },
    timestamps: true,
  }
})
export class BaseModel {
  @prop({ default: Date.now })
  createdAt?: Date;

  @prop({ default: Date.now })
  updatedAt?: Date;
  
  id?: string; // Virtual getter for _id
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
  @ApiProperty({ type: String, format: 'date-time', required: false })
  createdAt?: Date;
  
  @ApiProperty({ type: String, format: 'date-time', required: false })
  updatedAt?: Date;
  
  @ApiProperty({ required: false })
  id?: string;
}
