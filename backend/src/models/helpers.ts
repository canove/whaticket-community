/**
 * Use ModelRef<T> as the property type for @BelongsTo associations whose target
 * model creates a circular ESM import. TypeScript emits `Object` in
 * __metadata("design:type") for mapped types (no class reference at runtime),
 * avoiding the Temporal Dead Zone (TDZ) ReferenceError that occurs when
 * emitDecoratorMetadata accesses a circularly-imported class during module init.
 *
 * Structurally identical to T, so all type-checking still works.
 */
export type ModelRef<T extends object> = { [K in keyof T]: T[K] };
