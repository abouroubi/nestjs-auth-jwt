import { Injectable } from '@nestjs/common';
import 'automapper-ts/dist/automapper';

@Injectable()
export class MapperService {
  private mapper: AutoMapperJs.AutoMapper;

  constructor() {
    this.mapper = automapper;
    this.initializeMapper();
  }

  private initializeMapper(): void {
    this.mapper.initialize(MapperService.configure);
  }

  public createMap(
    source: string | (new () => any),
    destination: string | (new () => any),
  ): AutoMapperJs.ICreateMapFluentFunctions {
    return this.mapper.createMap(source, destination);
  }

  private static configure(config: AutoMapperJs.IConfiguration): void {}

  map<K>(
    object: any | any[],
    destinationKey: string,
    sourceKey?: string,
    isArray: boolean = false,
  ): K {
    const _sourceKey = isArray
      ? `${sourceKey || object.constructor.name}[]`
      : sourceKey || object.constructor.name;

    const _destinationKey = isArray ? `${destinationKey}[]` : destinationKey;

    // Convert Mongoose objects to JSON before mapping
    const _object =
      object && typeof object.toJSON === 'function' ? object.toJSON() : object;

    return this.mapper.map(_sourceKey, _destinationKey, _object);
  }
}
