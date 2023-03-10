import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Default,
  AllowNull,
  HasMany,
  Unique,
  BelongsToMany,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
import ConnectionFiles from "./ConnectionFile";
import Flows from "./Flows";
import OfficialWhatsapp from "./OfficialWhatsapp";
import Queue from "./Queue";
import Ticket from "./Ticket";
import WhatsappQueue from "./WhatsappQueue";

@Table
class Whatsapp extends Model<Whatsapp> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull
  @Unique
  @Column(DataType.TEXT)
  name: string;

  @Column(DataType.TEXT)
  session: string;

  @Column(DataType.TEXT)
  qrcode: string;

  @Column
  status: string;

  @Column
  battery: string;

  @Column
  plugged: boolean;

  @Column
  retries: number;

  @Column(DataType.TEXT)
  quality: string;

  @Column(DataType.TEXT)
  tierLimit: string;

  @Column(DataType.TEXT)
  greetingMessage: string;

  @Column(DataType.TEXT)
  farewellMessage: string;

  @Column
  official: boolean;

  @Column
  facebookToken: string;

  @Column
  facebookBusinessId: string;

  @Column
  facebookPhoneNumberId: string;

  @ForeignKey(() => ConnectionFiles)
  @Column
  connectionFileId: string;

  @BelongsTo(() => ConnectionFiles)
  connectionFile: ConnectionFiles;

  @Column
  phoneNumber: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Default(false)
  @AllowNull
  @Column
  isDefault: boolean;

  @Default(false)
  @Column
  deleted: boolean;

  @Default(false)
  @Column
  sleeping: boolean;

  @Column
  automaticControl: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column
  lastSendDate: Date;

  @Column
  lastPingDate: Date;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @BelongsToMany(() => Queue, () => WhatsappQueue)
  queues: Array<Queue & { WhatsappQueue: WhatsappQueue }>;

  @HasMany(() => WhatsappQueue)
  whatsappQueues: WhatsappQueue[];

  @ForeignKey(() => Flows)
  @Column
  flowId: number;

  @BelongsTo(() => Flows)
  flow: Flows;

  @ForeignKey(() => OfficialWhatsapp)
  @Column
  officialWhatsappId: number;

  @Default(false)
  @AllowNull
  @Column
  business: boolean;

  @Column
  whatsName: string;

  @Column
  whatsImage: string;

  @Column
  usedLimit: number;

  @Column
  extraInfo: string;

  @Column
  facebookAccessToken: string;

  @Column
  whatsappAccountId: string;

  @Column
  messageCallbackUrl: string;

  @Column
  statusCallbackUrl: string;

  @Column
  callbackAuthorization: string;

  @Default(false)
  @Column
  maturing: boolean;
}

export default Whatsapp;
