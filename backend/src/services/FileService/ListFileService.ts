import { Sequelize, Op, QueryTypes } from "sequelize";
import File from "../../database/models/File";

interface Request {
    Status: Number;
    initialDate: string;
}

interface Response {
};
const ListFileService = async ({
    Status = 0,
    initialDate = '',
}: Request): Promise<Response | undefined> => {
   return await File.sequelize?.query(
        ' select ' +
            ' msg.url, msg.name, msg.QtdeRegister, msg.Status, msg.createdAt, msg.ownerid' +
        ' from ' +
            ' whaticket.Files as msg ' +
        ' where ' +
            " msg.status = " + Status +
        ' and ' +
            " msg.createdAt >= '"+ initialDate +" dd/MM/yy HH:mm' ",

    {
    type:QueryTypes.SELECT
}
    );
}

export default ListFileService;