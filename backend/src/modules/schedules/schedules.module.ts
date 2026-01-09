import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { ScheduleProcessor, SCHEDULE_QUEUE } from './schedule.processor';
import { ScheduleQueueService } from './schedule-queue.service';

@Module({
    imports: [
        BullModule.registerQueue({ name: SCHEDULE_QUEUE }),
        ScheduleModule.forRoot(),
    ],
    controllers: [SchedulesController],
    providers: [SchedulesService, ScheduleProcessor, ScheduleQueueService],
    exports: [SchedulesService, ScheduleQueueService],
})
export class SchedulesModule { }
