import { Test, TestingModule } from '@nestjs/testing';
import { GolfSetService } from './golf-set.service';

describe('GolfSetService', () => {
  let service: GolfSetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GolfSetService],
    }).compile();

    service = module.get<GolfSetService>(GolfSetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
