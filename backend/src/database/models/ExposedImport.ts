import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
import OfficialTemplates from "./OfficialTemplates";
import OfficialWhatsapp from "./OfficialWhatsapp";
import Templates from "./TemplatesData";
import Whatsapp from "./Whatsapp";
import ConnectionFiles from "./ConnectionFile";

@Table
class ExposedImport extends Model<ExposedImport> {
  @PrimaryKey
  @Column
  id: string;

  @Column
  name: string;

  @Column
  mapping: string;

  @Column
  whatsappIds: string;

  @ForeignKey(() => Templates)
  @Column
  templateId: number;

  @Column
  qtdeRegister: number;

  @Column
  official: boolean;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @ForeignKey(() => ConnectionFiles)
  @Column
  connectionFileId: number;

  @BelongsTo(() => ConnectionFiles)
  connectionFile: ConnectionFiles;

  @ForeignKey(() => OfficialWhatsapp)
  @Column
  officialConnectionId: number;

  @ForeignKey(() => OfficialTemplates)
  @Column
  officialTemplatesId: number;

  @Column
  deletedAt: Date;

  @Column
  requiredItems: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ExposedImport;
