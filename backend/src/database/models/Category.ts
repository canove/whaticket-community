import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  HasMany,
  ForeignKey
} from "sequelize-typescript";
import Company from "./Company";
import FileRegister from "./FileRegister";
import Ticket from "./Ticket";

@Table
class Category extends Model<Category> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;

  @Column
  description: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @ForeignKey(() => Company)
  @Column
  companyId: number;
}

export default Category;
