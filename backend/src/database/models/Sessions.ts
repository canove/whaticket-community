import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  HasMany
} from "sequelize-typescript";
import Company from "./Company";
import Ticket from "./Ticket";
import SessionMessages from "./SessionMessages";

@Table
class Sessions extends Model<Sessions> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  type: string;

  @Column
  session: string;

  @Column
  phoneNumber: string;

  @Column
  official: boolean;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column
  expirationDate: Date;

  @Column
  processedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => SessionMessages, "sessionId")
  sessionMessages: SessionMessages[];

  @HasMany(() => Ticket, "sessionId")
  tickets: Ticket[];
}

export default Sessions;
