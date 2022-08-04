import File from "../../database/models/File";

interface Request {
    id: Number
    name: string
    ownerid: string
    Status: Number
}

interface Response {

}

const CreateUploadFileService = async ({
    id,
    name,
    ownerid,
    Status = 0
}: Request): Promise<Response> => {

  const file = await File.create(
    {
      id,
      name,
      ownerid,
      Status
    },
  );

  return 'Upload Completo';
};

export default CreateUploadFileService;
