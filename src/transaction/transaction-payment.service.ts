// payment/notchpay.service.ts
import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  METHOD_REQUEST,
  METHOD_PAYMENT,
  CancelResponse,
} from 'src/types/notchpay/all.type';

import {
  InitializePaymentPayload,
  CompletePaymentPayload,
  PaymentResponse,
  PaymentsResponse,
  CompletePaymentResponse,
} from 'src/types/notchpay/payment.type';

interface NotchPayAPIProps {
  BASE_URL: string;
  PUBLIC_KEY: string;
  PRIVATE_KEY: string;
}

@Injectable()
export class NotchPayPaymentService {
  private readonly logger = new Logger(NotchPayPaymentService.name);
  private API: NotchPayAPIProps;

  constructor(private configService: ConfigService) {
    this.API = {
      BASE_URL:
        this.configService.get('NOTCHPAY_API_URL') || 'https://api.notchpay.co',
      PUBLIC_KEY: this.configService.get('NOTCHPAY_PUBLIC_KEY')!,
      PRIVATE_KEY: this.configService.get('NOTCHPAY_PRIVATE_KEY')!,
    };

    // Vérifier que les clés sont présentes
    if (!this.API.PUBLIC_KEY || !this.API.PRIVATE_KEY) {
      throw new Error('NotchPay API keys are not configured');
    }
  }

  /**
   * Méthode générique pour gérer les paiements (deposits)
   */
  private async notchPaymentRequest(
    method: METHOD_REQUEST,
    endpoint: string = '',
    payload?: InitializePaymentPayload | CompletePaymentPayload,
  ): Promise<Response> {
    const url = `${this.API.BASE_URL}/payments/${endpoint ? encodeURIComponent(endpoint) : ''}`;
    this.logger.log(`${method} / url => ${url}`);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${this.API.PUBLIC_KEY}`,
        },
        ...(payload && { body: JSON.stringify(payload) }),
      });

      return response;
    } catch (error) {
      this.logger.error(
        `NotchPay payment request failed: ${(error as any).message}`,
      );
      throw new ForbiddenException('Erreur de communication avec NotchPay');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PAYMENTS (DEPOSITS)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lister tous les paiements
   */
  async listPayments(): Promise<PaymentsResponse> {
    try {
      const response = await this.notchPaymentRequest('GET');

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `List payments failed: ${response.status} ${errorText}`,
        );
        throw new BadRequestException(
          'Impossible de récupérer la liste des paiements',
        );
      }

      const payments = (await response.json()) as PaymentsResponse;
      this.logger.log('Payments retrieved successfully');
      return payments;
    } catch (error) {
      this.logger.error('listing-payment-error =>', error);
      throw new ForbiddenException(
        'Erreur lors de la récupération des paiements',
      );
    }
  }

  /**
   * Créer un paiement (initialiser une transaction)
   */
  async createPayment(
    email: string,
    phone: string,
    amount: number,
    description?: string,
  ): Promise<PaymentResponse> {
    try {
      const payload: InitializePaymentPayload = {
        amount,
        currency: 'XAF',
        email,
        phone,
        ...(description && { description }),
      };

      this.logger.log(`NotchPay payment request payload : ${payload}`);

      const response = await this.notchPaymentRequest('POST', '', payload);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Create payment failed: ${response.status} ${errorText}`,
        );
        throw new BadRequestException('Impossible de créer le paiement');
      }

      const payment = (await response.json()) as PaymentResponse;
      this.logger.log(`Payment created: ${payment.transaction.reference}`);
      return payment;
    } catch (error) {
      this.logger.error('creating-payment-error =>', error);
      throw new ForbiddenException('Erreur lors de la création du paiement');
    }
  }

  /**
   * Compléter un paiement (lancer la transaction côté marchand)
   */
  async completePayment(
    transaction_id: string,
    service: METHOD_PAYMENT,
    phone: string,
  ): Promise<CompletePaymentResponse> {
    try {
      const payload: CompletePaymentPayload = {
        channel: service,
        data: { phone },
      };

      const response = await this.notchPaymentRequest(
        'POST',
        transaction_id,
        payload,
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Complete payment failed: ${response.status} ${errorText}`,
        );
        throw new BadRequestException('Impossible de compléter le paiement');
      }

      const payment = (await response.json()) as CompletePaymentResponse;
      this.logger.log(
        `Payment waiting for customer completion: ${payment.message}`,
      );
      return payment;
    } catch (error) {
      this.logger.error('process-payment-error =>', error);
      throw new ForbiddenException('Erreur lors du traitement du paiement');
    }
  }

  /**
   * Vérifier l'état d'un paiement
   */
  async checkPayment(transaction_id: string): Promise<PaymentResponse> {
    try {
      const response = await this.notchPaymentRequest('GET', transaction_id);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Check payment failed: ${response.status} ${errorText}`,
        );
        throw new BadRequestException('Impossible de vérifier le paiement');
      }

      const payment = (await response.json()) as PaymentResponse;
      this.logger.log(
        `Payment check - ${payment.transaction.reference}, state: ${payment.transaction.status}`,
      );
      return payment;
    } catch (error) {
      this.logger.error('checking-payment-error =>', error);
      throw new ForbiddenException(
        'Erreur lors de la vérification du paiement',
      );
    }
  }

  /**
   * Annuler un paiement
   */
  async cancelPayment(transaction_id: string): Promise<CancelResponse> {
    try {
      const response = await this.notchPaymentRequest('DELETE', transaction_id);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Cancel payment failed: ${response.status} ${errorText}`,
        );
        throw new BadRequestException("Impossible d'annuler le paiement");
      }

      const cancel = (await response.json()) as CancelResponse;
      this.logger.log(
        `Payment cancelled - code: ${cancel.code}, message: ${cancel.message}`,
      );
      return cancel;
    } catch (error) {
      this.logger.error('canceling-payment-error =>', error);
      throw new ForbiddenException("Erreur lors de l'annulation du paiement");
    }
  }
}
