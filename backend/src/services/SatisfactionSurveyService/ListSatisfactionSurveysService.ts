import { Op, Sequelize } from "sequelize";
import SatisfactionSurveys from "../../database/models/SatisfactionSurveys";

interface Request {
    pageNumber?: string;
    limit?: string;
    deleted?: string;
    companyId: number;
}

interface Response {
    surveys: SatisfactionSurveys[];
    count: number;
    hasMore: boolean;
}

const ListSatisfactionSurveysService = async ({
    pageNumber = "1",
    limit = "10",
    deleted = "false",
    companyId,
}: Request): Promise<Response> => {
    let whereCondition = null;

    whereCondition = {
        ...whereCondition,
        companyId,
        deletedAt: deleted === "true" ? { [Op.ne]: null } : null
    }

    const offset = +limit * (+pageNumber - 1);

    const { count, rows: surveys } = await SatisfactionSurveys.findAndCountAll({
        where: whereCondition,
        limit: +limit > 0 ? +limit : null,
        offset: +limit > 0 ? offset : null,
    });

    const hasMore = count > offset + surveys.length;

    return { surveys, count, hasMore };
};

export default ListSatisfactionSurveysService;
