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
import OfficialWhatsapp from "./OfficialWhatsapp";
import Templates from "./TemplatesData";
import User from "./User";
import Whatsapp from "./Whatsapp";

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
  official: boolean;

  @Column
  whatsappIds: string;

  @ForeignKey(() => OfficialWhatsapp)
  @Column
  officialConnectionId: number;

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

  @Column
  approvedAt: Date;

  @Column
  refusedAt: Date;

  @ForeignKey(() => Templates)
  @Column
  templateId: number;

  @ForeignKey(() => User)
  @Column
  approvedOrRefusedId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

}

export default IntegratedImport;