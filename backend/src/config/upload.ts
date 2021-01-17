import path from "path";
import multer from "multer";

const publicFolder = path.resolve(__dirname, "..", "..", "public");
export default {
  directory: publicFolder,

  storage: multer.diskStorage({
    destination: publicFolder,
    filename(req, file, cb) {
      var arquivo = file.originalname;
      const fileName = arquivo.substring(0, arquivo.lastIndexOf(".")) + '-' + new Date().getTime() + path.extname(file.originalname);

      return cb(null, fileName);
    }
  })
};
