import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType
} from "sequelize-typescript";

@Table
class User extends Model<User> {
  @Column({
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    type: DataType.UUID
  })
  id: string;

  @Column
  name: string;

  @Column
  email: string;

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

  // @BeforeUpdate
  // @BeforeInsert
  // hashPassword = async () => {
  //   if (this.passwordHash) {
  //     this.passwordHash = await hash(this.passwordHash, 8);
  //   }
  // };

  // checkPassword = async (password: string) => {
  //   return await compare(password, this.passwordHash);
  // };
}

export default User;

// const bcrypt = require("bcryptjs");
// @Table
// class User extends Model<User> {
//   static init(sequelize) {
//     super.init(
//       {
//         name: { type: Sequelize.STRING },
//         password: { type: Sequelize.VIRTUAL },
//         profile: { type: Sequelize.STRING, defaultValue: "admin" },
//         passwordHash: { type: Sequelize.STRING },
//         email: { type: Sequelize.STRING }
//       },
//       {
//         sequelize
//       }
//     );

//     this.addHook("beforeSave", async user => {
//       if (user.password) {
//         user.passwordHash = await bcrypt.hash(user.password, 8);
//       }
//     });
//     return this;
//   }

//   checkPassword(password) {
//     return bcrypt.compare(password, this.passwordHash);
//   }
// }
