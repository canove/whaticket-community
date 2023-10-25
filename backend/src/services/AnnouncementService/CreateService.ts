import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Announcement from "../../models/Announcement";

interface Data {
  priority: string;
  title: string;
  text: string;
  status: string;
  companyId: number;
}

const CreateService = async (data: Data): Promise<Announcement> => {
  const { title, text } = data;

  const ticketnoteSchema = Yup.object().shape({
    title: Yup.string().required("ERR_ANNOUNCEMENT_REQUIRED"),
    text: Yup.string().required("ERR_ANNOUNCEMENT_REQUIRED")
  });

  try {
    await ticketnoteSchema.validate({ title, text });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const record = await Announcement.create(data);

  return record;
};

export default CreateService;
