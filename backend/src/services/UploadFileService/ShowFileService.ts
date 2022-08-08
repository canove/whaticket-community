import File from "../../database/models/File";
import AppError from "../../errors/AppError";

const ShowFileService = async (id: string | number): Promise<File> => {
  const file = await File.findByPk(id, {
    attributes: ["name", "id", "approvedAt", "refusedAt", "approvedOrRefusedId"],
  });
  if (!file) {
    throw new AppError("ERR_NO_FILE_FOUND", 404);
  }

  return file;
};

export default ShowFileService;
