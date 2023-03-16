import { endOfDay, format, parseISO, startOfDay } from "date-fns";
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
  categoryId?: string;
};

type ListQuery = {
  statuses: Array<any>;
  fileIds: Array<any>;
  pageNumber: number | string;
  initialDate: string;
  finalDate: string;
  name: string;
  phoneNumber: string;
  limit: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { fileId, date, initialDate, finalDate, categoryId } = req.query as IndexQuery;
  const { companyId } = req.user;

  const reports = await ListRegistersService({ fileId, date, companyId, initialDate, finalDate, categoryId });

  const category = await DashboardCategoryService({ companyId, date, categoryId });

  const connectedWhatsapps = await GetConnectedWhatsAppsService(companyId);

  const messages = await CountMessagesServices({ companyId, date, initialDate, finalDate, categoryId });

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
  const { statuses, fileIds, pageNumber, limit, initialDate, finalDate, name, phoneNumber } = req.query as ListQuery;
  const { companyId } = req.user;

  const { registers, count, hasMore } = await ListReportRegistersService({
    statuses,
    fileIds,
    pageNumber,
    companyId,
    initialDate,
    finalDate,
    name,
    phoneNumber,
    limit
  });

  return res.json({ registers, count, hasMore });
};

export const exportPdf = async (req: Request, res: Response): Promise<void> => {
  const { statuses, fileIds, initialDate, finalDate, name, phoneNumber } = req.query as ListQuery;
  const { companyId } = req.user;

  const { registers } = await ListReportRegistersService({
    statuses,
    fileIds,
    limit: "-1",
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
        <style>
          html { zoom: 0.7; }
        </style>
        <body>
          <h1>Relatório de Registros</h1>
          <table style="display: block; border-collapse: collapse; width: 1200px; table-layout: fixed;">
            <thead>
              <tr>
                <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Nome</td>
                <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Status</td>
                <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Processado</td>
                <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Enviado</td>
                <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Entregue</td>
                <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Lido</td>
                <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Interação</td>
                <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Erro</td>
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

const getRegistersData = registers => {
  let text = "";

  registers.forEach(register => {
    const name = register.name;

    const sentAt = register.sentAt ? format(register.sentAt, "dd/MM/yyyy HH:mm") : "";
    const deliveredAt = register.deliveredAt ? format(register.deliveredAt, "dd/MM/yyyy HH:mm") : "";
    const readAt = register.readAt ? format(register.readAt, "dd/MM/yyyy HH:mm") : "";
    const errorAt = register.errorAt ? format(register.errorAt, "dd/MM/yyyy HH:mm") : "";
    const processedAt = register.processedAt ? format(register.processedAt, "dd/MM/yyyy HH:mm") : "";
    const interactionAt = register.interactionAt ? format(register.interactionAt, "dd/MM/yyyy HH:mm") : "";

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
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${name}</td>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${status}</td>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${processedAt}</td>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${sentAt}</td>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${deliveredAt}</td>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${readAt}</td>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${interactionAt}</td>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${errorAt}</td>
      </tr>
    `;
  });

  return text;
};

export const exportCsv = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const { statuses, fileIds, initialDate, finalDate, name, phoneNumber } = req.query as ListQuery;
  const { companyId } = req.user;

  const { registers } = await ListReportRegistersService({
    statuses,
    fileIds,
    limit: "-1",
    companyId,
    initialDate,
    finalDate,
    name, 
    phoneNumber
  });

  const rows = [["Nome", "Telefone", "Status", "Processado", "Enviado", "Entregue", "Lido", "Interação", "Erro", "Tem Whatsapp?", "VAR 1", "VAR 2", "VAR 3", "VAR 4", "VAR 5"]];

  registers.forEach(register => {
    const { name, phoneNumber } = register;

    const processedAt = register.processedAt ? format(register.processedAt, "dd/MM/yyyy HH:mm") : "";
    const sentAt = register.sentAt ? format(register.sentAt, "dd/MM/yyyy HH:mm") : "";
    const deliveredAt = register.deliveredAt ? format(register.deliveredAt, "dd/MM/yyyy HH:mm") : "";
    const readAt = register.readAt ? format(register.readAt, "dd/MM/yyyy HH:mm") : "";
    const interactionAt = register.interactionAt ? format(register.interactionAt, "dd/MM/yyyy HH:mm") : "";
    const errorAt = register.errorAt ? format(register.errorAt, "dd/MM/yyyy HH:mm") : "";

    const haveWhatsapp = getHaveWhatsapp(register);

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
    columns.push(phoneNumber);
    columns.push(status);
    columns.push(processedAt);
    columns.push(sentAt);
    columns.push(deliveredAt);
    columns.push(readAt);
    columns.push(interactionAt);
    columns.push(errorAt);
    columns.push(haveWhatsapp);
    columns.push(register.var1);
    columns.push(register.var2);
    columns.push(register.var3);
    columns.push(register.var4);
    columns.push(register.var5);

    rows.push(columns);
  });

  let csvContent = "data:text/csv;charset=utf-8,";
  rows.forEach(rowArray => {
    const row = rowArray.join(";");
    csvContent += `${row}\r\n`;
  });

  return res.status(200).json(csvContent);
};

const getHaveWhatsapp = (reg) => {
  if (reg.haveWhatsapp === null && reg.sentAt) {
      return "SIM";
  }

  if (reg.haveWhatsapp === null && !reg.sentAt) {
      return "DESCONHECIDO";
  }

  return reg.haveWhatsapp ? "SIM" : "NÃO";
}
