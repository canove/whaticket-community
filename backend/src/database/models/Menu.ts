import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

@Table
class Menu extends Model<Menu> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  icon: string;

  @Column
  parentId: number;

  @Column
  isParent: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Menu;
