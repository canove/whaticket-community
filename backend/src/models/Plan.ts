import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

@Table({ tableName: "Plans" })
class Plan extends Model<Plan> {
  @Column
  name: string;

  @Column
  users: number;

  @Column
  connections: number;

  @Column
  queues: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Plan;
