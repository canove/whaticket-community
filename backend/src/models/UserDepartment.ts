import {
  Table,
  Column,
  Model,
  ForeignKey,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

@Table
class UserDepartment extends Model<UserDepartment> {
  @ForeignKey(() => require("./User").default)
  @Column
  userId: number;

  @ForeignKey(() => require("./Department").default)
  @Column
  departmentId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default UserDepartment;