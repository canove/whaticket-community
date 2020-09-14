import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate
} from "sequelize-typescript";
import { hash, compare } from "bcryptjs";

@Table
class User extends Model<User> {
  @Column
  name: string;

  @Column
  email: string;

  @Column(DataType.VIRTUAL)
  password: string;

  @Column
  passwordHash: string;

  @Column({
    defaultValue: "admin"
  })
  profile: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BeforeUpdate
  @BeforeCreate
  static hashPassword = async (instance: User): Promise<void> => {
    if (instance.password) {
      instance.passwordHash = await hash(instance.password, 8);
    }
  };

  // static checkPassword = async ( // maybe not work like this.
  //   instance: User,
  //   password: string
  // ): Promise<boolean> => {
  //   return compare(password, instance.passwordHash);
  // };
}

export default User;
