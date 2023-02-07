import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull
} from "sequelize-typescript";

@Table
class Product extends Model<Product> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;

  @Column
  monthlyFee: number;

  @Column
  triggerFee: number;

  @Column
  monthlyInterestRate: number;

  @Column
  penaltyMount: number;

  @Column
  receivedMessageFee: number;

  @Column
  sentMessageFee: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Product;
