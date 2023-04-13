import { Request, Response } from "express";

import ListCategoryService from "../services/CategoryServices/ListCategoryService";
import CreateCategoryService from "../services/CategoryServices/CreateCategoryService";
import ShowCategoryService from "../services/CategoryServices/ShowCategoryService";
import UpdateCategoryService from "../services/CategoryServices/UpdateCategoryService";
import DeleteCategoryService from "../services/CategoryServices/DeleteCategoryService";
import DashboardCategoryService from "../services/CategoryServices/DashboardCategoryService";
import CountCategoryService from "../services/CategoryServices/CountCategoryService";

import { getIO } from "../libs/socket";

const fs = require("fs");
const pdf = require("pdf-creator-node");
const pdf2base64 = require("pdf-to-base64");

interface CategoryData {
  name: string;
  description: string;
  companyId: string | number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const category = await ListCategoryService(companyId);

  return res.status(200).json(category);
};

type CountQuery = {
  name: string;
  initialDate: string;
  finalDate: string;
}

export const count = async (req: Request, res: Response): Promise<Response> => {
  const { name, initialDate, finalDate } = req.query as CountQuery;
  const { companyId } = req.user;

  const reports = await CountCategoryService({
    name,
    initialDate,
    finalDate,
    companyId
  });

  return res.status(200).json(reports);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, description }: CategoryData = req.body;
  const { companyId } = req.user;

  const category = await CreateCategoryService({
    name,
    description,
    companyId
  });

  const io = getIO();
  io.emit(`category${companyId}`, {
    action: "create",
    category
  });

  return res.status(200).json(category);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { categoryId } = req.params;
  const { companyId } = req.user;

  const category = await ShowCategoryService(categoryId, companyId);

  return res.status(200).json(category);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const categoryData: CategoryData = req.body;
  const { categoryId } = req.params;
  const { companyId } = req.user;

  const category = await UpdateCategoryService({
    categoryData,
    categoryId,
    companyId
  });

  const io = getIO();
  io.emit(`category${companyId}`, {
    action: "update",
    category
  });

  return res.status(200).json(category);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { categoryId } = req.params;
  const { companyId } = req.user;

  await DeleteCategoryService(categoryId, companyId);

  const io = getIO();
  io.emit(`category${companyId}`, {
    action: "delete",
    categoryId
  });

  return res.status(200).json({ message: "Category deleted" });
};

export const exportPDF = async (req: Request, res: Response): Promise<void> => {
  const { name, initialDate, finalDate } = req.query as CountQuery;
  const { companyId } = req.user;

  const reports = await CountCategoryService({
    name,
    initialDate,
    finalDate,
    companyId
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>PDF - Relatório de Categoria</title>
      </head>
      <style>
        html { zoom: 0.7; }
      </style>
      <body>
        <h1>Relatório de Categoria</h1>
        <h3>Filtros:</h3>
        <h4>Nome: ${name}</h4>
        <h4>Data Inicial: ${initialDate}</h4>
        <h4>Data Final: ${finalDate}</h4>
        <table style="display: block; border-collapse: collapse; width: 1200px; table-layout: fixed;">
          <thead>
            <tr>
              <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Categoria</td>
              <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Quantidade</td>
            <tr>
          </thead>
          <tbody>
            ${getReportsData(reports)}
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

const getReportsData = reports => {
  let text = "";

  reports.forEach(report => {
    const name = report.name;
    const ticketCount = report.ticketCount;

    text += `
      <tr>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${name}</td>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${ticketCount}</td>
      </tr>
    `;
  });

  return text;
};

export const exportCSV = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const { name, initialDate, finalDate } = req.query as CountQuery;
  const { companyId } = req.user;

  const reports: any = await CountCategoryService({
    name,
    initialDate,
    finalDate,
    companyId
  });

  const rows = [["Categoria", "Quantidade"]];

  reports.forEach(report => {
    const { name, ticketCount } = report;

    const columns = [];

    columns.push(name);
    columns.push(ticketCount);

    rows.push(columns);
  });

  let csvContent = "\uFEFF";

  rows.forEach(rowArray => {
    const row = rowArray.join(";");
    csvContent += `${row}\r\n`;
  });

  return res.status(200).json(csvContent);
};
