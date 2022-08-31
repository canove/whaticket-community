import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  BelongsToMany
} from "sequelize-typescript";
import Company from "./Company";
import MenuCompanies from "./MenuCompanies";

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

  @BelongsToMany(() => Company, () => MenuCompanies)
  companies: Array<Company & { MenuCompanies: MenuCompanies }>;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Menu;
