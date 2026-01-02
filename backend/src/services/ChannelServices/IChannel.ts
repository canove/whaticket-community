export interface SendMessageOptions {
  mediaUrl?: string;
  mediaType?: string; // image, video, audio, document
  isRecorded?: boolean; // For PTT (Push To Talk)
  caption?: string;
  quotedMsgId?: string | number;
  fileName?: string;
}

export interface IChannel {
  start(): Promise<void>;
  stop(): Promise<void>;
  sendMessage(contactId: number | string, content: string, options?: SendMessageOptions): Promise<any>;
  sendStatus(contactId: number | string, status: "composing" | "recording"): Promise<void>;
  healthCheck(): Promise<boolean>;
}
