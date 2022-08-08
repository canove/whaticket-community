import FileRegister from "../../database/models/FileRegister";

interface Response {}

const ListFileRegistersService = async ({
  fileId
}): Promise<unknown> => {
  const where = { fileId: fileId };

  // eslint-disable-next-line no-return-await
  return await FileRegister.findAll({
    where: where
  });
};

export default ListFileRegistersService;
