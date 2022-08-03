import Mustache from "mustache";
import Contact from "../database/models/Contact";

export default (body: string, contact: Contact): string => {
  const view = {
    name: contact ? contact.name : ""
  };
  return Mustache.render(body, view);
};
