import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import Setting from "../models/Setting";
import OpenAIService from "../services/AIServices/OpenAIService";
import AudioTranscriptionService from "../services/AIServices/AudioTranscriptionService";
import AppError from "../errors/AppError";

interface AISettingsRequest {
  // OpenAI Settings
  openai_api_key?: string;
  openai_model?: string;
  openai_temperature?: number;
  openai_max_tokens?: number;
  openai_enabled?: boolean;
  
  // Audio Transcription Settings
  audio_transcription_enabled?: boolean;
  audio_transcription_provider?: string;
  audio_auto_transcribe?: boolean;
  transcription_language?: string;
  
  // AI Agent Settings
  ai_agent_enabled?: boolean;
  ai_agent_prompt?: string;
  ai_sentiment_analysis?: boolean;
  ai_auto_suggestions?: boolean;
  
  // Analytics Settings
  analytics_enabled?: boolean;
  analytics_data_retention_days?: number;
  analytics_real_time?: boolean;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const settings = await Setting.findAll({
      attributes: ["key", "value"],
    });

    const aiSettings: any = {};
    
    // Default values for AI settings
    const defaultSettings = {
      openai_api_key: "",
      openai_model: "gpt-3.5-turbo",
      openai_temperature: 0.7,
      openai_max_tokens: 1000,
      openai_enabled: false,
      audio_transcription_enabled: false,
      audio_transcription_provider: "openai",
      audio_auto_transcribe: true,
      transcription_language: "pt-BR",
      ai_agent_enabled: false,
      ai_agent_prompt: "Você é um assistente inteligente. Ajude o usuário com suas dúvidas de forma clara e educada.",
      ai_sentiment_analysis: true,
      ai_auto_suggestions: true,
      analytics_enabled: true,
      analytics_data_retention_days: 90,
      analytics_real_time: true,
    };

    // Apply existing settings
    settings.forEach((setting) => {
      const key = setting.key;
      let value: any = setting.value;
      
      // Convert boolean and number values
      if (value === "true") value = true;
      else if (value === "false") value = false;
      else if (!isNaN(Number(value))) value = Number(value);
      
      aiSettings[key] = value;
    });

    // Merge with defaults
    const result = { ...defaultSettings, ...aiSettings };

    return res.json(result);
  } catch (error) {
    throw new AppError("ERR_AI_SETTINGS_FETCH", 500);
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const settings: AISettingsRequest = req.body;

  try {
    // Update each setting in the database
    for (const [key, value] of Object.entries(settings)) {
      await Setting.upsert({
        key,
        value: String(value),
      });
    }

    // Emit socket event for real-time updates
    const io = getIO();
    io.emit("ai-settings", {
      action: "update",
      settings,
    });

    return res.json({ message: "AI settings updated successfully" });
  } catch (error) {
    throw new AppError("ERR_AI_SETTINGS_UPDATE", 500);
  }
};

export const status = async (req: Request, res: Response): Promise<Response> => {
  try {
    const connectionStatus = {
      openai: false,
      transcription: false,
    };

    // Check OpenAI connection
    try {
      const openaiKey = await Setting.findOne({
        where: { key: "openai_api_key" },
      });
      
      if (openaiKey && openaiKey.value) {
        connectionStatus.openai = true;
      }
    } catch (error) {
      connectionStatus.openai = false;
    }

    // Check transcription service
    try {
      const transcriptionEnabled = await Setting.findOne({
        where: { key: "audio_transcription_enabled" },
      });
      
      if (transcriptionEnabled && transcriptionEnabled.value === "true") {
        connectionStatus.transcription = true;
      }
    } catch (error) {
      connectionStatus.transcription = false;
    }

    return res.json(connectionStatus);
  } catch (error) {
    throw new AppError("ERR_AI_STATUS_CHECK", 500);
  }
};

export const testConnection = async (req: Request, res: Response): Promise<Response> => {
  const { service } = req.params;

  try {
    switch (service) {
      case "openai":
        return res.json({ message: "OpenAI connection test - mock response" });
        
      case "transcription":
        return res.json({ message: "Transcription service connection test - mock response" });
        
      default:
        throw new AppError("ERR_INVALID_SERVICE", 400);
    }
  } catch (error) {
    throw new AppError(`ERR_${service.toUpperCase()}_CONNECTION_FAILED`, 400);
  }
};

export const getUsageStats = async (req: Request, res: Response): Promise<Response> => {
  const { period = "7d" } = req.query;

  try {
    // This would fetch usage statistics for AI services
    // For now, returning mock data
    const usageStats = {
      openai: {
        requests: 1250,
        tokens: 45000,
        cost: 12.5,
        period: period as string,
      },
      transcription: {
        audios: 340,
        minutes: 120,
        cost: 3.6,
        period: period as string,
      },
    };

    return res.json(usageStats);
  } catch (error) {
    throw new AppError("ERR_AI_USAGE_STATS", 500);
  }
};

export const resetSettings = async (req: Request, res: Response): Promise<Response> => {
  const { category } = req.body;

  try {
    let keysToDelete: string[] = [];

    switch (category) {
      case "openai":
        keysToDelete = [
          "openai_api_key",
          "openai_model",
          "openai_temperature",
          "openai_max_tokens",
          "openai_enabled",
          "ai_agent_enabled",
          "ai_agent_prompt",
          "ai_sentiment_analysis",
          "ai_auto_suggestions",
        ];
        break;
        
      case "transcription":
        keysToDelete = [
          "audio_transcription_enabled",
          "audio_transcription_provider",
          "audio_auto_transcribe",
          "transcription_language",
        ];
        break;
        
      case "analytics":
        keysToDelete = [
          "analytics_enabled",
          "analytics_data_retention_days",
          "analytics_real_time",
        ];
        break;
        
      case "all":
        keysToDelete = [
          // All AI-related settings
          "openai_api_key",
          "openai_model",
          "openai_temperature",
          "openai_max_tokens",
          "openai_enabled",
          "audio_transcription_enabled",
          "audio_transcription_provider",
          "audio_auto_transcribe",
          "transcription_language",
          "ai_agent_enabled",
          "ai_agent_prompt",
          "ai_sentiment_analysis",
          "ai_auto_suggestions",
          "analytics_enabled",
          "analytics_data_retention_days",
          "analytics_real_time",
        ];
        break;
        
      default:
        throw new AppError("ERR_INVALID_CATEGORY", 400);
    }

    // Delete specified settings
    await Setting.destroy({
      where: {
        key: keysToDelete,
      },
    });

    // Emit socket event
    const io = getIO();
    io.emit("ai-settings", {
      action: "reset",
      category,
    });

    return res.json({ message: `${category} settings reset successfully` });
  } catch (error) {
    throw new AppError("ERR_AI_SETTINGS_RESET", 500);
  }
};