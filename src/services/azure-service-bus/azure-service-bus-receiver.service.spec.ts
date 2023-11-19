import { Test, TestingModule } from '@nestjs/testing';
import { AzureServiceBusReceiverService } from './azure-service-bus-receiver.service';

describe('AzureServiceBusService', () => {
  let service: AzureServiceBusReceiverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AzureServiceBusReceiverService],
    }).compile();

    service = module.get<AzureServiceBusReceiverService>(
      AzureServiceBusReceiverService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
