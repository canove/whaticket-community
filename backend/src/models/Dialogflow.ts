import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    DataType,
    PrimaryKey,
    HasMany,
    AutoIncrement
} from "sequelize-typescript";
import Queue from "./Queue";

@Table
class Dialogflow extends Model<Dialogflow> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column(DataType.TEXT)
    name: string;
    
    @Column(DataType.TEXT)
    projectName: string;
    
    @Column(DataType.TEXT)
    jsonContent: string;

    @Column(DataType.TEXT)
    language: string;

    @CreatedAt
    @Column(DataType.DATE(6))
    createdAt: Date;

    @UpdatedAt
    @Column(DataType.DATE(6))
    updatedAt: Date;

    @HasMany(() => Queue)
    queues: Queue[]
}

export default Dialogflow;
