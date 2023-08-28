import {
    Table,
    Column,
    Model,
    PrimaryKey,
    AutoIncrement,
    CreatedAt,
    UpdatedAt,
    BelongsToMany,
  } from "sequelize-typescript";
import UserCompany from "./UserCompany";
import User from "./User";
import WhatsappCompany from "./WhatsappCompany";
import Whatsapp from "./Whatsapp";
  
  @Table
  class Company extends Model<Company> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @Column
    name: string;

    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;

    @BelongsToMany(() => User, () => UserCompany)
    users: Array<User & { UserCompany: UserCompany }>;

    @BelongsToMany(() => Whatsapp, () => WhatsappCompany)
    whatsapps: Array<Whatsapp & { WhatsappCompany: WhatsappCompany }>;
  
  }
  
  export default Company;
  