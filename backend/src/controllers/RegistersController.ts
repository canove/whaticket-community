import { Request, Response } from "express";
import ListRegistersService from "../services/RegistersService/ListRegistersService";
import ListReportRegistersService from "../services/RegistersService/ListReportRegistersService";

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

  const report = await ListRegistersService({ type:"", fileId });

  const register = await ListRegistersService ({ type:"register", fileId })

  const sent = await ListRegistersService ({ type:"sent", fileId })

  const delivered = await ListRegistersService ({ type:"delivered", fileId })

  const read = await ListRegistersService ({ type:"read", fileId })

  const error = await ListRegistersService ({ type:"error", fileId })

  return res.status(200).json({report, register, sent, delivered, read, error});
}

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { statuses, fileIds, pageNumber } = req.query as Query;

  const { registers, count, hasMore } = await ListReportRegistersService({ statuses, fileIds, pageNumber });

  return res.json({ registers, count, hasMore });
}

export const exportPdf = async (req: Request, res: Response) => {
  const { statuses, fileIds, pageNumber } = req.query as Query;

  const { registers, count, hasMore } = await ListReportRegistersService({ statuses, fileIds, pageNumber });

  const checkZero = (data) => {
    if(data.length == 1){
      data = "0" + data;
    }
    return data;
  }

  const formatDate = (date) => {
    if (date === null) {
      return "";
    } else {
      let dateString = `${date.toLocaleDateString("pt-BR")} ${checkZero(date.getHours() + "")}:${checkZero(date.getMinutes() + "")}`;
      return dateString;
    }
  }

  const getRegistersData = () => {
    let text = ''

    registers.forEach((register) => {
      const name = register.getDataValue('name');
      const sentAt = formatDate(register.getDataValue('sentAt'));
      const deliveredAt = formatDate(register.getDataValue('deliveredAt'));
      const readAt = formatDate(register.getDataValue('readAt'));
      const errorAt = formatDate(register.getDataValue('errorAt'));

      text += `
        <tr>
          <td style="border: 1px solid black">${name}</td>
          <td style="border: 1px solid black">${sentAt}</td>
          <td style="border: 1px solid black">${deliveredAt}</td>
          <td style="border: 1px solid black">${readAt}</td>
          <td style="border: 1px solid black">${errorAt}</td>
        </tr>
      `
    });

    return text;
  }

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
                  ${getRegistersData()}
                </tbody>
              </table>
        </body>
        </html>
    `;

//     <tr>
//     <td style="border: 1px solid black">{{this.dataValues.name}}</td>
//     <td style="border: 1px solid black">{{this.dataValues.sentAt}}</td>
//     <td style="border: 1px solid black">{{this.dataValues.deliveredAt}}</td>
//     <td style="border: 1px solid black">{{this.dataValues.readAt}}</td>
//     <td style="border: 1px solid black">{{this.dataValues.errorAt}}</td>
// <tr>
// {{/each}}

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