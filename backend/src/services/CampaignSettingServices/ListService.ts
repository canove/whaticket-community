import { Op, fn, col, where } from "sequelize";
import Campaign from "../../models/Campaign";
import { isEmpty } from "lodash";
import ContactList from "../../models/ContactList";
import Whatsapp from "../../models/Whatsapp";
import CampaignSetting from "../../models/CampaignSetting";

interface Request {
  companyId: number | string;
  searchParam?: string;
  pageNumber?: string;
}

interface Response {
  records: Campaign[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  companyId
}: Request): Promise<CampaignSetting[]> => {
  let whereCondition: any = {
    companyId
  };

  const records = await CampaignSetting.findAll({
    where: whereCondition
  });

  return records;
};

export default ListService;
