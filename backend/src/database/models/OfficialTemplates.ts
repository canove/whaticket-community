import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey
} from "sequelize-typescript";
import Company from "./Company";

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

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default OfficialTemplates;
