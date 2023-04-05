import Packages from "../../database/models/Packages";
import AppError from "../../errors/AppError";

const ShowPackageService = async (id: string | number): Promise<Packages> => {
  const pack = await Packages.findByPk(id);

  if (!pack) {
    throw new AppError("ERR_NO_PACKAGE_FOUND", 404);
  }

  return pack;
};

export default ShowPackageService;
