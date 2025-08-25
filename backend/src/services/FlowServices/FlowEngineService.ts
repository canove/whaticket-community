import { Op } from "sequelize";
import Flow from "../../models/Flow";
import FlowNode from "../../models/FlowNode";
import FlowExecution from "../../models/FlowExecution";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
// import FlowExecutorService from "./FlowExecutorService"; // Removido temporariamente devido a problema de dependência circular
import KeywordService from "./KeywordService";

interface ProcessMessageParams {
  message: Message;
  contact: Contact;
  ticket: Ticket;
  tenantId: number;
}

interface FlowTriggerResult {
  flow: Flow;
  triggered: boolean;
  priority: number;
}

class FlowEngineService {
  /**
   * Processa uma mensagem recebida e verifica se deve iniciar ou continuar um fluxo
   */
  public async processMessage({
    message,
    contact,
    ticket,
    tenantId
  }: ProcessMessageParams): Promise<boolean> {
    try {
      // 1. Verifica se há uma execução ativa para este contato
      const activeExecution = await this.getActiveExecution(contact.id, tenantId);
      
      if (activeExecution) {
        // Continua execução existente
        return await this.continueExecution(activeExecution, message);
      }

      // 2. Busca fluxos que podem ser triggered por esta mensagem
      const triggeredFlow = await this.findTriggeredFlow(message.body, tenantId);
      
      if (triggeredFlow) {
        // Inicia nova execução
        return await this.startNewExecution(triggeredFlow, contact, ticket, message);
      }

      return false;
    } catch (error) {
      console.error("Erro no FlowEngineService:", error);
      return false;
    }
  }

  /**
   * Busca uma execução ativa para um contato
   */
  private async getActiveExecution(
    contactId: number, 
    tenantId: number
  ): Promise<FlowExecution | null> {
    return await FlowExecution.findOne({
      where: {
        contactId,
        tenantId,
        status: "active"
      },
      include: [
        {
          model: Flow,
          include: [FlowNode]
        },
        FlowNode
      ]
    });
  }

  /**
   * Encontra um fluxo que deve ser triggered pela mensagem
   */
  private async findTriggeredFlow(
    messageBody: string,
    tenantId: number
  ): Promise<Flow | null> {
    // Busca fluxos ativos do tenant
    const activeFlows = await Flow.findAll({
      where: {
        tenantId,
        isActive: true,
        status: "active"
      },
      include: [FlowNode],
      order: [["id", "ASC"]] // Prioridade por ordem de criação
    });

    // Testa cada fluxo para ver se deve ser triggered
    for (const flow of activeFlows) {
      const shouldTrigger = await this.shouldTriggerFlow(flow, messageBody);
      if (shouldTrigger) {
        return flow;
      }
    }

    return null;
  }

  /**
   * Verifica se um fluxo deve ser triggered pela mensagem
   */
  private async shouldTriggerFlow(flow: Flow, messageBody: string): Promise<boolean> {
    switch (flow.triggerType) {
      case "keyword":
        return await KeywordService.matchesKeywords(
          messageBody,
          flow.triggerConfig as any
        );
      
      case "intent":
        // TODO: Implementar matching de intenções (NLP)
        return false;
      
      case "event":
        // TODO: Implementar triggers por eventos
        return false;
      
      case "manual":
        return false;
      
      default:
        return false;
    }
  }

  /**
   * Inicia uma nova execução de fluxo
   */
  private async startNewExecution(
    flow: Flow,
    contact: Contact,
    ticket: Ticket,
    message: Message
  ): Promise<boolean> {
    try {
      // Encontra o nó inicial (tipo "start") - corrigido para usar a associação correta do Sequelize
      const nodes = (flow as any).FlowNodes || [];
      const startNode = nodes.find((node: any) => node.type === "start");
      
      if (!startNode) {
        console.error(`Fluxo ${flow.id} não tem nó inicial`);
        return false;
      }

      // Cria nova execução
      const execution = await FlowExecution.create({
        tenantId: flow.tenantId,
        flowId: flow.id,
        contactId: contact.id,
        ticketId: ticket.id,
        status: "active",
        currentNodeId: startNode.id,
        variables: this.initializeVariables(contact, ticket, message),
        stepHistory: []
      });

      // Executa o primeiro nó
      return await this.executeNextNode(execution);
    } catch (error) {
      console.error("Erro ao iniciar execução:", error);
      return false;
    }
  }

  /**
   * Continua uma execução existente
   */
  private async continueExecution(
    execution: FlowExecution,
    message: Message
  ): Promise<boolean> {
    try {
      // Atualiza variáveis com a resposta do usuário
      const variables = execution.variables as any || {};
      variables.last_user_message = message.body;
      variables.last_message_timestamp = message.createdAt;

      await execution.update({
        variables,
        stepHistory: [
          ...(execution.stepHistory as any[] || []),
          {
            nodeId: execution.currentNodeId,
            userInput: message.body,
            timestamp: new Date()
          }
        ]
      });

      // Executa próximo nó
      return await this.executeNextNode(execution);
    } catch (error) {
      console.error("Erro ao continuar execução:", error);
      return false;
    }
  }

  /**
   * Executa o próximo nó na sequência
   */
  private async executeNextNode(execution: FlowExecution): Promise<boolean> {
    try {
      let currentNode = (execution as any).FlowNode;
      if (!currentNode && execution.currentNodeId) {
        // Carrega o nó atual se não estiver carregado
        currentNode = await FlowNode.findByPk(execution.currentNodeId);
      }

      if (!currentNode) {
        console.error(`Nó atual não encontrado para execução ${execution.id}`);
        return false;
      }

      // Executa o nó usando lógica inline (evita dependência circular)
      const result = await this.executeNodeInline(currentNode, execution);

      if (result.success) {
        // Atualiza variáveis se necessário
        if (result.variables) {
          await execution.update({
            variables: { ...execution.variables as any, ...result.variables }
          });
        }

        // Se há próximo nó, continua execução
        if (result.nextNodeId) {
          await execution.update({
            currentNodeId: result.nextNodeId
          });
          
          // Executa próximo nó imediatamente se não for um nó de espera
          const nextNode = await FlowNode.findByPk(result.nextNodeId);
          if (nextNode && nextNode.type !== "wait_input") {
            return await this.executeNextNode(execution);
          }
        } else {
          // Fluxo completado
          await execution.update({
            status: "completed",
            completedAt: new Date()
          });
        }

        return true;
      } else {
        // Erro na execução
        await execution.update({
          status: "failed",
          failedAt: new Date(),
          errorMessage: result.error
        });
        return false;
      }
    } catch (error) {
      console.error("Erro ao executar nó:", error);
      await execution.update({
        status: "failed",
        failedAt: new Date(),
        errorMessage: error.message
      });
      return false;
    }
  }

  /**
   * Inicializa variáveis do sistema para a execução
   */
  private initializeVariables(
    contact: Contact,
    ticket: Ticket,
    message: Message
  ): object {
    return {
      // Variáveis do contato
      nome: contact.name,
      telefone: contact.number,
      email: contact.email,
      
      // Variáveis do ticket
      ticket_id: ticket.id,
      status_ticket: ticket.status,
      
      // Variáveis da mensagem
      mensagem_inicial: message.body,
      timestamp_inicial: message.createdAt,
      
      // Variáveis de sistema
      data_hoje: new Date().toISOString().split('T')[0],
      hora_atual: new Date().toTimeString().split(' ')[0],
      
      // Variáveis customizadas (vazio inicialmente)
      custom: {}
    };
  }

  /**
   * Executa um nó inline (implementação temporária para evitar dependência circular)
   */
  private async executeNodeInline(node: FlowNode, execution: FlowExecution): Promise<any> {
    try {
      console.log(`Executando nó ${node.type} (ID: ${node.id})`);
      
      // Implementação básica baseada no tipo do nó
      switch (node.type) {
        case "start":
          return {
            success: true,
            nextNodeId: await this.findNextNodeId(node),
            variables: { flow_started_at: new Date().toISOString() }
          };
        
        case "send_text":
          const config = node.config as any || {};
          const messageText = this.replaceVariables(
            config.text || config.message || "Mensagem de texto",
            execution.variables as any || {}
          );
          
          console.log(`Enviando mensagem: ${messageText}`);
          // TODO: Integrar com SendWhatsAppMessage quando a dependência circular for resolvida
          
          return {
            success: true,
            nextNodeId: await this.findNextNodeId(node),
            variables: {
              last_sent_message: messageText,
              last_sent_at: new Date().toISOString()
            }
          };
        
        case "end":
          const endConfig = node.config as any || {};
          if (endConfig.message) {
            const finalMessage = this.replaceVariables(
              endConfig.message,
              execution.variables as any || {}
            );
            console.log(`Mensagem final: ${finalMessage}`);
          }
          
          return {
            success: true,
            variables: { flow_completed_at: new Date().toISOString() }
          };
        
        default:
          console.log(`Tipo de nó não implementado: ${node.type}`);
          return {
            success: true,
            nextNodeId: await this.findNextNodeId(node)
          };
      }
    } catch (error) {
      console.error("Erro ao executar nó:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido"
      };
    }
  }

  /**
   * Encontra o ID do próximo nó
   */
  private async findNextNodeId(currentNode: FlowNode): Promise<number | undefined> {
    try {
      const allNodes = await FlowNode.findAll({
        where: { flowId: currentNode.flowId },
        order: [["id", "ASC"]]
      });

      const currentIndex = allNodes.findIndex(node => node.id === currentNode.id);
      
      return currentIndex < allNodes.length - 1 ? allNodes[currentIndex + 1].id : undefined;
    } catch (error) {
      console.error("Erro ao encontrar próximo nó:", error);
      return undefined;
    }
  }

  /**
   * Substitui variáveis em um texto (versão simplificada)
   */
  private replaceVariables(text: string, variables: any): string {
    if (!text || typeof text !== "string") return text;

    return text.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
      const value = this.getVariableValue(varName.trim(), variables);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Obtém valor de uma variável (suporta notação ponto)
   */
  private getVariableValue(varName: string, variables: any): any {
    const parts = varName.split('.');
    let value = variables;
    
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }
    
    return value;
  }

  /**
   * Para uma execução ativa
   */
  public async stopExecution(executionId: number): Promise<boolean> {
    try {
      const execution = await FlowExecution.findByPk(executionId);
      if (execution && execution.status === "active") {
        await execution.update({
          status: "paused",
          updatedAt: new Date()
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao parar execução:", error);
      return false;
    }
  }

  /**
   * Lista execuções ativas de um tenant
   */
  public async getActiveExecutions(tenantId: number): Promise<FlowExecution[]> {
    return await FlowExecution.findAll({
      where: {
        tenantId,
        status: "active"
      },
      include: [Flow, Contact, Ticket, FlowNode],
      order: [["createdAt", "DESC"]]
    });
  }
}

export default new FlowEngineService();