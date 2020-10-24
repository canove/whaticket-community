import app from "./app";
import { initIO } from "./libs/socket";
import { StartWhatsAppSessions } from "./services/WbotServices/StartWhatsAppSessions";

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on port: ${process.env.PORT}`);
});

initIO(server);
StartWhatsAppSessions();
