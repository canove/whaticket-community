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
import Company from "./Company";
import Product from "./Products";

@Table
class Pricing extends Model<Pricing> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  gracePeriod: number;

  @Column
  graceTrigger: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @ForeignKey(() => Product)
  @Column
  productId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Pricing;
