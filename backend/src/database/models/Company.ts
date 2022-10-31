import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  Default,
  BelongsToMany,
  HasMany
} from "sequelize-typescript";
import Menu from "./Menu";
import MenuCompanies from "./MenuCompanies";
import User from "./User";

@Table
class Company extends Model<Company> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  alias: string;

  @Column
  name: string;

  @AllowNull(false)
  @Unique
  @Column
  cnpj: string;

  @AllowNull(false)
  @Default("")
  @Column
  phone: string;

  @AllowNull(true)
  @Column
  logo: string;

  @Column
  email: string;

  @Default(false)
  @Column
  address: string;

  @AllowNull(false)
  @Default("ativo")
  @Column
  status: string;

  @BelongsToMany(() => Menu, () => MenuCompanies)
  menus: Menu[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => User)
  users: User[];
}

export default Company;
