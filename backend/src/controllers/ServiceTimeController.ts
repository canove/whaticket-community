import { Request, Response } from "express";
import GetClientResponseTimeService from "../services/TicketHistoricsServices/GetClientResponseTimeService";
import ListQueueTicketHistoricService from "../services/TicketHistoricsServices/ListQueueTicketHistoricService";
import ListUserTicketHistoricService from "../services/TicketHistoricsServices/ListUserTicketHistoricService";

const fs = require("fs");
const pdf = require("pdf-creator-node");
const pdf2base64 = require("pdf-to-base64");

type IndexQuery = {
  tmaType: string;
  initialDate: string;
  finalDate: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tmaType, initialDate, finalDate } = req.query as IndexQuery;
  const { companyId } = req.user;

  let reports = [];

  if (tmaType === "queue") {
    reports = await ListQueueTicketHistoricService({ companyId, initialDate, finalDate });
  }

  if (tmaType === "user") {
    reports = await ListUserTicketHistoricService({ companyId, initialDate, finalDate });
  }

  if (tmaType === "client") {
    const response = await GetClientResponseTimeService({ companyId, initialDate, finalDate });
    reports.push(response);
  }

  return res.status(200).json(reports);
};

export const exportPDF = async (req: Request, res: Response): Promise<void> => {
  const { tmaType, initialDate, finalDate } = req.query as IndexQuery;
  const { companyId } = req.user;

  let reports = [];
  let header = "";

  if (tmaType === "queue") {
    reports = await ListQueueTicketHistoricService({ companyId, initialDate, finalDate });

    header = `
      <tr>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Fila</td>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Tempo de Atendimento</td>
      </tr>
    `;
  }

  if (tmaType === "user") {
    reports = await ListUserTicketHistoricService({ companyId, initialDate, finalDate });

    header = `
      <tr>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Usuário</td>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Tempo de Atendimento</td>
      </tr>
    `;
  }

  if (tmaType === "client") {
    const response = await GetClientResponseTimeService({ companyId, initialDate, finalDate });
    reports.push(response);

    header = `
      <tr>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; font-weight: bold">Tempo de Resposta</td>
      </tr>
    `;
  }
  
  const title = {
    "user": "Usuário",
    "queue": "Fila",
    "client": "Cliente",
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>PDF - Relatório</title>
      </head>
      <style>
        html { zoom: 0.7; }
      </style>
      <body>
        <h1>Relatório do Tempo de Atendimento</h1>
        <h3>Tipo: ${title[tmaType]}</h3>
        <table style="display: block; border-collapse: collapse; width: 1200px; table-layout: fixed;">
          <thead>
            ${header}
          </thead>
          <tbody>
            ${getBodyData(reports, tmaType)}
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

const getBodyData = (reports, tmaType) => {
  let text = "";

  if (tmaType === "client") {
    const serviceTime = formatTime(reports[0]);

    text += `
      <tr>
        <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${serviceTime}</td>
      </tr>
    `;
  }

  if (tmaType === "queue" || tmaType === "user") {
    for (const report of reports) {
      const serviceTime = processHistorics(report.historics);

      text += `
        <tr>
          <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${report.name}</td>
          <td style="border: 1px solid black; text-align: center; min-width: 120px; max-width: 120px; padding: 5px; word-wrap: break-word">${serviceTime}</td>
        </tr>
      `;
    }
  }

  return text;
}

export const exportCSV = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const { tmaType, initialDate, finalDate } = req.query as IndexQuery;
  const { companyId } = req.user;

  let reports = [];
  let rows = [];

  if (tmaType === "queue") {
    reports = await ListQueueTicketHistoricService({ companyId, initialDate, finalDate });

    rows.push(["Fila", "Tempo de Atendimento"]);
  }

  if (tmaType === "user") {
    reports = await ListUserTicketHistoricService({ companyId, initialDate, finalDate });

    rows.push(["Usuário", "Tempo de Atendimento"]);
  }

  if (tmaType === "client") {
    const response = await GetClientResponseTimeService({ companyId, initialDate, finalDate });
    reports.push(response);

    rows.push(["Tempo de Resposta"]);

    const serviceTime = formatTime(reports[0]);

    const columns = [];
    columns.push(serviceTime);
    rows.push(columns);
  }

  if (tmaType === "queue" || tmaType === "user") {
    for (const report of reports) {
      const serviceTime = processHistorics(report.historics);

      const columns = [];
      columns.push(report.name);
      columns.push(serviceTime);
      rows.push(columns);
    }
  }

  let csvContent = "\uFEFF";

  rows.forEach(rowArray => {
    const row = rowArray.join(";");
    csvContent += `${row}\r\n`;
  });

  return res.status(200).json(csvContent);
};

const formatTime = (milliseconds) => {
  let seconds = milliseconds / 1000;

  let minutes = Math.floor(seconds / 60);
  seconds = Math.floor((seconds / 60 - minutes) * 60);

  let hours = Math.floor(minutes / 60);
  minutes = Math.floor((minutes / 60 - hours) * 60);

  let secondsString = seconds.toString();
  let minutesString = minutes.toString();
  let hoursString = hours.toString();

  if (secondsString.length === 1) {
    secondsString = `0${secondsString}`;
  }

  if (minutesString.length === 1) {
    minutesString = `0${minutesString}`;
  }

  if (hoursString.length === 1) {
    hoursString = `0${hoursString}`;
  }

  if (hoursString === "NaN" || minutesString === "NaN" || secondsString === "NaN") return "00:00:00";

  return `${hoursString}:${minutesString}:${secondsString}`;
};

const getServiceTime = (hists) => {
  let currentID = 0;

  const initialHist = hists.find(h => h.id > currentID);
  currentID = initialHist.id;

  const finalHist = hists.find(h => h.id > currentID);

  const createdAt = initialHist.createdAt;
  const finalizedAt = finalHist.createdAt;

  if (!createdAt || !finalizedAt) return null;

  const createdAtDate = new Date(createdAt);
  const finalizedAtDate = new Date(finalizedAt);

  const serviceTime = finalizedAtDate.getTime() - createdAtDate.getTime();

  return serviceTime;
}

const processHistorics = (historics = []) => {    
  if (!historics || historics.length === 0) return "--:--:--";

  let tickets = [];

  for (const historic of historics) {
    const ticketIndex = tickets.findIndex(ticket => ticket.ticketId === historic.ticketId);

    if (ticketIndex === -1) {
      tickets.push({
        ticketId: historic.ticketId,
        historics: [historic]
      });
    } else {
      const newTicket = {
        ticketId: tickets[ticketIndex].ticketId,
        historics: [...tickets[ticketIndex].historics, historic]
      }

      tickets[ticketIndex] = newTicket;
    }
  }

  const ticketsServiceTime = [];

  for (const ticket of tickets) {
    const hists = ticket.historics;

    if (hists.length < 2) continue;

    if (hists.length === 2) {
      const serviceTime = getServiceTime(hists);

      if (serviceTime === null) continue;

      ticketsServiceTime.push(serviceTime);
      continue;
    }

    if (hists.length > 2) {
      const histsArray = [];

      for (let i = 0; i < hists.length; i += 2) {
        histsArray.push(hists.slice(i, i + 2));
      }

      for (const newHists of histsArray) {
        if (newHists.length % 2 !== 0) continue;

        const serviceTime = getServiceTime(hists);

        ticketsServiceTime.push(serviceTime);
        continue;
      }
    }
  }

  let itemCount = 0;
  let milliseconds = 0;
  for (const time of ticketsServiceTime) {
    milliseconds += time;
    itemCount++;
  }

  const averageServiceTime = milliseconds / itemCount;

  return formatTime(averageServiceTime);
}
