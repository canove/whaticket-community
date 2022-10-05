import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey
} from "sequelize-typescript";
import GreetingMessages from "./GreetingMessages";
import Templates from "./TemplatesData";

@Table
class GreetingMessageControls extends Model<GreetingMessageControls> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Templates)
  @Column
  templateId: number;

  @ForeignKey(() => GreetingMessages)
  @Column
  greetingMessageId: number;

  @Column
  phoneNumber: string;

  @Column
  sendAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default GreetingMessageControls;
