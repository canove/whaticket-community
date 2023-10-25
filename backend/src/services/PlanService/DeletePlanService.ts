import Plan from "../../models/Plan";
import AppError from "../../errors/AppError";

const DeletePlanService = async (id: string): Promise<void> => {
  const plan = await Plan.findOne({
    where: { id }
  });

  if (!plan) {
    throw new AppError("ERR_NO_PLAN_FOUND", 404);
  }

  await plan.destroy();
};

export default DeletePlanService;
