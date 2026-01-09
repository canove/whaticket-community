import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PromptsService } from './prompts.service';
import { CreatePromptDto, UpdatePromptDto } from './dto';
import { JwtAuthGuard } from '../auth';

@ApiTags('Prompts')
@Controller('prompts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PromptsController {
    constructor(private readonly promptsService: PromptsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new prompt' })
    @ApiResponse({ status: 201, description: 'Prompt created' })
    async create(@Body() dto: CreatePromptDto) {
        return this.promptsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List all prompts' })
    @ApiResponse({ status: 200, description: 'List of prompts' })
    async findAll() {
        return this.promptsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a prompt by ID' })
    @ApiResponse({ status: 200, description: 'Prompt details' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.promptsService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a prompt' })
    @ApiResponse({ status: 200, description: 'Prompt updated' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePromptDto,
    ) {
        return this.promptsService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a prompt' })
    @ApiResponse({ status: 204, description: 'Prompt deleted' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.promptsService.delete(id);
    }
}
