import File from "../../database/models/File";
import AppError from "../../errors/AppError";

const ShowFileService = async (
  id: string | number,
  companyId: string | number
): Promise<File> => {
  const file = await File.findOne({
    where: { id, companyId },
    attributes: [
      "name",
      "id",
      "approvedAt",
      "refusedAt",
      "approvedOrRefusedId",
      "CreatedAt",
      "ownerid",
      "QtdeRegister",
    ]
  });
  if (!file) {
    throw new AppError("ERR_NO_FILE_FOUND", 404);
  }

  return file;
};

export default ShowFileService;
