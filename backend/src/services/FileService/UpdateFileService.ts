import File from "../../database/models/File";

const UpdateFileService = async ({ id, field }): Promise<boolean> => {
  try {
    console.log("update File FileService 6");
    await File.update(field, { where: { id } });
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export default UpdateFileService