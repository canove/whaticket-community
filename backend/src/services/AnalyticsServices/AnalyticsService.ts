import { Op } from "sequelize";
import { logger } from "../../utils/logger";
import AnalyticsMetric, { MetricType, MetricPeriod } from "../../models/AnalyticsMetric";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Campaign from "../../models/Campaign";
import FlowExecution from "../../models/FlowExecution";

interface MetricQuery {
  tenantId: number;
  metricType?: MetricType;
  period?: MetricPeriod;
  startDate?: Date;
  endDate?: Date;
  dimensions?: Record<string, any>;
}

interface KPIResult {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

interface DashboardData {
  kpis: {
    totalTickets: KPIResult;
    avgResponseTime: KPIResult;
    resolutionRate: KPIResult;
    customerSatisfaction: KPIResult;
    aiUsage: KPIResult;
  };
  charts: {
    ticketsOverTime: Array<{ date: string; value: number }>;
    responseTimeOverTime: Array<{ date: string; value: number }>;
    topPerformingFlows: Array<{ name: string; success_rate: number; executions: number }>;
    userActivity: Array<{ user: string; tickets: number; avg_response_time: number }>;
  };
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    metric: string;
    value: number;
  }>;
}

class AnalyticsService {
  /**
   * Registra uma nova métrica
   */
  static async recordMetric(
    tenantId: number,
    metricType: MetricType,
    value: number,
    options: {
      unit?: string;
      period?: MetricPeriod;
      dimensions?: Record<string, any>;
      metadata?: Record<string, any>;
      customPeriodStart?: Date;
      customPeriodEnd?: Date;
    } = {}
  ): Promise<AnalyticsMetric> {
    try {
      const {
        unit,
        period = 'daily',
        dimensions = {},
        metadata = {},
        customPeriodStart,
        customPeriodEnd
      } = options;

      // Calcula período baseado no tipo
      const { periodStart, periodEnd } = customPeriodStart && customPeriodEnd 
        ? { periodStart: customPeriodStart, periodEnd: customPeriodEnd }
        : this.calculatePeriod(period);

      const metric = await AnalyticsMetric.create({
        tenantId,
        metricType,
        value,
        unit,
        period,
        periodStart,
        periodEnd,
        dimensions,
        metadata
      });

      logger.debug(`Métrica registrada: ${metricType} = ${value} para tenant ${tenantId}`);
      
      return metric;

    } catch (error) {
      logger.error("Erro ao registrar métrica:", error);
      throw error;
    }
  }

  /**
   * Calcula métricas de tempo de resposta
   */
  static async calculateResponseTimeMetrics(tenantId: number, period: MetricPeriod = 'daily'): Promise<void> {
    try {
      const { periodStart, periodEnd } = this.calculatePeriod(period);

      // Busca tickets resolvidos no período
      const tickets = await Ticket.findAll({
        where: {
          tenantId,
          status: 'closed',
          updatedAt: {
            [Op.between]: [periodStart, periodEnd]
          }
        },
        include: [
          {
            model: Message,
            as: 'messages',
            where: {
              fromMe: false // Primeira mensagem do cliente
            },
            order: [['createdAt', 'ASC']],
            limit: 1
          }
        ]
      });

      if (tickets.length === 0) {
        await this.recordMetric(tenantId, 'response_time', 0, {
          unit: 'minutes',
          period,
          dimensions: { ticket_count: 0 }
        });
        return;
      }

      let totalResponseTime = 0;
      let validTickets = 0;

      for (const ticket of tickets) {
        if (ticket.messages && ticket.messages.length > 0) {
          const firstMessage = ticket.messages[0];
          const responseTime = (ticket.updatedAt.getTime() - firstMessage.createdAt.getTime()) / (1000 * 60); // em minutos
          
          if (responseTime > 0 && responseTime < 10080) { // Máximo de 1 semana
            totalResponseTime += responseTime;
            validTickets++;
          }
        }
      }

      const avgResponseTime = validTickets > 0 ? totalResponseTime / validTickets : 0;

      await this.recordMetric(tenantId, 'response_time', Math.round(avgResponseTime), {
        unit: 'minutes',
        period,
        dimensions: { 
          total_tickets: tickets.length,
          valid_tickets: validTickets
        }
      });

    } catch (error) {
      logger.error("Erro ao calcular métricas de tempo de resposta:", error);
    }
  }

  /**
   * Calcula taxa de resolução de tickets
   */
  static async calculateResolutionRate(tenantId: number, period: MetricPeriod = 'daily'): Promise<void> {
    try {
      const { periodStart, periodEnd } = this.calculatePeriod(period);

      const totalTickets = await Ticket.count({
        where: {
          tenantId,
          createdAt: {
            [Op.between]: [periodStart, periodEnd]
          }
        }
      });

      const resolvedTickets = await Ticket.count({
        where: {
          tenantId,
          status: 'closed',
          createdAt: {
            [Op.between]: [periodStart, periodEnd]
          }
        }
      });

      const resolutionRate = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;

      await this.recordMetric(tenantId, 'resolution_rate', Math.round(resolutionRate * 100) / 100, {
        unit: 'percentage',
        period,
        dimensions: {
          total_tickets: totalTickets,
          resolved_tickets: resolvedTickets
        }
      });

    } catch (error) {
      logger.error("Erro ao calcular taxa de resolução:", error);
    }
  }

  /**
   * Calcula volume de tickets
   */
  static async calculateTicketVolume(tenantId: number, period: MetricPeriod = 'daily'): Promise<void> {
    try {
      const { periodStart, periodEnd } = this.calculatePeriod(period);

      const ticketCount = await Ticket.count({
        where: {
          tenantId,
          createdAt: {
            [Op.between]: [periodStart, periodEnd]
          }
        }
      });

      // Conta por status
      const statusCounts = await Ticket.findAll({
        where: {
          tenantId,
          createdAt: {
            [Op.between]: [periodStart, periodEnd]
          }
        },
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('*')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      const statusDimensions = statusCounts.reduce((acc: any, item: any) => {
        acc[`status_${item.status}`] = item.count;
        return acc;
      }, {});

      await this.recordMetric(tenantId, 'ticket_volume', ticketCount, {
        unit: 'tickets',
        period,
        dimensions: {
          ...statusDimensions,
          total: ticketCount
        }
      });

    } catch (error) {
      logger.error("Erro ao calcular volume de tickets:", error);
    }
  }

  /**
   * Calcula atividade de usuários
   */
  static async calculateUserActivity(tenantId: number, period: MetricPeriod = 'daily'): Promise<void> {
    try {
      const { periodStart, periodEnd } = this.calculatePeriod(period);

      const userActivity = await Message.findAll({
        where: {
          tenantId,
          fromMe: true,
          createdAt: {
            [Op.between]: [periodStart, periodEnd]
          }
        },
        include: [
          {
            model: Ticket,
            as: 'ticket',
            attributes: ['userId'],
            where: {
              userId: { [Op.ne]: null }
            }
          }
        ],
        attributes: [
          [require('sequelize').col('ticket.userId'), 'userId'],
          [require('sequelize').fn('COUNT', require('sequelize').col('*')), 'message_count']
        ],
        group: ['ticket.userId'],
        raw: true
      });

      for (const activity of userActivity as any[]) {
        if (activity.userId) {
          await this.recordMetric(tenantId, 'user_activity', parseInt(activity.message_count), {
            unit: 'messages',
            period,
            dimensions: {
              user_id: activity.userId
            }
          });
        }
      }

    } catch (error) {
      logger.error("Erro ao calcular atividade de usuários:", error);
    }
  }

  /**
   * Calcula engajamento de contatos
   */
  static async calculateContactEngagement(tenantId: number, period: MetricPeriod = 'daily'): Promise<void> {
    try {
      const { periodStart, periodEnd } = this.calculatePeriod(period);

      const contactEngagement = await Message.findAll({
        where: {
          tenantId,
          fromMe: false,
          createdAt: {
            [Op.between]: [periodStart, periodEnd]
          }
        },
        attributes: [
          'contactId',
          [require('sequelize').fn('COUNT', require('sequelize').col('*')), 'message_count']
        ],
        group: ['contactId'],
        having: require('sequelize').where(
          require('sequelize').fn('COUNT', require('sequelize').col('*')),
          Op.gt,
          0
        ),
        raw: true
      });

      const totalEngagedContacts = contactEngagement.length;
      const totalMessages = contactEngagement.reduce((sum: number, item: any) => 
        sum + parseInt(item.message_count), 0);

      const avgMessagesPerContact = totalEngagedContacts > 0 
        ? totalMessages / totalEngagedContacts 
        : 0;

      await this.recordMetric(tenantId, 'contact_engagement', Math.round(avgMessagesPerContact * 100) / 100, {
        unit: 'messages_per_contact',
        period,
        dimensions: {
          engaged_contacts: totalEngagedContacts,
          total_messages: totalMessages
        }
      });

    } catch (error) {
      logger.error("Erro ao calcular engajamento de contatos:", error);
    }
  }

  /**
   * Busca métricas com filtros
   */
  static async getMetrics(query: MetricQuery): Promise<AnalyticsMetric[]> {
    try {
      const where: any = { tenantId: query.tenantId };

      if (query.metricType) {
        where.metricType = query.metricType;
      }

      if (query.period) {
        where.period = query.period;
      }

      if (query.startDate || query.endDate) {
        where.createdAt = {};
        if (query.startDate) where.createdAt[Op.gte] = query.startDate;
        if (query.endDate) where.createdAt[Op.lte] = query.endDate;
      }

      if (query.dimensions) {
        // Filtra por dimensões específicas
        where.dimensions = {
          [Op.contains]: query.dimensions
        };
      }

      return await AnalyticsMetric.findAll({
        where,
        order: [['createdAt', 'DESC']]
      });

    } catch (error) {
      logger.error("Erro ao buscar métricas:", error);
      return [];
    }
  }

  /**
   * Calcula KPI com comparação com período anterior
   */
  static async calculateKPI(
    tenantId: number,
    metricType: MetricType,
    period: MetricPeriod = 'daily'
  ): Promise<KPIResult> {
    try {
      const { periodStart: currentStart, periodEnd: currentEnd } = this.calculatePeriod(period);
      
      // Calcula período anterior
      const periodDuration = currentEnd.getTime() - currentStart.getTime();
      const previousStart = new Date(currentStart.getTime() - periodDuration);
      const previousEnd = new Date(currentEnd.getTime() - periodDuration);

      // Busca métricas do período atual
      const currentMetrics = await this.getMetrics({
        tenantId,
        metricType,
        period,
        startDate: currentStart,
        endDate: currentEnd
      });

      // Busca métricas do período anterior
      const previousMetrics = await this.getMetrics({
        tenantId,
        metricType,
        period,
        startDate: previousStart,
        endDate: previousEnd
      });

      // Calcula valores médios
      const current = currentMetrics.length > 0 
        ? currentMetrics.reduce((sum, m) => sum + m.value, 0) / currentMetrics.length
        : 0;

      const previous = previousMetrics.length > 0
        ? previousMetrics.reduce((sum, m) => sum + m.value, 0) / previousMetrics.length
        : 0;

      const change = current - previous;
      const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (Math.abs(changePercent) > 5) {
        trend = changePercent > 0 ? 'up' : 'down';
      }

      return {
        current: Math.round(current * 100) / 100,
        previous: Math.round(previous * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        trend
      };

    } catch (error) {
      logger.error("Erro ao calcular KPI:", error);
      return {
        current: 0,
        previous: 0,
        change: 0,
        changePercent: 0,
        trend: 'stable'
      };
    }
  }

  /**
   * Gera dados completos para dashboard
   */
  static async generateDashboardData(tenantId: number, period: MetricPeriod = 'daily'): Promise<DashboardData> {
    try {
      // Calcula KPIs principais
      const [totalTickets, avgResponseTime, resolutionRate, customerSatisfaction, aiUsage] = await Promise.all([
        this.calculateKPI(tenantId, 'ticket_volume', period),
        this.calculateKPI(tenantId, 'response_time', period),
        this.calculateKPI(tenantId, 'resolution_rate', period),
        this.calculateKPI(tenantId, 'contact_engagement', period),
        this.calculateKPI(tenantId, 'ai_usage', period)
      ]);

      // Gera dados para gráficos
      const charts = await this.generateChartData(tenantId, period);

      // Gera alertas baseados nos KPIs
      const alerts = this.generateAlerts({
        totalTickets,
        avgResponseTime,
        resolutionRate,
        customerSatisfaction,
        aiUsage
      });

      return {
        kpis: {
          totalTickets,
          avgResponseTime,
          resolutionRate,
          customerSatisfaction,
          aiUsage
        },
        charts,
        alerts
      };

    } catch (error) {
      logger.error("Erro ao gerar dados do dashboard:", error);
      return {
        kpis: {
          totalTickets: { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' },
          avgResponseTime: { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' },
          resolutionRate: { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' },
          customerSatisfaction: { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' },
          aiUsage: { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' }
        },
        charts: {
          ticketsOverTime: [],
          responseTimeOverTime: [],
          topPerformingFlows: [],
          userActivity: []
        },
        alerts: []
      };
    }
  }

  /**
   * Gera dados para gráficos
   */
  private static async generateChartData(tenantId: number, period: MetricPeriod) {
    const { periodStart, periodEnd } = this.calculatePeriod(period, 7); // Últimos 7 períodos

    // Tickets ao longo do tempo
    const ticketsOverTime = await AnalyticsMetric.findAll({
      where: {
        tenantId,
        metricType: 'ticket_volume',
        createdAt: { [Op.between]: [periodStart, periodEnd] }
      },
      order: [['createdAt', 'ASC']]
    });

    // Tempo de resposta ao longo do tempo
    const responseTimeOverTime = await AnalyticsMetric.findAll({
      where: {
        tenantId,
        metricType: 'response_time',
        createdAt: { [Op.between]: [periodStart, periodEnd] }
      },
      order: [['createdAt', 'ASC']]
    });

    return {
      ticketsOverTime: ticketsOverTime.map(m => ({
        date: m.createdAt.toISOString().split('T')[0],
        value: m.value
      })),
      responseTimeOverTime: responseTimeOverTime.map(m => ({
        date: m.createdAt.toISOString().split('T')[0],
        value: m.value
      })),
      topPerformingFlows: [], // TODO: Implementar quando houver dados de flows
      userActivity: [] // TODO: Implementar quando houver dados de usuários
    };
  }

  /**
   * Gera alertas baseados nos KPIs
   */
  private static generateAlerts(kpis: any): Array<{ type: 'warning' | 'error' | 'info'; message: string; metric: string; value: number }> {
    const alerts = [];

    // Alerta para tempo de resposta alto
    if (kpis.avgResponseTime.current > 60) { // Mais de 1 hora
      alerts.push({
        type: 'warning' as const,
        message: `Tempo médio de resposta está alto: ${kpis.avgResponseTime.current} minutos`,
        metric: 'response_time',
        value: kpis.avgResponseTime.current
      });
    }

    // Alerta para taxa de resolução baixa
    if (kpis.resolutionRate.current < 80) {
      alerts.push({
        type: 'error' as const,
        message: `Taxa de resolução está baixa: ${kpis.resolutionRate.current}%`,
        metric: 'resolution_rate',
        value: kpis.resolutionRate.current
      });
    }

    // Alerta para aumento significativo de tickets
    if (kpis.totalTickets.changePercent > 50) {
      alerts.push({
        type: 'info' as const,
        message: `Volume de tickets aumentou ${kpis.totalTickets.changePercent}%`,
        metric: 'ticket_volume',
        value: kpis.totalTickets.changePercent
      });
    }

    return alerts;
  }

  /**
   * Calcula período baseado no tipo
   */
  private static calculatePeriod(period: MetricPeriod, count = 1): { periodStart: Date; periodEnd: Date } {
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date = new Date(now);

    switch (period) {
      case 'hourly':
        periodStart = new Date(now.getTime() - (count * 60 * 60 * 1000));
        break;
      case 'daily':
        periodStart = new Date(now.getTime() - (count * 24 * 60 * 60 * 1000));
        break;
      case 'weekly':
        periodStart = new Date(now.getTime() - (count * 7 * 24 * 60 * 60 * 1000));
        break;
      case 'monthly':
        periodStart = new Date(now);
        periodStart.setMonth(periodStart.getMonth() - count);
        break;
      case 'yearly':
        periodStart = new Date(now);
        periodStart.setFullYear(periodStart.getFullYear() - count);
        break;
      default:
        periodStart = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 1 dia
    }

    return { periodStart, periodEnd };
  }

  /**
   * Executa todas as métricas automaticamente
   */
  static async calculateAllMetrics(tenantId: number, period: MetricPeriod = 'daily'): Promise<void> {
    try {
      await Promise.all([
        this.calculateResponseTimeMetrics(tenantId, period),
        this.calculateResolutionRate(tenantId, period),
        this.calculateTicketVolume(tenantId, period),
        this.calculateUserActivity(tenantId, period),
        this.calculateContactEngagement(tenantId, period)
      ]);

      logger.info(`Métricas calculadas para tenant ${tenantId} - período: ${period}`);

    } catch (error) {
      logger.error(`Erro ao calcular métricas para tenant ${tenantId}:`, error);
    }
  }
}

export default AnalyticsService;