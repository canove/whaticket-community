declare module "mic-recorder-to-mp3" {
  export default class MicRecorder {
    constructor(config: any);
    start(): void;
    stop(): Promise<Blob>;
  }
}
