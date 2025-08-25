import Flow from "../../models/Flow";
import FlowNode from "../../models/FlowNode";
import FlowExecution from "../../models/FlowExecution";

interface DeleteFlowRequest {
  flowId: number;
  tenantId: number;
  force?: boolean;
}

class DeleteFlowService {
  /**
   * Deleta um fluxo
   */
  public async execute({ flowId, tenantId, force = false }: DeleteFlowRequest): Promise<void> {
    try {
      // Busca o fluxo
      const flow = await Flow.findOne({
        where: { id: flowId, tenantId },
        include: [FlowNode]
      });

      if (!flow) {
        throw new Error("Fluxo não encontrado");
      }

      // Verifica se há execuções ativas (a menos que force seja true)
      if (!force) {
        const activeExecutions = await FlowExecution.count({
          where: { 
            flowId,
            status: "active"
          }
        });

        if (activeExecutions > 0) {
          throw new Error(
            `Não é possível deletar fluxo com ${activeExecutions} execução(ões) ativa(s). ` +
            "Aguarde as execuções terminarem ou use force=true para forçar a deleção."
          );
        }
      }

      // Se force=true, para todas as execuções ativas
      if (force) {
        await FlowExecution.update(
          {
            status: "failed",
            failedAt: new Date(),
            errorMessage: "Fluxo foi deletado forçadamente"
          },
          {
            where: {
              flowId,
              status: "active"
            }
          }
        );
      }

      // Conta estatísticas antes de deletar
      const totalExecutions = await FlowExecution.count({
        where: { flowId }
      });

      const nodeCount = flow.nodes?.length || 0;

      console.log(`Deletando fluxo ${flowId} (${flow.name}): ${nodeCount} nós, ${totalExecutions} execuções`);

      // Deleta o fluxo (nós e execuções serão deletados em cascata)
      await flow.destroy();

      console.log(`Fluxo ${flowId} deletado com sucesso`);
    } catch (error) {
      console.error("Erro ao deletar fluxo:", error);
      throw error;
    }
  }

  /**
   * Arquiva um fluxo em vez de deletá-lo
   */
  public async archive(flowId: number, tenantId: number): Promise<Flow> {
    try {
      const flow = await Flow.findOne({
        where: { id: flowId, tenantId }
      });

      if (!flow) {
        throw new Error("Fluxo não encontrado");
      }

      // Verifica se há execuções ativas
      const activeExecutions = await FlowExecution.count({
        where: { 
          flowId,
          status: "active"
        }
      });

      if (activeExecutions > 0) {
        throw new Error(
          `Não é possível arquivar fluxo com ${activeExecutions} execução(ões) ativa(s). ` +
          "Aguarde as execuções terminarem."
        );
      }

      // Arquiva o fluxo
      await flow.update({
        status: "archived",
        isActive: false
      });

      console.log(`Fluxo ${flowId} arquivado com sucesso`);
      return flow;
    } catch (error) {
      console.error("Erro ao arquivar fluxo:", error);
      throw error;
    }
  }

  /**
   * Deleta fluxos em lote
   */
  public async bulkDelete(
    flowIds: number[],
    tenantId: number,
    force: boolean = false
  ): Promise<{ deleted: number; failed: Array<{ id: number; error: string }> }> {
    const results = {
      deleted: 0,
      failed: [] as Array<{ id: number; error: string }>
    };

    for (const flowId of flowIds) {
      try {
        await this.execute({ flowId, tenantId, force });
        results.deleted++;
      } catch (error) {
        results.failed.push({
          id: flowId,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Deleta todos os fluxos arquivados de um tenant
   */
  public async deleteArchivedFlows(tenantId: number): Promise<number> {
    try {
      // Busca fluxos arquivados
      const archivedFlows = await Flow.findAll({
        where: {
          tenantId,
          status: "archived"
        },
        attributes: ["id"]
      });

      if (archivedFlows.length === 0) {
        return 0;
      }

      const flowIds = archivedFlows.map(flow => flow.id);

      // Deleta execuções dos fluxos arquivados
      await FlowExecution.destroy({
        where: {
          flowId: flowIds
        }
      });

      // Deleta nós dos fluxos arquivados
      await FlowNode.destroy({
        where: {
          flowId: flowIds
        }
      });

      // Deleta os fluxos
      const deletedCount = await Flow.destroy({
        where: {
          id: flowIds
        }
      });

      console.log(`${deletedCount} fluxos arquivados deletados do tenant ${tenantId}`);
      return deletedCount;
    } catch (error) {
      console.error("Erro ao deletar fluxos arquivados:", error);
      throw error;
    }
  }

  /**
   * Limpa dados antigos de execuções (mantém fluxo, remove apenas execuções antigas)
   */
  public async cleanupOldExecutions(
    flowId: number,
    tenantId: number,
    daysOld: number = 30
  ): Promise<number> {
    try {
      const flow = await Flow.findOne({
        where: { id: flowId, tenantId }
      });

      if (!flow) {
        throw new Error("Fluxo não encontrado");
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      // Remove execuções antigas (completadas ou falhadas)
      const deletedExecutions = await FlowExecution.destroy({
        where: {
          flowId,
          status: ["completed", "failed"],
          updatedAt: {
            $lt: cutoffDate
          }
        }
      });

      console.log(`${deletedExecutions} execuções antigas removidas do fluxo ${flowId}`);
      return deletedExecutions;
    } catch (error) {
      console.error("Erro ao limpar execuções antigas:", error);
      throw error;
    }
  }

  /**
   * Remove apenas os nós de um fluxo (mantém o fluxo)
   */
  public async clearNodes(flowId: number, tenantId: number): Promise<Flow> {
    try {
      const flow = await Flow.findOne({
        where: { id: flowId, tenantId }
      });

      if (!flow) {
        throw new Error("Fluxo não encontrado");
      }

      // Verifica se há execuções ativas
      const activeExecutions = await FlowExecution.count({
        where: { 
          flowId,
          status: "active"
        }
      });

      if (activeExecutions > 0) {
        throw new Error(
          "Não é possível limpar nós de fluxo com execuções ativas"
        );
      }

      // Remove todos os nós
      await FlowNode.destroy({ where: { flowId } });

      // Desativa o fluxo
      await flow.update({
        isActive: false,
        status: "draft"
      });

      console.log(`Nós do fluxo ${flowId} removidos com sucesso`);
      return flow;
    } catch (error) {
      console.error("Erro ao limpar nós do fluxo:", error);
      throw error;
    }
  }
}

export default new DeleteFlowService();