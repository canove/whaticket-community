import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  PrimaryKey,
  AutoIncrement,
  Default,
  HasMany,
  BelongsToMany,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import { hash, compare } from "bcryptjs";
import Ticket from "./Ticket";
import Queue from "./Queue";
import UserQueue from "./UserQueue";
import Company from "./Company";
import Profiles from "./Profiles";
import Message from "./Message";
import TicketChanges from "./TicketChanges";

@Table
class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  nickname: string;

  @Column
  email: string;

  @Column(DataType.VIRTUAL)
  password: string;

  @Column
  passwordHash: string;

  @Default(0)
  @Column
  tokenVersion: number;

  @Default("admin")
  @Column
  profile: string;

  @Default("pt")
  @Column
  lang: string;

  @Column
  superAdmin: boolean;

  @Column
  useNickname: boolean;

  @Column
  deletedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @BelongsToMany(() => Queue, () => UserQueue)
  queues: Queue[];

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => Profiles)
  @Column
  profileId: number;

  @BelongsTo(() => Profiles)
  profiles: Profiles;

  @HasMany(() => TicketChanges, "newUserId")
  historics: TicketChanges[];

  @HasMany(() => Message, "userId")
  messages: Message[];

  @BeforeUpdate
  @BeforeCreate
  static hashPassword = async (instance: User): Promise<void> => {
    if (instance.password) {
      instance.passwordHash = await hash(instance.password, 8);
    }
  };

  public checkPassword = async (password: string): Promise<boolean> => {
    return compare(password, this.getDataValue("passwordHash"));
  };
}

export default User;
