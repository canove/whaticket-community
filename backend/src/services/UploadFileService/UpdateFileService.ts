import { FileStatus } from "../../enum/FileStatus";
import ShowFileService from "./ShowFileService";

interface Request {
  status: string | number;
  userId: string | number;
  fileId: string | number;
  companyId: string | number;
}

const UpdateFileService = async ({
  status,
  userId,
  fileId,
  companyId
}: Request): Promise<unknown> => {
  const file = await ShowFileService(fileId, companyId);
  const date = new Date();

  if (status === "4") {
    await file.update({ status: FileStatus.WaitingDispatcher });
    await file.update({ approvedAt: date });
    await file.update({ approvedOrRefusedId: userId });
    return file;
  }

  if (status === "5") {
    await file.update({ status: FileStatus.Sending });
    return file;
  }

  if (status === "7") {
    await file.update({ status: FileStatus.Refused });
    await file.update({ refusedAt: date });
    await file.update({ approvedOrRefusedId: userId });
    return file;
  }

  if (status === "8") {
    await file.update({ status: FileStatus.TestingWhatsapp });
    return file;
  }

  if (status === "10") {
    await file.update({ status: FileStatus.Paused });
    return file;
  }

  await file.update({ status: FileStatus.Error });
  return file;
};

export default UpdateFileService;
