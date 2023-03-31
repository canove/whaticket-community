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
  Default
} from "sequelize-typescript";
import Company from "./Company";

@Table
class WhatsappLearning extends Model<WhatsappLearning> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @AllowNull(false)
  @Column
  name: string;

  @Default(false)
  @Column
  baned: boolean;

  @AllowNull(false)
  @Column
  processedDate: string;

  @AllowNull(false)
  @Column
  registers: number;

  @AllowNull(false)
  @Column
  interval: number;

  @AllowNull(false)
  @Column
  sugestion: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default WhatsappLearning;
