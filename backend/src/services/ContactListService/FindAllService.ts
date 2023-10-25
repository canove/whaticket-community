import ContactList from "../../models/ContactList";

const FindAllService = async (): Promise<ContactList[]> => {
  const records: ContactList[] = await ContactList.findAll({
    order: [["name", "ASC"]]
  });
  return records;
};

export default FindAllService;
