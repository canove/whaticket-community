/* eslint-disable */
import { v4 as uuidv4 } from "uuid";
import { subHours } from "date-fns";
import { Op } from "sequelize";
import FlowsNodes from "../../database/models/FlowsNodes";
import AppError from "../../errors/AppError";
import FlowsSessions from "../../database/models/FlowsSessions";
import axios from "axios";
import Contact from "../../database/models/Contact";
import Ticket from "../../database/models/Ticket";
import FileRegister from "../../database/models/FileRegister";
import Queue from "../../database/models/Queue";

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
      value = value[newParams[i]];
    } else {
      value = value[newParams[i]];
    }
  }

  return value;
}

const processNode = async (node: any, session: any, body: any) => {
  if (node.type === "chat-node") {
    const messageJSON = node.data.content;
    const messageOBJ = JSON.parse(messageJSON);

    return { message: messageOBJ };
  }

  if (node.type === "conditional-node") {
    if (!node.conditions) return { condition: "ELSE" };

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

    const variablesOBJ = { ...variables, ...body.variables }

    await session.update({
      variables: JSON.stringify(variablesOBJ),
    })

    return { variables }
  }

  if (node.type === "transfer-queue-node") {
    // const contact = await Contact.findOne({
    //   where: {
    //     number: session.id,
    //     companyId: session.companyId
    //   }
    // });

    // const ticket = await Ticket.findOne({
    //   where: {
    //     contactId: contact.id,
    //     companyId: session.companyId
    //   }
    // })

    // await ticket.update({
    //   status: "pending",
    //   queueId: node.queueId
    // });

    const queue = await Queue.findOne({
      where: { id: node.queueId }
    });

    await session.update({
      nodeId: null,
      variables: null
    });

    return {
      queueName: queue.name,
      queueId: node.queueId,
      type: "TRANSFER_QUEUE"
    };
  }

  if (node.type === "database-condition-node") {
    const fileRegister = await FileRegister.findOne({
      where: {
        phoneNumber: { [Op.like]: `%${session.id.substr(5,8)}%` },
        companyId: session.companyId,
        processedAt: { [Op.ne]: null }
      },
      order: [["createdAt", "DESC"]]
    });

    if (!fileRegister) return { condition: false };

    const variable = fileRegister[node.variable];

    if (node.condition === "complete") {
      return { condition: variable === body.text };
    }

    if (node.condition === "last") {
      const variableLast = variable.substring(variable.length - node.charactersNumber);
      return { condition: variableLast === body.text };
    }

    if (node.condition === "start") {
      const variableStart = variable.substring(0, node.charactersNumber);
      return { condition: variableStart === body.text };
    }
  }

  if (node.type === "database-node") {
    const fileRegister = await FileRegister.findOne({
      where: {
        phoneNumber: { [Op.like]: `%${session.id.substr(5,8)}%` },
        companyId: session.companyId,
        processedAt: { [Op.ne]: null }
      },
      order: [["updatedAt", "DESC"]]
    });

    if (!fileRegister) return { database: { value: "", type: "text" } };

    const variable = fileRegister[node.variable] ? fileRegister[node.variable] : "";

    return {
      message: {
        blocks: [
          {
            text: variable,
            type: node.varType
          }
        ]
      }
    };
  }

  if (node.type === "message-condition-node") {
    if (!node.conditions) return { condition: "ELSE" }

    const response = Object.keys(node.conditions).find((conditionId: any) => {
      const conditionExpression = node.conditions[conditionId];

      if (!conditionExpression) return true;

      const texts = conditionExpression.replaceAll(" ", "").toLowerCase().split(",");

      for (const text of texts) {
        if (text === body.text.replaceAll(" ", "").toLowerCase()) return true;
      }
    });

    return { condition: response ? response : "ELSE" };
  }

  if (node.type === "multiple-messages-node") {
    const messages = [];

    const fileRegister = await FileRegister.findOne({
      where: {
        phoneNumber: session.id,
        companyId: session.companyId,
        processedAt: { [Op.ne]: null }
      },
      order: [["updatedAt", "DESC"]]
    });

    node.messages.map(message => {
      if (message.messageType === "text") {
        const newMessage = {
          blocks: [
            {
              text: message.messageContent,
              type: "text"
            }
          ]
        };

        messages.push(newMessage);

        return;
      }

      if (message.messageType === "database") {
        if (!fileRegister) {
          const newMessage = {
            blocks: [
              {
                text: "",
                type: "text"
              }
            ]
          };
  
          messages.push(newMessage);

          return;
        }
    
        const variable = fileRegister[message.messageContent] ? fileRegister[message.messageContent] : "";
    
        const newMessage = {
          blocks: [
            {
              text: variable,
              type: message.textType
            }
          ]
        };

        messages.push(newMessage);

        return;
      }
    });

    return { messages };
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

  if (node.type === "database-condition-node") {
    const portName = `${name}-${nodeResponse.condition.toString().toLowerCase()}`;
    for (const port of node.ports) {
      if (port.name === portName) {
        return port.links[0];
      }
    }
  }

  if (node.type === "message-condition-node") {
    const portName = `${name}-${nodeResponse.condition.toString().toLowerCase()}`;
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
      id:  { [Op.like]: `%${sessionId.substr(6,8)}%` },
      nodeId: { [Op.ne]: null },
      flowId: flowNodes.flowId,
    }
  });

  const currentNode = session?.nodeId ? session.nodeId : flowNodeId;

  const variables = (session && session.variables) ? JSON.parse(session.variables) : {};

  const nodesOBJ = JSON.parse(flowNodes.json);

  const links = nodesOBJ.layers[0].models;
  const nodes = nodesOBJ.layers[1].models;

  const node = nodes[currentNode];

  if (!node) {
    throw new AppError("ERR_NO_NODE", 404);
  }

  const nodeResponse = await processNode(node, session, { ...body, variables });

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
    return await StartFlowService({
      flowNodeId,
      sessionId,
      companyId,
      body: { ...body, variables: { ...variables, ...nodeResponse.variables } }
    });
  }

  if (node.type === "database-condition-node") {
    return await StartFlowService({
      flowNodeId,
      sessionId,
      companyId,
      body: { ...body, variables }
    });
  }

  // if (node.type === "database-node") {
  //   return await StartFlowService({
  //     flowNodeId,
  //     sessionId,
  //     companyId,
  //     body: { ...body, variables, ...nodeResponse }
  //   });
  // }

  if (node.type === "message-condition-node") {
    return await StartFlowService({
      flowNodeId,
      sessionId,
      companyId,
      body: { ...body, variables }
    });
  }

  return { 
    ...nodeResponse, 
    sessionId,
    status: "IN_FLOW",
  };
};

export default StartFlowService;
