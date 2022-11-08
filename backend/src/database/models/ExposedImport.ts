import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey
} from "sequelize-typescript";
import Company from "./Company";

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
  qtdeRegister: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column
  deletedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ExposedImport;