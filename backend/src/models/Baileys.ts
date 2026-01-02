import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

@Table({ tableName: "Baileys" })
class Baileys extends Model<Baileys> {
  @Column
  whatsappId: number;

  @Column
  contacts: string;

  @Column
  chats: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Baileys;
