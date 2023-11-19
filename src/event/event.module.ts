import { Module } from '@nestjs/common';
import { EventService } from './service/event.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schema/event.schema';

@Module({
  imports:[
    MongooseModule.forFeature([
      {
        name: Event.name,
        schema: EventSchema,
      },
    ]),
  ],
  providers: [EventService],
  exports: [EventService]
})
export class EventModule {}
