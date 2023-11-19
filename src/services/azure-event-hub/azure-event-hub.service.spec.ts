import { Test, TestingModule } from '@nestjs/testing';
import { AzureEventHubService } from './azure-event-hub.service';

describe('AzureEventHubService', () => {
  let service: AzureEventHubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AzureEventHubService],
    }).compile();

    service = module.get<AzureEventHubService>(AzureEventHubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
