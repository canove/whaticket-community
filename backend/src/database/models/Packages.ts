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
  extraUserPrice: number;
  
  @Column
  maxTicketsByMonth: number;
  
  @Column
  extraTicketPrice: number;
  
  @Column
  whatsappMonthlyPrice: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Packages;
