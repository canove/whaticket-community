import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'admin@whaticket.com' })
    @IsEmail({}, { message: 'Email inválido' })
    @IsNotEmpty({ message: 'Email é obrigatório' })
    email!: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    @IsNotEmpty({ message: 'Senha é obrigatória' })
    @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
    password!: string;
}

export class RegisterDto {
    @ApiProperty({ example: 'Admin User' })
    @IsString()
    @IsNotEmpty({ message: 'Nome é obrigatório' })
    name!: string;

    @ApiProperty({ example: 'admin@whaticket.com' })
    @IsEmail({}, { message: 'Email inválido' })
    @IsNotEmpty({ message: 'Email é obrigatório' })
    email!: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    @IsNotEmpty({ message: 'Senha é obrigatória' })
    @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
    password!: string;
}

export class RefreshTokenDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Refresh token é obrigatório' })
    refreshToken!: string;
}

export class AuthResponseDto {
    @ApiProperty()
    token!: string;

    @ApiProperty()
    refreshToken!: string;

    @ApiProperty()
    user!: {
        id: number;
        name: string;
        email: string;
        profile: string;
    };
}
