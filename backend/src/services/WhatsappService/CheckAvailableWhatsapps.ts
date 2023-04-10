import { Op } from "sequelize";

import Packages from "../../database/models/Packages";
import Pricing from "../../database/models/Pricing";
import Whatsapp from "../../database/models/Whatsapp";

const CheckAvailableWhatsapps = async (
  companyId: string | number
): Promise<boolean> => {
  const pack = await Packages.findOne({
    include: [
      {
        model: Pricing,
        as: "pricings",
        where: { companyId },
        required: true
      }
    ]
  });

  if (!pack) return true;

  const whatsappCount = await Whatsapp.count({
    where: { companyId, deleted: false }
  });

  if (!pack.maxWhatsapps || pack.maxWhatsapps > whatsappCount) {
    return true;
  }

  return false;
};

export default CheckAvailableWhatsapps;
