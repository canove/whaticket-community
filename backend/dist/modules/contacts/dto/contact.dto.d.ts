export declare class CreateContactDto {
    name: string;
    number: string;
    email?: string;
    profilePicUrl?: string;
    isGroup?: boolean;
    extraInfo?: Record<string, any>;
}
declare const UpdateContactDto_base: import("@nestjs/common").Type<Partial<CreateContactDto>>;
export declare class UpdateContactDto extends UpdateContactDto_base {
}
export declare class ContactListQueryDto {
    page?: number;
    limit?: number;
    search?: string;
}
export {};
