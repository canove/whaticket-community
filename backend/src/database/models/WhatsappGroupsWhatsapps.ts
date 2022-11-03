import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey
} from "sequelize-typescript";
import Whatsapp from "./Whatsapp";
import WhatsappGroups from "./WhatsappGroups";

@Table
class WhatsappGroupsWhatsapps extends Model<WhatsappGroupsWhatsapps> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @ForeignKey(() => WhatsappGroups)
  @Column
  whatsappGroupId: number;

  @Column
  processedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default WhatsappGroupsWhatsapps;
