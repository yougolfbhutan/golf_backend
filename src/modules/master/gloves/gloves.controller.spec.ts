import { Test, TestingModule } from '@nestjs/testing';
import { GlovesController } from './gloves.controller';
import { GlovesService } from './gloves.service';

describe('GlovesController', () => {
  let controller: GlovesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GlovesController],
      providers: [GlovesService],
    }).compile();

    controller = module.get<GlovesController>(GlovesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
