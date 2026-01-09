import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, AuthResponseDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, req: Request): Promise<AuthResponseDto>;
    register(dto: RegisterDto): Promise<AuthResponseDto>;
    refresh(dto: RefreshTokenDto): Promise<AuthResponseDto>;
    logout(dto: RefreshTokenDto): Promise<void>;
    logoutAll(userId: number): Promise<void>;
}
