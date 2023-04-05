import Packages from "../../database/models/Packages";

interface Request {
  name: string;
  maxUsers: number;
  extraUserPrice: number;
  maxTicketsByMonth: number;
  extraTicketPrice: number;
  whatsappMonthlyPrice: number;
}

const CreatePackageService = async ({
  name,
  maxUsers,
  extraUserPrice,
  maxTicketsByMonth,
  extraTicketPrice,
  whatsappMonthlyPrice,
}: Request): Promise<Packages> => {
  const pack = await Packages.create({
    name,
    maxUsers,
    extraUserPrice,
    maxTicketsByMonth,
    extraTicketPrice,
    whatsappMonthlyPrice,
  });

  return pack;
};

export default CreatePackageService;
