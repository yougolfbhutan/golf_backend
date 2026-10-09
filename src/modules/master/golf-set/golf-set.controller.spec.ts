import { Test, TestingModule } from '@nestjs/testing';
import { GolfSetController } from './golf-set.controller';
import { GolfSetService } from './golf-set.service';

describe('GolfSetController', () => {
  let controller: GolfSetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GolfSetController],
      providers: [GolfSetService],
    }).compile();

    controller = module.get<GolfSetController>(GolfSetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
