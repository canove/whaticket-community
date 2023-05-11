import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  HasMany,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
import Ticket from "./Ticket";
import Sessions from "./Sessions";
import Message from "./Message";

@Table
class SessionMessages extends Model<SessionMessages> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  type: string;

  @ForeignKey(() => Message)
  @Column
  messageId: string;

  @BelongsTo(() => Message)
  message: Message;

  @ForeignKey(() => Sessions)
  @Column
  sessionId: number;

  @BelongsTo(() => Sessions)
  session: Sessions;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column
  processedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Ticket, "sessionId")
  tickets: Ticket[];
}

export default SessionMessages;
