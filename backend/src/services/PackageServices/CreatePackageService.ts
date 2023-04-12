import Packages from "../../database/models/Packages";

interface Request {
  name: string;
  maxUsers: number;
  monthlyFee: number;
  extraUserPrice: number;
  maxTicketsByMonth: number;
  extraTicketPrice: number;
  maxWhatsapps: number;
  whatsappMonthlyPrice: number;
}

const CreatePackageService = async ({
  name,
  maxUsers,
  monthlyFee,
  extraUserPrice,
  maxTicketsByMonth,
  extraTicketPrice,
  maxWhatsapps,
  whatsappMonthlyPrice,
}: Request): Promise<Packages> => {
  const pack = await Packages.create({
    name,
    maxUsers,
    monthlyFee,
    extraUserPrice,
    maxTicketsByMonth,
    extraTicketPrice,
    maxWhatsapps,
    whatsappMonthlyPrice,
  });

  return pack;
};

export default CreatePackageService;
