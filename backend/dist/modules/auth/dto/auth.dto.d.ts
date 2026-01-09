export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class AuthResponseDto {
    token: string;
    refreshToken: string;
    user: {
        id: number;
        name: string;
        email: string;
        profile: string;
    };
}
