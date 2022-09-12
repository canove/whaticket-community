import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,

} from "sequelize-typescript";

@Table
class Templates extends Model<Templates> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  status: number;

  @Column
  text: string;

  @Column
  footer: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

}

export default Templates;