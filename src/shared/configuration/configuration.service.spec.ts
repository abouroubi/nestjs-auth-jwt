import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurationService } from './configuration.service';

describe('ConfigurationService', () => {
  let service: ConfigurationService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigurationService],
    }).compile();
    service = module.get<ConfigurationService>(ConfigurationService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
