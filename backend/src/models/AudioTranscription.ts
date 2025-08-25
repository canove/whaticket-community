import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Default
} from "sequelize-typescript";

import Message from "./Message";
import Tenant from "./Tenant";

export type TranscriptionProvider = "openai" | "azure" | "google" | "local";
export type TranscriptionStatus = "pending" | "processing" | "completed" | "failed";

@Table
class AudioTranscription extends Model<AudioTranscription> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Tenant)
  @AllowNull(false)
  @Column
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  @ForeignKey(() => Message)
  @AllowNull(false)
  @Column
  messageId: string;

  @BelongsTo(() => Message)
  message: Message;

  @AllowNull(false)
  @Column
  audioUrl: string;

  @Column(DataType.TEXT)
  transcription: string;

  @Column(DataType.FLOAT)
  confidence: number;

  @AllowNull(false)
  @Default("openai")
  @Column(DataType.ENUM("openai", "azure", "google", "local"))
  provider: TranscriptionProvider;

  @AllowNull(false)
  @Default("pending")
  @Column(DataType.ENUM("pending", "processing", "completed", "failed"))
  status: TranscriptionStatus;

  @Column(DataType.TEXT)
  errorMessage: string;

  @Column(DataType.INTEGER)
  processingTimeMs: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default AudioTranscription;