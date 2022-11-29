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
import OfficialTemplates from "./OfficialTemplates";
import Whatsapp from "./Whatsapp";

@Table
class OfficialTemplateStatus extends Model<OfficialTemplateStatus> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  status: string;

  @Column
  facebookTemplateId: string;

  @ForeignKey(() => OfficialTemplates)
  @Column
  officialTemplatesId: number;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @AllowNull(true)
  @Column
  processedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default OfficialTemplateStatus;
