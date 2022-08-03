import File from "../../database/models/File";

interface Request {
    id: Number
    url: string
    name: string
    QtdeRegister: Number
    Status: Number
    initialDate: Date
    ownerid: string
}

interface Response {

}

const CreateUploadFileService = async ({
    id,
    url,
    name,
    QtdeRegister,
    Status,
    initialDate,
    ownerid,
}: Request): Promise<Response> => {

  const file = await File.create(
    {
      id,
      url,
      name,
      QtdeRegister,
      Status,
      initialDate,
      ownerid,
    },
  );

  await file.reload();

  return 'Upload Completo';
};

export default CreateUploadFileService;
