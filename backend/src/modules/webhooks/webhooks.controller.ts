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
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto';
import { JwtAuthGuard } from '../auth';

@ApiTags('Webhooks')
@Controller('webhooks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WebhooksController {
    constructor(private readonly webhooksService: WebhooksService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new webhook' })
    @ApiResponse({ status: 201, description: 'Webhook created' })
    async create(@Body() dto: CreateWebhookDto) {
        return this.webhooksService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List all webhooks' })
    @ApiResponse({ status: 200, description: 'List of webhooks' })
    async findAll() {
        return this.webhooksService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a webhook by ID' })
    @ApiResponse({ status: 200, description: 'Webhook details' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.webhooksService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a webhook' })
    @ApiResponse({ status: 200, description: 'Webhook updated' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateWebhookDto,
    ) {
        return this.webhooksService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a webhook' })
    @ApiResponse({ status: 204, description: 'Webhook deleted' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.webhooksService.delete(id);
    }
}
