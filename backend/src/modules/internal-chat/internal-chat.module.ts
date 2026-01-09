import { Module } from '@nestjs/common';
import { InternalChatController } from './internal-chat.controller';
import { InternalChatService } from './internal-chat.service';
import { InternalChatGateway } from './internal-chat.gateway';

@Module({
    controllers: [InternalChatController],
    providers: [InternalChatService, InternalChatGateway],
    exports: [InternalChatService, InternalChatGateway],
})
export class InternalChatModule { }
