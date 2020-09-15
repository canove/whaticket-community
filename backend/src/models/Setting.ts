import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey
} from "sequelize-typescript";

@Table
class Setting extends Model<Setting> {
  @PrimaryKey
  @Column(DataType.STRING)
  key: string;

  @Column(DataType.STRING)
  value: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Setting;
