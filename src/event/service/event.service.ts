import { Catch, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event, EventDocument } from '../schema/event.schema';
import { Model } from 'mongoose';
import { DeviceDataInputDTO, EventDTO } from '../dto/events.dto';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
  ) {}

  async create(event: EventDTO) {
    try {
      const newEvent = new this.eventModel(event);
      await newEvent.save();
    } catch (error) {
      this.logger.error(
        `[${EventService.name}] Error on inserting new event on db: ${error.message}`,
      );
    }
  }

  async saveDeviceData(data: DeviceDataInputDTO) {
    const _event: EventDTO = {
      deviceId: data.dId,
      ip: data.details.ip,
      isValid: data.verified && data.enabled,
      name: data.sub,
      message: data.note,
      deviceType: data.ref,
    };
    return await this.create(_event);
  }
}
