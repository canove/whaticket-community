import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    IsOptional,
    IsBoolean,
    IsEnum,
    IsArray,
    IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';

export enum UserProfile {
    ADMIN = 'admin',
    USER = 'user',
    SUPERVISOR = 'supervisor',
}

export class CreateUserDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty({ message: 'Nome é obrigatório' })
    name!: string;

    @ApiProperty({ example: 'john@example.com' })
    @IsEmail({}, { message: 'Email inválido' })
    @IsNotEmpty({ message: 'Email é obrigatório' })
    email!: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    @IsNotEmpty({ message: 'Senha é obrigatória' })
    @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
    password!: string;

    @ApiPropertyOptional({ enum: UserProfile, default: UserProfile.USER })
    @IsOptional()
    @IsEnum(UserProfile)
    profile?: UserProfile;

    @ApiPropertyOptional({ example: [1, 2, 3] })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    queueIds?: number[];
}

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'])) {
    @ApiPropertyOptional({ example: 'newpassword123' })
    @IsOptional()
    @IsString()
    @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
    password?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UserResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    email!: string;

    @ApiProperty({ enum: UserProfile })
    profile!: string;

    @ApiProperty()
    isActive!: boolean;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;

    @ApiPropertyOptional()
    queues?: { id: number; name: string }[];
}

export class UserListQueryDto {
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

    @ApiPropertyOptional({ enum: UserProfile })
    @IsOptional()
    @IsEnum(UserProfile)
    profile?: UserProfile;
}
