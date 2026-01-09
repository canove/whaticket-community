import { Module } from '@nestjs/common';
import { QueuesController } from './queues.controller';
import { QueuesService } from './queues.service';

@Module({
    controllers: [QueuesController],
    providers: [QueuesService],
    exports: [QueuesService],
})
export class QueuesModule { }
