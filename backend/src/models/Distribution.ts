import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  DataType,
} from "sequelize-typescript";

@Table
class Distribution extends Model<Distribution> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column(DataType.STRING)
  queue_id: string;

  @Column(DataType.JSON)
  user_ids: object;

  @Column(DataType.STRING)
  current_user: string;

  @Column(DataType.BOOLEAN)
  is_active: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Distribution;
