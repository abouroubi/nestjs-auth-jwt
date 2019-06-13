import { InstanceType, ModelType, Typegoose } from 'typegoose';
import { Types } from 'mongoose';

export abstract class BaseService<T extends Typegoose> {
  protected _model: ModelType<T>;

  async findAll(filter = {}): Promise<InstanceType<T>[]> {
    return this._model.find(filter).exec();
  }

  async findOne(filter = {}): Promise<InstanceType<T>> {
    return this._model.findOne(filter).exec();
  }

  async findById(id: string): Promise<InstanceType<T>> {
    return this._model.findById(Types.ObjectId(id)).exec();
  }

  async create(item: InstanceType<T>): Promise<InstanceType<T>> {
    return this._model.create(item);
  }

  async update(id: string, item: InstanceType<T>): Promise<InstanceType<T>> {
    return this._model
      .findByIdAndUpdate(Types.ObjectId(id), item, { new: true })
      .exec();
  }

  async deleteById(id: string): Promise<InstanceType<T>> {
    return this._model.findOneAndDelete(Types.ObjectId(id)).exec();
  }

  async delete(filter = {}): Promise<any> {
    return this._model.deleteMany(filter).exec();
  }
}
