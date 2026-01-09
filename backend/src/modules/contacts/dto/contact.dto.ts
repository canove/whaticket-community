import {
    IsString,
    IsOptional,
    IsEmail,
    IsBoolean,
    IsNotEmpty,
    IsInt,
    IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateContactDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty({ message: 'Nome é obrigatório' })
    name!: string;

    @ApiProperty({ example: '5511999999999' })
    @IsString()
    @IsNotEmpty({ message: 'Número é obrigatório' })
    number!: string;

    @ApiPropertyOptional({ example: 'john@example.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    profilePicUrl?: string;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    isGroup?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    extraInfo?: Record<string, any>;
}

export class UpdateContactDto extends PartialType(CreateContactDto) { }

export class ContactListQueryDto {
    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @IsInt()
    page?: number;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @IsInt()
    limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;
}
