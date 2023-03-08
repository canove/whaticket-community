import { Request, Response } from "express";
import AppError from "../errors/AppError";

import ListGeneralReportService from "../services/GeneralReportService/ListGeneralReportService";

const fs = require("fs");
const pdf = require("pdf-creator-node");
const pdf2base64 = require("pdf-to-base64");

type IndexQuery = {
    initialDate: string;
    finalDate: string;
    company: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
    const { initialDate, finalDate, company } = req.query as IndexQuery;
    const { companyId } = req.user;

    const reports = await ListGeneralReportService({
        companyId,
        initialDate,
        finalDate,
        company
    });

    return res.status(200).json(reports);
};

export const exportPdf = async (req: Request, res: Response): Promise<void> => {
    const { initialDate, finalDate, company } = req.query as IndexQuery;
    const { companyId } = req.user;
  
    try {
        const reports = await ListGeneralReportService({
            companyId,
            initialDate,
            finalDate,
            company
        });
    
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
                    <h4>ID da Empresa: ${company}</h4>
                    <h4>Data Inicial: ${initialDate}</h4>
                    <h4>Data Final: ${finalDate}</h4>
                    <table style="display: block; border-collapse: collapse; width: 1200px; table-layout: fixed;">
                        <thead>
                            <tr>
                                <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Nome da Empresa</td>
                                <td style="border: 1px solid black; text-align: center; min-width: 100px; max-width: 100px; font-weight: bold">Importados</td>
                                <td style="border: 1px solid black; text-align: center; min-width: 100px; max-width: 100px; font-weight: bold">Enviados</td>
                                <td style="border: 1px solid black; text-align: center; min-width: 100px; max-width: 100px; font-weight: bold">Entregues</td>
                                <td style="border: 1px solid black; text-align: center; min-width: 100px; max-width: 100px; font-weight: bold">Lidos</td>
                                <td style="border: 1px solid black; text-align: center; min-width: 100px; max-width: 100px; font-weight: bold">Erros</td>
                                <td style="border: 1px solid black; text-align: center; min-width: 100px; max-width: 100px; font-weight: bold">Interações</td>
                                <td style="border: 1px solid black; text-align: center; min-width: 100px; max-width: 100px; font-weight: bold">Sem Whatsapp</td>
                                <td style="border: 1px solid black; text-align: center; min-width: 100px; max-width: 100px; font-weight: bold">Mensagens Trafegadas Enviadas</td>
                                <td style="border: 1px solid black; text-align: center; min-width: 100px; max-width: 100px; font-weight: bold">Mensagens Trafegadas Recebidas</td>
                            <tr>
                        </thead>
                        <tbody>
                            ${getReportRows(reports)}
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
    } catch (err) {
        throw new AppError("ERR_ON_CREATING_PDF");
    }
};
  
const getReportRows = (reports: any[]) => {
    let rows = "";

    for (const report of reports) {
        const company_name = report.name || "";
        const register_total = report["registers.total"] || 0;
        const register_sent = report["registers.sent"] || 0;
        const register_delivered = report["registers.delivered"] || 0;
        const register_read = report["registers.read"] || 0;
        const register_error = report["registers.error"] || 0;
        const register_interaction = report["registers.interaction"] || 0;
        const register_no_whats = report["registers.noWhats"] || 0;
        const message_sent = report.message_sent || 0;
        const message_received = report.message_received || 0;

        rows += `
            <tr>
                <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${company_name}</td>
                <td style="border: 1px solid black; text-align: center; min-width: 100px; max-width: 100px; padding: 5px; word-wrap: break-word">${register_total}</td>
                <td style="border: 1px solid black; text-align: center; min-width: 100px; max-width: 100px; padding: 5px; word-wrap: break-word">${register_sent}</td>
                <td style="border: 1px solid black; text-align: center; min-width: 100px; max-width: 100px; padding: 5px; word-wrap: break-word">${register_delivered}</td>
                <td style="border: 1px solid black; text-align: center; min-width: 100px; max-width: 100px; padding: 5px; word-wrap: break-word">${register_read}</td>
                <td style="border: 1px solid black; text-align: center; min-width: 100px; max-width: 100px; padding: 5px; word-wrap: break-word">${register_error}</td>
                <td style="border: 1px solid black; text-align: center; min-width: 100px; max-width: 100px; padding: 5px; word-wrap: break-word">${register_interaction}</td>
                <td style="border: 1px solid black; text-align: center; min-width: 100px; max-width: 100px; padding: 5px; word-wrap: break-word">${register_no_whats}</td>
                <td style="border: 1px solid black; text-align: center; min-width: 100px; max-width: 100px; padding: 5px; word-wrap: break-word">${message_sent}</td>
                <td style="border: 1px solid black; text-align: center; min-width: 100px; max-width: 100px; padding: 5px; word-wrap: break-word">${message_received}</td>
            </tr>
        `;
    }
  
    return rows;
}
  