import { Test, TestingModule } from '@nestjs/testing';
import { GreenFeeController } from './green-fee.controller';
import { GreenFeeService } from './green-fee.service';

describe('GreenFeeController', () => {
  let controller: GreenFeeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GreenFeeController],
      providers: [GreenFeeService],
    }).compile();

    controller = module.get<GreenFeeController>(GreenFeeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
