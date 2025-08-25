import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { logger } from "../utils/logger";
import APIKey from "../models/APIKey";
import AnalyticsMetric from "../models/AnalyticsMetric";
import AppError from "../errors/AppError";

// Estende o tipo Request para incluir informações da API key
declare global {
  namespace Express {
    interface Request {
      apiKey?: APIKey;
      apiTenant?: { id: number };
    }
  }
}

// Cache para API keys válidas (otimização)
const apiKeyCache = new Map<string, CachedAPIKey>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

interface CachedAPIKey {
  apiKey: APIKey;
  cachedAt: number;
}

/**
 * Middleware de autenticação por API Key
 */
export const apiAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extrai a API key do header
    const authHeader = req.headers.authorization;
    let apiKeyString: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      apiKeyString = authHeader.substring(7);
    } else if (req.headers['x-api-key']) {
      apiKeyString = req.headers['x-api-key'] as string;
    } else if (req.query.api_key) {
      apiKeyString = req.query.api_key as string;
    }

    if (!apiKeyString) {
      throw new AppError("API key obrigatória", 401);
    }

    // Verifica cache primeiro
    const cacheKey = `apikey:${apiKeyString}`;
    const cached = apiKeyCache.get(cacheKey);
    
    let apiKey: APIKey;
    
    if (cached && (Date.now() - cached.cachedAt) < CACHE_TTL) {
      apiKey = cached.apiKey;
    } else {
      // Busca no banco de dados
      const foundApiKey = await APIKey.findOne({
        where: { 
          key: apiKeyString,
          isActive: true
        }
      });

      if (!foundApiKey) {
        logger.warn(`Tentativa de acesso com API key inválida: ${apiKeyString}`);
        throw new AppError("API key inválida", 401);
      }

      // Verifica se a key não expirou
      if (foundApiKey.isExpired()) {
        logger.warn(`Tentativa de acesso com API key expirada: ${apiKeyString}`);
        throw new AppError("API key expirada", 401);
      }

      apiKey = foundApiKey;
      
      // Atualiza cache
      apiKeyCache.set(cacheKey, {
        apiKey,
        cachedAt: Date.now()
      });
    }

    // Anexa informações ao request
    req.apiKey = apiKey;
    req.apiTenant = { id: apiKey.tenantId };

    // Atualiza estatísticas de uso (sem await para não bloquear)
    updateAPIKeyUsage(apiKey.id, req.method, req.path);

    next();

  } catch (error) {
    next(error);
  }
};

/**
 * Middleware de verificação de permissões
 */
export const requirePermission = (resource: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.apiKey) {
        throw new AppError("API key não encontrada", 401);
      }

      if (!req.apiKey.hasPermission(resource, action)) {
        logger.warn(`API key ${req.apiKey.key} tentou acessar ${resource}:${action} sem permissão`);
        throw new AppError("Permissão insuficiente", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Cria rate limiter baseado nas configurações da API key
 */
export const createAPIKeyRateLimit = () => {
  const limiters = new Map<string, any>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.apiKey;
    if (!apiKey) {
      return next();
    }

    const limitKey = `apikey_${apiKey.key}`;
    
    if (!limiters.has(limitKey)) {
      const limiter = rateLimit({
        windowMs: apiKey.rateLimitWindow * 1000,
        max: apiKey.rateLimit === -1 ? Number.MAX_SAFE_INTEGER : apiKey.rateLimit,
        keyGenerator: () => limitKey,
        handler: (req: Request, res: Response) => {
          logger.warn(`Rate limit excedido para API key: ${apiKey.key}`);
          res.status(429).json({
            error: "Rate limit excedido",
            message: `Limite de ${apiKey.rateLimit} requisições por ${apiKey.rateLimitWindow / 60} minutos excedido`
          });
        },
        standardHeaders: true,
        legacyHeaders: false
      });
      
      limiters.set(limitKey, limiter);
    }

    const limiter = limiters.get(limitKey);
    limiter(req, res, next);
  };
};

/**
 * Middleware para logging de API usage
 */
export const apiUsageLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Intercepta o final da resposta
  const originalSend = res.json;
  res.json = function(data: any) {
    const responseTime = Date.now() - startTime;
    
    // Log da requisição (sem await)
    logAPIUsage({
      apiKeyId: req.apiKey?.id,
      tenantId: req.apiTenant?.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip
    });

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Atualiza estatísticas de uso da API key
 */
async function updateAPIKeyUsage(apiKeyId: number, method: string, path: string): Promise<void> {
  try {
    await APIKey.increment('usageCount', {
      where: { id: apiKeyId }
    });

    await APIKey.update(
      { lastUsedAt: new Date() },
      { where: { id: apiKeyId } }
    );

  } catch (error) {
    logger.error('Erro ao atualizar estatísticas da API key:', error);
  }
}

/**
 * Registra uso da API para analytics
 */
async function logAPIUsage(data: {
  apiKeyId?: number;
  tenantId?: number;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  userAgent: string;
  ip: string;
}): Promise<void> {
  try {
    if (!data.tenantId || !data.apiKeyId) return;

    // Cria métrica de uso da API
    await AnalyticsMetric.create({
      tenantId: data.tenantId,
      metricType: "api_usage",
      value: 1,
      unit: "request",
      period: "hourly",
      periodStart: new Date(new Date().setMinutes(0, 0, 0)),
      periodEnd: new Date(new Date().setMinutes(59, 59, 999)),
      dimensions: {
        apiKeyId: data.apiKeyId,
        method: data.method,
        path: data.path,
        statusCode: data.statusCode,
        ip: data.ip
      },
      metadata: {
        responseTime: data.responseTime,
        userAgent: data.userAgent
      }
    });

  } catch (error) {
    logger.error('Erro ao registrar uso da API:', error);
  }
}

/**
 * Limpa o cache de API keys
 */
export const clearAPIKeyCache = (): void => {
  apiKeyCache.clear();
  logger.info("Cache de API keys limpo");
};

/**
 * Middleware para validar formato de API key
 */
export const validateAPIKeyFormat = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  let apiKeyString: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    apiKeyString = authHeader.substring(7);
  } else if (req.headers['x-api-key']) {
    apiKeyString = req.headers['x-api-key'] as string;
  }

  if (apiKeyString) {
    // Valida formato da API key (exemplo: deve ter pelo menos 32 caracteres)
    if (apiKeyString.length < 32) {
      res.status(400).json({
        error: "Formato de API key inválido",
        message: "API key deve ter pelo menos 32 caracteres"
      });
      return;
    }

    // Valida caracteres permitidos
    if (!/^[A-Za-z0-9_-]+$/.test(apiKeyString)) {
      res.status(400).json({
        error: "Formato de API key inválido",
        message: "API key contém caracteres inválidos"
      });
      return;
    }
  }

  next();
};

/**
 * Middleware para endpoints de desenvolvimento (rate limit mais baixo)
 */
export const developmentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por 15 minutos
  message: {
    error: "Muitas requisições",
    message: "Limite de 100 requisições por 15 minutos para endpoints de desenvolvimento"
  },
  standardHeaders: true,
  legacyHeaders: false
});