import Mustache from "mustache";
import Contact from "../models/Contact";


// Función para determinar el saludo según la hora del día
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Buenos días";
  } else if (hour < 18) {
    return "Buenas tardes";
  } else {
    return "Buenas noches";
  }
}

export default (body: string, contact: Contact): string => {
  const view = {
    name: contact ? contact.name || contact.number : "",
    greeting: getGreeting(), // Incluye el saludo dinámico

  };
  return Mustache.render(body, view);
};
