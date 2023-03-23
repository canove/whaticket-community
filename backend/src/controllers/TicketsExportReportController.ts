import { format } from "date-fns";
import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import Message from "../database/models/Message";
import AppError from "../errors/AppError";
import ListTicketsReportService from "../services/TicketsReportService/ListTicketsReportService";

const fs = require("fs");
const pdf = require("pdf-creator-node");
const pdf2base64 = require("pdf-to-base64");

type IndexQuery = {
  ticketId?: string;
};

type Report = {
  id: string;
  body: string;
  mediaUrl: string | null;
  ticketId: number;
  createdAt: Date;
  read: number | boolean;
};

export const index = async (req: Request, res: Response): Promise<void> => {
  const { ticketId } = req.query as IndexQuery;
  const { companyId } = req.user;

  if (!ticketId) throw new AppError("NO_TICKET_SELECTED");

  const ticket = await ListTicketsReportService({ ticketId, companyId });

  const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8" />
          <title>PDF - Relatório de Conversa</title>
      </head>
      <style>
        html { zoom: 0.7; }
      </style>
      <body>
          <h1>Relatório de Conversa</h1>
          <h3>ID da Conversa: ${ticketId}</h3>
          <h3>Categoria: ${ticket.category ? ticket.category.name : ""}</h3>
          <table style="border: 1px solid black; border-collapse: collapse;">
              <thead>
                  <tr>
                      <td  style="border: 1px solid black; text-align: center; min-width: 200px; max-width: 200px; font-weight: bold">ID</td>
                      <td  style="border: 1px solid black; text-align: center; min-width: 200px; max-width: 200px; font-weight: bold">Corpo</td>
                      <td  style="border: 1px solid black; text-align: center; min-width: 200px; max-width: 200px; font-weight: bold">Media URL</td>
                      <td  style="border: 1px solid black; text-align: center; min-width: 200px; max-width: 200px; font-weight: bold">Lido</td>
                      <td  style="border: 1px solid black; text-align: center; min-width: 200px; max-width: 200px; font-weight: bold">Criado em</td>
                  <tr>
              </thead>
              <tbody>
                  ${getReportData(ticket, ticket.messages)}
              </tbody>
          </table>
      </body>
      </html>
    `;

  const options = {
    format: "A3",
    orientation: "portrait",
    border: "10mm",
    footer: {
      height: "28mm",
      contents: {
        default:
          '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>'
      }
    },
    childProcessOptions: {
      env: {
        OPENSSL_CONF: "/dev/null"
      }
    }
  };

  const documento = {
    html,
    data: {},
    path: "./src/downloads/output.pdf",
    type: ""
  };

  await pdf.create(documento, options);

  pdf2base64("./src/downloads/output.pdf").then((pdfBase: Response) => {
    return res.status(200).json(pdfBase);
  });

  fs.unlink("./src/downloads/output.pdf", (err: Error) => {
    if (err) {
      throw err;
    }
  });
};

const getReportData = (ticket, messages) => {
  let text = "";

  for (const message of messages) {
    const { id, body } = message;

    const mediaUrl = message.mediaUrl ? message.mediaUrl : "";
    const createdAt = format(message.createdAt, "dd/MM/yyyy HH:mm");
    const read = message.read ? "SIM" : "NÃO";

    text += `
      <tr>
        <td style="border: 1px solid black; text-align: center; min-width: 200px; max-width: 200px; padding: 5px; word-wrap: break-word">${id}</td>
        <td style="border: 1px solid black; text-align: center; min-width: 200px; max-width: 200px; padding: 5px; word-wrap: break-word">${body}</td>
        <td style="border: 1px solid black; text-align: center; min-width: 200px; max-width: 200px; padding: 5px; word-wrap: break-word">${mediaUrl}</td>
        <td style="border: 1px solid black; text-align: center; min-width: 200px; max-width: 200px; padding: 5px; word-wrap: break-word">${read}</td>
        <td style="border: 1px solid black; text-align: center; min-width: 200px; max-width: 200px; padding: 5px; word-wrap: break-word">${createdAt}</td>
      </tr>
    `;
  }

  return text;
};
