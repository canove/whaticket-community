import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey
} from "sequelize-typescript";

@Table
class Ticket extends Model<Ticket> {
  @PrimaryKey
  @Column(DataType.NUMBER)
  id: number;

  @Column({ defaultValue: "pending" })
  status: string;

  // @Column({ allowNull: false, unique: true })
  // userId: string;

  @Column(DataType.VIRTUAL)
  unreadMessages: string;

  @Column(DataType.STRING)
  lastMessage: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Ticket;
