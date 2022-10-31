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
class ConnectionFiles extends Model<ConnectionFiles> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  icon: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ConnectionFiles;
