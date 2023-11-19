import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ServiceBusClient, ServiceBusReceiver } from '@azure/service-bus';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { EventService } from 'src/event/service/event.service';

@Injectable()
export class AzureServiceBusReceiverService
  implements OnModuleInit, OnModuleDestroy
{
  private client: ServiceBusClient;
  private receivers: Map<string, ServiceBusReceiver> = new Map();

  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
    private readonly eventService: EventService
  ) {}

  onModuleInit() {
    try {
      /** Initial Azure Service Bus Client */
      this.client = new ServiceBusClient(
        this.configService.getOrThrow<string>('AZURE_SERVICEBUS_CONN_STRING'),
      );

      /** Start receiving from queues */
      const queuesList: string[] =
        this.configService.get<string[]>('SERVICE_BUS_QUEUES') || [];
      queuesList.forEach((queue) => this.startReceivingMessages(queue));
    } catch (error) {
      this.logger.error(
        `[${AzureServiceBusReceiverService.name}] Error on initialing Azure Service Bus Client:`,
        error,
      );
    }
  }

  private async startReceivingMessages(queueName: string) {
    const receiver = await this.client.createReceiver(queueName);
    this.receivers.set(queueName, receiver);

    try {
      receiver.subscribe({
        processMessage: async (message) => {
          this.logger.log(
            `[${AzureServiceBusReceiverService.name}] Received message from ${queueName}:`,
            message.body,
          );
          /** Save on Database */
          await this.eventService.saveDeviceData(message.body);
          await receiver.completeMessage(message);
        },
        processError: async (args) => {
          this.logger.error(
            `[${
              AzureServiceBusReceiverService.name
            }] Error from ${queueName}: ${JSON.stringify(
              args.error,
            )}`,
          );
        },
      });
    } catch (error) {
      this.logger.error(
        `[${AzureServiceBusReceiverService.name}] Error receiving messages from queue ${queueName}:`,
        error,
      );
    }
  }

  async onModuleDestroy() {
    /** Close senders connection */
    for (const sender of this.receivers.values()) {
      await sender.close();
    }

    /** Close client connection */
    this.client.close();
  }
}
