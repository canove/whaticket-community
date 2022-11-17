import { Request, Response } from "express";

import ListNodeRegistersService from "../services/NodeRegistersServices/ListNodeRegistersService";

type IndexQuery = {
  phoneNumber: string;
  pageNumber: string;
  flow: string;
  response: string;
  nodeId: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { phoneNumber, pageNumber, flow, response, nodeId } =
    req.query as IndexQuery;
  const { companyId } = req.user;

  const reports = await ListNodeRegistersService({
    phoneNumber,
    pageNumber,
    companyId,
    flow,
    response,
    nodeId
  });

  return res.status(200).json(reports);
};

export const exportCsv = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { phoneNumber, pageNumber, flow, response, nodeId } =
    req.query as IndexQuery;

  const { companyId } = req.user;

  const { reports } = await ListNodeRegistersService({
    phoneNumber,
    pageNumber,
    companyId,
    flow,
    response,
    nodeId
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

  const rows = [
    ["Número", "Texto", "Resposta", "Id do Nó", "Fluxo", "Criado em"]
  ];

  reports.forEach(report => {
    const {
      phoneNumber: phoneNumberColumn,
      text: textColumn,
      response: responseColumn,
      nodeId: nodeIdColumn,
      flow: flowData
    } = report;
    const createdAt = formatDate(report.createdAt);
    const flowName = flowData.name;

    const columns = [];

    columns.push(phoneNumberColumn);
    columns.push(textColumn);
    columns.push(responseColumn);
    columns.push(nodeIdColumn);
    columns.push(flowName);
    columns.push(createdAt);

    rows.push(columns);
  });

  let csvContent = "data:text/csv;charset=utf-8,";
  rows.forEach(rowArray => {
    const row = rowArray.join(";");
    csvContent += `${row}\r\n`;
  });

  return res.status(200).json(csvContent);
};
