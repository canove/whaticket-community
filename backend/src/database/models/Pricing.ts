import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
import Product from "./Products";
import Packages from "./Packages";

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

  @BelongsTo(() => Product)
  product: Product;

  @ForeignKey(() => Packages)
  @Column
  packageId: number;

  @BelongsTo(() => Packages)
  package: Packages;

  @Column
  usedGraceTriggers: number;

  @Column
  deletedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: Company;
}

export default Pricing;
