import { Sequelize, Op, QueryTypes } from "sequelize";
import File from "../../database/models/File";

interface Request {
    Status: Number;
    initialDate: string;
}

interface Response {
};
const ListFileService = async ({
    Status ,
    initialDate,
}: Request): Promise<Response | undefined> => {
    if (!Status && !initialDate){
    return await File.sequelize?.query(
            ' select ' +
                ' msg.id, msg.url, msg.name, msg.QtdeRegister, msg.Status, msg.createdAt, msg.ownerid' +
            ' from ' +
                ' whaticket.Files as msg ',

            {type:QueryTypes.SELECT}
    )};

    if (!initialDate && Status){
        return await File.sequelize?.query(
            ' select ' +
                ' msg.id, msg.url, msg.name, msg.QtdeRegister, msg.Status, msg.createdAt, msg.ownerid' +
            ' from ' +
                ' whaticket.Files as msg ' +
            ' where ' +
                " msg.status = " + Status,

            {type:QueryTypes.SELECT}
    )};

    if (!Status && initialDate){
        return await File.sequelize?.query(
            ' select ' +
                ' msg.id, msg.url, msg.name, msg.QtdeRegister, msg.Status, msg.createdAt, msg.ownerid' +
            ' from ' +
                ' whaticket.Files as msg ' +
            ' where ' +
                " msg.createdAt >= '"+ initialDate +"' ",

            {type:QueryTypes.SELECT}
    )};
        return await File.sequelize?.query(
            ' select ' +
                ' msg.id, msg.url, msg.name, msg.QtdeRegister, msg.Status, msg.createdAt, msg.ownerid' +
            ' from ' +
                ' whaticket.Files as msg ' +
            ' where ' +
                " msg.status = " + Status +
            ' and ' +
                " msg.createdAt >= '"+ initialDate +"' ",

            {type:QueryTypes.SELECT}
        )
}
export default ListFileService;