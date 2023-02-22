import { Request, Response } from "express";
import ListReportService from "../services/ReportTalkService/ListReportService";

const fs = require("fs");
const pdf = require("pdf-creator-node");
const pdf2base64 = require("pdf-to-base64");

type IndexQuery = {
  userId: number;
  initialDate: string;
  finalDate: string;
  id: number;
  body: string;
  mediaUrl: string;
  read: number | boolean;
  companyId?: number;
  number?: string;
  ticketId?: number;
};

type Report = {
  id: string;
  body: string;
  mediaUrl: string | null;
  ticketId: number;
  createdAt: Date;
  read: number | boolean;
  number: string;
};

export const index = async (req: Request, res: Response): Promise<void> => {
  const {id, body, mediaUrl, ticketId, read, initialDate, finalDate, number, userId } = req.query as unknown as IndexQuery;
  const { companyId } = req.user;
  const response = await ListReportService({
    id,
    body,
    mediaUrl,
    ticketId,
    read,
    companyId,
    number,
    userId,
 });

  const checkZero = data => {
    if (data.length == 1) {
      data = `0${data}`;
    }
    return data;
  };

  const formatDate = date => {
    if (date === null) {
      return "";
    }
    const dateString = `${date.toLocaleDateString("pt-BR")} ${checkZero(
      `${date.getHours()}`
    )}:${checkZero(`${date.getMinutes()}`)}`;
    return dateString;
  };

  const isRead = read => {
    if (read === 1) {
      return "Sim";
    }
    if (read === 2) {
      return "Não";
    }
    return read;
  };

  const getReportData = () => {
    let text = "";
    response.messages.forEach((report) => {
      const { id } = report;
      const { body } = report;
      const read = isRead(report.read);
      const number = (report.contact.number)
      const mediaUrl = report.mediaUrl ? report.mediaUrl : "";
      const ticketId  = report.ticket.id;
      const createdAt = formatDate(report.createdAt);

      text += `
                <tr>
                    <td style="border: 1px solid black; padding: 5px; text-align: center; max-width: 250px; min-width: 100px; word-wrap: break-word">${id}</td>
                    <td style="border: 1px solid black; padding: 5px; text-align: center; max-width: 250px; min-width: 100px; word-wrap: break-word">${body.replace(/{{/g, '{').replace(/}}/g, '}')}</td>
                    <td style="border: 1px solid black; padding: 5px; text-align: center; max-width: 250px; min-width: 100px; word-wrap: break-word">${read}</td>
                    <td style="border: 1px solid black; padding: 5px; text-align: center; max-width: 250px; min-width: 100px; word-wrap: break-word">${number}</td>
                    <td style="border: 1px solid black; padding: 5px; text-align: center; max-width: 250px; min-width: 100px; word-wrap: break-word">${mediaUrl}</td>
                    <td style="border: 1px solid black; padding: 5px; text-align: center; max-width: 250px; min-width: 100px; word-wrap: break-word">${ticketId}</td>
                    <td style="border: 1px solid black; padding: 5px; text-align: center; max-width: 250px; min-width: 100px; word-wrap: break-word">${createdAt}</td>
                </tr>
            `;
    });
    return text;
  };

  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>PDF - Ticket Report</title>
        </head>
        <body>
            <h1>Tickets Report</h1>
            <h2>User ID: ${userId}</h2>
            <h2>Initial Date: ${initialDate}</h2>
            <h2>Final Date: ${finalDate}</h2>
            <h2>NUmber: ${number}</h2>
            <table style="border: 1px solid black; border-collapse: collapse;">
                <thead>
                    <tr>
                        <td style="border: 1px solid black">ID</td>
                        <td style="border: 1px solid black">Body</td>
                        <td style="border: 1px solid black">Read</td>
                        <td style="border: 1px solid black">Number</td>
                        <td style="border: 1px solid black">Media URL</td>
                        <td style="border: 1px solid black">Ticket ID</td>
                        <td style="border: 1px solid black">Created At</td>
                    <tr>
                </thead>
                <tbody>
                    ${getReportData()}
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
    }
  };

  const documento = {
    html,
    data: {
      reports: response.messages
    },
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
