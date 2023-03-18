import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Queue from "../../database/models/Queue";
import ShowQueueService from "./ShowQueueService";

interface QueueData {
  name: string;
  color: string;
  companyId: string | number;
  greetingMessage?: string;
  limit?: string;
  overflowQueueId?: string;
}

const CreateQueueService = async (queueData: QueueData): Promise<Queue> => {
  const { color, name, greetingMessage, companyId, limit, overflowQueueId } = queueData;

  const queueSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_QUEUE_INVALID_NAME")
      .required("ERR_QUEUE_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_QUEUE_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const queueWithSameName = await Queue.findOne({
              where: { name: value, companyId }
            });

            return !queueWithSameName;
          }
          return false;
        }
      ),
    color: Yup.string()
      .required("ERR_QUEUE_INVALID_COLOR")
      .test("Check-color", "ERR_QUEUE_INVALID_COLOR", async value => {
        if (value) {
          const colorTestRegex = /^#[0-9a-f]{3,6}$/i;
          return colorTestRegex.test(value);
        }
        return false;
      })
      .test(
        "Check-color-exists",
        "ERR_QUEUE_COLOR_ALREADY_EXISTS",
        async value => {
          if (value) {
            const queueWithSameColor = await Queue.findOne({
              where: { color: value, companyId }
            });
            return !queueWithSameColor;
          }
          return false;
        }
      )
  });

  try {
    await queueSchema.validate({ color, name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (limit && overflowQueueId) {
    let loopError = false;

    let loopCount = 0;
    let queueList = [];
    let currentQueueId: string | number = overflowQueueId;

    while (loopCount <= 10) {
      loopCount++;
  
      const overflowQueue = await ShowQueueService(currentQueueId, companyId);
  
      if (overflowQueue.limit && overflowQueue.overflowQueueId) {
        if (queueList.includes(overflowQueue.id)) {
          loopError = true;
          break;
        }

        queueList.push(overflowQueue.id);
        currentQueueId = overflowQueue.overflowQueueId;
      } else {
        break;
      }
    }

    if (loopError) throw new AppError("ERR_QUEUE_CREATES_A_LOOP");
    if (loopCount > 10) throw new AppError("ERR_QUEUE_PATH_TOO_LONG");
  }

  const queue = await Queue.create({
    color,
    name,
    greetingMessage,
    limit: limit ? limit : null,
    overflowQueueId: overflowQueueId ? overflowQueueId : null,
    companyId
  });

  return queue;
};

export default CreateQueueService;
