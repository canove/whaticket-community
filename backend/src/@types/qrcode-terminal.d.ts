declare module 'qrcode-terminal' {
    export function generate(text: string, options?: { small?: boolean }): void;
    export function setErrorLevel(level: string): void;
}
