import { Op } from "sequelize";
import Flow from "../../models/Flow";
import FlowNode from "../../models/FlowNode";
import FlowExecution from "../../models/FlowExecution";
import KeywordService from "./KeywordService";

interface UpdateFlowRequest {
  flowId: number;
  tenantId: number;
  name?: string;
  description?: string;
  triggerType?: "keyword" | "intent" | "event" | "manual";
  triggerConfig?: object;
  status?: "draft" | "active" | "archived";
  isActive?: boolean;
  nodes?: any[];
}

class UpdateFlowService {
  public async execute({
    flowId,
    tenantId,
    name,
    description,
    triggerType,
    triggerConfig,
    status,
    isActive,
    nodes
  }: UpdateFlowRequest): Promise<Flow> {
    try {
      // Busca o fluxo
      const flow = await Flow.findOne({
        where: { id: flowId, tenantId },
        include: [FlowNode]
      });

      if (!flow) {
        throw new Error("Fluxo não encontrado");
      }

      // Validações
      if (name && name.trim().length === 0) {
        throw new Error("Nome do fluxo não pode estar vazio");
      }

      // Verifica se não há outro fluxo com o mesmo nome
      if (name && name.trim() !== flow.name) {
        const existingFlow = await Flow.findOne({
          where: {
            tenantId,
            name: name.trim(),
            id: { [Op.ne]: flowId }
          }
        });

        if (existingFlow) {
          throw new Error("Já existe um fluxo com esse nome");
        }
      }

      // Valida tipo de gatilho se fornecido
      if (triggerType && !["keyword", "intent", "event", "manual"].includes(triggerType)) {
        throw new Error("Tipo de gatilho inválido");
      }

      // Valida configuração de keywords se for o caso
      if (triggerType === "keyword" && triggerConfig) {
        const validation = KeywordService.validateConfig(triggerConfig as any);
        if (!validation.valid) {
          throw new Error(`Configuração de keywords inválida: ${validation.errors.join(", ")}`);
        }
      }

      // Valida se pode ser ativado
      if ((status === "active" || isActive === true) && nodes) {
        const hasStartNode = nodes.some(node => node.type === "start");
        if (!hasStartNode) {
          throw new Error("Fluxo deve ter um nó inicial para ser ativado");
        }
      } else if ((status === "active" || isActive === true) && flow.nodes) {
        const hasStartNode = flow.nodes.some(node => node.type === "start");
        if (!hasStartNode) {
          throw new Error("Fluxo deve ter um nó inicial para ser ativado");
        }
      }

      // Verifica se há execuções ativas ao arquivar
      if (status === "archived") {
        const activeExecutions = await FlowExecution.count({
          where: { flowId, status: "active" }
        });

        if (activeExecutions > 0) {
          throw new Error("Não é possível arquivar fluxo com execuções ativas");
        }
      }

      // Prepara dados para atualização
      const updateData: any = {};

      if (name !== undefined) {
        updateData.name = name.trim();
      }

      if (description !== undefined) {
        updateData.description = description?.trim();
      }

      if (triggerType !== undefined) {
        updateData.triggerType = triggerType;
      }

      if (triggerConfig !== undefined) {
        updateData.triggerConfig = triggerConfig;
      }

      if (status !== undefined) {
        updateData.status = status;
        // Atualiza isActive baseado no status
        if (status === "active") {
          updateData.isActive = true;
        } else {
          updateData.isActive = false;
        }
      } else if (isActive !== undefined) {
        updateData.isActive = isActive;
        // Atualiza status baseado no isActive
        if (isActive) {
          updateData.status = "active";
        } else if (flow.status === "active") {
          updateData.status = "draft";
        }
      }

      // Incrementa versão se houver mudanças significativas
      if (nodes || triggerType || triggerConfig) {
        updateData.version = flow.version + 1;
      }

      // Atualiza o fluxo
      await flow.update(updateData);

      // Atualiza nós se fornecidos
      if (nodes) {
        // Remove nós existentes
        await FlowNode.destroy({ where: { flowId } });

        // Cria novos nós se fornecidos
        if (nodes.length > 0) {
          await Promise.all(
            nodes.map(async (nodeData: any) => {
              return await this.createFlowNode(flowId, nodeData);
            })
          );
        }
      }

      // Retorna fluxo atualizado com nós
      const updatedFlow = await Flow.findByPk(flowId, {
        include: [FlowNode]
      });

      console.log(`Fluxo ${flowId} atualizado com sucesso`);
      return updatedFlow!;
    } catch (error) {
      console.error("Erro ao atualizar fluxo:", error);
      throw error;
    }
  }

  /**
   * Atualiza apenas o status ativo/inativo
   */
  public async toggleActive(
    flowId: number,
    tenantId: number,
    isActive: boolean
  ): Promise<Flow> {
    const flow = await Flow.findOne({
      where: { id: flowId, tenantId },
      include: [FlowNode]
    });

    if (!flow) {
      throw new Error("Fluxo não encontrado");
    }

    // Se está ativando, valida se tem nó inicial
    if (isActive) {
      const hasStartNode = flow.nodes?.some(node => node.type === "start");
      if (!hasStartNode) {
        throw new Error("Fluxo deve ter um nó inicial para ser ativado");
      }
    }

    await flow.update({
      isActive,
      status: isActive ? "active" : "draft"
    });

    return flow;
  }

  /**
   * Atualiza apenas os nós do fluxo
   */
  public async updateNodes(
    flowId: number,
    tenantId: number,
    nodes: any[]
  ): Promise<Flow> {
    const flow = await Flow.findOne({
      where: { id: flowId, tenantId }
    });

    if (!flow) {
      throw new Error("Fluxo não encontrado");
    }

    // Remove nós existentes
    await FlowNode.destroy({ where: { flowId } });

    // Cria novos nós
    if (nodes.length > 0) {
      await Promise.all(
        nodes.map(async (nodeData: any) => {
          return await this.createFlowNode(flowId, nodeData);
        })
      );

      // Incrementa versão
      await flow.update({ version: flow.version + 1 });
    }

    // Retorna fluxo atualizado
    return await Flow.findByPk(flowId, { include: [FlowNode] })!;
  }

  /**
   * Cria um nó do fluxo
   */
  private async createFlowNode(flowId: number, nodeData: any): Promise<FlowNode> {
    // Valida tipo do nó
    const validTypes = ["start", "send_text", "send_media", "wait_input", "condition", "webhook", "ai_node", "end"];
    if (!validTypes.includes(nodeData.type)) {
      throw new Error(`Tipo de nó inválido: ${nodeData.type}`);
    }

    return await FlowNode.create({
      flowId,
      nodeId: nodeData.id || `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: nodeData.type,
      label: nodeData.data?.label,
      config: nodeData.data?.config || {},
      data: nodeData.data || {},
      positionX: nodeData.position?.x || 0,
      positionY: nodeData.position?.y || 0,
      sourcePosition: nodeData.sourcePosition || "right",
      targetPosition: nodeData.targetPosition || "left",
      width: nodeData.style?.width,
      height: nodeData.style?.height
    });
  }

  /**
   * Duplica um fluxo
   */
  public async duplicate(
    flowId: number,
    tenantId: number,
    newName?: string
  ): Promise<Flow> {
    const originalFlow = await Flow.findOne({
      where: { id: flowId, tenantId },
      include: [FlowNode]
    });

    if (!originalFlow) {
      throw new Error("Fluxo não encontrado");
    }

    const name = newName || `${originalFlow.name} - Cópia`;

    // Verifica se já existe fluxo com esse nome
    const existingFlow = await Flow.findOne({
      where: { tenantId, name }
    });

    if (existingFlow) {
      throw new Error("Já existe um fluxo com esse nome");
    }

    // Cria cópia do fluxo
    const newFlow = await Flow.create({
      tenantId,
      name,
      description: originalFlow.description,
      triggerType: originalFlow.triggerType,
      triggerConfig: originalFlow.triggerConfig,
      status: "draft",
      version: 1,
      isActive: false
    });

    // Cria cópia dos nós
    if (originalFlow.nodes && originalFlow.nodes.length > 0) {
      await Promise.all(
        originalFlow.nodes.map(async (node) => {
          return await FlowNode.create({
            flowId: newFlow.id,
            nodeId: `${node.nodeId}-copy`,
            type: node.type,
            label: node.label,
            config: node.config,
            data: node.data,
            positionX: node.positionX,
            positionY: node.positionY,
            sourcePosition: node.sourcePosition,
            targetPosition: node.targetPosition,
            width: node.width,
            height: node.height
          });
        })
      );
    }

    // Retorna fluxo duplicado completo
    return await Flow.findByPk(newFlow.id, { include: [FlowNode] })!;
  }
}

export default new UpdateFlowService();