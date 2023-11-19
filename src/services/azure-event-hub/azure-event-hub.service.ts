import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { EventHubConsumerClient } from '@azure/event-hubs';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { AzureServiceBusSenderService } from '../azure-service-bus/azure-service-bus-sender.service';
import { DeviceDataInputDTO } from 'src/event/dto/events.dto';
import { plainToClass, plainToInstance } from 'class-transformer';

@Injectable()
export class AzureEventHubService implements OnModuleInit, OnModuleDestroy {
  private client: EventHubConsumerClient;
  private consumer_group = null;

  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
    private readonly serviceBusSender: AzureServiceBusSenderService,
    _consumer_group: string = null,
  ) {
    this.consumer_group = _consumer_group
      ? _consumer_group
      : this.configService.getOrThrow<string>(
          'AZURE_EVENTHUB_DEFAULT_CONSUMER_GROUP',
        );
  }

  onModuleInit() {
    try {
      this.client = new EventHubConsumerClient(
        this.consumer_group,
        this.configService.getOrThrow<string>('AZURE_EVENTHUB_CONN_STRING'),
      );
      this.client.subscribe(this.messageHandler());
    } catch (error) {
      this.logger.error(
        `[${AzureEventHubService.name}] Error on initialing/Subscribing Azure Event Hub client/events: ${error.message}`,
      );
    }
  }

  private messageHandler() {
    return {
      processEvents: async (events, context) => {
        for (const event of events) {
          this.processEvent(event, context);
        }
      },
      processError: async (err, context) => this.processError(err, context),
    };
  }

  private processEvent(event, context) {
    try {
      this.logger.log(
        `[${AzureEventHubService.name}] Received event: '${event.body}' from partition: '${context.partitionId}' and consumer group: '${context.consumerGroup}'`,
      );
      const data: DeviceDataInputDTO = plainToInstance(
        DeviceDataInputDTO,
        event.body,
      );
      this.serviceBusSender.sendMessage(context?.partitionId, data);
    } catch (error) {
      this.logger.error(
        `[${AzureEventHubService.name}] Error on process event: ${error}`,
      );
    }
  }

  private processError(err, context) {
    this.logger.error(
      `[${AzureEventHubService.name}] Error on recieve event: ${err}`,
    );
  }

  async onModuleDestroy() {
    await this.client.close();
  }
}
