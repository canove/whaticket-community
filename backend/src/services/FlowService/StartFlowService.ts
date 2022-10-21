import { Op } from "sequelize";
import FlowsNodes from "../../database/models/FlowsNodes";
import AppError from "../../errors/AppError";

const StartFlowService = async (flowNodeId: string): Promise<FlowsNodes> => {
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

  return flowNodes;
};

export default StartFlowService;
