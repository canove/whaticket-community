import AppError from "../../errors/AppError";
import Plan from "../../models/Plan";

interface PlanData {
  name: string;
  id?: number | string;
  users?: number;
  connections?: number;
  queues?: number;
  value?: number;
}

const UpdatePlanService = async (planData: PlanData): Promise<Plan> => {
  const { id, name, users, connections, queues, value } = planData;

  const plan = await Plan.findByPk(id);

  if (!plan) {
    throw new AppError("ERR_NO_PLAN_FOUND", 404);
  }

  await plan.update({
    name,
    users,
    connections,
    queues,
    value
  });

  return plan;
};

export default UpdatePlanService;
