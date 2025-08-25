import { Op, WhereOptions, FindOptions } from "sequelize";

interface TenantAwareOptions extends FindOptions {
  tenantId?: number;
}

class TenantHelper {
  /**
   * Injeta automaticamente o tenant context em opções de query do Sequelize
   */
  static injectTenantContext<T = any>(
    options: TenantAwareOptions,
    tenantId: number
  ): FindOptions<T> {
    const where: WhereOptions = options.where || {};
    
    // Se já existe uma condição where, combina com o tenantId
    if (typeof where === "object" && !Array.isArray(where)) {
      (where as any).tenantId = tenantId;
    } else {
      // Se where é uma condição mais complexa, usa Op.and
      options.where = {
        [Op.and]: [
          where,
          { tenantId }
        ]
      };
      return options;
    }

    return {
      ...options,
      where
    };
  }

  /**
   * Cria dados com tenant context automaticamente
   */
  static injectTenantData<T = any>(data: T, tenantId: number): T & { tenantId: number } {
    return {
      ...data,
      tenantId
    };
  }

  /**
   * Valida se um registro pertence ao tenant atual
   */
  static validateTenantAccess(record: any, tenantId: number): boolean {
    if (!record) return false;
    return record.tenantId === tenantId;
  }

  /**
   * Cria condições de where com tenant context
   */
  static createTenantWhere(conditions: WhereOptions, tenantId: number): WhereOptions {
    return {
      ...conditions,
      tenantId
    };
  }

  /**
   * Aplica tenant context para operações de bulk (update, destroy)
   */
  static applyTenantFilter(options: any, tenantId: number): any {
    const where = options.where || {};
    return {
      ...options,
      where: {
        ...where,
        tenantId
      }
    };
  }
}

export default TenantHelper;