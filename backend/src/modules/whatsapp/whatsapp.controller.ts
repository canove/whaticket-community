import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WhatsappService } from './whatsapp.service';

@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsappController {
    constructor(private readonly whatsappService: WhatsappService) { }

    @Get()
    @ApiOperation({ summary: 'List all WhatsApp connections' })
    @ApiResponse({ status: 200, description: 'List of WhatsApp connections' })
    async findAll() {
        return this.whatsappService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a WhatsApp connection by ID' })
    @ApiResponse({ status: 200, description: 'WhatsApp connection details' })
    @ApiResponse({ status: 404, description: 'Connection not found' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.whatsappService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new WhatsApp connection' })
    @ApiResponse({ status: 201, description: 'Connection created' })
    async create(
        @Body()
        body: {
            name: string;
            greetingMessage?: string;
            farewellMessage?: string;
            isDefault?: boolean;
            queueIds?: number[];
        },
    ) {
        return this.whatsappService.create(body);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a WhatsApp connection' })
    @ApiResponse({ status: 200, description: 'Connection updated' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body()
        body: {
            name?: string;
            greetingMessage?: string;
            farewellMessage?: string;
            isDefault?: boolean;
            queueIds?: number[];
        },
    ) {
        return this.whatsappService.update(id, body);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a WhatsApp connection' })
    @ApiResponse({ status: 204, description: 'Connection deleted' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.whatsappService.delete(id);
    }

    @Post(':id/session')
    @ApiOperation({ summary: 'Start a WhatsApp session' })
    @ApiResponse({ status: 200, description: 'Session started, QR code returned if needed' })
    async startSession(@Param('id', ParseIntPipe) id: number) {
        return this.whatsappService.initSession(id);
    }

    @Delete(':id/session')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Disconnect a WhatsApp session' })
    @ApiResponse({ status: 204, description: 'Session disconnected' })
    async logout(@Param('id', ParseIntPipe) id: number) {
        await this.whatsappService.logout(id);
    }

    @Get(':id/status')
    @ApiOperation({ summary: 'Get WhatsApp session status' })
    @ApiResponse({ status: 200, description: 'Session status' })
    async getStatus(@Param('id', ParseIntPipe) id: number) {
        return this.whatsappService.getSessionStatus(id);
    }

    @Post(':id/restart')
    @ApiOperation({ summary: 'Restart a WhatsApp session' })
    @ApiResponse({ status: 200, description: 'Session restarted' })
    async restart(@Param('id', ParseIntPipe) id: number) {
        await this.whatsappService.restart(id);
    }
}
