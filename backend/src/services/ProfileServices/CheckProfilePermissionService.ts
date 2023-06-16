import { Op } from "sequelize";
import Profiles from "../../database/models/Profiles";
import AppError from "../../errors/AppError";
import ShowUserService from "../UserServices/ShowUserService";

interface Request {
    userId?: string | number;
    profileId?: number;
    companyId?: number | string;
    permission?: string;
}

const CheckProfilePermissionService = async ({
    userId,
    profileId,
    companyId,
    permission
}: Request): Promise<Boolean> => {
    let userProfileId = null;

    if (userId) {
        const user = await ShowUserService(userId, companyId);

        userProfileId = user.profileId
    }

    if (!userProfileId && !profileId) return true;

    const profile = await Profiles.findOne({
        attributes: ["permissions"],
        where: {
            id: userProfileId ? userProfileId : profileId,
            companyId: { [Op.or]: [companyId, null] }
        }
    });

    const permissions = JSON.parse(profile.permissions);

    if (permissions === null) return true;
    if (permissions.includes(permission)) return true;

    return false;
};

export default CheckProfilePermissionService;
