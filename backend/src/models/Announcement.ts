import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

@Table({ tableName: "Announcements" })
class Announcement extends Model<Announcement> {
  @Column
  priority: number;

  @Column
  title: string;

  @Column
  text: string;

  @Column
  mediaUrl: string;

  @Column
  mediaType: string;

  @Column
  companyId: number;

  @Column
  status: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Announcement;
