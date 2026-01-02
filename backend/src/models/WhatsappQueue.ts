import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

@Table({ tableName: "WhatsappQueues" })
class WhatsappQueue extends Model<WhatsappQueue> {
  @Column
  whatsappId: number;

  @Column
  queueId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default WhatsappQueue;
