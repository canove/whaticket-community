import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

@Table({ tableName: "TicketTrakings" })
class TicketTraking extends Model<TicketTraking> {
  @Column
  ticketId: number;

  @Column
  companyId: number;

  @Column
  userId: number;

  @Column
  whatsappId: number;

  @Column
  rated: boolean;

  @Column
  startedAt: Date;

  @Column
  finishedAt: Date;

  @Column
  ratingAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TicketTraking;
