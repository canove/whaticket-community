import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateWebhookDto {
    @ApiProperty({ example: 'My Webhook' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: 'https://mysystem.com/webhook' })
    @IsUrl()
    @IsNotEmpty()
    url!: string;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;

    @ApiProperty({ example: ['ticket.created', 'message.received'] })
    @IsArray()
    @IsString({ each: true })
    events!: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    token?: string;
}

export class UpdateWebhookDto extends PartialType(CreateWebhookDto) { }
