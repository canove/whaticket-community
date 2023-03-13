import { endOfDay, parseISO, startOfDay } from "date-fns";
import { Request, Response } from "express";
import { Op } from "sequelize";
import FileRegister from "../database/models/FileRegister";
import DashboardCategoryService from "../services/CategoryServices/DashboardCategoryService";
import CountMessagesServices from "../services/MessageServices/CountMessagesService";
import ListRegistersService from "../services/RegistersService/ListRegistersService";
import ListReportRegistersService from "../services/RegistersService/ListReportRegistersService";
import GetConnectedWhatsAppsService from "../services/WhatsappService/GetConnectedWhatsAppsService";

const fs = require("fs");
const pdf = require("pdf-creator-node");
const pdf2base64 = require("pdf-to-base64");

type IndexQuery = {
  type?: string;
  fileId?: string;
  date?: string;
  initialDate?: string;
  finalDate?: string;
};

type ListQuery = {
  statuses: Array<any>;
  fileIds: Array<any>;
  pageNumber: number | string;
  initialDate: string;
  finalDate: string;
  name: string;
  phoneNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { fileId, date, initialDate, finalDate } = req.query as IndexQuery;
  const { companyId } = req.user;

  const reports = await ListRegistersService({ fileId, date, companyId, initialDate, finalDate });

  const category = await DashboardCategoryService(companyId, date);

  const connectedWhatsapps = await GetConnectedWhatsAppsService(companyId);

  const messages = await CountMessagesServices({ companyId, date, initialDate, finalDate });

  return res.status(200).json({ reports, category, connectedWhatsapps, messages });
};

type ChartQuery = {
  date: string;
  selectedDate?: string;
}

export const chart = async (req: Request, res: Response): Promise<Response> => {
  const { date, selectedDate } = req.query as ChartQuery;
  const { companyId } = req.user;

  let whereCondition = null;

  if (selectedDate) {
    whereCondition = {
      [Op.or]: [
        {
          processedAt: {
            [Op.between]: [+startOfDay(parseISO(selectedDate)), +endOfDay(parseISO(selectedDate))]
          },
        },
        {
          sentAt: {
            [Op.between]: [+startOfDay(parseISO(selectedDate)), +endOfDay(parseISO(selectedDate))]
          },
        }
      ],
      companyId
    };
  } else if (date) {
    whereCondition = {
      [Op.or]: [
        {
          processedAt: {
            [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
          },
        },
        {
          sentAt: {
            [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
          },
        }
      ],
      companyId
    };
  }

  const reports = await FileRegister.findAll({
    where: whereCondition,
    attributes: ["createdAt", "sentAt", "processedAt"]
  });

  return res.status(200).json({ reports });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { statuses, fileIds, pageNumber, initialDate, finalDate, name, phoneNumber } = req.query as ListQuery;
  const { companyId } = req.user;

  const { registers, count, hasMore } = await ListReportRegistersService({
    statuses,
    fileIds,
    pageNumber,
    companyId,
    initialDate,
    finalDate,
    name,
    phoneNumber
  });

  return res.json({ registers, count, hasMore });
};

export const exportPdf = async (req: Request, res: Response): Promise<void> => {
  const { statuses, fileIds, pageNumber, initialDate, finalDate, name, phoneNumber } = req.query as ListQuery;
  const { companyId } = req.user;

  const { registers } = await ListReportRegistersService({
    statuses,
    fileIds,
    pageNumber,
    companyId,
    initialDate,
    finalDate,
    name,
    phoneNumber
  });

  const html = `
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
                <td style="border: 1px solid black">Status</td>
                <td style="border: 1px solid black">Processado</td>
                <td style="border: 1px solid black">Enviado</td>
                <td style="border: 1px solid black">Entregue</td>
                <td style="border: 1px solid black">Lido</td>
                <td style="border: 1px solid black">Erro</td>
              <tr>
            </thead>
            <tbody>
              ${getRegistersData(registers)}
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

const getRegistersData = registers => {
  let text = "";

  registers.forEach(register => {
    const name = register.getDataValue("name");
    const sentAt = formatDate(register.getDataValue("sentAt"));
    const deliveredAt = formatDate(register.getDataValue("deliveredAt"));
    const readAt = formatDate(register.getDataValue("readAt"));
    const errorAt = formatDate(register.getDataValue("errorAt"));
    const processedAt = formatDate(register.getDataValue("processedAt"));

    let status = "";
    if (errorAt) {
      status = "Erro";
    } else if (register.readAt) {
      status = "Lido";
    } else if (register.deliveredAt) {
      status = "Entregue";
    } else if (register.sentAt) {
      status = "Enviado";
    }

    text += `
      <tr>
        <td style="border: 1px solid black">${name}</td>
        <td style="border: 1px solid black">${status}</td>
        <td style="border: 1px solid black">${processedAt}</td>
        <td style="border: 1px solid black">${sentAt}</td>
        <td style="border: 1px solid black">${deliveredAt}</td>
        <td style="border: 1px solid black">${readAt}</td>
        <td style="border: 1px solid black">${errorAt}</td>
      </tr>
    `;
  });

  return text;
};

export const exportCsv = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const { statuses, fileIds, pageNumber, initialDate, finalDate, name, phoneNumber } = req.query as ListQuery;
  const { companyId } = req.user;

  const { registers } = await ListReportRegistersService({
    statuses,
    fileIds,
    pageNumber,
    companyId,
    initialDate,
    finalDate,
    name, 
    phoneNumber
  });

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

  const rows = [["Nome", "Status", "Enviado", "Entregue", "Lido", "Erro"]];

  registers.forEach(register => {
    const { name } = register;
    const sentAt = formatDate(register.sentAt);
    const deliveredAt = formatDate(register.deliveredAt);
    const readAt = formatDate(register.readAt);
    const errorAt = formatDate(register.errorAt);

    let status = "";
    if (errorAt) {
      status = "Erro";
    } else if (register.readAt) {
      status = "Lido";
    } else if (register.deliveredAt) {
      status = "Entregue";
    } else if (register.sentAt) {
      status = "Enviado";
    }

    const columns = [];

    columns.push(name);
    columns.push(status);
    columns.push(sentAt);
    columns.push(deliveredAt);
    columns.push(readAt);
    columns.push(errorAt);
    rows.push(columns);
  });

  let csvContent = "data:text/csv;charset=utf-8,";
  rows.forEach(rowArray => {
    const row = rowArray.join(";");
    csvContent += `${row}\r\n`;
  });

  return res.status(200).json(csvContent);
};
