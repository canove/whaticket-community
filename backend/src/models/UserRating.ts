import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    PrimaryKey,
    ForeignKey,
    BelongsTo,
    AutoIncrement
  } from "sequelize-typescript";

  import Company from "./Company";
  import User from "./User";
  import Ticket from "./Ticket";
  
  @Table({
    tableName: "UserRatings"
  })
  class UserRating extends Model<UserRating> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => Ticket)
    @Column
    ticketId: number;
  
    @BelongsTo(() => Ticket)
    ticket: Ticket;
  
    @ForeignKey(() => Company)
    @Column
    companyId: number;
  
    @BelongsTo(() => Company)
    company: Company;

    @ForeignKey(() => User)
    @Column
    userId: number;
  
    @BelongsTo(() => User)
    user: User;
  
    @Column
    rate: number;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default UserRating;
  