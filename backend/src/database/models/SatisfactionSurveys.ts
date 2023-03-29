import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
  AutoIncrement,
} from "sequelize-typescript";
import Company from "./Company";
import SatisfactionSurveyResponses from "./SatisfactionSurveyResponses";

@Table
class SatisfactionSurveys extends Model<SatisfactionSurveys> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  message: string;

  @Column
  answers: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column
  deletedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => SatisfactionSurveyResponses, "satisfactionSurveyId")
  satisfactionSurveyResponses: SatisfactionSurveyResponses[];
}

export default SatisfactionSurveys;
