import OpenAI from "openai";
import { logger } from "../../utils/logger";
import TenantSetting from "../../models/TenantSetting";
import AnalyticsMetric from "../../models/AnalyticsMetric";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
}

interface ChatContext {
  tenantId: number;
  contactId: number;
  ticketId?: number;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp?: Date;
  }>;
}

interface ChatResponse {
  response: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;
  responseTime: number;
}

class OpenAIService {
  private static instances = new Map<number, OpenAI>();

  /**
   * Obtém instância do OpenAI para um tenant
   */
  private static async getOpenAIInstance(tenantId: number): Promise<OpenAI> {
    if (this.instances.has(tenantId)) {
      return this.instances.get(tenantId)!;
    }

    const config = await this.getOpenAIConfig(tenantId);
    
    const instance = new OpenAI({
      apiKey: config.apiKey,
      timeout: config.timeout
    });

    this.instances.set(tenantId, instance);
    return instance;
  }

  /**
   * Obtém configurações do OpenAI para um tenant
   */
  private static async getOpenAIConfig(tenantId: number): Promise<OpenAIConfig> {
    const settings = await TenantSetting.findAll({
      where: {
        tenantId,
        key: [
          'ai:openai:api_key',
          'ai:openai:model',
          'ai:openai:temperature',
          'ai:openai:max_tokens',
          'ai:openai:timeout'
        ]
      }
    });

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      apiKey: settingsMap['ai:openai:api_key'] || process.env.OPENAI_API_KEY || '',
      model: settingsMap['ai:openai:model'] || 'gpt-3.5-turbo',
      temperature: parseFloat(settingsMap['ai:openai:temperature'] || '0.7'),
      maxTokens: parseInt(settingsMap['ai:openai:max_tokens'] || '1000'),
      timeout: parseInt(settingsMap['ai:openai:timeout'] || '30000')
    };
  }

  /**
   * Gera resposta usando ChatGPT
   */
  static async generateChatResponse(
    context: ChatContext,
    systemPrompt?: string
  ): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      const config = await this.getOpenAIConfig(context.tenantId);
      
      if (!config.apiKey) {
        throw new Error("API key do OpenAI não configurada");
      }

      const openai = await this.getOpenAIInstance(context.tenantId);

      // Prepara mensagens para o OpenAI
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

      // Sistema
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt
        });
      }

      // Contexto da conversa
      context.messages.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });

      // Chama a API do OpenAI
      const completion = await openai.chat.completions.create({
        model: config.model,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      const responseTime = Date.now() - startTime;
      const response = completion.choices[0]?.message?.content || "";

      // Registra uso para analytics
      await this.recordUsage(context.tenantId, {
        model: config.model,
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
        responseTime
      });

      return {
        response,
        tokensUsed: {
          prompt: completion.usage?.prompt_tokens || 0,
          completion: completion.usage?.completion_tokens || 0,
          total: completion.usage?.total_tokens || 0
        },
        model: config.model,
        responseTime
      };

    } catch (error) {
      logger.error("Erro na geração de resposta OpenAI:", error);
      
      // Registra erro para analytics
      await this.recordUsage(context.tenantId, {
        model: 'error',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });

      throw error;
    }
  }

  /**
   * Constrói contexto de conversa a partir do histórico de mensagens
   */
  static async buildChatContext(
    tenantId: number,
    contactId: number,
    ticketId?: number,
    messageLimit = 10
  ): Promise<ChatContext> {
    try {
      // Busca contato
      const contact = await Contact.findByPk(contactId);
      if (!contact) {
        throw new Error("Contato não encontrado");
      }

      // Busca histórico de mensagens
      const where: any = { tenantId, contactId };
      if (ticketId) {
        where.ticketId = ticketId;
      }

      const messages = await Message.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: messageLimit,
        include: [
          {
            model: Contact,
            as: 'contact',
            attributes: ['name', 'number']
          }
        ]
      });

      // Converte mensagens para formato do chat
      const chatMessages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
        timestamp?: Date;
      }> = messages
        .reverse()
        .map(msg => ({
          role: (msg.fromMe ? 'assistant' : 'user') as 'user' | 'assistant',
          content: msg.body,
          timestamp: msg.createdAt
        }));

      return {
        tenantId,
        contactId,
        ticketId,
        messages: chatMessages
      };

    } catch (error) {
      logger.error("Erro ao construir contexto do chat:", error);
      throw error;
    }
  }

  /**
   * Gera prompt do sistema baseado no contexto
   */
  static generateSystemPrompt(
    contact: Contact,
    customPrompt?: string
  ): string {
    const basePrompt = `Você é um assistente virtual inteligente em um sistema de atendimento ao cliente. 

Informações do cliente:
- Nome: ${contact.name}
- Número: ${contact.number}
- Tipo: ${contact.isGroup ? 'Grupo' : 'Individual'}

Instruções:
- Seja sempre educado, prestativo e profissional
- Mantenha respostas concisas e diretas ao ponto
- Se não souber algo, seja honesto sobre isso
- Use linguagem natural e amigável
- Adapte-se ao tom da conversa do cliente
- Responda sempre em português brasileiro`;

    if (customPrompt) {
      return `${basePrompt}\n\nInstruções específicas:\n${customPrompt}`;
    }

    return basePrompt;
  }

  /**
   * Processa mensagem com IA para um nó de fluxo
   */
  static async processFlowMessage(
    tenantId: number,
    contactId: number,
    messageContent: string,
    flowConfig: {
      prompt?: string;
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    try {
      const contact = await Contact.findByPk(contactId);
      if (!contact) {
        throw new Error("Contato não encontrado");
      }

      // Constrói contexto da conversa
      const context = await this.buildChatContext(tenantId, contactId, undefined, 5);
      
      // Adiciona a mensagem atual ao contexto
      context.messages.push({
        role: 'user',
        content: messageContent
      });

      // Gera prompt do sistema
      const systemPrompt = this.generateSystemPrompt(contact, flowConfig.prompt);

      // Sobrescreve configurações se especificadas no fluxo
      if (flowConfig.model || flowConfig.temperature || flowConfig.maxTokens) {
        const configUpdates: any = {};
        if (flowConfig.model) configUpdates.model = flowConfig.model;
        if (flowConfig.temperature !== undefined) configUpdates.temperature = flowConfig.temperature;
        if (flowConfig.maxTokens) configUpdates.maxTokens = flowConfig.maxTokens;
        
        // Temporariamente atualiza a instância com as configurações do fluxo
        const originalConfig = await this.getOpenAIConfig(tenantId);
        // TODO: Implementar override de configuração por requisição
      }

      // Gera resposta
      const response = await this.generateChatResponse(context, systemPrompt);

      return response.response;

    } catch (error) {
      logger.error("Erro ao processar mensagem do fluxo:", error);
      throw error;
    }
  }

  /**
   * Analisa sentimento de uma mensagem
   */
  static async analyzeSentiment(
    tenantId: number,
    message: string
  ): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    emotions?: string[];
  }> {
    try {
      const config = await this.getOpenAIConfig(tenantId);
      const openai = await this.getOpenAIInstance(tenantId);

      const prompt = `Analise o sentimento da seguinte mensagem e responda APENAS em formato JSON:

Mensagem: "${message}"

Responda no formato:
{
  "sentiment": "positive/negative/neutral",
  "confidence": 0.95,
  "emotions": ["alegria", "satisfação"]
}`;

      const completion = await openai.chat.completions.create({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em análise de sentimentos. Responda sempre em JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      });

      const response = completion.choices[0]?.message?.content || "{}";
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        logger.warn("Erro ao parsear resposta de sentimento:", response);
        return {
          sentiment: 'neutral',
          confidence: 0.5
        };
      }

    } catch (error) {
      logger.error("Erro na análise de sentimento:", error);
      return {
        sentiment: 'neutral',
        confidence: 0.0
      };
    }
  }

  /**
   * Gera sugestões de resposta
   */
  static async generateResponseSuggestions(
    tenantId: number,
    contactId: number,
    count = 3
  ): Promise<string[]> {
    try {
      const context = await this.buildChatContext(tenantId, contactId, undefined, 5);
      const contact = await Contact.findByPk(contactId);

      if (!contact || context.messages.length === 0) {
        return [];
      }

      const lastUserMessage = context.messages
        .filter(m => m.role === 'user')
        .pop();

      if (!lastUserMessage) {
        return [];
      }

      const prompt = `Com base na conversa abaixo, sugira ${count} possíveis respostas profissionais e úteis:

${context.messages.map(m => `${m.role === 'user' ? 'Cliente' : 'Atendente'}: ${m.content}`).join('\n')}

Gere ${count} sugestões de resposta separadas por "---":`;

      const response = await this.generateChatResponse(
        {
          tenantId,
          contactId,
          messages: [{ role: 'user', content: prompt }]
        },
        "Você é um assistente que gera sugestões de resposta para atendimento ao cliente."
      );

      const suggestions = response.response
        .split('---')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .slice(0, count);

      return suggestions;

    } catch (error) {
      logger.error("Erro ao gerar sugestões:", error);
      return [];
    }
  }

  /**
   * Registra uso da API para analytics
   */
  private static async recordUsage(
    tenantId: number,
    usage: {
      model: string;
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      responseTime: number;
      error?: string;
    }
  ): Promise<void> {
    try {
      const now = new Date();
      const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000 - 1);

      await AnalyticsMetric.create({
        tenantId,
        metricType: 'ai_usage',
        value: usage.totalTokens,
        unit: 'tokens',
        period: 'hourly',
        periodStart: hourStart,
        periodEnd: hourEnd,
        dimensions: {
          model: usage.model,
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          hasError: !!usage.error
        },
        metadata: {
          responseTime: usage.responseTime,
          error: usage.error
        }
      });

    } catch (error) {
      logger.error("Erro ao registrar uso da IA:", error);
    }
  }

  /**
   * Limpa cache de instâncias
   */
  static clearInstanceCache(): void {
    this.instances.clear();
  }

  /**
   * Obtém estatísticas de uso
   */
  static async getUsageStats(
    tenantId: number,
    days = 30
  ): Promise<{
    totalTokens: number;
    totalCalls: number;
    avgTokensPerCall: number;
    avgResponseTime: number;
    errorRate: number;
  }> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const metrics = await AnalyticsMetric.findAll({
        where: {
          tenantId,
          metricType: 'ai_usage',
          createdAt: { [require('sequelize').Op.gte]: since }
        }
      });

      if (metrics.length === 0) {
        return {
          totalTokens: 0,
          totalCalls: 0,
          avgTokensPerCall: 0,
          avgResponseTime: 0,
          errorRate: 0
        };
      }

      const totalTokens = metrics.reduce((sum, m) => sum + m.value, 0);
      const totalCalls = metrics.length;
      const totalResponseTime = metrics.reduce((sum, m) => sum + (m.metadata?.responseTime || 0), 0);
      const errorCount = metrics.filter(m => m.dimensions?.hasError).length;

      return {
        totalTokens,
        totalCalls,
        avgTokensPerCall: Math.round(totalTokens / totalCalls),
        avgResponseTime: Math.round(totalResponseTime / totalCalls),
        errorRate: Math.round((errorCount / totalCalls) * 100 * 100) / 100
      };

    } catch (error) {
      logger.error("Erro ao obter estatísticas de uso:", error);
      return {
        totalTokens: 0,
        totalCalls: 0,
        avgTokensPerCall: 0,
        avgResponseTime: 0,
        errorRate: 0
      };
    }
  }
}

export default OpenAIService;