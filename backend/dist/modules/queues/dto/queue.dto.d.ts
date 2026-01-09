export declare class CreateQueueDto {
    name: string;
    color: string;
    greetingMessage?: string;
}
declare const UpdateQueueDto_base: import("@nestjs/common").Type<Partial<CreateQueueDto>>;
export declare class UpdateQueueDto extends UpdateQueueDto_base {
}
export {};
