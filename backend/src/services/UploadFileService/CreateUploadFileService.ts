import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import File from "../../database/models/File";

interface Request {
  name: string;
  ownerid: string;
  official: string;
  filePath: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Response {}

const CreateUploadFileService = async ({
  name,
  ownerid,
  official,
  filePath
}: Request): Promise<Response | null> => {
  const s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    region: process.env.AWS_REGION
  });

  const fileContent = fs.readFileSync(filePath);
  const now = new Date();

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `disparos/${now.getFullYear()}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now
      .getDate()
      .toString()
      .padStart(2, "0")}/${path.basename(filePath)}`,
    Body: fileContent
  } as AWS.S3.PutObjectRequest;

  const data = await s3.upload(params).promise();
  const url = data.Location;
  const file = await File.create({
    url,
    name,
    ownerid,
    official,
    whatsappId: 13,
    status: 0
  });
  return file;
};

export default CreateUploadFileService;
