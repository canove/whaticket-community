import Tasks from "../../database/models/Tasks";
import AppError from "../../errors/AppError";

const ShowTaskService = async (
  taskId: number | string,
  companyId: number | string
): Promise<Tasks> => {
  const task = await Tasks.findOne({ 
    where: { id: taskId, companyId },
  });

  if (!task) {
    throw new AppError("ERR_TASK_NOT_FOUND");
  }

  return task;
};

export default ShowTaskService;
