import {
  AllowNull,
  AutoIncrement,
  BelongsToMany,
  Column,
  CreatedAt,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt
} from "sequelize-typescript";
import User from "./User";
import UserQueue from "./UserQueue";

import Category from "./Category";
import ChatbotOption from "./ChatbotOption";
import QueueCategory from "./QueueCategory";
import Whatsapp from "./Whatsapp";
import WhatsappQueue from "./WhatsappQueue";

@Table
class Queue extends Model<Queue> {
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

  @Column
  greetingMessage: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @AllowNull(true)
  @Default(false)
  @Column
  automaticAssignment: boolean;

  @AllowNull(true)
  @Default(false)
  @Column
  automaticAssignmentForOfflineUsers: boolean;

  @BelongsToMany(() => Whatsapp, () => WhatsappQueue)
  whatsapps: Array<Whatsapp & { WhatsappQueue: WhatsappQueue }>;

  @BelongsToMany(() => User, () => UserQueue)
  users: Array<User & { UserQueue: UserQueue }>;

  @BelongsToMany(() => Category, () => QueueCategory)
  categories: Category[];

  @HasMany(() => ChatbotOption)
  chatbotOptions: ChatbotOption[];
}

export default Queue;
