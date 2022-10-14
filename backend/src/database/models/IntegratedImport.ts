import { text } from "aws-sdk/clients/customerprofiles";
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
class IntegratedImport extends Model<IntegratedImport> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;

  @Column
  method: number;

  @Column
  qtdeRegister: number;

  @Column
  status: number;

  @Column
  url: number;

  @Column
  key: number;

  @Column
  token: number;

  @Column
  mapping: string;

  @Column
  header: string;

  @Column
  body: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

}

export default IntegratedImport;