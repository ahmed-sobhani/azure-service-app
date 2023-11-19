import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AzureEventHubService } from './services/azure-event-hub/azure-event-hub.service';
import {
  WINSTON_MODULE_PROVIDER,
  WinstonLogger,
  WinstonModule,
  utilities,
} from 'nest-winston';
import { format, transports } from 'winston';
import { AzureServiceBusSenderService } from './services/azure-service-bus/azure-service-bus-sender.service';
import { EventModule } from './event/event.module';
import 'winston-daily-rotate-file';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true
      }),
      inject: [ConfigService],
    }),
    WinstonModule.forRoot({
      transports: [
        new transports.DailyRotateFile({
          filename: `logs/%DATE%-error.log`,
          level: 'error',
          format: format.combine(format.timestamp(), format.json()),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxFiles: '30d',
        }),
        new transports.DailyRotateFile({
          filename: `logs/%DATE%-combined.log`,
          format: format.combine(format.timestamp(), format.json()),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxFiles: '30d',
        }),
        new transports.Console({
          format: format.combine(
            format.cli(),
            format.splat(),
            format.timestamp(),
            format.printf((info) => {
              return `${info.timestamp} ${info.level} ${info.message}`;
            }),
            utilities.format.nestLike('AzureServiceApp', {
              colors: true,
              prettyPrint: true,
            }),
          ),
        }),
      ],
    }),
    EventModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'AzureEventHubServiceWithCustomGroup',
      inject: [ConfigService, WINSTON_MODULE_PROVIDER],
      useFactory: (
        configService: ConfigService,
        logger: WinstonLogger,
        serviceBusSender: AzureServiceBusSenderService,
      ) => {
        return new AzureEventHubService(
          configService,
          logger,
          serviceBusSender,
          'custom_group',
        );
      },
    },
    {
      provide: 'AzureEventHubServiceWithDefaultGroup',
      inject: [ConfigService, WINSTON_MODULE_PROVIDER],
      useFactory: (
        configService: ConfigService,
        logger: WinstonLogger,
        serviceBusSender: AzureServiceBusSenderService,
      ) => {
        return new AzureEventHubService(
          configService,
          logger,
          serviceBusSender,
        );
      },
    },
    AzureServiceBusSenderService,
  ],
})
export class AppModule {}
