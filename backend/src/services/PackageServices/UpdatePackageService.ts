import Packages from "../../database/models/Packages";
import ShowPackageService from "./ShowPackageService";

interface PackageData {
  name: string;
  maxUsers: number;
  monthlyFee: number;
  extraUserPrice: number;
  maxTicketsByMonth: number;
  extraTicketPrice: number;
  maxWhatsapps: number;
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
    monthlyFee,
    extraUserPrice,
    maxTicketsByMonth,
    extraTicketPrice,
    maxWhatsapps,
    whatsappMonthlyPrice,
  } = packageData;

  await pack.update({
    name,
    maxUsers,
    monthlyFee,
    extraUserPrice,
    maxTicketsByMonth,
    extraTicketPrice,
    maxWhatsapps,
    whatsappMonthlyPrice,
  });

  await pack.reload();

  return pack;
};

export default UpdateProductService;
