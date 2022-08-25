import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  Model,
  HasMany
} from "sequelize-typescript";
import GreetingMessages from "./GreetingMessages";

@Table
class WhatsappsConfig extends Model<WhatsappsConfig> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  triggerInterval: number;

  @Column
  whatsappIds: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => GreetingMessages)
  greetingMessages: GreetingMessages[];

  @Column
  active: boolean;
}

export default WhatsappsConfig;
