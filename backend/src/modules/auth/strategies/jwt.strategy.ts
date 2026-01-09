import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

export interface JwtPayload {
    sub: number;
    email: string;
    profile: string;
    tokenVersion: number;
    iat: number;
    exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        const secret = configService.get<string>('jwt.secret') || 'default-jwt-secret';
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: JwtPayload) {
        const isValid = await this.authService.validateUser(
            payload.sub,
            payload.tokenVersion,
        );

        if (!isValid) {
            throw new UnauthorizedException('Token inválido ou expirado');
        }

        return {
            id: payload.sub,
            email: payload.email,
            profile: payload.profile,
        };
    }
}
