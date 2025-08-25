import axios, { AxiosInstance } from "axios";
import { logger } from "../../utils/logger";
import PaymentIntegration, { PaymentProvider, PaymentStatus, PaymentMethod } from "../../models/PaymentIntegration";
import Contact from "../../models/Contact";
import Tenant from "../../models/Tenant";

export interface AsaasCustomer {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  cpfCnpj: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  city?: string;
  state?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  observations?: string;
}

export interface AsaasCharge {
  id?: string;
  customer: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'DEBIT_CARD' | 'TRANSFER';
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
  installmentCount?: number;
  installmentValue?: number;
  discount?: {
    value?: number;
    dueDateLimitDays?: number;
    type?: 'FIXED' | 'PERCENTAGE';
  };
  interest?: {
    value: number;
    type?: 'PERCENTAGE';
  };
  fine?: {
    value: number;
    type?: 'FIXED' | 'PERCENTAGE';
  };
  postalService?: boolean;
  split?: any[];
  callback?: {
    successUrl?: string;
    autoRedirect?: boolean;
  };
}

export interface AsaasConfig {
  apiKey: string;
  baseUrl?: string;
  sandbox?: boolean;
}

class AsaasService {
  private client: AxiosInstance;
  private config: AsaasConfig;

  constructor(config: AsaasConfig) {
    this.config = config;
    
    const baseURL = config.baseUrl || (config.sandbox 
      ? 'https://sandbox.asaas.com/api/v3'
      : 'https://api.asaas.com/v3');

    this.client = axios.create({
      baseURL,
      headers: {
        'access_token': config.apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'Whaticket-Integration/1.0'
      },
      timeout: 30000
    });

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.info(`Asaas API ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
      },
      (error) => {
        logger.error(`Asaas API Error: ${error.response?.status} ${error.response?.statusText}`, {
          url: error.config?.url,
          method: error.config?.method,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create or update customer in Asaas
   */
  async createOrUpdateCustomer(contact: Contact): Promise<AsaasCustomer> {
    try {
      const customerData: Omit<AsaasCustomer, 'id'> = {
        name: contact.name,
        email: contact.email || undefined,
        phone: contact.number,
        mobilePhone: contact.number,
        cpfCnpj: this.extractCpfCnpj(contact),
        externalReference: contact.id.toString()
      };

      // Try to find existing customer first
      const existingCustomer = await this.findCustomerByExternalReference(contact.id.toString());
      
      if (existingCustomer) {
        // Update existing customer
        const response = await this.client.put(`/customers/${existingCustomer.id}`, customerData);
        return response.data;
      } else {
        // Create new customer
        const response = await this.client.post('/customers', customerData);
        return response.data;
      }
    } catch (error) {
      logger.error('Error creating/updating Asaas customer:', error);
      throw new Error(`Failed to create/update customer: ${error.response?.data?.errors?.[0]?.description || error.message}`);
    }
  }

  /**
   * Find customer by external reference
   */
  private async findCustomerByExternalReference(externalReference: string): Promise<AsaasCustomer | null> {
    try {
      const response = await this.client.get('/customers', {
        params: { externalReference }
      });
      
      return response.data.data?.[0] || null;
    } catch (error) {
      logger.error('Error finding Asaas customer:', error);
      return null;
    }
  }

  /**
   * Create charge/cobrança
   */
  async createCharge(params: {
    contact: Contact;
    amount: number;
    description: string;
    dueDate: Date;
    billingType: PaymentMethod;
    installments?: number;
    externalReference?: string;
  }): Promise<PaymentIntegration> {
    try {
      const { contact, amount, description, dueDate, billingType, installments, externalReference } = params;

      // Create or update customer first
      const customer = await this.createOrUpdateCustomer(contact);

      // Map billing type
      const asaasBillingType = this.mapPaymentMethodToAsaas(billingType);

      // Create charge data
      const chargeData: AsaasCharge = {
        customer: customer.id!,
        billingType: asaasBillingType,
        value: amount,
        dueDate: dueDate.toISOString().split('T')[0],
        description,
        externalReference: externalReference || `contact-${contact.id}-${Date.now()}`
      };

      if (installments && installments > 1) {
        chargeData.installmentCount = installments;
        chargeData.installmentValue = Math.round((amount / installments) * 100) / 100;
      }

      // Create charge
      const response = await this.client.post('/payments', chargeData);
      const charge = response.data;

      // Create PaymentIntegration record
      const paymentIntegration = await PaymentIntegration.create({
        provider: PaymentProvider.ASAAS,
        externalId: charge.id,
        status: this.mapAsaasStatusToInternal(charge.status),
        amount: charge.value,
        description: charge.description,
        dueDate: new Date(charge.dueDate),
        paymentMethod: billingType,
        paymentUrl: charge.invoiceUrl,
        boletoUrl: charge.bankSlipUrl,
        pixCode: charge.pixTransaction?.payload,
        pixQrCode: charge.pixTransaction?.qrCode?.encodedImage,
        netValue: charge.netValue,
        externalData: charge,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          cpfCnpj: customer.cpfCnpj
        },
        tenantId: contact.tenantId,
        contactId: contact.id,
        lastSyncAt: new Date()
      });

      logger.info(`Asaas charge created: ${charge.id} for contact ${contact.id}`);
      return paymentIntegration;

    } catch (error) {
      logger.error('Error creating Asaas charge:', error);
      throw new Error(`Failed to create charge: ${error.response?.data?.errors?.[0]?.description || error.message}`);
    }
  }

  /**
   * Get charge status from Asaas
   */
  async getChargeStatus(externalId: string): Promise<any> {
    try {
      const response = await this.client.get(`/payments/${externalId}`);
      return response.data;
    } catch (error) {
      logger.error('Error getting Asaas charge status:', error);
      throw new Error(`Failed to get charge status: ${error.response?.data?.errors?.[0]?.description || error.message}`);
    }
  }

  /**
   * Update local payment integration with Asaas data
   */
  async syncPaymentStatus(paymentId: number): Promise<PaymentIntegration> {
    try {
      const payment = await PaymentIntegration.findByPk(paymentId);
      if (!payment) {
        throw new Error('Payment integration not found');
      }

      const asaasCharge = await this.getChargeStatus(payment.externalId);
      
      await payment.update({
        status: this.mapAsaasStatusToInternal(asaasCharge.status),
        paymentDate: asaasCharge.paymentDate ? new Date(asaasCharge.paymentDate) : null,
        netValue: asaasCharge.netValue,
        fees: {
          total: asaasCharge.totalValue - asaasCharge.netValue,
          gateway: asaasCharge.asaasFee
        },
        externalData: asaasCharge,
        lastSyncAt: new Date()
      });

      return payment;
    } catch (error) {
      logger.error('Error syncing payment status:', error);
      throw error;
    }
  }

  /**
   * Handle webhook from Asaas
   */
  async handleWebhook(payload: any): Promise<void> {
    try {
      const { event, payment } = payload;
      
      if (!payment?.id) {
        logger.warn('Asaas webhook received without payment ID');
        return;
      }

      const paymentIntegration = await PaymentIntegration.findOne({
        where: { externalId: payment.id, provider: PaymentProvider.ASAAS }
      });

      if (!paymentIntegration) {
        logger.warn(`Payment integration not found for Asaas payment ${payment.id}`);
        return;
      }

      // Update payment status
      await paymentIntegration.update({
        status: this.mapAsaasStatusToInternal(payment.status),
        paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : null,
        netValue: payment.netValue,
        fees: {
          total: payment.totalValue - payment.netValue,
          gateway: payment.asaasFee
        },
        externalData: payment,
        webhookResponse: JSON.stringify(payload),
        lastSyncAt: new Date()
      });

      logger.info(`Asaas webhook processed for payment ${payment.id}, event: ${event}`);
    } catch (error) {
      logger.error('Error handling Asaas webhook:', error);
      throw error;
    }
  }

  /**
   * Generate payment link
   */
  async generatePaymentLink(params: {
    contact: Contact;
    amount: number;
    description: string;
    successUrl?: string;
    externalReference?: string;
  }): Promise<string> {
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

      const payment = await this.createCharge({
        contact: params.contact,
        amount: params.amount,
        description: params.description,
        dueDate,
        billingType: PaymentMethod.PIX // Default to PIX for links
      });

      return payment.paymentUrl || '';
    } catch (error) {
      logger.error('Error generating payment link:', error);
      throw error;
    }
  }

  /**
   * Map PaymentMethod to Asaas billing type
   */
  private mapPaymentMethodToAsaas(method: PaymentMethod): AsaasCharge['billingType'] {
    const mapping = {
      [PaymentMethod.BOLETO]: 'BOLETO' as const,
      [PaymentMethod.CREDIT_CARD]: 'CREDIT_CARD' as const,
      [PaymentMethod.PIX]: 'PIX' as const,
      [PaymentMethod.DEBIT_CARD]: 'DEBIT_CARD' as const,
      [PaymentMethod.TRANSFER]: 'TRANSFER' as const
    };

    return mapping[method] || 'PIX';
  }

  /**
   * Map Asaas status to internal status
   */
  private mapAsaasStatusToInternal(asaasStatus: string): PaymentStatus {
    const mapping: Record<string, PaymentStatus> = {
      'PENDING': PaymentStatus.PENDING,
      'RECEIVED': PaymentStatus.RECEIVED,
      'CONFIRMED': PaymentStatus.CONFIRMED,
      'OVERDUE': PaymentStatus.OVERDUE,
      'REFUNDED': PaymentStatus.REFUNDED,
      'RECEIVED_IN_CASH': PaymentStatus.RECEIVED_IN_CASH,
      'REFUND_REQUESTED': PaymentStatus.REFUND_REQUESTED,
      'REFUND_IN_PROGRESS': PaymentStatus.REFUND_IN_PROGRESS,
      'CHARGEBACK_REQUESTED': PaymentStatus.CHARGEBACK_REQUESTED,
      'CHARGEBACK_DISPUTE': PaymentStatus.CHARGEBACK_DISPUTE,
      'AWAITING_CHARGEBACK_REVERSAL': PaymentStatus.AWAITING_CHARGEBACK_REVERSAL,
      'DUNNING_REQUESTED': PaymentStatus.DUNNING_REQUESTED,
      'DUNNING_RECEIVED': PaymentStatus.DUNNING_RECEIVED,
      'AWAITING_RISK_ANALYSIS': PaymentStatus.AWAITING_RISK_ANALYSIS
    };

    return mapping[asaasStatus] || PaymentStatus.PENDING;
  }

  /**
   * Extract CPF/CNPJ from contact extraInfo
   */
  private extractCpfCnpj(contact: Contact): string {
    // Try to get from extraInfo
    if (contact.extraInfo && Array.isArray(contact.extraInfo)) {
      const cpfField = contact.extraInfo.find(info => 
        info.name?.toLowerCase().includes('cpf') || 
        info.name?.toLowerCase().includes('cnpj') ||
        info.name?.toLowerCase().includes('documento')
      );
      
      if (cpfField?.value) {
        return cpfField.value.replace(/\D/g, ''); // Remove non-digits
      }
    }

    // Fallback: generate a fake CPF for testing (not for production!)
    return this.generateFakeCpf();
  }

  /**
   * Generate fake CPF for testing (DO NOT use in production!)
   */
  private generateFakeCpf(): string {
    const digits = () => Math.floor(Math.random() * 9).toString();
    return `${digits()}${digits()}${digits()}.${digits()}${digits()}${digits()}.${digits()}${digits()}${digits()}-${digits()}${digits()}`;
  }
}

export default AsaasService;