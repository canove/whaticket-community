/* eslint-disable */
import { Op } from "sequelize";
import FlowsNodes from "../../database/models/FlowsNodes";
import AppError from "../../errors/AppError";

const StartFlowService = async (flowNodeId: string): Promise<any> => {
  const flowNodes = await FlowsNodes.findOne({
    where: {
      json: {
        [Op.like]: `%${flowNodeId}%`
      }
    }
  });

  // SELECT * FROM whaticket.FlowsNodes WHERE json LIKE '%65073c0b-6c5b-4548-ba40-906b44c05581%';

  if (!flowNodes) {
    throw new AppError("ERR_NO_FLOW_FOUND", 404);
  }

  if (!flowNodes.json) {
    throw new AppError("ERR_NO_NODES", 404);
  }

  const nodesOBJ = JSON.parse(flowNodes.json);

  const links = nodesOBJ.layers[0].models;
  const nodes = nodesOBJ.layers[1].models;

  const firstNode = nodes[flowNodeId];
  const { ports } = firstNode;

  let link = null;

  for (const port of ports) {
    if (port.name === "out") {
      link = port.links[0];
    }
  }

  const firstLink = links[link];

  const { target } = firstLink;

  const nextNode = nodes[target];

  const messageJSON = nextNode.data.content;
  const messageOBJ = JSON.parse(messageJSON);

  return { links, nodes, firstNode, firstLink, nextNode, messageOBJ };
};

export default StartFlowService;
