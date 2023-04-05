import Packages from "../../database/models/Packages";

const ListPackagesService = async (): Promise<Packages[]> => {
  const packages = await Packages.findAll();

  return packages;
};

export default ListPackagesService;
