import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  AllowNull,
  HasMany,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
import Whatsapp from "./Whatsapp";
import Queue from "./Queue";

@Table
class ConnectionFiles extends Model<ConnectionFiles> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  icon: string;

  @Column
  greetingMessage: string;

  @Column
  farewellMessage: string;

  @AllowNull(true)
  @Column
  triggerInterval: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @BelongsTo(() => Queue)
  queue: Queue;

  @Column
  uniqueCode: string;

  @HasMany(() => Whatsapp, "connectionFileId")
  whatsapps: Whatsapp[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ConnectionFiles;
