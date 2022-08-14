import FileRegister from "../../database/models/FileRegister";

interface Response {
  reports: FileRegister[];
  count: number;
  hasMore: boolean;
}

const ListFileRegistersService = async ({
  fileId, 
  pageNumber = "1"
}): Promise<Response> => {
  const whereCondition = { fileId: fileId };

  const limit = 10;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: reports } = await FileRegister.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  const hasMore = count > offset + reports.length;

  return { reports, count, hasMore };
};

export default ListFileRegistersService;
