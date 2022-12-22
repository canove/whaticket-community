import Mustache from "mustache";
import Contact from "../database/models/Contact";
import FileRegister from "../database/models/FileRegister";

export default (body: string, reg: FileRegister): string => {
  if (!reg) return body;
  return Mustache.render(body, reg);
};
