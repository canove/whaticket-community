import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsOptional, IsInt } from 'class-validator';

export class CreateScheduleDto {
    @ApiProperty({ example: 'Olá, tudo bem?', description: 'Mensagem a ser enviada' })
    @IsString()
    @IsNotEmpty({ message: 'A mensagem é obrigatória' })
    body!: string;

    @ApiProperty({ example: '2024-01-15T10:00:00Z', description: 'Data/hora de envio' })
    @IsDateString({}, { message: 'Data de envio inválida' })
    sendAt!: string;

    @ApiProperty({ example: 1, description: 'ID do contato' })
    @IsInt()
    contactId!: number;

    @ApiProperty({ example: 1, description: 'ID do ticket (opcional)', required: false })
    @IsOptional()
    @IsInt()
    ticketId?: number;
}
