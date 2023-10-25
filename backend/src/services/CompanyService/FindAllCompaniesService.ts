import Company from "../../models/Company";
import Plan from "../../models/Plan";
import Setting from "../../models/Setting";

const FindAllCompanyService = async (): Promise<Company[]> => {
  const companies = await Company.findAll({
    order: [["name", "ASC"]],
    include: [
      { model: Plan, as: "plan", attributes: ["id", "name", "value"] },
      { model: Setting, as: "settings" }
    ]
  });
  return companies;
};

export default FindAllCompanyService;
