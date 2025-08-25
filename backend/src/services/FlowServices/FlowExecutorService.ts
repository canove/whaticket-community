import FlowNode, { NodeType } from "../../models/FlowNode";
import FlowExecution from "../../models/FlowExecution";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";

// Importações dos serviços do WhatsApp
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import SendWhatsAppMedia from "../WbotServices/SendWhatsAppMedia";
import { MessageMedia } from "whatsapp-web.js";
import GetTicketWbot from "../../helpers/GetTicketWbot";

// Importações dos serviços de IA
import OpenAIService from "../AIServices/OpenAIService";

interface ExecutionResult {
  success: boolean;
  nextNodeId?: number;
  variables?: object;
  error?: string;
  shouldWait?: boolean;
}

interface NodeExecutionContext {
  node: FlowNode;
  execution: FlowExecution;
  contact: Contact;
  ticket: Ticket;
  variables: any;
}

class FlowExecutorService {
  /**
   * Executa um nó específico do fluxo
   */
  public async executeNode(
    node: FlowNode,
    execution: FlowExecution
  ): Promise<ExecutionResult> {
    try {
      // Carrega contexto necessário se não estiver carregado
      if (!execution.contact) {
        execution.contact = await Contact.findByPk(execution.contactId);
      }
      
      if (!execution.ticket) {
        execution.ticket = await Ticket.findByPk(execution.ticketId!);
      }

      const context: NodeExecutionContext = {
        node,
        execution,
        contact: execution.contact!,
        ticket: execution.ticket!,
        variables: execution.variables as any || {}
      };

      // Executa baseado no tipo do nó
      switch (node.type) {
        case "start":
          return await this.executeStartNode(context);
        
        case "send_text":
          return await this.executeSendTextNode(context);
        
        case "send_media":
          return await this.executeSendMediaNode(context);
        
        case "wait_input":
          return await this.executeWaitInputNode(context);
        
        case "condition":
          return await this.executeConditionNode(context);
        
        case "webhook":
          return await this.executeWebhookNode(context);
        
        case "ai_node":
          return await this.executeAINode(context);
        
        case "end":
          return await this.executeEndNode(context);
        
        default:
          return {
            success: false,
            error: `Tipo de nó não suportado: ${node.type}`
          };
      }
    } catch (error) {
      console.error("Erro ao executar nó:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Executa nó de início
   */
  private async executeStartNode(context: NodeExecutionContext): Promise<ExecutionResult> {
    // Nó de início apenas passa para o próximo
    const nextNode = await this.findNextNode(context.node);
    
    return {
      success: true,
      nextNodeId: nextNode?.id,
      variables: {
        flow_started_at: new Date().toISOString()
      }
    };
  }

  /**
   * Executa nó de envio de texto
   */
  private async executeSendTextNode(context: NodeExecutionContext): Promise<ExecutionResult> {
    try {
      const config = context.node.config as any || {};
      let messageText = config.text || config.message || "";

      // Substitui variáveis no texto
      messageText = this.replaceVariables(messageText, context.variables);

      // Envia a mensagem via WhatsApp
      await this.sendWhatsAppMessage(context.ticket, messageText);

      // Encontra próximo nó
      const nextNode = await this.findNextNode(context.node);

      return {
        success: true,
        nextNodeId: nextNode?.id,
        variables: {
          last_sent_message: messageText,
          last_sent_at: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao enviar texto: ${error.message}`
      };
    }
  }

  /**
   * Executa nó de envio de mídia
   */
  private async executeSendMediaNode(context: NodeExecutionContext): Promise<ExecutionResult> {
    try {
      const config = context.node.config as any || {};
      const { mediaUrl, caption, mediaType } = config;

      if (!mediaUrl) {
        return {
          success: false,
          error: "URL da mídia não fornecida"
        };
      }

      // Substitui variáveis na caption se existir
      let finalCaption = caption ? this.replaceVariables(caption, context.variables) : "";

      // Envia a mídia via WhatsApp
      await this.sendWhatsAppMedia(context.ticket, mediaUrl, finalCaption, mediaType);

      const nextNode = await this.findNextNode(context.node);

      return {
        success: true,
        nextNodeId: nextNode?.id,
        variables: {
          last_sent_media: mediaUrl,
          last_sent_at: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao enviar mídia: ${error.message}`
      };
    }
  }

  /**
   * Executa nó de espera por entrada do usuário
   */
  private async executeWaitInputNode(context: NodeExecutionContext): Promise<ExecutionResult> {
    const config = context.node.config as any || {};
    
    // Se há uma mensagem para enviar antes de esperar
    if (config.message) {
      const messageText = this.replaceVariables(config.message, context.variables);
      await this.sendWhatsAppMessage(context.ticket, messageText);
    }

    // Este nó sempre espera, então não avança automaticamente
    return {
      success: true,
      shouldWait: true,
      variables: {
        waiting_for_input: true,
        wait_started_at: new Date().toISOString()
      }
    };
  }

  /**
   * Executa nó de condição
   */
  private async executeConditionNode(context: NodeExecutionContext): Promise<ExecutionResult> {
    try {
      const config = context.node.config as any || {};
      const { conditions = [], defaultPath } = config;

      // Avalia cada condição
      for (const condition of conditions) {
        const result = this.evaluateCondition(condition, context.variables);
        if (result) {
          return {
            success: true,
            nextNodeId: condition.nextNodeId
          };
        }
      }

      // Se nenhuma condição foi atendida, segue caminho padrão
      return {
        success: true,
        nextNodeId: defaultPath?.nextNodeId
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao avaliar condição: ${error.message}`
      };
    }
  }

  /**
   * Executa nó de webhook
   */
  private async executeWebhookNode(context: NodeExecutionContext): Promise<ExecutionResult> {
    try {
      const config = context.node.config as any || {};
      const { url, method = "POST", headers = {}, body } = config;

      if (!url) {
        return {
          success: false,
          error: "URL do webhook não fornecida"
        };
      }

      // Prepara dados para enviar
      const requestBody = {
        ...body,
        contact: {
          id: context.contact.id,
          name: context.contact.name,
          number: context.contact.number,
          email: context.contact.email
        },
        variables: context.variables,
        execution: {
          id: context.execution.id,
          flowId: context.execution.flowId
        }
      };

      // TODO: Implementar chamada HTTP real
      console.log(`Webhook call to ${url}:`, requestBody);

      const nextNode = await this.findNextNode(context.node);

      return {
        success: true,
        nextNodeId: nextNode?.id,
        variables: {
          webhook_called: url,
          webhook_called_at: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro no webhook: ${error.message}`
      };
    }
  }

  /**
   * Executa nó de IA
   */
  private async executeAINode(context: NodeExecutionContext): Promise<ExecutionResult> {
    try {
      const config = context.node.config as any || {};
      const {
        prompt,
        model,
        temperature,
        maxTokens,
        useMessageHistory = true,
        sendResponse = true
      } = config;

      if (!prompt) {
        return {
          success: false,
          error: "Prompt da IA não fornecido"
        };
      }

      // Obtém o tenantId a partir da execução
      const tenantId = context.execution.tenantId || context.ticket.tenantId;

      let aiResponse: string;

      if (useMessageHistory) {
        // Usa o contexto da conversa para gerar resposta inteligente
        const lastMessage = context.variables.last_user_message ||
                           context.variables.user_input ||
                           "Olá";

        aiResponse = await OpenAIService.processFlowMessage(
          tenantId,
          context.contact.id,
          lastMessage,
          {
            prompt: this.replaceVariables(prompt, context.variables),
            model,
            temperature,
            maxTokens
          }
        );
      } else {
        // Gera resposta baseada apenas no prompt configurado
        const chatContext = {
          tenantId,
          contactId: context.contact.id,
          messages: [{
            role: 'user' as const,
            content: this.replaceVariables(prompt, context.variables)
          }]
        };

        const systemPrompt = OpenAIService.generateSystemPrompt(context.contact);
        const response = await OpenAIService.generateChatResponse(chatContext, systemPrompt);
        aiResponse = response.response;
      }

      // Envia a resposta da IA como mensagem se configurado para isso
      if (sendResponse && aiResponse) {
        await this.sendWhatsAppMessage(context.ticket, aiResponse);
      }

      const nextNode = await this.findNextNode(context.node);

      return {
        success: true,
        nextNodeId: nextNode?.id,
        variables: {
          ai_response: aiResponse,
          ai_processed_at: new Date().toISOString(),
          ai_model_used: model || "gpt-3.5-turbo"
        }
      };
    } catch (error) {
      console.error("Erro no nó de IA:", error);
      
      // Em caso de erro, tenta enviar mensagem de fallback se configurada
      const config = context.node.config as any || {};
      const fallbackMessage = config.fallbackMessage ||
        "Desculpe, não consegui processar sua solicitação no momento. Pode tentar novamente?";

      if (config.sendResponse !== false) {
        try {
          await this.sendWhatsAppMessage(context.ticket, fallbackMessage);
        } catch (sendError) {
          console.error("Erro ao enviar mensagem de fallback:", sendError);
        }
      }

      return {
        success: false,
        error: `Erro no nó de IA: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        // Continua o fluxo mesmo com erro, usando mensagem de fallback
        nextNodeId: config.continueOnError ? (await this.findNextNode(context.node))?.id : undefined,
        variables: {
          ai_error: error instanceof Error ? error.message : 'Erro desconhecido',
          ai_processed_at: new Date().toISOString(),
          ai_fallback_used: true
        }
      };
    }
  }

  /**
   * Executa nó de fim
   */
  private async executeEndNode(context: NodeExecutionContext): Promise<ExecutionResult> {
    const config = context.node.config as any || {};
    
    // Se há uma mensagem final para enviar
    if (config.message) {
      const messageText = this.replaceVariables(config.message, context.variables);
      await this.sendWhatsAppMessage(context.ticket, messageText);
    }

    return {
      success: true,
      // Não há próximo nó - fluxo termina
      variables: {
        flow_completed_at: new Date().toISOString()
      }
    };
  }

  /**
   * Substitui variáveis em um texto
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
   * Avalia uma condição
   */
  private evaluateCondition(condition: any, variables: any): boolean {
    const { variable, operator, value } = condition;
    const varValue = this.getVariableValue(variable, variables);

    switch (operator) {
      case "equals":
        return varValue == value;
      case "not_equals":
        return varValue != value;
      case "contains":
        return String(varValue).toLowerCase().includes(String(value).toLowerCase());
      case "not_contains":
        return !String(varValue).toLowerCase().includes(String(value).toLowerCase());
      case "greater_than":
        return Number(varValue) > Number(value);
      case "less_than":
        return Number(varValue) < Number(value);
      case "is_empty":
        return !varValue || String(varValue).trim() === "";
      case "is_not_empty":
        return varValue && String(varValue).trim() !== "";
      default:
        return false;
    }
  }

  /**
   * Encontra o próximo nó na sequência
   */
  private async findNextNode(currentNode: FlowNode): Promise<FlowNode | null> {
    // TODO: Implementar lógica para encontrar próximo nó baseado nas conexões
    // Por enquanto, busca o próximo nó por ID (implementação simplificada)
    
    const allNodes = await FlowNode.findAll({
      where: { flowId: currentNode.flowId },
      order: [["id", "ASC"]]
    });

    const currentIndex = allNodes.findIndex(node => node.id === currentNode.id);
    
    return currentIndex < allNodes.length - 1 ? allNodes[currentIndex + 1] : null;
  }

  /**
   * Envia mensagem via WhatsApp
   */
  private async sendWhatsAppMessage(ticket: Ticket, message: string): Promise<void> {
    try {
      await SendWhatsAppMessage({
        body: message,
        ticket
      });
      
      console.log(`✅ Mensagem enviada para ticket ${ticket.id}: ${message.substring(0, 50)}...`);
    } catch (error) {
      console.error(`❌ Erro ao enviar mensagem para ticket ${ticket.id}:`, error);
      throw error;
    }
  }

  /**
   * Envia mídia via WhatsApp
   */
  private async sendWhatsAppMedia(
    ticket: Ticket,
    mediaUrl: string,
    caption: string,
    mediaType: string
  ): Promise<void> {
    try {
      // Verifica se é uma URL externa
      if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
        // Para URLs externas, cria um MessageMedia
        const wbot = await GetTicketWbot(ticket);
        
        const media = await MessageMedia.fromUrl(mediaUrl);
        
        await wbot.sendMessage(
          `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`,
          media,
          { caption }
        );
      } else {
        // Para arquivos locais (caso futuro)
        console.log(`Enviando mídia local ainda não implementado: ${mediaUrl}`);
      }
      
      console.log(`✅ Mídia enviada para ticket ${ticket.id}: ${mediaUrl}`);
    } catch (error) {
      console.error(`❌ Erro ao enviar mídia para ticket ${ticket.id}:`, error);
      throw error;
    }
  }
}

export default new FlowExecutorService();