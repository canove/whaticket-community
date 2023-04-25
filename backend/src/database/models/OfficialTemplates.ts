import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  HasMany
} from "sequelize-typescript";
import Company from "./Company";
import OfficialTemplatesStatus from "./OfficialTemplatesStatus";

@Table
class OfficialTemplates extends Model<OfficialTemplates> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  category: string;

  @Column
  body: string;

  @Column
  footer: string;

  @Column
  mapping: string;

  @Column
  header: string;

  @Column
  buttons: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column
  deletedAt: Date;

  @Column
  bodyExample: string;

  @HasMany(() => OfficialTemplatesStatus, "officialTemplateId")
  officialTemplatesStatus: OfficialTemplatesStatus[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default OfficialTemplates;
