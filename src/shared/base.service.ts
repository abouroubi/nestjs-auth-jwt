import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { BaseModel } from './base.model';

export abstract class BaseService<T extends BaseModel> {
  protected _model: ReturnModelType<any>;

  async findAll(filter = {}): Promise<DocumentType<T>[]> {
    return this._model.find(filter).exec();
  }

  async findOne(filter = {}): Promise<DocumentType<T>> {
    return this._model.findOne(filter).exec();
  }

  async findById(id: string): Promise<DocumentType<T>> {
    return this._model.findById(new Types.ObjectId(id)).exec();
  }

  async create(item: Partial<T>): Promise<DocumentType<T>> {
    return this._model.create(item as any);
  }

  async update(id: string, item: Partial<T>): Promise<DocumentType<T>> {
    return this._model
      .findByIdAndUpdate(new Types.ObjectId(id), item, { new: true })
      .exec();
  }

  async deleteById(id: string): Promise<DocumentType<T>> {
    return this._model.findOneAndDelete({ _id: new Types.ObjectId(id) }).exec();
  }

  async delete(filter = {}): Promise<any> {
    return this._model.deleteMany(filter).exec();
  }
}
