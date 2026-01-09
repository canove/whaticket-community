export declare class CreateWebhookDto {
    name: string;
    url: string;
    enabled?: boolean;
    events: string[];
    token?: string;
}
declare const UpdateWebhookDto_base: import("@nestjs/common").Type<Partial<CreateWebhookDto>>;
export declare class UpdateWebhookDto extends UpdateWebhookDto_base {
}
export {};
