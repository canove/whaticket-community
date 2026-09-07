import {
  AutoIncrement,
  Column,
  CreatedAt,
  Default,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";

@Table
class SendMessageRequest extends Model<SendMessageRequest> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  fromNumber: string;

  @Column
  toNumber: string;

  @Column
  message: string;

  @Column
  channel: string;

  @Column
  localId: number;

  @Column
  recipientName: string;

  @Column
  notificationType: string;

  @Column
  surveyName: string;

  @Column
  classification: string;

  @Column
  clientName: string;

  @Column
  clientPhone: string;

  @Default("pending")
  @Column
  status: string;

  @Default(0)
  @Column
  timesAttempted: number;

  @CreatedAt
  lastAttemptAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default SendMessageRequest;
