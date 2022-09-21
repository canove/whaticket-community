import { FileStatus } from "../../enum/FileStatus";
import ShowFileService from "./ShowFileService";

const UpdateFileService = async ({
  status,
  userId,
  fileId
}): Promise<unknown> => {
  const file = await ShowFileService(fileId);
  const date = new Date();

  if (status == "4") {
    await file.update({ Status: FileStatus.WaitingDispatcher });
    await file.update({ approvedAt: date });
    await file.update({ approvedOrRefusedId: userId });
    return file;
  }

  if (status == "7") {
    await file.update({ Status: FileStatus.Refused });
    await file.update({ refusedAt: date });
    await file.update({ approvedOrRefusedId: userId });
    return file;
  }

  await file.update({ Status: FileStatus.Error });
  return file;
};

export default UpdateFileService;
