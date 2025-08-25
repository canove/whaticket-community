import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "crypto";
import { Op } from "sequelize";
import { logger } from "../../utils/logger";
import APIKey, { APIKeyPermission } from "../../models/APIKey";
import AppError from "../../errors/AppError";

interface CreateAPIKeyData {
  tenantId: number;
  name: string;
  permissions: APIKeyPermission[];
  rateLimit?: number;
  rateLimitWindow?: number;
  description?: string;
  expiresAt?: Date;
}

interface UpdateAPIKeyData {
  name?: string;
  permissions?: APIKeyPermission[];
  rateLimit?: number;
  rateLimitWindow?: number;
  description?: string;
  isActive?: boolean;
  expiresAt?: Date;
}

class APIKeyService {
  /**
   * Gera uma nova chave de API segura
   */
  private static generateSecureKey(): string {
    // Gera uma chave de 64 caracteres hexadecimais
    const randomPart = randomBytes(32).toString('hex');
    const timestampPart = Date.now().toString(36);
    const uuidPart = uuidv4().replace(/-/g, '');
    
    // Combina as partes e pega os primeiros 64 caracteres
    return `wk_${(randomPart + timestampPart + uuidPart).substring(0, 61)}`;
  }

  /**
   * Cria uma nova API key
   */
  static async createAPIKey(data: CreateAPIKeyData): Promise<APIKey> {
    try {
      // Valida permissões
      this.validatePermissions(data.permissions);

      // Gera chave única
      let key: string;
      let attempts = 0;
      const maxAttempts = 5;

      do {
        if (attempts >= maxAttempts) {
          throw new AppError("Não foi possível gerar uma chave única", 500);
        }
        key = this.generateSecureKey();
        attempts++;
      } while (await this.keyExists(key));

      // Cria a API key
      const apiKey = await APIKey.create({
        tenantId: data.tenantId,
        name: data.name,
        key,
        permissions: data.permissions,
        rateLimit: data.rateLimit || 1000,
        rateLimitWindow: data.rateLimitWindow || 3600,
        description: data.description,
        expiresAt: data.expiresAt,
        isActive: true,
        usageCount: 0
      });

      logger.info(`API key criada: ${apiKey.id} para tenant ${data.tenantId}`);

      return apiKey;

    } catch (error) {
      logger.error("Erro ao criar API key:", error);
      throw error;
    }
  }

  /**
   * Verifica se uma chave já existe
   */
  private static async keyExists(key: string): Promise<boolean> {
    const existingKey = await APIKey.findOne({
      where: { key }
    });
    return !!existingKey;
  }

  /**
   * Valida permissões da API key
   */
  private static validatePermissions(permissions: APIKeyPermission[]): void {
    const validResources = [
      'messages', 'contacts', 'tickets', 'campaigns', 
      'flows', 'analytics', 'webhooks', 'ai', 'admin'
    ];
    
    const validActions = [
      'create', 'read', 'update', 'delete', 'list', 'execute', '*'
    ];

    for (const permission of permissions) {
      if (!validResources.includes(permission.resource)) {
        throw new AppError(`Recurso inválido: ${permission.resource}`, 400);
      }

      for (const action of permission.actions) {
        if (!validActions.includes(action)) {
          throw new AppError(`Ação inválida: ${action}`, 400);
        }
      }
    }
  }

  /**
   * Lista API keys de um tenant
   */
  static async listAPIKeys(
    tenantId: number,
    options: {
      includeInactive?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ apiKeys: APIKey[]; total: number }> {
    const where: any = { tenantId };
    
    if (!options.includeInactive) {
      where.isActive = true;
    }

    const { count, rows } = await APIKey.findAndCountAll({
      where,
      limit: options.limit || 50,
      offset: options.offset || 0,
      order: [["createdAt", "DESC"]],
      attributes: {
        exclude: ["key"] // Não retorna a chave por segurança
      }
    });

    return {
      apiKeys: rows,
      total: count
    };
  }

  /**
   * Obtém uma API key por ID
   */
  static async getAPIKey(
    id: number,
    tenantId: number,
    includeKey = false
  ): Promise<APIKey | null> {
    const attributes = includeKey 
      ? undefined 
      : { exclude: ["key"] as (keyof APIKey)[] };

    return await APIKey.findOne({
      where: { id, tenantId },
      attributes
    });
  }

  /**
   * Obtém uma API key pela chave
   */
  static async getAPIKeyByKey(key: string): Promise<APIKey | null> {
    return await APIKey.findOne({
      where: { 
        key,
        isActive: true
      }
    });
  }

  /**
   * Atualiza uma API key
   */
  static async updateAPIKey(
    id: number,
    tenantId: number,
    data: UpdateAPIKeyData
  ): Promise<APIKey> {
    const apiKey = await APIKey.findOne({
      where: { id, tenantId }
    });

    if (!apiKey) {
      throw new AppError("API key não encontrada", 404);
    }

    // Valida permissões se foram fornecidas
    if (data.permissions) {
      this.validatePermissions(data.permissions);
    }

    await apiKey.update(data);

    logger.info(`API key ${id} atualizada para tenant ${tenantId}`);

    return apiKey;
  }

  /**
   * Desativa uma API key
   */
  static async deactivateAPIKey(id: number, tenantId: number): Promise<void> {
    const apiKey = await APIKey.findOne({
      where: { id, tenantId }
    });

    if (!apiKey) {
      throw new AppError("API key não encontrada", 404);
    }

    await apiKey.update({ isActive: false });

    logger.info(`API key ${id} desativada para tenant ${tenantId}`);
  }

  /**
   * Ativa uma API key
   */
  static async activateAPIKey(id: number, tenantId: number): Promise<void> {
    const apiKey = await APIKey.findOne({
      where: { id, tenantId }
    });

    if (!apiKey) {
      throw new AppError("API key não encontrada", 404);
    }

    await apiKey.update({ isActive: true });

    logger.info(`API key ${id} ativada para tenant ${tenantId}`);
  }

  /**
   * Deleta uma API key
   */
  static async deleteAPIKey(id: number, tenantId: number): Promise<void> {
    const apiKey = await APIKey.findOne({
      where: { id, tenantId }
    });

    if (!apiKey) {
      throw new AppError("API key não encontrada", 404);
    }

    await apiKey.destroy();

    logger.info(`API key ${id} deletada para tenant ${tenantId}`);
  }

  /**
   * Regenera uma API key
   */
  static async regenerateAPIKey(id: number, tenantId: number): Promise<APIKey> {
    const apiKey = await APIKey.findOne({
      where: { id, tenantId }
    });

    if (!apiKey) {
      throw new AppError("API key não encontrada", 404);
    }

    // Gera nova chave
    let newKey: string;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      if (attempts >= maxAttempts) {
        throw new AppError("Não foi possível gerar uma nova chave única", 500);
      }
      newKey = this.generateSecureKey();
      attempts++;
    } while (await this.keyExists(newKey));

    await apiKey.update({ 
      key: newKey,
      usageCount: 0, // Reset contador de uso
      lastUsedAt: null // Reset último uso
    });

    logger.info(`API key ${id} regenerada para tenant ${tenantId}`);

    return apiKey;
  }

  /**
   * Obtém estatísticas de uso de uma API key
   */
  static async getAPIKeyStats(
    id: number,
    tenantId: number,
    days = 30
  ): Promise<{
    totalRequests: number;
    avgRequestsPerDay: number;
    lastUsed: Date | null;
    isActive: boolean;
    isExpired: boolean;
  }> {
    const apiKey = await APIKey.findOne({
      where: { id, tenantId }
    });

    if (!apiKey) {
      throw new AppError("API key não encontrada", 404);
    }

    return {
      totalRequests: apiKey.usageCount,
      avgRequestsPerDay: Math.round(apiKey.usageCount / days),
      lastUsed: apiKey.lastUsedAt,
      isActive: apiKey.isActive,
      isExpired: apiKey.isExpired()
    };
  }

  /**
   * Lista API keys próximas do vencimento
   */
  static async getExpiringAPIKeys(
    tenantId: number,
    daysUntilExpiry = 7
  ): Promise<APIKey[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry);

    return await APIKey.findAll({
      where: {
        tenantId,
        isActive: true,
        expiresAt: {
          [Op.lte]: expiryDate,
          [Op.gt]: new Date()
        }
      },
      attributes: {
        exclude: ["key"]
      },
      order: [["expiresAt", "ASC"]]
    });
  }

  /**
   * Obtém métricas gerais das API keys de um tenant
   */
  static async getTenantAPIKeyMetrics(tenantId: number): Promise<{
    total: number;
    active: number;
    inactive: number;
    expired: number;
    totalUsage: number;
  }> {
    const allKeys = await APIKey.findAll({
      where: { tenantId }
    });

    const metrics = {
      total: allKeys.length,
      active: 0,
      inactive: 0,
      expired: 0,
      totalUsage: 0
    };

    for (const key of allKeys) {
      metrics.totalUsage += key.usageCount;

      if (key.isExpired()) {
        metrics.expired++;
      } else if (key.isActive) {
        metrics.active++;
      } else {
        metrics.inactive++;
      }
    }

    return metrics;
  }

  /**
   * Cria permissões padrão para diferentes tipos de integração
   */
  static getDefaultPermissions(type: 'full' | 'readonly' | 'webhook' | 'ai'): APIKeyPermission[] {
    switch (type) {
      case 'full':
        return [
          { resource: 'messages', actions: ['*'] },
          { resource: 'contacts', actions: ['*'] },
          { resource: 'tickets', actions: ['*'] },
          { resource: 'campaigns', actions: ['*'] },
          { resource: 'flows', actions: ['*'] },
          { resource: 'analytics', actions: ['read'] },
          { resource: 'webhooks', actions: ['*'] },
          { resource: 'ai', actions: ['*'] }
        ];

      case 'readonly':
        return [
          { resource: 'messages', actions: ['read', 'list'] },
          { resource: 'contacts', actions: ['read', 'list'] },
          { resource: 'tickets', actions: ['read', 'list'] },
          { resource: 'campaigns', actions: ['read', 'list'] },
          { resource: 'flows', actions: ['read', 'list'] },
          { resource: 'analytics', actions: ['read'] }
        ];

      case 'webhook':
        return [
          { resource: 'messages', actions: ['create'] },
          { resource: 'webhooks', actions: ['create'] }
        ];

      case 'ai':
        return [
          { resource: 'messages', actions: ['read', 'list'] },
          { resource: 'ai', actions: ['*'] },
          { resource: 'analytics', actions: ['read'] }
        ];

      default:
        return [];
    }
  }
}

export default APIKeyService;