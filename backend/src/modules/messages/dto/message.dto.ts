import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    ticketId!: number;

    @ApiProperty({ example: 'Hello!' })
    @IsString()
    @IsNotEmpty()
    body!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    quotedMsgId?: string;
}

export class MessageListQueryDto {
    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @IsInt()
    page?: number;

    @ApiPropertyOptional({ default: 50 })
    @IsOptional()
    @IsInt()
    limit?: number;
}
