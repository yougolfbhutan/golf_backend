import { Test, TestingModule } from '@nestjs/testing';
import { GolferCategoryController } from './golfer-category.controller';
import { GolferCategoryService } from './golfer-category.service';

describe('GolferCategoryController', () => {
  let controller: GolferCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GolferCategoryController],
      providers: [GolferCategoryService],
    }).compile();

    controller = module.get<GolferCategoryController>(GolferCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
