import { FileStatus } from "../../enum/FileStatus";
import ShowIntegratedImportService from "./ShowIntegratedImportService";

interface Request {
  status: string | number;
  userId: string | number;
  integratedImportId: string | number;
  companyId: string | number;
}

const UpdateIntegratedImportStatusService = async ({
  status,
  userId,
  integratedImportId,
  companyId
}: Request): Promise<unknown> => {
  const integratedImport = await ShowIntegratedImportService(
    integratedImportId,
    companyId
  );
  const date = new Date();

  if (status === "4") {
    await integratedImport.update({ status: FileStatus.WaitingDispatcher });
    await integratedImport.update({ approvedAt: date });
    await integratedImport.update({ approvedOrRefusedId: userId });
    return integratedImport;
  }

  if (status === "7") {
    await integratedImport.update({ status: FileStatus.Refused });
    await integratedImport.update({ refusedAt: date });
    await integratedImport.update({ approvedOrRefusedId: userId });
    return integratedImport;
  }

  await integratedImport.update({ status: FileStatus.Error });
  return integratedImport;
};

export default UpdateIntegratedImportStatusService;
