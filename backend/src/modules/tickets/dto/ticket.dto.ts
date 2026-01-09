import {
    IsString,
    IsOptional,
    IsInt,
    IsEnum,
    IsBoolean,
    IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TicketStatus {
    OPEN = 'open',
    PENDING = 'pending',
    CLOSED = 'closed',
}

export class CreateTicketDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    contactId!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    whatsappId!: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    queueId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    userId?: number;

    @ApiPropertyOptional({ enum: TicketStatus, default: TicketStatus.PENDING })
    @IsOptional()
    @IsEnum(TicketStatus)
    status?: TicketStatus;
}

export class UpdateTicketDto {
    @ApiPropertyOptional({ enum: TicketStatus })
    @IsOptional()
    @IsEnum(TicketStatus)
    status?: TicketStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    queueId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    userId?: number;
}

export class TicketListQueryDto {
    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @IsInt()
    page?: number;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @IsInt()
    limit?: number;

    @ApiPropertyOptional({ enum: TicketStatus })
    @IsOptional()
    @IsEnum(TicketStatus)
    status?: TicketStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    queueId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    userId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    showAll?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;
}

export class TransferTicketDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    queueId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    userId?: number;
}
