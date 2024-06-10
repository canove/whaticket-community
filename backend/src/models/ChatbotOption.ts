import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import Category from "./Category";
import Queue from "./Queue";

@Table
class ChatbotOption extends Model<ChatbotOption> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  message: string;

  @Default(false)
  @Column
  hasSubOptions: boolean;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @BelongsTo(() => Queue)
  queue: Queue;

  @ForeignKey(() => Category)
  @Column
  categoryId: number;

  @BelongsTo(() => Category)
  category: Category;

  @ForeignKey(() => ChatbotOption)
  @Column
  fatherChatbotOptionId: number;

  @BelongsTo(() => ChatbotOption)
  fatherChatbotOption: ChatbotOption;

  @HasMany(() => ChatbotOption)
  chatbotOptions: ChatbotOption[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ChatbotOption;
