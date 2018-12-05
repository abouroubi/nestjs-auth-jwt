import { Test, TestingModule } from '@nestjs/testing';
import { MapperService } from './mapper.service';

describe('MapperService', () => {
  let service: MapperService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MapperService],
    }).compile();
    service = module.get<MapperService>(MapperService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
