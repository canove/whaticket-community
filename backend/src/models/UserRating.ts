import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

@Table({ tableName: "UserRatings" })
class UserRating extends Model<UserRating> {
  @Column
  ticketId: number;

  @Column
  companyId: number;

  @Column
  userId: number;

  @Column
  rate: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default UserRating;
