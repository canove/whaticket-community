import { Module } from '@nestjs/common';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';

@Module({
    controllers: [TagsController],
    providers: [TagsService],
    exports: [TagsService],
})
export class TagsModule { }
