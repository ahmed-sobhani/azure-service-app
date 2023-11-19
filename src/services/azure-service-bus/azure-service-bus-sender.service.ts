import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ServiceBusClient, ServiceBusSender } from '@azure/service-bus';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import retry from 'async-retry';
import { DeviceDataInputDTO } from 'src/event/dto/events.dto';

@Injectable()
export class AzureServiceBusSenderService
  implements OnModuleInit, OnModuleDestroy
{
  private client: ServiceBusClient;
  private senders: Map<string, ServiceBusSender> = new Map();

  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
  ) {}

  onModuleInit() {
    try {
      /** Initial Azure Service Bus Client */
      this.client = new ServiceBusClient(
        this.configService.getOrThrow<string>('AZURE_SERVICEBUS_CONN_STRING'),
      );
    } catch (error) {
      this.logger.error(
        `[${AzureServiceBusSenderService.name}] Error on initialing Azure Service Bus Client:`,
        error,
      );
    }
  }

  private async getOrCreateSender(queueName: string) {
    let sender = this.senders.get(queueName);

    if (!sender) {
      sender = await this.client.createSender(queueName);
      this.senders.set(queueName, sender);
    }

    return sender;
  }

  async sendMessage(queueName: string, message: DeviceDataInputDTO) {
    try {
      await retry(
        async () => {
          const sender = await this.getOrCreateSender(queueName);
          await sender.sendMessages({ body: message });
          this.logger.log(
            `[${AzureServiceBusSenderService.name}] Message sent to queue ${queueName}`,
          );
        },
        {
          retries: this.configService.get<number>('SEND_MESSAGE_RETRIES') || 5, // Number of retries
          factor: this.configService.get<number>('SEND_MESSAGE_RETRY_FACTOR') || 2, // The exponential factor
          minTimeout: this.configService.get<number>('SEND_MESSAGE_TIMEOUT') || 1000, // The number of milliseconds before starting the first retry
          onRetry: (error, attempt) => {
            this.logger.log(
              `[${AzureServiceBusSenderService.name}] Attempt ${attempt} failed with error: ${error.message}`,
            );
          },
        },
      );
    } catch (error) {
      this.logger.error(
        `[${AzureServiceBusSenderService.name}] Error on sending mesage:`,
        error,
      );
    }
  }

  async onModuleDestroy() {
    /** Close senders connection */
    for (const sender of this.senders.values()) {
      await sender.close();
    }

    /** Close client connection */
    this.client.close();
  }
}
