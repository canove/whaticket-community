export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  externalId?: string;
  error?: string;
  delivered?: boolean;
}

export interface SendMediaResult extends SendMessageResult {
  mediaId?: string;
}

export interface ChannelStatus {
  isConnected: boolean;
  connectionName?: string;
  lastActivity?: Date;
  error?: string;
}

export interface ChannelConfig {
  tenantId: number;
  channelId: number;
  settings: Record<string, any>;
}

export abstract class ChannelAdapter {
  protected config: ChannelConfig;
  protected channelType: string;

  constructor(config: ChannelConfig, channelType: string) {
    this.config = config;
    this.channelType = channelType;
  }

  /**
   * Send text message to a contact
   */
  abstract sendMessage(
    contactNumber: string,
    message: string,
    options?: Record<string, any>
  ): Promise<SendMessageResult>;

  /**
   * Send media message (image, audio, video, document)
   */
  abstract sendMedia(
    contactNumber: string,
    mediaPath: string,
    caption?: string,
    options?: Record<string, any>
  ): Promise<SendMediaResult>;

  /**
   * Get current connection status
   */
  abstract getStatus(): Promise<ChannelStatus>;

  /**
   * Validate if channel is properly configured and connected
   */
  abstract validateConnection(): Promise<boolean>;

  /**
   * Get channel type identifier
   */
  getChannelType(): string {
    return this.channelType;
  }

  /**
   * Get channel configuration
   */
  getConfig(): ChannelConfig {
    return this.config;
  }

  /**
   * Update channel configuration
   */
  updateConfig(newConfig: Partial<ChannelConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Format phone number according to channel requirements
   */
  protected formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (default Brazil +55)
    if (cleaned.length === 11 || cleaned.length === 10) {
      return `55${cleaned}`;
    }
    
    return cleaned;
  }

  /**
   * Validate phone number format
   */
  protected isValidPhoneNumber(phoneNumber: string): boolean {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  /**
   * Handle rate limiting delays
   */
  protected async rateLimitDelay(messagesPerSecond: number = 1): Promise<void> {
    const delay = 1000 / messagesPerSecond;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

export default ChannelAdapter;