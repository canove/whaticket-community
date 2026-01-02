import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

@Table({ tableName: "ChatFlows" })
class ChatFlow extends Model<ChatFlow> {
  @Column
  name: string;

  @Column
  flow: string;

  @Column
  companyId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ChatFlow;
