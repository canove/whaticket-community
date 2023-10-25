import ContactListItem from "../../models/ContactListItem";
import Company from "../../models/Company";

type Params = {
  companyId: number;
  contactListId: number;
};

const FindService = async ({
  companyId,
  contactListId
}: Params): Promise<ContactListItem[]> => {
  let where: any = {
    companyId
  };

  if (contactListId) {
    where = {
      ...where,
      contactListId
    };
  }

  const notes: ContactListItem[] = await ContactListItem.findAll({
    where,
    include: [{ model: Company, as: "company", attributes: ["id", "name"] }],
    order: [["name", "ASC"]]
  });

  return notes;
};

export default FindService;
