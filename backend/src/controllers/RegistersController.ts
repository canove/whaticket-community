import { Request, Response } from "express";
import ListRegistersService from "../services/RegistersService/ListRegistersService";
import ListReportRegistersService from "../services/RegistersService/ListReportRegistersService";
import { QueryTypes } from "sequelize";
import Message from "../database/models/Message";

var fs = require("fs");
var pdf = require("pdf-creator-node");
var pdf2base64 = require('pdf-to-base64');

type IndexQuery = {
  type: string,
  fileId: string,
};

type Query = {
  statuses: Array<any>,
  fileIds: Array<any>,
  pageNumber: number | string
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { type, fileId } = req.query as unknown as IndexQuery;

  const report = await ListRegistersService({ type, fileId });

  return res.status(200).json(report);
}

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { statuses, fileIds, pageNumber } = req.query as Query;

  const { registers, count, hasMore } = await ListReportRegistersService({ statuses, fileIds, pageNumber });

  return res.json({ registers, count, hasMore });
}

export const exportPdf = async (req: Request, res: Response) => {
  const { statuses, fileIds, pageNumber } = req.query as Query;

  const { registers, count, hasMore } = await ListReportRegistersService({ statuses, fileIds, pageNumber });

  let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>PDF - Relatório de Registros</title>
        </head>
        <body>
            <h1>Relatório de Registros</h1>
            <table style="border: 1px solid black; border-collapse: collapse;">
                <thead>
                    <tr>
                        <td style="border: 1px solid black">Nome</td>
                        <td style="border: 1px solid black">Enviado</td>
                        <td style="border: 1px solid black">Entregue</td>
                        <td style="border: 1px solid black">Lido</td>
                        <td style="border: 1px solid black">Erro</td>
                    <tr>
                </thead>
                <tbody>
                    {{#each registers}}
                    <tr>
                        <td style="border: 1px solid black">{{this.dataValues.name}}</td>
                        <td style="border: 1px solid black">{{this.dataValues.sentAt}}</td>
                        <td style="border: 1px solid black">{{this.dataValues.deliveredAt}}</td>
                        <td style="border: 1px solid black">{{this.dataValues.readAt}}</td>
                        <td style="border: 1px solid black">{{this.dataValues.errorAt}}</td>
                    <tr>
                    {{/each}}
                </tbody>
            </table>
        </body>
        </html>
    `;

  let options = {
    format: "A3",
    orientation: "portrait",
    border: "10mm",
    footer: {
        height: "28mm",
        contents: {
            default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
        }
    }
  };

  let documento = {
    html: html,
    data: {
      registers: registers,
    },
    path: "./src/downloads/output.pdf",
    type: "",
  };

  await pdf.create(documento, options);

  pdf2base64("./src/downloads/output.pdf").then((pdfBase: Response) => {
    return res.status(200).json(pdfBase);
  })

  fs.unlink('./src/downloads/output.pdf', (err: Error) => {
      if (err) {
          throw err;
      }
  });
}