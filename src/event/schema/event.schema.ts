import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export type EventDocument = Event & Document;

export enum DeviceType {
  DEVICE_ONE = 'deviceOne',
  DEVICE_TWO = 'deviceTwo',
  DEVICE_THREE = 'deviceThree',
}

@Schema({ timestamps: true, versionKey: false })
export class Event {
  @Prop({
    required: true,
    index: true,
  })
  name: string;

  @Prop({
    required: true,
    index: true,
  })
  deviceId: string;

  @Prop({
    type: String,
    enum: DeviceType,
    index: true,
  })
  deviceType: DeviceType;

  @Prop({ required: false })
  ip: string;

  @Prop({
    required: true,
    index: true,
  })
  message: string;

  @Prop({
    default: true,
  })
  isValid: boolean;
}

export const EventDatabaseName = 'events';

/**
 * Instance of User Mongo Schema
 */
export const EventSchema = SchemaFactory.createForClass(Event);
