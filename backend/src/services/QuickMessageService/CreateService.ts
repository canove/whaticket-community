import * as Yup from "yup";
import AppError from "../../errors/AppError";
import QuickMessage from "../../models/QuickMessage";

interface Data {
  shortcode: string;
  message: string;
  companyId: number | string;
  userId: number | string;
}

const CreateService = async (data: Data): Promise<QuickMessage> => {
  const { shortcode, message } = data;

  const ticketnoteSchema = Yup.object().shape({
    shortcode: Yup.string()
      .min(3, "ERR_QUICKMESSAGE_INVALID_NAME")
      .required("ERR_QUICKMESSAGE_REQUIRED"),
    message: Yup.string()
      .min(3, "ERR_QUICKMESSAGE_INVALID_NAME")
      .required("ERR_QUICKMESSAGE_REQUIRED")
  });

  try {
    await ticketnoteSchema.validate({ shortcode, message });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const record = await QuickMessage.create(data);

  return record;
};

export default CreateService;
