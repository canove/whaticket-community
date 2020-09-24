import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey
} from "sequelize-typescript";

@Table
class Setting extends Model<Setting> {
  @PrimaryKey
  @Column
  key: string;

  @Column
  value: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Setting;
