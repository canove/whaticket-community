import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  Model,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import WhatsappsConfig from "./WhatsappsConfig";

@Table
class GreetingMessages extends Model<GreetingMessages> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  greetingMessage: string;

  @BelongsTo(() => WhatsappsConfig)
  whatsappConfig: WhatsappsConfig;

  @ForeignKey(() => WhatsappsConfig)
  @Column
  configId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default GreetingMessages;
