import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Plan from "../../models/Plan";

interface PlanData {
  name: string;
  users: number;
  connections: number;
  queues: number;
  value: number;
}

const CreatePlanService = async (planData: PlanData): Promise<Plan> => {
  const { name } = planData;

  const planSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_PLAN_INVALID_NAME")
      .required("ERR_PLAN_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_PLAN_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const planWithSameName = await Plan.findOne({
              where: { name: value }
            });

            return !planWithSameName;
          }
          return false;
        }
      )
  });

  try {
    await planSchema.validate({ name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const plan = await Plan.create(planData);

  return plan;
};

export default CreatePlanService;
