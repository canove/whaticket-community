import FlowNode from "../models/FlowNode";

class AIAgentService {
  public static async processNode(node: FlowNode): Promise<any> {
    // Placeholder for AI processing logic.
    // In a real implementation this would call an external AI service.
    return node.config;
  }
}

export default AIAgentService;
