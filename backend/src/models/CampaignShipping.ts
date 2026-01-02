import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

@Table({ tableName: "CampaignShippings" })
class CampaignShipping extends Model<CampaignShipping> {
  @Column
  number: string;

  @Column
  contactId: number;

  @Column
  campaignId: number;

  @Column
  message: string;

  @Column
  confirmationMessage: string;

  @Column
  confirmation: boolean;

  @Column
  deliveredAt: Date;

  @Column
  confirmationAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default CampaignShipping;
