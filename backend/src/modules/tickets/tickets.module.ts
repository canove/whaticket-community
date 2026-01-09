import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
    controllers: [TicketsController],
    providers: [TicketsService],
    exports: [TicketsService],
})
export class TicketsModule { }
