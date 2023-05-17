import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  BelongsToMany,
  ForeignKey,
  HasMany,
  BelongsTo
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

  @ForeignKey(() => Menu)
  @Column
  parentId: number;

  @HasMany(() => Menu, "parentId")
  childrenMenus: Menu[];

  @BelongsTo(() => Menu)
  parentMenu: Menu;

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
