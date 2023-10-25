import path from "path";

const cert = path.join(
  __dirname,
  `../../certs/${process.env.GERENCIANET_PIX_CERT}.p12`
);

export = {
  sandbox: false,
  client_id: process.env.GERENCIANET_CLIENT_ID as string,
  client_secret: process.env.GERENCIANET_CLIENT_SECRET as string,
  pix_cert: cert
};
