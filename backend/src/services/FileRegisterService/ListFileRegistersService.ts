import { Op } from "sequelize";
import File from "../../database/models/File";
import FileRegister from "../../database/models/FileRegister";
import Templates from "../../database/models/TemplatesData";

interface Response {
  reports: FileRegister[];
  count: number;
  hasMore: boolean;
}

const ListFileRegistersService = async ({
  fileId,
  companyId,
  integratedImportId,
  pageNumber = "1",
  haveWhatsapp,
}): Promise<Response> => {
  let whereCondition = null;

  whereCondition = { 
    fileId: fileId ? fileId : null,
    integratedImportId: integratedImportId ? integratedImportId : null,
    companyId,
    haveWhatsapp: { [Op.or]: [true, null] }
  };

  if (haveWhatsapp === "false") {
    whereCondition = { ...whereCondition, haveWhatsapp: false };
  }

  const limit = 10;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: reports } = await FileRegister.findAndCountAll({
    where: whereCondition,
    limit: +pageNumber > 0 ? +limit : null,
    offset: +pageNumber > 0 ? offset : null,
    order: [["createdAt", "DESC"]],
  });

  if (fileId != '' && fileId != null) {
    const file = await File.findOne({ where: { id: fileId, companyId } });
    if (file.templateId) {
      const template = await Templates.findOne({ where: { id: file.templateId, companyId } });
      reports.forEach((reg) => {
        reg.message = template.text
        .replace("{{name}}", reg.name)
        .replace("{{documentNumber}}", reg.documentNumber)
        .replace("{{var1}}", reg.var1)
        .replace("{{var2}}", reg.var2)
        .replace("{{var3}}", reg.var3)
        .replace("{{var4}}", reg.var4)
        .replace("{{var5}}", reg.var5)
        .replace("{{phoneNumber}}", reg.phoneNumber);
      });    
    }
  }

  const hasMore = count > offset + reports.length;

  return { reports, count, hasMore };
};

export default ListFileRegistersService;
