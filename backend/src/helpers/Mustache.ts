import Mustache from "mustache";
const he = require('he');

export default (body: string, obj): string => {
  if (!obj) return body;

  let text = Mustache.render(body, obj);
  text = he.decode(text);

  return text;
};
