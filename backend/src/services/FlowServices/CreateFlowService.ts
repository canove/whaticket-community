import Flow from "../../models/Flow";
import FlowNode from "../../models/FlowNode";
import KeywordService from "./KeywordService";

interface CreateFlowRequest {
  tenantId: number;
  name: string;
  description?: string;
  triggerType?: "keyword" | "intent" | "event" | "manual";
  triggerConfig?: object;
  nodes?: any[];
}

interface FlowNode_Interface {
  id?: string;
  type: string;
  data?: any;
  position?: { x: number; y: number };
  sourcePosition?: string;
  targetPosition?: string;
  style?: { width?: number; height?: number };
}

class CreateFlowService {
  public async execute({
    tenantId,
    name,
    description,
    triggerType = "manual",
    triggerConfig,
    nodes = []
  }: CreateFlowRequest): Promise<Flow> {
    try {
      // Validações básicas
      if (!name || name.trim().length === 0) {
        throw new Error("Nome do fluxo é obrigatório");
      }

      if (!tenantId) {
        throw new Error("Tenant ID é obrigatório");
      }

      // Valida tipo de gatilho
      if (!["keyword", "intent", "event", "manual"].includes(triggerType)) {
        throw new Error("Tipo de gatilho inválido");
      }

      // Valida configuração de keywords se for o caso
      if (triggerType === "keyword" && triggerConfig) {
        const validation = KeywordService.validateConfig(triggerConfig as any);
        if (!validation.valid) {
          throw new Error(`Configuração de keywords inválida: ${validation.errors.join(", ")}`);
        }
      }

      // Verifica se já existe um fluxo com mesmo nome no tenant
      const existingFlow = await Flow.findOne({
        where: {
          tenantId,
          name: name.trim()
        }
      });

      if (existingFlow) {
        throw new Error("Já existe um fluxo com esse nome");
      }

      // Cria o fluxo
      const flow = await Flow.create({
        tenantId,
        name: name.trim(),
        description: description?.trim(),
        triggerType,
        triggerConfig,
        status: "draft",
        version: 1,
        isActive: false
      });

      // Cria os nós se fornecidos
      if (nodes.length > 0) {
        // Valida se tem pelo menos um nó do tipo "start"
        const hasStartNode = nodes.some((node: FlowNode_Interface) => node.type === "start");
        if (!hasStartNode) {
          console.warn("Fluxo criado sem nó inicial. Será necessário adicionar um nó 'start' antes de ativar.");
        }

        // Valida se tem pelo menos um nó do tipo "end"
        const hasEndNode = nodes.some((node: FlowNode_Interface) => node.type === "end");
        if (!hasEndNode) {
          console.warn("Fluxo criado sem nó final. É recomendado adicionar um nó 'end'.");
        }

        // Cria todos os nós
        const createdNodes = await Promise.all(
          nodes.map(async (nodeData: FlowNode_Interface) => {
            return await this.createFlowNode(flow.id, nodeData);
          })
        );

        console.log(`Fluxo ${flow.id} criado com ${createdNodes.length} nós`);
      }

      // Retorna fluxo completo com nós
      const flowWithNodes = await Flow.findByPk(flow.id, {
        include: [FlowNode]
      });

      return flowWithNodes!;
    } catch (error) {
      console.error("Erro ao criar fluxo:", error);
      throw error;
    }
  }

  /**
   * Cria um nó do fluxo
   */
  private async createFlowNode(flowId: number, nodeData: FlowNode_Interface): Promise<FlowNode> {
    // Valida tipo do nó
    const validTypes = ["start", "send_text", "send_media", "wait_input", "condition", "webhook", "ai_node", "end"];
    if (!validTypes.includes(nodeData.type)) {
      throw new Error(`Tipo de nó inválido: ${nodeData.type}`);
    }

    // Valida configuração específica do tipo de nó
    this.validateNodeConfig(nodeData);

    return await FlowNode.create({
      flowId,
      nodeId: nodeData.id || this.generateNodeId(),
      type: nodeData.type as any,
      label: nodeData.data?.label || this.getDefaultNodeLabel(nodeData.type),
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
   * Valida configuração específica de cada tipo de nó
   */
  private validateNodeConfig(nodeData: FlowNode_Interface): void {
    const { type, data } = nodeData;
    const config = data?.config || {};

    switch (type) {
      case "send_text":
        if (!config.text && !config.message) {
          throw new Error("Nó 'send_text' deve ter uma mensagem configurada");
        }
        break;

      case "send_media":
        if (!config.mediaUrl && !config.url) {
          throw new Error("Nó 'send_media' deve ter uma URL de mídia configurada");
        }
        break;

      case "condition":
        if (!config.conditions || !Array.isArray(config.conditions)) {
          throw new Error("Nó 'condition' deve ter condições configuradas");
        }
        break;

      case "webhook":
        if (!config.url) {
          throw new Error("Nó 'webhook' deve ter uma URL configurada");
        }
        break;

      case "ai_node":
        if (!config.prompt) {
          throw new Error("Nó 'ai_node' deve ter um prompt configurado");
        }
        break;

      // start, end, wait_input não precisam de validação específica
    }
  }

  /**
   * Gera ID único para o nó
   */
  private generateNodeId(): string {
    return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Retorna label padrão para cada tipo de nó
   */
  private getDefaultNodeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      "start": "Início",
      "send_text": "Enviar Texto",
      "send_media": "Enviar Mídia",
      "wait_input": "Aguardar Resposta",
      "condition": "Condição",
      "webhook": "Webhook",
      "ai_node": "IA",
      "end": "Fim"
    };

    return labels[type] || "Nó";
  }

  /**
   * Cria um fluxo básico com template padrão
   */
  public async createFromTemplate(
    tenantId: number,
    name: string,
    templateType: "welcome" | "support" | "sales" = "welcome"
  ): Promise<Flow> {
    const templates = {
      welcome: {
        description: "Fluxo de boas-vindas básico",
        triggerType: "keyword" as const,
        triggerConfig: {
          keywords: ["oi", "olá", "hello", "hi"],
          matchType: "contains",
          caseSensitive: false
        },
        nodes: [
          {
            id: "start-1",
            type: "start",
            data: { label: "Início" },
            position: { x: 100, y: 100 }
          },
          {
            id: "text-1",
            type: "send_text",
            data: {
              label: "Mensagem de Boas-vindas",
              config: {
                text: "Olá {{nome}}! Seja bem-vindo(a) ao nosso atendimento. Como posso ajudá-lo(a)?"
              }
            },
            position: { x: 300, y: 100 }
          },
          {
            id: "wait-1",
            type: "wait_input",
            data: { label: "Aguardar Resposta" },
            position: { x: 500, y: 100 }
          },
          {
            id: "end-1",
            type: "end",
            data: {
              label: "Fim",
              config: {
                message: "Obrigado pelo contato. Nossa equipe entrará em contato em breve!"
              }
            },
            position: { x: 700, y: 100 }
          }
        ]
      },
      support: {
        description: "Fluxo de suporte técnico",
        triggerType: "keyword" as const,
        triggerConfig: {
          keywords: ["suporte", "problema", "erro", "ajuda", "bug"],
          matchType: "contains",
          caseSensitive: false
        },
        nodes: [
          {
            id: "start-1",
            type: "start",
            data: { label: "Início" },
            position: { x: 100, y: 100 }
          },
          {
            id: "text-1",
            type: "send_text",
            data: {
              label: "Identificar Problema",
              config: {
                text: "Olá! Vejo que você precisa de suporte. Por favor, descreva detalhadamente o problema que está enfrentando."
              }
            },
            position: { x: 300, y: 100 }
          },
          {
            id: "wait-1",
            type: "wait_input",
            data: { label: "Aguardar Descrição" },
            position: { x: 500, y: 100 }
          },
          {
            id: "end-1",
            type: "end",
            data: {
              label: "Fim",
              config: {
                message: "Obrigado pelas informações. Nossa equipe técnica analisará seu caso e retornará em até 24 horas."
              }
            },
            position: { x: 700, y: 100 }
          }
        ]
      },
      sales: {
        description: "Fluxo de vendas e informações",
        triggerType: "keyword" as const,
        triggerConfig: {
          keywords: ["preço", "valor", "comprar", "produto", "serviço"],
          matchType: "contains",
          caseSensitive: false
        },
        nodes: [
          {
            id: "start-1",
            type: "start",
            data: { label: "Início" },
            position: { x: 100, y: 100 }
          },
          {
            id: "text-1",
            type: "send_text",
            data: {
              label: "Interesse Comercial",
              config: {
                text: "Ótimo! Vejo que você tem interesse em nossos produtos/serviços. Qual produto específico gostaria de saber mais?"
              }
            },
            position: { x: 300, y: 100 }
          },
          {
            id: "wait-1",
            type: "wait_input",
            data: { label: "Aguardar Produto" },
            position: { x: 500, y: 100 }
          },
          {
            id: "end-1",
            type: "end",
            data: {
              label: "Fim",
              config: {
                message: "Perfeito! Vou transferir você para nossa equipe comercial que enviará todas as informações e preços. Aguarde um momento."
              }
            },
            position: { x: 700, y: 100 }
          }
        ]
      }
    };

    const template = templates[templateType];

    return await this.execute({
      tenantId,
      name,
      description: template.description,
      triggerType: template.triggerType,
      triggerConfig: template.triggerConfig,
      nodes: template.nodes
    });
  }
}

export default new CreateFlowService();