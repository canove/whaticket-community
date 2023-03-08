import { format, parseISO } from "date-fns";
import { Request, Response } from "express";
import Message from "../database/models/Message";
import AppError from "../errors/AppError";
import ListReportService from "../services/ReportTalkService/ListReportService";

const fs = require("fs");
const pdf = require("pdf-creator-node");
const pdf2base64 = require("pdf-to-base64");
const html_to_pdf = require('html-pdf-node');

type IndexQuery = {
  pageNumber?: string, 
  initialDate?: string, 
  finalDate?: string, 
  userId?: string, 
  contactNumber?: string,
  company?: string,
};

export const index = async (req: Request, res: Response): Promise<void> => {
  const { initialDate, finalDate, userId, contactNumber, company } = req.query as IndexQuery;
  const { companyId } = req.user;

  try {
    const { messages } = await ListReportService({
      limit: "-1",
      companyId,
      contactNumber,
      userId,
      initialDate,
      finalDate,
      company
   });
  
    let reports = [];
  
    for (const message of messages) {
      const ticketIndex = reports.findIndex(report => report.ticketId === message.ticketId);
  
      if (ticketIndex === -1) {
        reports.push({
          ticketId: message.ticketId,
          messages: [message]
        });
      } else {
        const newReport = {
          ticketId: reports[ticketIndex].ticketId,
          messages: [...reports[ticketIndex].messages, message]
        }
  
        reports[ticketIndex] = newReport;
      }
    }
  
    let reportHTML = "";
  
    for (const report of reports) {
      reportHTML += `
        <div>
          <h2>ID do Ticket: ${report.ticketId}</h2>
          <table style="display: block; border-collapse: collapse; width: 1200px; table-layout: fixed;">
            <thead>
              <tr>
                <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Operador</td>
                <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Cliente</td>
                <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Enviado Por</td>
                <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Telefone</td>
                <td style="border: 1px solid black; text-align: center; min-width: 140px; max-width: 140px; font-weight: bold">Mensagem</td>
                <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">ID do Ticket</td>
                <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Data</td>
              <tr>
            </thead>
            <tbody>
              ${getMessageRows(report.messages)}
            </tbody>
          </table>
        </div>
      `;
    }
  
    const html = `
          <!DOCTYPE html>
          <html>
            <head>
                <meta charset="utf-8" />
                <title>PDF - Ticket Report</title>
            </head>
            <body style="width: 100%">
                <h1>Relatório de Conversas</h1>
                <h3>Filtros:</h3>
                <h4>Telefone: ${contactNumber}</h4>
                <h4>ID do Usuário: ${userId}</h4>
                <h4>Data Inicial: ${initialDate}</h4>
                <h4>Data Final: ${finalDate}</h4>
                ${reportHTML}
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
  } catch (err) {
    throw new AppError("ERR_ON_CREATING_PDF");
  }
};

const getMessageRows = (messages: Message[]) => {
  let rows = "";

  for (const message of messages) {
    const userName = message.ticket.user ? message.ticket.user.name : "BOT";
    const contactName = (message.ticket.contact && message.ticket.contact.name) ? message.ticket.contact.name : "DESCONHECIDO";
    const fromMe = message.fromMe ? "OPERADOR" : "CLIENTE";
    const contactNumber = (message.ticket.contact && message.ticket.contact.number) ? message.ticket.contact.number : "DESCONHECIDO";
    const msg = message.mediaUrl ? `[MEDIA_URL: ${message.mediaUrl}]${message.body}` : message.body;
    const ticketId = message.ticketId;
    const date = format(message.createdAt, "dd/MM/yyyy HH:mm");

    rows += `
      <tr>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${userName}</td>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${contactName}</td>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${fromMe}</td>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${contactNumber}</td>
        <td style="border: 1px solid black; text-align: center; min-width: 140px; max-width: 140px; padding: 5px; word-wrap: break-word">${msg.replace(/{/g, '/{').replace(/}/g, '/}')}</td>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${ticketId}</td>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${date}</td>
      </tr>
    `;
  }

  return rows;
}
