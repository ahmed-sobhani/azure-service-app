import { DeviceType } from 'src/event/schema/event.schema';

export class EventDTO {
  name: string;
  deviceId: string;
  deviceType: DeviceType;
  ip: string;
  message: string;
  isValid: boolean;
}

export class DeviceDataInputDTO {
  sub: string;
  dId: string;
  details : {
    ip: string;
  }
  note: string;
  verified: boolean;
  enabled: boolean;
  ref: DeviceType;
}
