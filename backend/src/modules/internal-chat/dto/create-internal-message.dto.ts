import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateInternalMessageDto {
    @ApiProperty({ example: 1, description: 'ID do usuário destinatário' })
    @IsInt()
    toUserId!: number;

    @ApiProperty({ example: 'Olá, preciso de ajuda!', description: 'Mensagem' })
    @IsString()
    @IsNotEmpty({ message: 'A mensagem é obrigatória' })
    body!: string;
}
