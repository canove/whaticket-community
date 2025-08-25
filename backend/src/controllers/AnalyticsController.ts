import { Request, Response } from "express";
import { Op } from "sequelize";
import { subDays, subHours, format, startOfDay, endOfDay } from "date-fns";
import AnalyticsService from "../services/AnalyticsServices/AnalyticsService";
import ReportGeneratorService from "../services/AnalyticsServices/ReportGeneratorService";
import AnalyticsMetric from "../models/AnalyticsMetric";
import AppError from "../errors/AppError";

export const getMetrics = async (req: Request, res: Response): Promise<Response> => {
  const { period = "7d" } = req.query;

  try {
    let startDate: Date;
    let endDate: Date = new Date();

    // Parse period parameter
    switch (period) {
      case "1h":
        startDate = subHours(endDate, 1);
        break;
      case "24h":
        startDate = subHours(endDate, 24);
        break;
      case "7d":
        startDate = subDays(endDate, 7);
        break;
      case "30d":
        startDate = subDays(endDate, 30);
        break;
      case "90d":
        startDate = subDays(endDate, 90);
        break;
      default:
        startDate = subDays(endDate, 7);
    }

    // Generate metrics for the period
    const metrics = {
      // Ticket volume over time
      ticketVolume: await generateTicketVolumeData(startDate, endDate),
      
      // Response time trends
      responseTime: await generateResponseTimeData(startDate, endDate),
      
      // Resolution rate
      resolutionRate: await generateResolutionRateData(startDate, endDate),
      
      // User activity patterns
      userActivity: await generateUserActivityData(startDate, endDate),
      
      // Transcription usage
      transcriptionUsage: await generateTranscriptionUsageData(startDate, endDate),
      
      // AI agent usage
      aiAgentUsage: await generateAIAgentUsageData(startDate, endDate),
      
      // Sentiment analysis
      sentimentAnalysis: await generateSentimentAnalysisData(startDate, endDate),
    };

    return res.json(metrics);
  } catch (error) {
    throw new AppError("ERR_ANALYTICS_FETCH", 500);
  }
};

export const getKPIs = async (req: Request, res: Response): Promise<Response> => {
  const { period = "7d" } = req.query;

  try {
    let startDate: Date;
    let endDate: Date = new Date();

    switch (period) {
      case "1h":
        startDate = subHours(endDate, 1);
        break;
      case "24h":
        startDate = subHours(endDate, 24);
        break;
      case "7d":
        startDate = subDays(endDate, 7);
        break;
      case "30d":
        startDate = subDays(endDate, 30);
        break;
      case "90d":
        startDate = subDays(endDate, 90);
        break;
      default:
        startDate = subDays(endDate, 7);
    }

    // Calculate KPIs with mock data for now
    const kpis = {
      avgResponseTime: {
        value: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
        change: (Math.random() - 0.5) * 20, // -10% to +10%
      },
      resolutionRate: {
        value: Math.floor(Math.random() * 30) + 70, // 70-100%
        change: (Math.random() - 0.5) * 10, // -5% to +5%
      },
      ticketCount: {
        value: Math.floor(Math.random() * 500) + 100, // 100-600 tickets
        change: (Math.random() - 0.5) * 40, // -20% to +20%
      },
      activeUsers: {
        value: Math.floor(Math.random() * 50) + 10, // 10-60 users
        change: (Math.random() - 0.5) * 20, // -10% to +10%
      },
      transcriptions: {
        value: Math.floor(Math.random() * 200) + 50, // 50-250 transcriptions
        change: (Math.random() - 0.5) * 30, // -15% to +15%
      },
      aiInteractions: {
        value: Math.floor(Math.random() * 300) + 100, // 100-400 interactions
        change: (Math.random() - 0.5) * 25, // -12.5% to +12.5%
      },
    };

    return res.json(kpis);
  } catch (error) {
    throw new AppError("ERR_KPI_FETCH", 500);
  }
};

export const exportReport = async (req: Request, res: Response): Promise<Response> => {
  const { format = "pdf", period = "7d" } = req.body;

  try {
    let startDate: Date;
    let endDate: Date = new Date();

    switch (period) {
      case "1h":
        startDate = subHours(endDate, 1);
        break;
      case "24h":
        startDate = subHours(endDate, 24);
        break;
      case "7d":
        startDate = subDays(endDate, 7);
        break;
      case "30d":
        startDate = subDays(endDate, 30);
        break;
      case "90d":
        startDate = subDays(endDate, 90);
        break;
      default:
        startDate = subDays(endDate, 7);
    }

    // Generate mock report content for now
    let reportContent: string | Buffer;
    
    const mockData = {
      title: `Analytics Report - ${period}`,
      period,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      kpis: await getKPIData(startDate, endDate),
      metrics: await getMetricsData(startDate, endDate),
    };

    // Set appropriate headers and generate content based on format
    switch (format) {
      case "pdf":
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=analytics-report-${period}.pdf`);
        // For now, return mock PDF message
        reportContent = `Mock PDF Report for period: ${period}`;
        break;
        
      case "excel":
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=analytics-report-${period}.xlsx`);
        // For now, return mock Excel message
        reportContent = `Mock Excel Report for period: ${period}`;
        break;
        
      case "csv":
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=analytics-report-${period}.csv`);
        // Generate simple CSV content
        reportContent = `Period,Avg Response Time,Resolution Rate,Ticket Count\n${period},${mockData.kpis.avgResponseTime},${mockData.kpis.resolutionRate},${mockData.kpis.ticketCount}`;
        break;
        
      default:
        throw new AppError("ERR_INVALID_FORMAT", 400);
    }

    return res.send(reportContent);
  } catch (error) {
    throw new AppError("ERR_REPORT_EXPORT", 500);
  }
};

// Helper functions to generate mock data
async function generateTicketVolumeData(startDate: Date, endDate: Date) {
  const data = [];
  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < diffDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    data.push({
      date: format(date, "yyyy-MM-dd"),
      count: Math.floor(Math.random() * 50) + 10, // 10-60 tickets per day
    });
  }
  
  return data;
}

async function generateResponseTimeData(startDate: Date, endDate: Date) {
  const data = [];
  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < diffDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    data.push({
      date: format(date, "yyyy-MM-dd"),
      avgTime: Math.floor(Math.random() * 40) + 20, // 20-60 minutes
    });
  }
  
  return data;
}

async function generateResolutionRateData(startDate: Date, endDate: Date) {
  const data = [];
  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < diffDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    data.push({
      date: format(date, "yyyy-MM-dd"),
      rate: Math.floor(Math.random() * 30) + 70, // 70-100%
    });
  }
  
  return data;
}

async function generateUserActivityData(startDate: Date, endDate: Date) {
  const data = [];
  
  // Generate hourly data for the last 24 hours
  for (let hour = 0; hour < 24; hour++) {
    data.push({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      activeUsers: Math.floor(Math.random() * 20) + 5, // 5-25 active users per hour
    });
  }
  
  return data;
}

async function generateTranscriptionUsageData(startDate: Date, endDate: Date) {
  return [
    { name: "Português", count: Math.floor(Math.random() * 100) + 50 },
    { name: "Inglês", count: Math.floor(Math.random() * 30) + 10 },
    { name: "Espanhol", count: Math.floor(Math.random() * 20) + 5 },
    { name: "Outros", count: Math.floor(Math.random() * 10) + 2 },
  ];
}

async function generateAIAgentUsageData(startDate: Date, endDate: Date) {
  const data = [];
  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < diffDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    data.push({
      date: format(date, "yyyy-MM-dd"),
      interactions: Math.floor(Math.random() * 100) + 20, // 20-120 interactions
    });
  }
  
  return data;
}

async function generateSentimentAnalysisData(startDate: Date, endDate: Date) {
  return [
    { sentiment: "Positivo", count: Math.floor(Math.random() * 150) + 100 },
    { sentiment: "Neutro", count: Math.floor(Math.random() * 200) + 150 },
    { sentiment: "Negativo", count: Math.floor(Math.random() * 80) + 30 },
  ];
}

async function getKPIData(startDate: Date, endDate: Date) {
  // Mock KPI data for report
  return {
    avgResponseTime: Math.floor(Math.random() * 60) + 15,
    resolutionRate: Math.floor(Math.random() * 30) + 70,
    ticketCount: Math.floor(Math.random() * 500) + 100,
    activeUsers: Math.floor(Math.random() * 50) + 10,
    transcriptions: Math.floor(Math.random() * 200) + 50,
    aiInteractions: Math.floor(Math.random() * 300) + 100,
  };
}

async function getMetricsData(startDate: Date, endDate: Date) {
  return {
    ticketVolume: await generateTicketVolumeData(startDate, endDate),
    responseTime: await generateResponseTimeData(startDate, endDate),
    resolutionRate: await generateResolutionRateData(startDate, endDate),
    userActivity: await generateUserActivityData(startDate, endDate),
    transcriptionUsage: await generateTranscriptionUsageData(startDate, endDate),
    aiAgentUsage: await generateAIAgentUsageData(startDate, endDate),
    sentimentAnalysis: await generateSentimentAnalysisData(startDate, endDate),
  };
}