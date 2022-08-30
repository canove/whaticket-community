import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  ForeignKey
} from "sequelize-typescript";
import Company from "./Company";
import Menu from "./Menu";

@Table
class MenuCompanies extends Model<MenuCompanies> {
  @ForeignKey(() => Menu)
  @Column
  menuId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default MenuCompanies;
