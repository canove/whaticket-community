import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

@Table({ tableName: "QueueOptions" })
class QueueOption extends Model<QueueOption> {
  @Column
  title: string;

  @Column
  message: string;

  @Column
  parentId: number;

  @Column
  queueId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default QueueOption;
