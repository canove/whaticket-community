import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppGateway } from './app.gateway';

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('jwt.secret'),
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [AppGateway],
    exports: [AppGateway],
})
export class GatewaysModule { }
