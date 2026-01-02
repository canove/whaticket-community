import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

@Table({ tableName: "TicketNotes" })
class TicketNote extends Model<TicketNote> {
  @Column
  note: string;

  @Column
  userId: number;

  @Column
  contactId: number;

  @Column
  ticketId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TicketNote;
