import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey
} from "sequelize-typescript";
import Company from "./Company";
import Templates from "./TemplatesData";

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

  @Column
  deletedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ExposedImport;
