import { Test, TestingModule } from '@nestjs/testing';
import { GolferCategoryService } from './golfer-category.service';

describe('GolferCategoryService', () => {
  let service: GolferCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GolferCategoryService],
    }).compile();

    service = module.get<GolferCategoryService>(GolferCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
