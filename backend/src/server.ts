import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on port: ${process.env.PORT}`);
});

initIO(server);
StartAllWhatsAppsSessions();
gracefulShutdown(server);
