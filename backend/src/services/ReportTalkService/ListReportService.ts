import { Sequelize, Op, QueryTypes } from "sequelize";
import Message from "../../models/Message";

interface Request {
  user: Number;
  initialDate: string;
  finalDate: string;

}

interface Response {

};
const ListReportService = async ({
  user = 0,
  initialDate = '',
  finalDate = ''
}: Request): Promise<Response | undefined> => {
   return await Message.sequelize?.query(
        ' select ' +
	' msg.id, msg.body, msg.mediaUrl, msg.ticketId, msg.createdAt, msg.`read`' +
' from ' +
	' whaticket.Messages as msg ' +
' inner join ' +
	' whaticket.Tickets as tck on msg.ticketId = tck.id ' +
' where ' +
	' tck.userId = ' + user +
' and ' +
	" msg.createdAt >= '"+ initialDate +" dd/MM/yy HH:mm' "+
' and ' +
	" msg.createdAt <= '" + finalDate + " dd/MM/yy HH:mm' ",
    {
    type:QueryTypes.SELECT
}
    );


}

export default ListReportService;