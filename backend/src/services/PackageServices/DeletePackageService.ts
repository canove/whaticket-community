import Packages from "../../database/models/Packages";
import AppError from "../../errors/AppError";

const DeletePackageService = async (id: string | number): Promise<void> => {
  const pack = await Packages.findOne({
    where: { id }
  });

  if (!pack) {
    throw new AppError("ERR_NO_PACKAGE_FOUND", 404);
  }

  await pack.destroy();
};

export default DeletePackageService;
