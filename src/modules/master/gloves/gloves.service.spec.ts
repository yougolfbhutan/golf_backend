import { Test, TestingModule } from '@nestjs/testing';
import { GlovesService } from './gloves.service';

describe('GlovesService', () => {
  let service: GlovesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlovesService],
    }).compile();

    service = module.get<GlovesService>(GlovesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
