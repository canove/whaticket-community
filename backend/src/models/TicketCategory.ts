import {
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import Category from "./Category";
import Ticket from "./Ticket";

@Table
class TicketCategory extends Model<TicketCategory> {
  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @ForeignKey(() => Category)
  @Column
  CategoryId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TicketCategory;
