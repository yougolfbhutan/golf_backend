import { Test, TestingModule } from '@nestjs/testing';
import { GreenFeeService } from './green-fee.service';

describe('GreenFeeService', () => {
  let service: GreenFeeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GreenFeeService],
    }).compile();

    service = module.get<GreenFeeService>(GreenFeeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
