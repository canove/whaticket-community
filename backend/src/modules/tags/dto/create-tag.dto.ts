import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsHexColor, MaxLength } from 'class-validator';

export class CreateTagDto {
    @ApiProperty({ example: 'Urgente', description: 'Nome da etiqueta' })
    @IsString()
    @IsNotEmpty({ message: 'O nome é obrigatório' })
    @MaxLength(50, { message: 'O nome deve ter no máximo 50 caracteres' })
    name!: string;

    @ApiProperty({ example: '#e74c3c', description: 'Cor da etiqueta em formato hexadecimal', required: false })
    @IsOptional()
    @IsHexColor({ message: 'A cor deve estar em formato hexadecimal válido' })
    color?: string;
}
