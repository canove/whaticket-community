export declare enum UserProfile {
    ADMIN = "admin",
    USER = "user",
    SUPERVISOR = "supervisor"
}
export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    profile?: UserProfile;
    queueIds?: number[];
}
declare const UpdateUserDto_base: import("@nestjs/common").Type<Partial<Omit<CreateUserDto, "password">>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
    password?: string;
    isActive?: boolean;
}
export declare class UserResponseDto {
    id: number;
    name: string;
    email: string;
    profile: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    queues?: {
        id: number;
        name: string;
    }[];
}
export declare class UserListQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    profile?: UserProfile;
}
export {};
