import * as fs from "fs";
import * as path from "path";
import OpenAI from "openai";
import FormData from "form-data";
import axios from "axios";
import { logger } from "../../utils/logger";
import AudioTranscription, { TranscriptionProvider, TranscriptionStatus } from "../../models/AudioTranscription";
import Message from "../../models/Message";
import TenantSetting from "../../models/TenantSetting";

interface TranscriptionConfig {
  provider: TranscriptionProvider;
  apiKey: string;
  model?: string;
  language?: string;
  temperature?: number;
}

interface TranscriptionResult {
  transcription: string;
  confidence?: number;
  processingTime: number;
  provider: TranscriptionProvider;
}

class AudioTranscriptionService {
  private static cache = new Map<string, string>();

  /**
   * Obtém as configurações de transcrição para um tenant
   */
  private static async getTranscriptionConfig(tenantId: number): Promise<TranscriptionConfig> {
    const settings = await TenantSetting.findAll({
      where: {
        tenantId,
        key: [
          "ai:transcription:provider",
          "ai:transcription:openai_api_key",
          "ai:transcription:model", 
          "ai:transcription:language",
          "ai:transcription:temperature"
        ]
      }
    });

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      provider: (settingsMap["ai:transcription:provider"] as TranscriptionProvider) || "openai",
      apiKey: settingsMap["ai:transcription:openai_api_key"] || process.env.OPENAI_API_KEY || "",
      model: settingsMap["ai:transcription:model"] || "whisper-1",
      language: settingsMap["ai:transcription:language"] || "pt",
      temperature: parseFloat(settingsMap["ai:transcription:temperature"] || "0")
    };
  }

  /**
   * Transcreve um arquivo de áudio usando OpenAI Whisper
   */
  private static async transcribeWithOpenAI(
    audioPath: string,
    config: TranscriptionConfig
  ): Promise<TranscriptionResult> {
    const startTime = Date.now();

    try {
      const openai = new OpenAI({
        apiKey: config.apiKey
      });

      const audioFile = fs.createReadStream(audioPath);
      
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: config.model || "whisper-1",
        language: config.language || "pt",
        temperature: config.temperature || 0,
        response_format: "json"
      });

      const processingTime = Date.now() - startTime;

      return {
        transcription: transcription.text,
        confidence: 0.95, // OpenAI não retorna confidence, assumimos alta
        processingTime,
        provider: "openai"
      };

    } catch (error) {
      logger.error("Erro na transcrição OpenAI:", error);
      throw error;
    }
  }

  /**
   * Transcreve com fallback para Google Cloud Speech
   */
  private static async transcribeWithGoogle(
    audioPath: string,
    config: TranscriptionConfig
  ): Promise<TranscriptionResult> {
    const startTime = Date.now();

    try {
      // Implementação básica para Google Cloud Speech
      // Em produção, usar @google-cloud/speech
      const audioBytes = fs.readFileSync(audioPath).toString('base64');
      
      const response = await axios.post(
        `https://speech.googleapis.com/v1/speech:recognize?key=${config.apiKey}`,
        {
          config: {
            encoding: "WEBM_OPUS",
            sampleRateHertz: 48000,
            languageCode: config.language || "pt-BR"
          },
          audio: {
            content: audioBytes
          }
        }
      );

      const processingTime = Date.now() - startTime;
      const result = response.data.results?.[0];
      
      if (!result) {
        throw new Error("Nenhuma transcrição encontrada");
      }

      return {
        transcription: result.alternatives[0].transcript,
        confidence: result.alternatives[0].confidence,
        processingTime,
        provider: "google"
      };

    } catch (error) {
      logger.error("Erro na transcrição Google:", error);
      throw error;
    }
  }

  /**
   * Transcreve com fallback para Azure Speech
   */
  private static async transcribeWithAzure(
    audioPath: string,
    config: TranscriptionConfig
  ): Promise<TranscriptionResult> {
    const startTime = Date.now();

    try {
      // Implementação básica para Azure Speech
      const audioData = fs.readFileSync(audioPath);
      
      const response = await axios.post(
        `https://${process.env.AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`,
        audioData,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': config.apiKey,
            'Content-Type': 'audio/webm; codec=opus',
            'Accept': 'application/json'
          },
          params: {
            language: config.language || "pt-BR"
          }
        }
      );

      const processingTime = Date.now() - startTime;

      return {
        transcription: response.data.DisplayText,
        confidence: response.data.Confidence || 0.8,
        processingTime,
        provider: "azure"
      };

    } catch (error) {
      logger.error("Erro na transcrição Azure:", error);
      throw error;
    }
  }

  /**
   * Transcreve um arquivo de áudio
   */
  private static async transcribeAudio(
    audioPath: string,
    config: TranscriptionConfig
  ): Promise<TranscriptionResult> {
    // Verifica cache primeiro
    const cacheKey = `${audioPath}:${config.provider}`;
    if (this.cache.has(cacheKey)) {
      return {
        transcription: this.cache.get(cacheKey)!,
        confidence: 1.0,
        processingTime: 0,
        provider: config.provider
      };
    }

    let result: TranscriptionResult;

    try {
      switch (config.provider) {
        case "openai":
          result = await this.transcribeWithOpenAI(audioPath, config);
          break;
        case "google":
          result = await this.transcribeWithGoogle(audioPath, config);
          break;
        case "azure":
          result = await this.transcribeWithAzure(audioPath, config);
          break;
        default:
          throw new Error(`Provider não suportado: ${config.provider}`);
      }

      // Armazena no cache
      this.cache.set(cacheKey, result.transcription);
      
      return result;

    } catch (error) {
      // Tenta fallback para OpenAI se não foi o provider original
      if (config.provider !== "openai" && config.apiKey) {
        logger.warn(`Tentando fallback para OpenAI após erro em ${config.provider}`);
        try {
          result = await this.transcribeWithOpenAI(audioPath, {
            ...config,
            provider: "openai"
          });
          this.cache.set(cacheKey, result.transcription);
          return result;
        } catch (fallbackError) {
          logger.error("Erro no fallback OpenAI:", fallbackError);
        }
      }

      throw error;
    }
  }

  /**
   * Processa transcrição de áudio para uma mensagem
   */
  static async processAudioMessage(messageId: string, tenantId: number): Promise<AudioTranscription | null> {
    try {
      // Busca a mensagem
      const message = await Message.findByPk(messageId);
      if (!message || !message.mediaUrl || message.mediaType !== "audio") {
        logger.warn(`Mensagem ${messageId} não é de áudio ou não encontrada`);
        return null;
      }

      // Verifica se já existe transcrição
      const existingTranscription = await AudioTranscription.findOne({
        where: { messageId, tenantId }
      });

      if (existingTranscription && existingTranscription.status === "completed") {
        return existingTranscription;
      }

      // Cria ou atualiza registro de transcrição
      const transcriptionRecord = existingTranscription || await AudioTranscription.create({
        tenantId,
        messageId,
        audioUrl: message.mediaUrl,
        status: "pending" as TranscriptionStatus,
        provider: "openai" as TranscriptionProvider
      });

      // Marca como processando
      await transcriptionRecord.update({ status: "processing" });

      // Obtém configurações
      const config = await this.getTranscriptionConfig(tenantId);
      
      if (!config.apiKey) {
        await transcriptionRecord.update({
          status: "failed",
          errorMessage: "API key não configurada"
        });
        return transcriptionRecord;
      }

      // Caminho do arquivo de áudio
      const audioPath = path.join(__dirname, "..", "..", "..", "public", message.mediaUrl);
      
      if (!fs.existsSync(audioPath)) {
        await transcriptionRecord.update({
          status: "failed",
          errorMessage: "Arquivo de áudio não encontrado"
        });
        return transcriptionRecord;
      }

      // Executa transcrição
      const result = await this.transcribeAudio(audioPath, config);

      // Atualiza registro com resultado
      await transcriptionRecord.update({
        transcription: result.transcription,
        confidence: result.confidence,
        provider: result.provider,
        processingTimeMs: result.processingTime,
        status: "completed"
      });

      logger.info(`Transcrição concluída para mensagem ${messageId}: "${result.transcription.substring(0, 50)}..."`);

      return transcriptionRecord;

    } catch (error) {
      logger.error(`Erro ao processar transcrição para mensagem ${messageId}:`, error);

      // Atualiza status para falha
      const transcriptionRecord = await AudioTranscription.findOne({
        where: { messageId, tenantId }
      });

      if (transcriptionRecord) {
        await transcriptionRecord.update({
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Erro desconhecido"
        });
      }

      return transcriptionRecord;
    }
  }

  /**
   * Busca transcrição existente
   */
  static async getTranscription(messageId: string, tenantId: number): Promise<AudioTranscription | null> {
    return await AudioTranscription.findOne({
      where: { messageId, tenantId }
    });
  }

  /**
   * Lista transcrições por tenant
   */
  static async listTranscriptions(
    tenantId: number,
    options: {
      status?: TranscriptionStatus;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ transcriptions: AudioTranscription[]; total: number }> {
    const where: any = { tenantId };
    
    if (options.status) {
      where.status = options.status;
    }

    const { count, rows } = await AudioTranscription.findAndCountAll({
      where,
      limit: options.limit || 50,
      offset: options.offset || 0,
      order: [["createdAt", "DESC"]],
      include: [{
        model: Message,
        as: "message"
      }]
    });

    return {
      transcriptions: rows,
      total: count
    };
  }

  /**
   * Limpa cache de transcrições
   */
  static clearCache(): void {
    this.cache.clear();
  }
}

export default AudioTranscriptionService;