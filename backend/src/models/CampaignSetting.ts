import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

@Table({ tableName: "CampaignSettings" })
class CampaignSetting extends Model<CampaignSetting> {
  @Column
  key: string;

  @Column
  value: string;

  @Column
  companyId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default CampaignSetting;
