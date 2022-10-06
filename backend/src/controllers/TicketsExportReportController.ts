import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import Message from "../database/models/Message";

const fs = require("fs");
const pdf = require("pdf-creator-node");
const pdf2base64 = require("pdf-to-base64");

type IndexQuery = {
  ticketId?: number;
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

  const reports: Array<Report> = await Message.sequelize?.query(
    `
        select
            msg.id, msg.body, msg.mediaUrl, msg.ticketId, msg.createdAt, msg.read
        from
            whaticket.Messages as msg
        inner join
            whaticket.Tickets as ticket
        on
            msg.ticketId = ticket.id
        where
            ticket.id = ${ticketId}
        and
            ticket.companyId = ${companyId}
    `,
    { type: QueryTypes.SELECT }
  );

  const checkZero = data => {
    if (data.length === 1) {
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
    reports.forEach((report: Report) => {
      const { id } = report;
      const { body } = report;
      const mediaUrl = report.mediaUrl ? report.mediaUrl : "";
      const createdAt = formatDate(report.createdAt);
      const read = isRead(report.read);

      text += `
                <tr>
                    <td style="border: 1px solid black">${id}</td>
                    <td style="border: 1px solid black">${body}</td>
                    <td style="border: 1px solid black">${mediaUrl}</td>
                    <td style="border: 1px solid black">${createdAt}</td>
                    <td style="border: 1px solid black">${read}</td>
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
            <h2>Ticket ID: ${ticketId}</h2>
            <table style="border: 1px solid black; border-collapse: collapse;">
                <thead>
                    <tr>
                        <td style="border: 1px solid black">ID</td>
                        <td style="border: 1px solid black">Body</td>
                        <td style="border: 1px solid black">Media URL</td>
                        <td style="border: 1px solid black">Created At</td>
                        <td style="border: 1px solid black">Read</td>
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
      reports
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
