import Plan from "../../models/Plan";
import AppError from "../../errors/AppError";

const ShowPlanService = async (id: string | number): Promise<Plan> => {
  const plan = await Plan.findByPk(id);

  if (!plan) {
    throw new AppError("ERR_NO_PLAN_FOUND", 404);
  }

  return plan;
};

export default ShowPlanService;
