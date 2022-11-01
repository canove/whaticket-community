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

const handleParams = (body: any, params: any) => {
  let value = body;
  let newParams = [];

  for (let i = 0; i < params.length; i++) {
    let index = params[i].match(/\[(.*?)\]/);

    if (index) {
      if (params[i].replace(index[0], "")) newParams.push(params[i].replace(index[0], ""));
      newParams.push(index[1]);
    } else {
      newParams.push(params[i]);
    }
  }

  for (let i = 0; i < newParams.length; i++) {
    if (value === undefined) {
      return false;
    }

    if (Array.isArray(value)) {
      //   let array = [];
      //   for (const item of value) {
      //     array.push(item[params[i]]);
      // }
  
      value = value[newParams[i]];
    } else {
      value = value[newParams[i]];
    }
  }

  return value;
}

const processNode = async (node: any, body: any) => {
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
      let dinamicParam1 = [];
      if (params1) dinamicParam1 = params1[1].trim().split(".");

      let var1 = param1;

      if (dinamicParam1.length === 1) {
        var1 = body[dinamicParam1[0]];

        if (condition === "exists") return var1 ? true : false;
        if (condition === "not_exists") return var1 ? false : true;
      } else if (dinamicParam1.length >= 2) {
        var1 = handleParams(body, dinamicParam1);

        if (condition === "exists") return var1 ? true : false;
        if (condition === "not_exists") return var1 ? false : true;
      }

      if (!var1) return false;
      
      if (!param2) return false;

      const params2 = param2.match(/\{{(.*?)\}}/);
      let dinamicParam2 = [];
      if (params2) dinamicParam2 = params2[1].trim().split(".");

      let var2 = param2;

      if (dinamicParam2.length === 1) {
        var1 = body[dinamicParam2[0]];
      } else if (dinamicParam2.length >= 2) {
        var2 = handleParams(body, dinamicParam2);
      }

      if (!var1) return false;

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

  if (node.type === "save-variable-node") {
    let variables = jsonStringToObj(node.save);

    if (!variables) return {};

    Object.keys(variables).find((variableName: any) => {
      const params = variables[variableName].match(/\{{(.*?)\}}/);

      if (!params) {
        const param = variables[variableName];

        variables[variableName] = param;
      } else {
        const treatedParam = params[1].trim().split(".");
        const param = handleParams(body, treatedParam);

        variables[variableName] = param;
      }
    });

    return { variables }
  }

  return {};
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
  if(!sessionId) {
    return {
      status: "SESSION_ID_IS_REQUIRED"
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

  const session = await FlowsSessions.findOne({
    where: {
      updatedAt: { [Op.between]: [+subHours(new Date(), 2), +new Date()] },
      companyId,
      id: sessionId,
      nodeId: { [Op.ne]: null },
      flowId: flowNodes.flowId,
    }
  });

  const currentNode = session ? session.nodeId : flowNodeId;

  const variables = (session && session.variables) ? JSON.parse(session.variables) : {};

  const nodesOBJ = JSON.parse(flowNodes.json);

  const links = nodesOBJ.layers[0].models;
  const nodes = nodesOBJ.layers[1].models;

  const node = nodes[currentNode];

  if (!node) {
    throw new AppError("ERR_NO_NODE", 404);
  }

  const nodeResponse = await processNode(node, { ...body, variables });

  const linkId = getLink("out", node, nodeResponse);
  const link = links[linkId];

  if (!link) {
    return {
      ...nodeResponse, 
      sessionId: session.id,
      status: "IN_FLOW",
    };
  }

  const { target } = link;
  const nextNode = nodes[target];

  if (!session) {
    await FlowsSessions.create({
      id: sessionId,
      nodeId: nextNode.id,
      companyId,
      flowId: flowNodes.flowId
    });
  } else {
    await session.update({
      nodeId: nextNode.id,
    });
  }

  if (nextNode.type === "end-node") {
    await session.update({
      nodeId: null,
      variables: null
    });
  }

  if (node.type === "start-node") {
    return await StartFlowService({
      flowNodeId,
      sessionId,
      companyId,
      body: { ...body, variables },
    })
  }

  if (node.type === "conditional-node") {
    return await StartFlowService({
      flowNodeId,
      sessionId,
      companyId,
      body: { ...body, variables }
    });
  }

  if (node.type === "request-node") {
    return await StartFlowService({
      flowNodeId,
      sessionId,
      companyId,
      body: { ...nodeResponse, ...body, variables }
    });
  }

  if (node.type === "save-variable-node") {
    const variablesOBJ = { ...nodeResponse.variables, ...variables }

    await session.update({
      variables: JSON.stringify(variablesOBJ),
    })

    return await StartFlowService({
      flowNodeId,
      sessionId,
      companyId,
      body: { ...body, variables: { ...variables, ...nodeResponse.variables } }
    });
  }

  return { 
    ...nodeResponse, 
    sessionId,
    status: "IN_FLOW",
  };
};

export default StartFlowService;
