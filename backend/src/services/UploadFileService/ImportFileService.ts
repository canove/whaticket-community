import AWS from "aws-sdk";
import path from "path";

import FileRegister from "../../database/models/FileRegister";
import { FileStatus } from "../../enum/FileStatus";

/*eslint-disable*/
const ImportFileService = async ({ key, createdAt, file }): Promise<void> => {
  const s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    region: process.env.AWS_REGION
  });

  const getParams = {
    Bucket: process.env.AWS_S3_BUCKET, // your bucket name,
    Key: `disparos/${createdAt.getFullYear()}/${(createdAt.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${createdAt
      .getDate()
      .toString()
      .padStart(2, "0")}/${path.basename(key)}`
  };

  try {
    const data = await s3.getObject(getParams).promise();
    let objectData = data.Body.toString('utf-8');
    let registers = objectData.split('\r\n');
    let totalRegisters = 0;
    let registersToInsert = [];

    for(const line of registers) {
      try {
        if (line.trim().length > 1) {
          let infos = line.split(";");
  
          registersToInsert.push({
            name: infos[0],
            phoneNumber: infos[2],
            fileId: file.id,
            documentNumber: infos[1],
            template: infos[3],
            templateParams: infos[4],
            message: infos[5]
          });
  
          if (registersToInsert.length >= 500) {
            await FileRegister.bulkCreate(registersToInsert);
            totalRegisters += registersToInsert.length;
            registersToInsert = [];
          }
        }
      } catch (err) {
        console.log(err);
      }
    }

    if (registersToInsert.length > 0) {
      totalRegisters += registersToInsert.length;
      await FileRegister.bulkCreate(registersToInsert);
    }
    await file.update({ QtdeRegister: totalRegisters, Status: FileStatus.WaitingApprove });
  } catch (e) {
    console.log(e);
    await file.update({ Status: FileStatus.Error });
  }
};

export default ImportFileService;
