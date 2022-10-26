/* eslint-disable */
import { v4 as uuidv4 } from "uuid";
import { subHours } from "date-fns";
import { Op } from "sequelize";
import FlowsNodes from "../../database/models/FlowsNodes";
import AppError from "../../errors/AppError";
import FlowsSessions from "../../database/models/FlowsSessions";
import axios from "axios";

interface Request {
  flowNodeId?: string;
  sessionId?: string;
  companyId: number;
  body?: any;
}

const jsonStringToObj = (json: any) => {
  try {
      const responseObj = JSON.parse(json);
      return responseObj;
  } catch {
      return false;
  }
}

const processNode = async (node: any, body: any) => {
  if (node.type === "start-node") {
    return {};
  }

  if (node.type === "chat-node") {
    const messageJSON = node.data.content;
    const messageOBJ = JSON.parse(messageJSON);

    return { message: messageOBJ };
  }

  if (node.type === "conditional-node") {
    const response = Object.keys(node.conditions).find((conditionId: any) => {
      const conditionExpression = node.conditions[conditionId];

      const param1 = conditionExpression.param1 ? conditionExpression.param1 : "";
      const param2 = conditionExpression.param2 ? conditionExpression.param2 : "";
      const condition = conditionExpression.condition ? conditionExpression.condition : "";

      if (!param1 || !condition) return false;

      const params1 = param1.match(/\{{(.*?)\}}/);
      let dinamicParam1 = "";
      if (params1) dinamicParam1 = params1[1];
      const var1 = dinamicParam1 ? body[dinamicParam1] : param1;
      
      if (condition === "exists") return body[dinamicParam1] ? true : false;
      if (condition === "not_exists") return body[dinamicParam1] ? false : true;
      
      if (!param2) return false;

      const params2 = param2.match(/\{{(.*?)\}}/);
      let dinamicParam2 = "";
      if (params2) dinamicParam2 = params2[1];
      const var2 = dinamicParam2 ? body[dinamicParam2] : param2;

      if (condition === "equals") return (var1 == var2);
      if (condition === "not_equal") return (var1 != var2);
      if (condition === "greater_than") return (var1 > var2);
      if (condition === "greater_than_or_equal") return (var1 >= var2);
      if (condition === "contains") return (var1.indexOf(var2));
      if (condition === "not_contains") return (!var1.indexOf(var2));
      if (condition === "less_than") return (var1 < var2);
      if (condition === "less_than_or_equal") return (var1 <= var2);
    });

    return { condition: response ? response : "ELSE" };
  }

  if (node.type === "request-node") {
    let nodeHeader = jsonStringToObj(node.header);
    let nodeBody = jsonStringToObj(node.body);

    if (!nodeHeader) {
      nodeHeader = "";
    }

    if (node.method === "POST" || !nodeBody) {
      nodeBody = "";
    }

    let response: any;
    let error: any;

    await axios({
        method: node.method,
        url: node.url,
        headers: {
            ...nodeHeader
        },
        data: {
            ...nodeBody
        }
    })
    .then(res => {
        response = res.data;
    })
    .catch(err => {
        error = err;
    });

    if (response) {
      return { response };
    } else {
      return { error };
    }
  }
}

const getLink = (name: string, node: any, nodeResponse: any) => {
  if (node.type === "conditional-node") {
    const portName = `${name}-${nodeResponse.condition.toLowerCase()}`;
    for (const port of node.ports) {
      if (port.name === portName) {
        return port.links[0];
      }
    }
  }

  if (node.type === "request-node") {
    const portName = `${name}-${nodeResponse.response ? "2xx" : "err"}`;
    for (const port of node.ports) {
      if (port.name === portName) {
        return port.links[0];
      }
    }
  }

  for (const port of node.ports) {
    if (port.name === name) {
      return port.links[0];
    }
  }
}

const StartFlowService = async ({
  flowNodeId,
  sessionId,
  companyId,
  body
}: Request): Promise<any> => {
  let session = null;
  let currentNode = null;

  if (sessionId) {
    session = await FlowsSessions.findOne({
      where: {
        updatedAt: {
          [Op.between]: [+subHours(new Date(), 2), +new Date()]
        },
        companyId,
        id: sessionId
      }
    });

    currentNode = session.nodeId;
  } else {
    currentNode = flowNodeId;
  }

  if (currentNode === null) {
    return {
      message: "END_OF_THE_FLOW",
      sessionId: session.id
    }
  }

  const flowNodes = await FlowsNodes.findOne({
    where: {
      json: {
        [Op.like]: `%${flowNodeId}%`
      },
      companyId
    }
  });

  if (!flowNodes) {
    throw new AppError("ERR_NO_FLOW_FOUND", 404);
  }

  if (!flowNodes.json) {
    throw new AppError("ERR_NO_NODES", 404);
  }

  const nodesOBJ = JSON.parse(flowNodes.json);

  const links = nodesOBJ.layers[0].models;
  const nodes = nodesOBJ.layers[1].models;

  const node = nodes[currentNode];

  if (!node) {
    throw new AppError("ERR_NO_NODE", 404);
  }

  const nodeResponse = await processNode(node, body);

  const linkId = getLink("out", node, nodeResponse);
  const link = links[linkId];

  if (!link) {
    await session.update({
      nodeId: null,
    });

    return {
      ...nodeResponse, 
      sessionId: session.id
    };
  }

  const { target } = link;
  const nextNode = nodes[target];

  if (!session) {
    session = await FlowsSessions.create({
      id: uuidv4(),
      nodeId: nextNode.id,
      companyId
    });
  } else {
    await session.update({
      nodeId: nextNode.id,
    });
  }

  if (node.type === "conditional-node") {
    return await StartFlowService({
      flowNodeId,
      sessionId,
      companyId,
      body
    });
  }

  if (node.type === "request-node") {
    return await StartFlowService({
      flowNodeId,
      sessionId,
      companyId,
      body: { ...nodeResponse.response }
    });
  }

  return { 
    ...nodeResponse, 
    sessionId: session ? session.id : "END_OF_THE_FLOW"
  };
};

export default StartFlowService;
