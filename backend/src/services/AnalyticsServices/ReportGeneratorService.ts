import * as fs from "fs";
import * as path from "path";
import { logger } from "../../utils/logger";
import AnalyticsService from "./AnalyticsService";
import AnalyticsMetric, { MetricType, MetricPeriod } from "../../models/AnalyticsMetric";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import Contact from "../../models/Contact";
import User from "../../models/User";

interface ReportConfig {
  tenantId: number;
  title: string;
  description?: string;
  period: MetricPeriod;
  startDate?: Date;
  endDate?: Date;
  metrics: MetricType[];
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts?: boolean;
  includeRawData?: boolean;
}

interface ReportSection {
  title: string;
  type: 'kpi' | 'chart' | 'table' | 'text';
  data: any;
}

interface GeneratedReport {
  id: string;
  config: ReportConfig;
  sections: ReportSection[];
  generatedAt: Date;
  filePath?: string;
  size?: number;
}

class ReportGeneratorService {
  private static reportsDir = path.join(__dirname, "..", "..", "..", "reports");

  /**
   * Inicializa o diretório de relatórios
   */
  static async initialize(): Promise<void> {
    try {
      if (!fs.existsSync(this.reportsDir)) {
        fs.mkdirSync(this.reportsDir, { recursive: true });
      }
    } catch (error) {
      logger.error("Erro ao inicializar diretório de relatórios:", error);
    }
  }

  /**
   * Gera um relatório completo
   */
  static async generateReport(config: ReportConfig): Promise<GeneratedReport> {
    try {
      const reportId = this.generateReportId();
      
      logger.info(`Gerando relatório ${reportId} para tenant ${config.tenantId}`);

      // Coleta dados baseado na configuração
      const sections = await this.collectReportData(config);

      const report: GeneratedReport = {
        id: reportId,
        config,
        sections,
        generatedAt: new Date()
      };

      // Gera arquivo baseado no formato
      if (config.format !== 'json') {
        const filePath = await this.generateReportFile(report);
        report.filePath = filePath;
        report.size = fs.statSync(filePath).size;
      }

      logger.info(`Relatório ${reportId} gerado com sucesso`);

      return report;

    } catch (error) {
      logger.error("Erro ao gerar relatório:", error);
      throw error;
    }
  }

  /**
   * Gera relatório de desempenho geral
   */
  static async generatePerformanceReport(
    tenantId: number,
    period: MetricPeriod = 'weekly',
    format: 'pdf' | 'excel' | 'csv' = 'pdf'
  ): Promise<GeneratedReport> {
    const config: ReportConfig = {
      tenantId,
      title: `Relatório de Desempenho - ${this.formatPeriod(period)}`,
      description: "Análise completa do desempenho do atendimento",
      period,
      metrics: ['ticket_volume', 'response_time', 'resolution_rate', 'user_activity'],
      format,
      includeCharts: true,
      includeRawData: false
    };

    return await this.generateReport(config);
  }

  /**
   * Gera relatório de uso de IA
   */
  static async generateAIUsageReport(
    tenantId: number,
    period: MetricPeriod = 'monthly',
    format: 'pdf' | 'excel' | 'csv' = 'excel'
  ): Promise<GeneratedReport> {
    const config: ReportConfig = {
      tenantId,
      title: `Relatório de Uso de IA - ${this.formatPeriod(period)}`,
      description: "Análise detalhada do uso de recursos de inteligência artificial",
      period,
      metrics: ['ai_usage'],
      format,
      includeCharts: true,
      includeRawData: true
    };

    return await this.generateReport(config);
  }

  /**
   * Gera relatório de satisfação do cliente
   */
  static async generateSatisfactionReport(
    tenantId: number,
    period: MetricPeriod = 'monthly',
    format: 'pdf' | 'excel' | 'csv' = 'pdf'
  ): Promise<GeneratedReport> {
    const config: ReportConfig = {
      tenantId,
      title: `Relatório de Satisfação do Cliente - ${this.formatPeriod(period)}`,
      description: "Análise da satisfação e engajamento dos clientes",
      period,
      metrics: ['contact_engagement', 'resolution_rate'],
      format,
      includeCharts: true,
      includeRawData: false
    };

    return await this.generateReport(config);
  }

  /**
   * Coleta dados para o relatório
   */
  private static async collectReportData(config: ReportConfig): Promise<ReportSection[]> {
    const sections: ReportSection[] = [];

    // Seção de resumo executivo
    const dashboardData = await AnalyticsService.generateDashboardData(config.tenantId, config.period);
    
    sections.push({
      title: "Resumo Executivo",
      type: "kpi",
      data: dashboardData.kpis
    });

    // Seções de métricas específicas
    for (const metricType of config.metrics) {
      const kpi = await AnalyticsService.calculateKPI(config.tenantId, metricType, config.period);
      const metrics = await AnalyticsService.getMetrics({
        tenantId: config.tenantId,
        metricType,
        period: config.period,
        startDate: config.startDate,
        endDate: config.endDate
      });

      sections.push({
        title: this.formatMetricTitle(metricType),
        type: "chart",
        data: {
          kpi,
          timeSeries: metrics.map(m => ({
            date: m.createdAt.toISOString().split('T')[0],
            value: m.value,
            dimensions: m.dimensions
          }))
        }
      });

      // Inclui dados brutos se solicitado
      if (config.includeRawData) {
        sections.push({
          title: `Dados Brutos - ${this.formatMetricTitle(metricType)}`,
          type: "table",
          data: metrics.map(m => ({
            data: m.createdAt.toISOString().split('T')[0],
            valor: m.value,
            unidade: m.unit,
            dimensoes: JSON.stringify(m.dimensions),
            metadata: JSON.stringify(m.metadata)
          }))
        });
      }
    }

    // Seção de insights automáticos
    const insights = await this.generateInsights(config.tenantId, config.period, dashboardData);
    sections.push({
      title: "Insights e Recomendações",
      type: "text",
      data: insights
    });

    return sections;
  }

  /**
   * Gera insights automáticos baseado nos dados
   */
  private static async generateInsights(
    tenantId: number,
    period: MetricPeriod,
    dashboardData: any
  ): Promise<string[]> {
    const insights: string[] = [];

    const { kpis } = dashboardData;

    // Insights sobre volume de tickets
    if (kpis.totalTickets.changePercent > 20) {
      insights.push(
        `📈 O volume de tickets aumentou ${kpis.totalTickets.changePercent.toFixed(1)}% em relação ao período anterior. ` +
        `Considere aumentar a equipe de atendimento ou otimizar os fluxos de automação.`
      );
    } else if (kpis.totalTickets.changePercent < -20) {
      insights.push(
        `📉 O volume de tickets diminuiu ${Math.abs(kpis.totalTickets.changePercent).toFixed(1)}% em relação ao período anterior. ` +
        `Isso pode indicar melhoria na automação ou redução de demanda.`
      );
    }

    // Insights sobre tempo de resposta
    if (kpis.avgResponseTime.current > 60) {
      insights.push(
        `⏰ O tempo médio de resposta está em ${kpis.avgResponseTime.current.toFixed(0)} minutos, acima do ideal. ` +
        `Recomenda-se otimizar o fluxo de atendimento e treinar a equipe.`
      );
    } else if (kpis.avgResponseTime.current < 15) {
      insights.push(
        `⚡ Excelente tempo médio de resposta de ${kpis.avgResponseTime.current.toFixed(0)} minutos! ` +
        `Continue mantendo este padrão de eficiência.`
      );
    }

    // Insights sobre taxa de resolução
    if (kpis.resolutionRate.current < 70) {
      insights.push(
        `🔧 Taxa de resolução de ${kpis.resolutionRate.current.toFixed(1)}% está abaixo do ideal. ` +
        `Considere revisar os processos de atendimento e capacitação da equipe.`
      );
    } else if (kpis.resolutionRate.current > 90) {
      insights.push(
        `✅ Excelente taxa de resolução de ${kpis.resolutionRate.current.toFixed(1)}%! ` +
        `Sua equipe está performando muito bem.`
      );
    }

    // Insights sobre uso de IA
    if (kpis.aiUsage.changePercent > 50) {
      insights.push(
        `🤖 O uso de IA aumentou ${kpis.aiUsage.changePercent.toFixed(1)}% no período. ` +
        `Monitore o ROI e a satisfação dos clientes com as respostas automatizadas.`
      );
    }

    // Insight sobre tendências
    const trendingUp = Object.values(kpis).filter((kpi: any) => kpi.trend === 'up').length;
    const trendingDown = Object.values(kpis).filter((kpi: any) => kpi.trend === 'down').length;

    if (trendingUp > trendingDown) {
      insights.push(
        `📊 A maioria das métricas está em tendência de crescimento. ` +
        `Continue monitorando para manter a qualidade do atendimento.`
      );
    } else if (trendingDown > trendingUp) {
      insights.push(
        `📊 Algumas métricas estão em declínio. ` +
        `Recomenda-se análise detalhada para identificar causas e implementar melhorias.`
      );
    }

    return insights.length > 0 ? insights : ["Não há insights específicos para este período."];
  }

  /**
   * Gera arquivo do relatório baseado no formato
   */
  private static async generateReportFile(report: GeneratedReport): Promise<string> {
    const fileName = `report_${report.id}_${Date.now()}.${report.config.format}`;
    const filePath = path.join(this.reportsDir, fileName);

    switch (report.config.format) {
      case 'csv':
        await this.generateCSVFile(report, filePath);
        break;
      case 'excel':
        await this.generateExcelFile(report, filePath);
        break;
      case 'pdf':
        await this.generatePDFFile(report, filePath);
        break;
      default:
        throw new Error(`Formato não suportado: ${report.config.format}`);
    }

    return filePath;
  }

  /**
   * Gera arquivo CSV
   */
  private static async generateCSVFile(report: GeneratedReport, filePath: string): Promise<void> {
    let csvContent = `"Relatório","${report.config.title}"\n`;
    csvContent += `"Gerado em","${report.generatedAt.toLocaleString('pt-BR')}"\n`;
    csvContent += `"Período","${this.formatPeriod(report.config.period)}"\n\n`;

    for (const section of report.sections) {
      csvContent += `"${section.title}"\n`;

      if (section.type === 'kpi' && section.data) {
        csvContent += '"Métrica","Atual","Anterior","Mudança","Mudança %","Tendência"\n';
        Object.entries(section.data).forEach(([key, value]: [string, any]) => {
          csvContent += `"${key}","${value.current}","${value.previous}","${value.change}","${value.changePercent}%","${value.trend}"\n`;
        });
      } else if (section.type === 'table' && Array.isArray(section.data)) {
        if (section.data.length > 0) {
          const headers = Object.keys(section.data[0]);
          csvContent += `"${headers.join('","')}"\n`;
          
          section.data.forEach(row => {
            const values = headers.map(header => row[header] || '');
            csvContent += `"${values.join('","')}"\n`;
          });
        }
      }
      
      csvContent += '\n';
    }

    fs.writeFileSync(filePath, csvContent, 'utf-8');
  }

  /**
   * Gera arquivo Excel (usando CSV por simplicidade)
   */
  private static async generateExcelFile(report: GeneratedReport, filePath: string): Promise<void> {
    // Por simplicidade, geramos CSV e renomeamos para Excel
    // Em produção, use uma biblioteca como exceljs
    await this.generateCSVFile(report, filePath);
  }

  /**
   * Gera arquivo PDF
   */
  private static async generatePDFFile(report: GeneratedReport, filePath: string): Promise<void> {
    // Por simplicidade, geramos HTML e salvamos como texto
    // Em produção, use uma biblioteca como puppeteer ou pdfkit
    let htmlContent = `
      <html>
        <head>
          <title>${report.config.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
            h2 { color: #34495e; margin-top: 30px; }
            .kpi { background: #ecf0f1; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .insight { background: #e8f5e8; padding: 10px; margin: 5px 0; border-radius: 3px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #bdc3c7; padding: 8px; text-align: left; }
            th { background-color: #34495e; color: white; }
          </style>
        </head>
        <body>
          <h1>${report.config.title}</h1>
          <p><strong>Gerado em:</strong> ${report.generatedAt.toLocaleString('pt-BR')}</p>
          <p><strong>Período:</strong> ${this.formatPeriod(report.config.period)}</p>
          ${report.config.description ? `<p><strong>Descrição:</strong> ${report.config.description}</p>` : ''}
    `;

    for (const section of report.sections) {
      htmlContent += `<h2>${section.title}</h2>`;

      if (section.type === 'kpi' && section.data) {
        htmlContent += '<div>';
        Object.entries(section.data).forEach(([key, value]: [string, any]) => {
          const trend = value.trend === 'up' ? '↑' : value.trend === 'down' ? '↓' : '→';
          htmlContent += `
            <div class="kpi">
              <strong>${key}:</strong> ${value.current} 
              (${value.changePercent > 0 ? '+' : ''}${value.changePercent.toFixed(1)}% ${trend})
            </div>
          `;
        });
        htmlContent += '</div>';
      } else if (section.type === 'text' && Array.isArray(section.data)) {
        section.data.forEach(insight => {
          htmlContent += `<div class="insight">${insight}</div>`;
        });
      } else if (section.type === 'table' && Array.isArray(section.data) && section.data.length > 0) {
        const headers = Object.keys(section.data[0]);
        htmlContent += '<table><thead><tr>';
        headers.forEach(header => {
          htmlContent += `<th>${header}</th>`;
        });
        htmlContent += '</tr></thead><tbody>';

        section.data.forEach(row => {
          htmlContent += '<tr>';
          headers.forEach(header => {
            htmlContent += `<td>${row[header] || ''}</td>`;
          });
          htmlContent += '</tr>';
        });

        htmlContent += '</tbody></table>';
      }
    }

    htmlContent += '</body></html>';

    fs.writeFileSync(filePath, htmlContent, 'utf-8');
  }

  /**
   * Lista relatórios gerados
   */
  static async listReports(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.reportsDir)) {
        return [];
      }

      return fs.readdirSync(this.reportsDir)
        .filter(file => file.startsWith('report_'))
        .sort((a, b) => {
          const statA = fs.statSync(path.join(this.reportsDir, a));
          const statB = fs.statSync(path.join(this.reportsDir, b));
          return statB.mtime.getTime() - statA.mtime.getTime();
        });
    } catch (error) {
      logger.error("Erro ao listar relatórios:", error);
      return [];
    }
  }

  /**
   * Remove relatórios antigos
   */
  static async cleanupOldReports(daysToKeep = 30): Promise<number> {
    try {
      if (!fs.existsSync(this.reportsDir)) {
        return 0;
      }

      const files = fs.readdirSync(this.reportsDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      let removedCount = 0;

      for (const file of files) {
        if (file.startsWith('report_')) {
          const filePath = path.join(this.reportsDir, file);
          const stat = fs.statSync(filePath);

          if (stat.mtime < cutoffDate) {
            fs.unlinkSync(filePath);
            removedCount++;
          }
        }
      }

      logger.info(`${removedCount} relatórios antigos removidos`);
      return removedCount;

    } catch (error) {
      logger.error("Erro ao limpar relatórios antigos:", error);
      return 0;
    }
  }

  /**
   * Gera ID único para o relatório
   */
  private static generateReportId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Formata nome do período
   */
  private static formatPeriod(period: MetricPeriod): string {
    const periodNames = {
      hourly: 'Por Hora',
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
      yearly: 'Anual'
    };
    return periodNames[period] || period;
  }

  /**
   * Formata título da métrica
   */
  private static formatMetricTitle(metricType: MetricType): string {
    const titles = {
      response_time: 'Tempo de Resposta',
      resolution_rate: 'Taxa de Resolução',
      flow_effectiveness: 'Eficácia dos Fluxos',
      campaign_roi: 'ROI de Campanhas',
      user_activity: 'Atividade dos Usuários',
      contact_engagement: 'Engajamento dos Contatos',
      ticket_volume: 'Volume de Tickets',
      ai_usage: 'Uso de IA',
      api_usage: 'Uso da API',
      custom: 'Métrica Personalizada'
    };
    return titles[metricType] || metricType;
  }
}

export default ReportGeneratorService;