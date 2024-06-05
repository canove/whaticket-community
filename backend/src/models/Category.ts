import {
  AllowNull,
  AutoIncrement,
  BelongsToMany,
  Column,
  CreatedAt,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt
} from "sequelize-typescript";
import Queue from "./Queue";
import QueueCategory from "./QueueCategory";
import Ticket from "./Ticket";
import TicketCategory from "./TicketCategory";

@Table
class Category extends Model<Category> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Unique
  @Column
  name: string;

  @AllowNull(false)
  @Unique
  @Column
  color: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsToMany(() => Ticket, () => TicketCategory)
  users: Array<Ticket & { TicketCategory: TicketCategory }>;

  @BelongsToMany(() => Queue, () => QueueCategory)
  queues: Array<Queue & { QueueCategory: QueueCategory }>;
}

export default Category;
