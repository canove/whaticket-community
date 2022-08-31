import { Sequelize } from "sequelize";
import Company from "../../database/models/Company";

const ListCompanyService = async () => {
  const companies = await Company.findAll({
    attributes: ["id", "name"],
    order: [["createdAt", "DESC"]],
  });

  return companies;
};

export default ListCompanyService;
