import { Op } from "sequelize";
import Flow from "../../models/Flow";
import FlowNode from "../../models/FlowNode";
import FlowExecution from "../../models/FlowExecution";

interface ListFlowsRequest {
  tenantId: number;
  page?: number;
  limit?: number;
  status?: "draft" | "active" | "archived";
  search?: string;
  triggerType?: "keyword" | "intent" | "event" | "manual";
  sortBy?: "name" | "createdAt" | "updatedAt" | "executions";
  sortOrder?: "ASC" | "DESC";
}

interface FlowWithStats extends Flow {
  statistics: {
    totalExecutions: number;
    activeExecutions: number;
    completedExecutions: number;
    failedExecutions: number;
    nodeCount: number;
    successRate: number;
    lastExecution?: Date;
  };
}

class ListFlowsService {
  /**
   * Lista fluxos com paginação e filtros
   */
  public async execute({
    tenantId,
    page = 1,
    limit = 10,
    status,
    search,
    triggerType,
    sortBy = "createdAt",
    sortOrder = "DESC"
  }: ListFlowsRequest) {
    try {
      // Monta condições de busca
      const where: any = { tenantId };

      // Filtro por status
      if (status) {
        where.status = status;
      }

      // Filtro por tipo de gatilho
      if (triggerType) {
        where.triggerType = triggerType;
      }

      // Filtro por busca (nome ou descrição)
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      // Configuração de ordenação
      let orderBy: any = [[sortBy, sortOrder]];
      
      // Para ordenar por execuções, precisa de uma query mais complexa
      if (sortBy === "executions") {
        // Por enquanto, ordena por createdAt
        orderBy = [["createdAt", sortOrder]];
      }

      // Busca fluxos
      const result = await Flow.findAndCountAll({
        where,
        include: [
          {
            model: FlowNode,
            attributes: ["id", "type", "nodeId"]
          }
        ],
        order: orderBy,
        limit,
        offset: (page - 1) * limit,
        distinct: true
      });

      // Adiciona estatísticas para cada fluxo
      const flowsWithStats = await Promise.all(
        result.rows.map(async (flow) => {
          const stats = await this.getFlowStatistics(flow.id);
          return {
            ...flow.toJSON(),
            statistics: stats
          };
        })
      );

      return {
        flows: flowsWithStats,
        totalCount: result.count,
        totalPages: Math.ceil(result.count / limit),
        currentPage: page,
        pageSize: limit
      };
    } catch (error) {
      console.error("Erro ao listar fluxos:", error);
      throw error;
    }
  }

  /**
   * Lista apenas fluxos ativos (para uso interno)
   */
  public async getActiveFlows(tenantId: number): Promise<Flow[]> {
    return await Flow.findAll({
      where: {
        tenantId,
        isActive: true,
        status: "active"
      },
      include: [FlowNode],
      order: [["id", "ASC"]]
    });
  }

  /**
   * Busca fluxos por palavra-chave
   */
  public async searchByKeywords(
    tenantId: number,
    keywords: string[]
  ): Promise<Flow[]> {
    const flows = await Flow.findAll({
      where: {
        tenantId,
        triggerType: "keyword",
        isActive: true,
        status: "active"
      },
      include: [FlowNode]
    });

    // Filtra fluxos que têm keywords que fazem match
    const matchingFlows: Flow[] = [];
    
    for (const flow of flows) {
      const config = flow.triggerConfig as any;
      if (config?.keywords) {
        const flowKeywords = config.keywords.map((k: string) => k.toLowerCase());
        const hasMatch = keywords.some(keyword => 
          flowKeywords.some(flowKeyword => 
            flowKeyword.includes(keyword.toLowerCase()) ||
            keyword.toLowerCase().includes(flowKeyword)
          )
        );
        
        if (hasMatch) {
          matchingFlows.push(flow);
        }
      }
    }

    return matchingFlows;
  }

  /**
   * Obtém estatísticas de um fluxo específico
   */
  private async getFlowStatistics(flowId: number) {
    const [
      totalExecutions,
      activeExecutions,
      completedExecutions,
      failedExecutions,
      lastExecution
    ] = await Promise.all([
      FlowExecution.count({
        where: { flowId }
      }),
      FlowExecution.count({
        where: { flowId, status: "active" }
      }),
      FlowExecution.count({
        where: { flowId, status: "completed" }
      }),
      FlowExecution.count({
        where: { flowId, status: "failed" }
      }),
      FlowExecution.findOne({
        where: { flowId },
        order: [["createdAt", "DESC"]],
        attributes: ["createdAt"]
      })
    ]);

    const nodeCount = await FlowNode.count({
      where: { flowId }
    });

    const successRate = totalExecutions > 0 
      ? Math.round((completedExecutions / totalExecutions) * 100)
      : 0;

    return {
      totalExecutions,
      activeExecutions,
      completedExecutions,
      failedExecutions,
      nodeCount,
      successRate,
      lastExecution: lastExecution?.createdAt
    };
  }

  /**
   * Obtém detalhes completos de um fluxo
   */
  public async getFlowDetails(flowId: number, tenantId: number): Promise<any> {
    const flow = await Flow.findOne({
      where: { id: flowId, tenantId },
      include: [FlowNode]
    });

    if (!flow) {
      throw new Error("Fluxo não encontrado");
    }

    // Adiciona estatísticas detalhadas
    const statistics = await this.getFlowStatistics(flowId);

    // Busca execuções recentes
    const recentExecutions = await FlowExecution.findAll({
      where: { flowId },
      order: [["createdAt", "DESC"]],
      limit: 10,
      attributes: [
        "id", "status", "createdAt", "completedAt", "failedAt", "errorMessage"
      ]
    });

    return {
      ...flow.toJSON(),
      statistics: {
        ...statistics,
        recentExecutions
      }
    };
  }

  /**
   * Lista fluxos por tipo de gatilho
   */
  public async getFlowsByTriggerType(
    tenantId: number,
    triggerType: "keyword" | "intent" | "event" | "manual"
  ): Promise<Flow[]> {
    return await Flow.findAll({
      where: {
        tenantId,
        triggerType,
        isActive: true,
        status: "active"
      },
      include: [FlowNode],
      order: [["name", "ASC"]]
    });
  }

  /**
   * Obtém resumo estatístico de todos os fluxos do tenant
   */
  public async getTenantFlowsSummary(tenantId: number) {
    const [
      totalFlows,
      activeFlows,
      draftFlows,
      archivedFlows,
      totalExecutions,
      activeExecutions
    ] = await Promise.all([
      Flow.count({ where: { tenantId } }),
      Flow.count({ where: { tenantId, status: "active" } }),
      Flow.count({ where: { tenantId, status: "draft" } }),
      Flow.count({ where: { tenantId, status: "archived" } }),
      FlowExecution.count({ where: { tenantId } }),
      FlowExecution.count({ where: { tenantId, status: "active" } })
    ]);

    // Fluxos mais executados
    const topFlows = await Flow.findAll({
      where: { tenantId },
      attributes: [
        "id", "name",
        [
          this.sequelize.fn("COUNT", this.sequelize.col("FlowExecutions.id")),
          "executionCount"
        ]
      ],
      include: [
        {
          model: FlowExecution,
          attributes: []
        }
      ],
      group: ["Flow.id"],
      order: [[this.sequelize.literal("executionCount"), "DESC"]],
      limit: 5,
      raw: true
    });

    return {
      totalFlows,
      activeFlows,
      draftFlows,
      archivedFlows,
      totalExecutions,
      activeExecutions,
      topFlows
    };
  }

  // Propriedade sequelize para usar nas queries
  private get sequelize() {
    return Flow.sequelize!;
  }
}

export default new ListFlowsService();