import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany
} from "sequelize-typescript";
import User from "./User.js";
import Company from "./Company.js";
import CampaignSetting from "./CampaignSetting.js";
import CampaignShipping from "./CampaignShipping.js";

@Table({ tableName: "Campaigns" })
class Campaign extends Model<Campaign> {
  @Column
  name: string;

  @Column
  start: Date;

  @Column
  end: Date;

  @Column(DataType.TEXT)
  message: string;

  @Column
  mediaUrl: string;

  @Column
  mediaType: string;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column
  recurrenceType: string; // daily, weekly, monthly

  @Column
  repeatEvery: number;

  @Column
  endDate: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => CampaignSetting)
  settings: CampaignSetting[];

  @HasMany(() => CampaignShipping)
  shipping: CampaignShipping[];
}

export default Campaign;
