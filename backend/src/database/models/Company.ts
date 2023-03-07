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
  HasMany,
  HasOne
} from "sequelize-typescript";
import BillingControls from "./BillingControls";
import FileRegister from "./FileRegister";
import Menu from "./Menu";
import MenuCompanies from "./MenuCompanies";
import Pricing from "./Pricing";
import Ticket from "./Ticket";
import User from "./User";
import Whatsapp from "./Whatsapp";
import WhatsappsConfig from "./WhatsappsConfig";

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

  @HasMany(() => FileRegister, "companyId")
  fileRegisters: FileRegister[];

  @HasMany(() => Whatsapp, "companyId")
  whatsapps: Whatsapp[];

  @HasMany(() => BillingControls, "companyId")
  billingControls: BillingControls[];

  @HasOne(() => WhatsappsConfig, "companyId")
  config: WhatsappsConfig;

  @HasOne(() => Pricing, "companyId")
  pricing: Pricing;

  @HasMany(() => FileRegister, "companyId")
  registers: FileRegister[];

  @HasMany(() => Ticket, "companyId")
  tickets: Ticket[];
}

export default Company;
