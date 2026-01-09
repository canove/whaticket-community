import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsOptional, IsInt, ArrayMinSize } from 'class-validator';

export class CreateCampaignDto {
    @ApiProperty({ example: 'Promoção de Natal', description: 'Nome da campanha' })
    @IsString()
    @IsNotEmpty({ message: 'O nome é obrigatório' })
    name!: string;

    @ApiProperty({ example: 'Olá {nome}, aproveite nossas ofertas!', description: 'Mensagem da campanha' })
    @IsString()
    @IsNotEmpty({ message: 'A mensagem é obrigatória' })
    message!: string;

    @ApiProperty({ example: [1, 2, 3], description: 'IDs dos contatos', required: false })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    contactIds?: number[];
}
