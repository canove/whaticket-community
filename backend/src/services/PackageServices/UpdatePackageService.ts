import Packages from "../../database/models/Packages";
import ShowPackageService from "./ShowPackageService";

interface PackageData {
  name: string;
  maxUsers: number;
  extraUserPrice: number;
  maxTicketsByMonth: number;
  extraTicketPrice: number;
  whatsappMonthlyPrice: number;
}

interface Request {
  packageData: PackageData;
  packageId: number | string;
}

const UpdateProductService = async ({
  packageData,
  packageId
}: Request): Promise<Packages> => {
  const pack = await ShowPackageService(packageId);

  const {
    name,
    maxUsers,
    extraUserPrice,
    maxTicketsByMonth,
    extraTicketPrice,
    whatsappMonthlyPrice,
  } = packageData;

  await pack.update({
    name,
    maxUsers,
    extraUserPrice,
    maxTicketsByMonth,
    extraTicketPrice,
    whatsappMonthlyPrice,
  });

  await pack.reload();

  return pack;
};

export default UpdateProductService;
