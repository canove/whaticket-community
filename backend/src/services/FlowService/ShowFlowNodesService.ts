import { Op } from "sequelize";

import Flows from "../../database/models/Flows";
import FlowsNodes from "../../database/models/FlowsNodes";

import AppError from "../../errors/AppError";

const ShowFlowNodesService = async (
  id: string,
  companyId: number
): Promise<Flows> => {
  const flow = await Flows.findOne({
    where: { id, companyId },
    include: [
      {
        model: FlowsNodes,
        as: "nodes",
        where: { json: { [Op.ne]: null } },
        required: false
      }
    ]
  });

  if (!flow) {
    throw new AppError("ERR_NO_FLOW_FOUND", 404);
  }

  return flow;
};

export default ShowFlowNodesService;
