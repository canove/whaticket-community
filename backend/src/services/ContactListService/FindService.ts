import ContactList from "../../models/ContactList";
import Company from "../../models/Company";

type Params = {
  companyId: string;
};

const FindService = async ({ companyId }: Params): Promise<ContactList[]> => {
  const notes: ContactList[] = await ContactList.findAll({
    where: {
      companyId
    },
    include: [{ model: Company, as: "company", attributes: ["id", "name"] }],
    order: [["name", "ASC"]]
  });

  return notes;
};

export default FindService;
