import {
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import Category from "./Category";
import Queue from "./Queue";

@Table
class QueueCategory extends Model<QueueCategory> {
  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @ForeignKey(() => Category)
  @Column
  categoryId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default QueueCategory;
