import { IsString, IsNotEmpty, IsOptional, IsInt, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreatePromptDto {
    @ApiProperty({ example: 'Vendedor Loja 1' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: 'sk-...' })
    @IsString()
    @IsNotEmpty()
    apiKey!: string;

    @ApiProperty({ example: 'Você é um vendedor útil...' })
    @IsString()
    @IsNotEmpty()
    prompt!: string;

    @ApiPropertyOptional({ default: 1000 })
    @IsOptional()
    @IsInt()
    @Min(1)
    maxTokens?: number;

    @ApiPropertyOptional({ default: 0.7 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(2)
    temperature?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    voice?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    voiceKey?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    voiceRegion?: string;
}

export class UpdatePromptDto extends PartialType(CreatePromptDto) { }
