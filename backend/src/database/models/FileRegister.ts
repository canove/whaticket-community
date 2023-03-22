import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  BelongsTo,
  ForeignKey,
  Default
} from "sequelize-typescript";
import Company from "./Company";
import ExposedImport from "./ExposedImport";
import File from "./File";
import IntegratedImport from "./IntegratedImport";
import Message from "./Message";
import Whatsapp from "./Whatsapp";

@Table
class FileRegister extends Model<FileRegister> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Unique
  @Column
  name: string;

  @AllowNull(false)
  @Column
  phoneNumber: string;

  @AllowNull(true)
  @Column
  documentNumber: string;

  @AllowNull(true)
  @Column
  template: string;

  @AllowNull(true)
  @Column
  templateParams: string;

  @AllowNull(true)
  @Column
  message: string;

  @AllowNull(true)
  @ForeignKey(() => Message)
  @Column
  msgWhatsId: string;

  @BelongsTo(() => Message)
  messageData: Message;

  @AllowNull(true)
  @Column
  errorAt: Date;

  @AllowNull(true)
  @Column
  errorMessage: string;

  @AllowNull(true)
  @Column
  haveWhatsapp: boolean;

  @AllowNull(true)
  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @AllowNull(true)
  @Column
  deliveredAt: Date;

  @AllowNull(true)
  @Column
  processedAt: Date;

  @AllowNull(true)
  @Column
  interactionAt: Date;

  @AllowNull(true)
  @Column
  billingProcessedAt: Date;

  @AllowNull(true)
  @Column
  sentAt: Date;

  @AllowNull(true)
  @Column
  readAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => File)
  @Column
  fileId: number;

  @BelongsTo(() => File)
  file: File;

  @ForeignKey(() => IntegratedImport)
  @Column
  integratedImportId: number;

  @BelongsTo(() => IntegratedImport)
  integratedImport: IntegratedImport;

  @ForeignKey(() => ExposedImport)
  @Column
  exposedImportId: string;

  @BelongsTo(() => ExposedImport)
  exposedImport: ExposedImport;

  @AllowNull(true)
  @Column
  var1: string;

  @AllowNull(true)
  @Column
  var2: string;

  @AllowNull(true)
  @Column
  var3: string;

  @AllowNull(true)
  @Column
  var4: string;

  @AllowNull(true)
  @Column
  var5: string;

  @AllowNull(true)
  @Column
  input1: string;

  @AllowNull(true)
  @Column
  input2: string;

  @AllowNull(true)
  @Column
  input3: string;

  @AllowNull(true)
  @Column
  blacklist: boolean;
}

export default FileRegister;
