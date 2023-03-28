import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement,
} from "sequelize-typescript";

import Company from "./Company";
import Contact from "./Contact";
import SatisfactionSurveys from "./SatisfactionSurveys";
import Ticket from "./Ticket";
import User from "./User";

@Table
class SatisfactionSurveyResponses extends Model<SatisfactionSurveyResponses> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  response: string;

  @ForeignKey(() => SatisfactionSurveys)
  @Column
  satisfactionSurveyId: number;

  @BelongsTo(() => SatisfactionSurveys)
  satisfactionSurvey: SatisfactionSurveys;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default SatisfactionSurveyResponses;
