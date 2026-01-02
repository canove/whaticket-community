import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

@Table({ tableName: "TicketTags" })
class TicketTag extends Model<TicketTag> {
  @Column
  ticketId: number;

  @Column
  tagId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TicketTag;
