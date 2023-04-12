import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  HasMany
} from "sequelize-typescript";
import Pricing from "./Pricing";

@Table
class Packages extends Model<Packages> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;
  
  @Column
  maxUsers: number;

  @Column
  monthlyFee: number;
  
  @Column
  extraUserPrice: number;
  
  @Column
  maxTicketsByMonth: number;
  
  @Column
  extraTicketPrice: number;
  
  @Column
  maxWhatsapps: number;

  @Column
  whatsappMonthlyPrice: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Pricing, "packageId")
  pricings: Pricing[];
}

export default Packages;
