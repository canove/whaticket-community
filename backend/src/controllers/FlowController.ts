import { Request, Response } from "express";
import { Op } from "sequelize";
import Flow from "../models/Flow";
import FlowNode from "../models/FlowNode";
import FlowExecution from "../models/FlowExecution";
import FlowEngineService from "../services/FlowServices/FlowEngineService";
import KeywordService from "../services/FlowServices/KeywordService";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    profile: string;
    tenantId: number;
  };
}

/**
 * Lista todos os fluxos do tenant
 */
export const index = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { tenantId } = req.user;
    const { page = 1, limit = 10, status, search } = req.query;

    const where: any = { tenantId };

    // Filtro por status
    if (status) {
      where.status = status;
    }

    // Filtro por busca (nome ou descrição)
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const flows = await Flow.findAndCountAll({
      where,
      include: [
        {
          model: FlowNode,
          attributes: ["id", "type", "nodeId"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit)
    });

    // Adiciona estatísticas de execução para cada fluxo
    const flowsWithStats = await Promise.all(
      flows.rows.map(async (flow) => {
        const executions = await FlowExecution.count({
          where: { flowId: flow.id }
        });

        const activeExecutions = await FlowExecution.count({
          where: { flowId: flow.id, status: "active" }
        });

        return {
          ...flow.toJSON(),
          statistics: {
            totalExecutions: executions,
            activeExecutions,
            nodeCount: flow.nodes?.length || 0
          }
        };
      })
    );

    return res.json({
      flows: flowsWithStats,
      totalCount: flows.count,
      totalPages: Math.ceil(flows.count / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    console.error("Erro ao listar fluxos:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

/**
 * Cria um novo fluxo
 */
export const store = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { tenantId } = req.user;
    const {
      name,
      description,
      triggerType,
      triggerConfig,
      nodes = []
    } = req.body;

    // Validações básicas
    if (!name) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    if (triggerType && !["keyword", "intent", "event", "manual"].includes(triggerType)) {
      return res.status(400).json({ error: "Tipo de gatilho inválido" });
    }

    // Valida configuração de keywords se for o caso
    if (triggerType === "keyword" && triggerConfig) {
      const validation = KeywordService.validateConfig(triggerConfig);
      if (!validation.valid) {
        return res.status(400).json({
          error: "Configuração de keywords inválida",
          details: validation.errors
        });
      }
    }

    // Cria o fluxo
    const flow = await Flow.create({
      tenantId,
      name,
      description,
      triggerType: triggerType || "manual",
      triggerConfig,
      status: "draft",
      version: 1,
      isActive: false
    });

    // Cria os nós se fornecidos
    if (nodes.length > 0) {
      const createdNodes = await Promise.all(
        nodes.map(async (node: any) => {
          return await FlowNode.create({
            flowId: flow.id,
            nodeId: node.id,
            type: node.type,
            label: node.data?.label,
            config: node.data?.config || {},
            data: node.data || {},
            positionX: node.position?.x || 0,
            positionY: node.position?.y || 0,
            sourcePosition: node.sourcePosition,
            targetPosition: node.targetPosition,
            width: node.style?.width,
            height: node.style?.height
          });
        })
      );

      // Carrega fluxo completo com nós
      const fullFlow = await Flow.findByPk(flow.id, {
        include: [FlowNode]
      });

      return res.status(201).json(fullFlow);
    }

    return res.status(201).json(flow);
  } catch (error) {
    console.error("Erro ao criar fluxo:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

/**
 * Busca um fluxo específico
 */
export const show = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { tenantId } = req.user;
    const { flowId } = req.params;

    const flow = await Flow.findOne({
      where: { id: flowId, tenantId },
      include: [FlowNode]
    });

    if (!flow) {
      return res.status(404).json({ error: "Fluxo não encontrado" });
    }

    // Adiciona estatísticas
    const executions = await FlowExecution.count({
      where: { flowId: flow.id }
    });

    const activeExecutions = await FlowExecution.count({
      where: { flowId: flow.id, status: "active" }
    });

    const completedExecutions = await FlowExecution.count({
      where: { flowId: flow.id, status: "completed" }
    });

    return res.json({
      ...flow.toJSON(),
      statistics: {
        totalExecutions: executions,
        activeExecutions,
        completedExecutions,
        successRate: executions > 0 ? (completedExecutions / executions * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error("Erro ao buscar fluxo:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

/**
 * Atualiza um fluxo
 */
export const update = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { tenantId } = req.user;
    const { flowId } = req.params;
    const {
      name,
      description,
      triggerType,
      triggerConfig,
      nodes,
      status
    } = req.body;

    const flow = await Flow.findOne({
      where: { id: flowId, tenantId }
    });

    if (!flow) {
      return res.status(404).json({ error: "Fluxo não encontrado" });
    }

    // Se está mudando para ativo, valida se tem nó inicial
    if (status === "active" && nodes) {
      const hasStartNode = nodes.some((node: any) => node.type === "start");
      if (!hasStartNode) {
        return res.status(400).json({ error: "Fluxo deve ter um nó inicial para ser ativado" });
      }
    }

    // Valida configuração de keywords se mudou
    if (triggerType === "keyword" && triggerConfig) {
      const validation = KeywordService.validateConfig(triggerConfig);
      if (!validation.valid) {
        return res.status(400).json({
          error: "Configuração de keywords inválida",
          details: validation.errors
        });
      }
    }

    // Atualiza o fluxo
    await flow.update({
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(triggerType && { triggerType }),
      ...(triggerConfig !== undefined && { triggerConfig }),
      ...(status && { status }),
      ...(status === "active" && { isActive: true }),
      ...(status !== "active" && status && { isActive: false })
    });

    // Atualiza nós se fornecidos
    if (nodes) {
      // Remove nós antigos
      await FlowNode.destroy({ where: { flowId: flow.id } });

      // Cria novos nós
      await Promise.all(
        nodes.map(async (node: any) => {
          return await FlowNode.create({
            flowId: flow.id,
            nodeId: node.id,
            type: node.type,
            label: node.data?.label,
            config: node.data?.config || {},
            data: node.data || {},
            positionX: node.position?.x || 0,
            positionY: node.position?.y || 0,
            sourcePosition: node.sourcePosition,
            targetPosition: node.targetPosition,
            width: node.style?.width,
            height: node.style?.height
          });
        })
      );
    }

    // Retorna fluxo atualizado
    const updatedFlow = await Flow.findByPk(flow.id, {
      include: [FlowNode]
    });

    return res.json(updatedFlow);
  } catch (error) {
    console.error("Erro ao atualizar fluxo:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

/**
 * Deleta um fluxo
 */
export const destroy = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { tenantId } = req.user;
    const { flowId } = req.params;

    const flow = await Flow.findOne({
      where: { id: flowId, tenantId }
    });

    if (!flow) {
      return res.status(404).json({ error: "Fluxo não encontrado" });
    }

    // Verifica se há execuções ativas
    const activeExecutions = await FlowExecution.count({
      where: { flowId: flow.id, status: "active" }
    });

    if (activeExecutions > 0) {
      return res.status(400).json({
        error: "Não é possível deletar fluxo com execuções ativas",
        activeExecutions
      });
    }

    // Deleta fluxo (nós serão deletados em cascata)
    await flow.destroy();

    return res.json({ message: "Fluxo deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar fluxo:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

/**
 * Ativa/desativa um fluxo
 */
export const toggleActive = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { tenantId } = req.user;
    const { flowId } = req.params;
    const { isActive } = req.body;

    const flow = await Flow.findOne({
      where: { id: flowId, tenantId },
      include: [FlowNode]
    });

    if (!flow) {
      return res.status(404).json({ error: "Fluxo não encontrado" });
    }

    // Se está ativando, valida se tem nó inicial
    if (isActive) {
      const hasStartNode = flow.nodes?.some(node => node.type === "start");
      if (!hasStartNode) {
        return res.status(400).json({ error: "Fluxo deve ter um nó inicial para ser ativado" });
      }

      await flow.update({
        isActive: true,
        status: "active"
      });
    } else {
      await flow.update({
        isActive: false,
        status: "draft"
      });
    }

    return res.json({ message: `Fluxo ${isActive ? "ativado" : "desativado"} com sucesso` });
  } catch (error) {
    console.error("Erro ao alterar status do fluxo:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

/**
 * Duplica um fluxo
 */
export const duplicate = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { tenantId } = req.user;
    const { flowId } = req.params;
    const { name } = req.body;

    const originalFlow = await Flow.findOne({
      where: { id: flowId, tenantId },
      include: [FlowNode]
    });

    if (!originalFlow) {
      return res.status(404).json({ error: "Fluxo não encontrado" });
    }

    // Cria cópia do fluxo
    const newFlow = await Flow.create({
      tenantId,
      name: name || `${originalFlow.name} - Cópia`,
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
            nodeId: node.nodeId,
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

    // Retorna fluxo duplicado com nós
    const duplicatedFlow = await Flow.findByPk(newFlow.id, {
      include: [FlowNode]
    });

    return res.status(201).json(duplicatedFlow);
  } catch (error) {
    console.error("Erro ao duplicar fluxo:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

/**
 * Testa um fluxo manualmente
 */
export const test = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { flowId } = req.params;
    const { message = "teste", contactId } = req.body;

    // TODO: Implementar teste completo do fluxo
    // Por enquanto, apenas simula o teste

    return res.json({
      success: true,
      message: "Teste simulado com sucesso",
      steps: [
        { nodeId: 1, type: "start", result: "Fluxo iniciado" },
        { nodeId: 2, type: "send_text", result: "Mensagem enviada: Olá!" },
        { nodeId: 3, type: "wait_input", result: "Aguardando resposta do usuário" }
      ]
    });
  } catch (error) {
    console.error("Erro ao testar fluxo:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

/**
 * Lista execuções de um fluxo
 */
export const executions = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { tenantId } = req.user;
    const { flowId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const where: any = { flowId, tenantId };
    if (status) {
      where.status = status;
    }

    const executions = await FlowExecution.findAndCountAll({
      where,
      include: [
        { model: Flow, attributes: ["name"] },
        { model: FlowNode, attributes: ["type", "label"] }
      ],
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit)
    });

    return res.json({
      executions: executions.rows,
      totalCount: executions.count,
      totalPages: Math.ceil(executions.count / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    console.error("Erro ao listar execuções:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};
