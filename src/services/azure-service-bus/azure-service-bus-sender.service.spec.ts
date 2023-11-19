import { Test, TestingModule } from '@nestjs/testing';
import { AzureServiceBusSenderService } from './azure-service-bus-sender.service';

describe('AzureServiceBusService', () => {
  let service: AzureServiceBusSenderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AzureServiceBusSenderService],
    }).compile();

    service = module.get<AzureServiceBusSenderService>(
      AzureServiceBusSenderService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
