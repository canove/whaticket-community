import { logger } from "../../utils/logger";
import Contact from "../../models/Contact";
import Tenant from "../../models/Tenant";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface TemplateVariables {
  [key: string]: any;
  // Standard contact variables
  nome?: string;
  telefone?: string;
  email?: string;
  empresa?: string;
  // Standard functions
  data_hoje?: string;
  hora_atual?: string;
  nome_empresa?: string;
}

class MessageTemplateService {
  private readonly VARIABLE_REGEX = /\{\{([^}]+)\}\}/g;
  private readonly FUNCTION_REGEX = /^(data_hoje|hora_atual|nome_empresa)$/;

  /**
   * Process message template replacing variables with actual values
   */
  async processTemplate(
    template: string,
    contact: Contact,
    tenant: Tenant,
    customVariables?: Record<string, any>
  ): Promise<string> {
    try {
      // Get all variables used in template
      const variables = this.extractVariables(template);
      
      // Build variable values
      const variableValues = await this.buildVariableValues(
        variables,
        contact,
        tenant,
        customVariables
      );

      // Replace variables in template
      return this.replaceVariables(template, variableValues);
    } catch (error) {
      logger.error("Error processing template:", error);
      throw new Error(`Template processing failed: ${error.message}`);
    }
  }

  /**
   * Extract all variables from template
   */
  private extractVariables(template: string): string[] {
    const matches = template.match(this.VARIABLE_REGEX);
    if (!matches) return [];

    return matches.map(match => {
      // Remove {{ and }}
      return match.replace(/[{}]/g, '').trim();
    });
  }

  /**
   * Build values for all variables
   */
  private async buildVariableValues(
    variables: string[],
    contact: Contact,
    tenant: Tenant,
    customVariables?: Record<string, any>
  ): Promise<Record<string, string>> {
    const values: Record<string, string> = {};

    for (const variable of variables) {
      // Check if it's a function
      if (this.FUNCTION_REGEX.test(variable)) {
        values[variable] = await this.executeFunction(variable, tenant);
        continue;
      }

      // Check custom variables first
      if (customVariables && customVariables[variable] !== undefined) {
        values[variable] = String(customVariables[variable]);
        continue;
      }

      // Check contact standard fields
      values[variable] = this.getContactVariable(variable, contact);
    }

    return values;
  }

  /**
   * Get contact variable value
   */
  private getContactVariable(variable: string, contact: Contact): string {
    switch (variable) {
      case 'nome':
        return contact.name || '';
      case 'telefone':
        return contact.number || '';
      case 'email':
        return contact.email || '';
      case 'empresa':
        // This could come from extraInfo or a custom field
        return this.getExtraInfo(contact, 'empresa') || '';
      default:
        // Try to get from extraInfo
        return this.getExtraInfo(contact, variable) || `{{${variable}}}`;
    }
  }

  /**
   * Get value from contact extraInfo
   */
  private getExtraInfo(contact: Contact, key: string): string {
    if (!contact.extraInfo || !Array.isArray(contact.extraInfo)) {
      return '';
    }

    const info = contact.extraInfo.find(item => 
      item.name?.toLowerCase() === key.toLowerCase()
    );

    return info?.value || '';
  }

  /**
   * Execute template functions
   */
  private async executeFunction(functionName: string, tenant: Tenant): Promise<string> {
    const now = new Date();

    switch (functionName) {
      case 'data_hoje':
        return format(now, 'dd/MM/yyyy', { locale: ptBR });
      
      case 'hora_atual':
        return format(now, 'HH:mm', { locale: ptBR });
      
      case 'nome_empresa':
        return tenant.name || '';
      
      default:
        return `{{${functionName}}}`;
    }
  }

  /**
   * Replace variables in template with their values
   */
  private replaceVariables(
    template: string,
    variables: Record<string, string>
  ): string {
    let processed = template;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      processed = processed.replace(regex, value);
    }

    return processed;
  }

  /**
   * Validate template syntax
   */
  validateTemplate(template: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      // Check for unmatched braces
      const openBraces = (template.match(/\{\{/g) || []).length;
      const closeBraces = (template.match(/\}\}/g) || []).length;

      if (openBraces !== closeBraces) {
        errors.push('Unmatched template braces {{ }}');
      }

      // Check for empty variables
      const emptyVariables = template.match(/\{\{\s*\}\}/g);
      if (emptyVariables) {
        errors.push('Empty template variables found');
      }

      // Check for nested variables
      const nestedVariables = template.match(/\{\{[^}]*\{\{/g);
      if (nestedVariables) {
        errors.push('Nested template variables are not supported');
      }

      // Extract and validate variable names
      const variables = this.extractVariables(template);
      for (const variable of variables) {
        if (variable.trim() === '') {
          errors.push('Empty variable name found');
          continue;
        }

        // Check for invalid characters in variable names
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable.trim())) {
          errors.push(`Invalid variable name: ${variable}`);
        }
      }

    } catch (error) {
      errors.push(`Template validation error: ${error.message}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get available variables for a template
   */
  getAvailableVariables(): Record<string, string> {
    return {
      // Contact variables
      'nome': 'Nome do contato',
      'telefone': 'Número do telefone',
      'email': 'Email do contato',
      'empresa': 'Nome da empresa (campo personalizado)',
      
      // Functions
      'data_hoje': 'Data atual (dd/MM/yyyy)',
      'hora_atual': 'Hora atual (HH:mm)',
      'nome_empresa': 'Nome da empresa (tenant)',
    };
  }

  /**
   * Preview template with sample data
   */
  previewTemplate(
    template: string,
    sampleData?: Partial<TemplateVariables>
  ): string {
    const defaultSample: TemplateVariables = {
      nome: 'João Silva',
      telefone: '(11) 99999-9999',
      email: 'joao@exemplo.com',
      empresa: 'Exemplo Ltda',
      data_hoje: format(new Date(), 'dd/MM/yyyy', { locale: ptBR }),
      hora_atual: format(new Date(), 'HH:mm', { locale: ptBR }),
      nome_empresa: 'Minha Empresa',
      ...sampleData
    };

    return this.replaceVariables(template, 
      Object.fromEntries(
        Object.entries(defaultSample).map(([k, v]) => [k, String(v)])
      )
    );
  }

  /**
   * Extract variables used in template for audience targeting
   */
  getRequiredContactFields(template: string): string[] {
    const variables = this.extractVariables(template);
    const contactFields: string[] = [];

    for (const variable of variables) {
      // Skip functions
      if (this.FUNCTION_REGEX.test(variable)) continue;

      // Standard contact fields
      if (['nome', 'telefone', 'email'].includes(variable)) {
        contactFields.push(variable);
      } else {
        // Custom fields from extraInfo
        contactFields.push(variable);
      }
    }

    return [...new Set(contactFields)]; // Remove duplicates
  }
}

export default new MessageTemplateService();