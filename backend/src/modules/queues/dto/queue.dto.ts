import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateQueueDto {
    @ApiProperty({ example: 'Suporte' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: '#3498db' })
    @IsString()
    @IsNotEmpty()
    color!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    greetingMessage?: string;
}

export class UpdateQueueDto extends PartialType(CreateQueueDto) { }
