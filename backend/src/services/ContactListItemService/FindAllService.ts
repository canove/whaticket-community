import ContactListItem from "../../models/ContactListItem";

const FindAllService = async (): Promise<ContactListItem[]> => {
  const records: ContactListItem[] = await ContactListItem.findAll({
    order: [["name", "ASC"]]
  });
  return records;
};

export default FindAllService;
