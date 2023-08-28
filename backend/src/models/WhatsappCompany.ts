import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    ForeignKey,
    AutoIncrement,
    PrimaryKey
  } from "sequelize-typescript";
  import Company from "./Company";
import Whatsapp from "./Whatsapp";
  
  @Table
  class WhatsappCompany extends Model<WhatsappCompany> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @ForeignKey(() => Whatsapp)
    @Column
    whatsappId: number;
  
    @ForeignKey(() => Company)
    @Column
    companyId: number;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default WhatsappCompany;
  