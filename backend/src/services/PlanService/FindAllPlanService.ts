import Plan from "../../models/Plan";

const FindAllPlanService = async (): Promise<Plan[]> => {
  const plan = await Plan.findAll({
    order: [["name", "ASC"]]
  });
  return plan;
};

export default FindAllPlanService;
