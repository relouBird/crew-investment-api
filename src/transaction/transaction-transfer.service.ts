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
  InitializeTransferPayload,
  InitializeSimpleTransferPayload,
} from 'src/types/notchpay/all.type';

import {
  TransferResponse,
  TransfersResponse,
} from 'src/types/notchpay/transfer.type';

interface NotchPayAPIProps {
  BASE_URL: string;
  PUBLIC_KEY: string;
  PRIVATE_KEY: string;
}

@Injectable()
export class NotchPayTransferService {
  private readonly logger = new Logger(NotchPayTransferService.name);
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
   * Méthode générique pour gérer les transferts (withdrawals)
   */
  private async notchTransferRequest(
    method: METHOD_REQUEST,
    endpoint: string = '',
    payload?: InitializeTransferPayload | InitializeSimpleTransferPayload,
  ): Promise<Response> {
    const url = `${this.API.BASE_URL}/transfers/${endpoint ? encodeURIComponent(endpoint) : ''}`;
    this.logger.log(`${method} / url => ${url}`);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${this.API.PUBLIC_KEY}`,
          'X-Grant': this.API.PRIVATE_KEY,
        },
        ...(payload && { body: JSON.stringify(payload) }),
      });

      return response;
    } catch (error) {
      this.logger.error(
        `NotchPay transfer request failed: ${(error as any).message}`,
      );
      throw new ForbiddenException('Erreur de communication avec NotchPay');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TRANSFERS (WITHDRAWALS)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Créer un transfert vers un bénéficiaire existant
   */
  async createTransfer(
    recipient_id: string,
    amount: number,
    description?: string,
  ): Promise<TransferResponse> {
    try {
      const payload: InitializeTransferPayload = {
        amount,
        currency: 'XAF',
        beneficiary: recipient_id,
        channel: 'cm.mobile',
        description: description || 'Payment for services',
      };

      this.logger.log('TRANSFER-PAYLOAD ==>', payload);

      const response = await this.notchTransferRequest('POST', '', payload);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Create transfer failed: ${response.status} ${errorText}`,
        );
        throw new BadRequestException('Impossible de créer le transfert');
      }

      const transfer = (await response.json()) as TransferResponse;
      this.logger.log(`Transfer created: ${transfer.transfer.reference}`);
      return transfer;
    } catch (error) {
      this.logger.error('creating-transfer-error =>', error);
      throw new ForbiddenException('Erreur lors de la création du transfert');
    }
  }

  /**
   * Créer un transfert simple (sans bénéficiaire préalable)
   */
  async createSimpleTransfer(
    name: string,
    phone: string,
    amount: number,
  ): Promise<TransferResponse> {
    try {
      const payload: InitializeSimpleTransferPayload = {
        description: 'MANUAL_CASHOUT',
        amount,
        currency: 'XAF',
        channel: 'cm.mobile',
        recipient: {
          account_number: phone.replace('+', ''),
          country: 'CM',
          name,
        },
      };

      const response = await this.notchTransferRequest('POST', '', payload);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Create simple transfer failed: ${response.status} ${errorText}`,
        );
        throw new BadRequestException('Impossible de créer le transfert');
      }

      const transfer = (await response.json()) as TransferResponse;
      this.logger.log(
        `Simple transfer created: ${transfer.transfer.reference}`,
      );
      return transfer;
    } catch (error) {
      this.logger.error('creating-simple-transfer-error =>', error);
      throw new ForbiddenException(
        'Erreur lors de la création du transfert simple',
      );
    }
  }

  /**
   * Vérifier l'état d'un transfert
   */
  async checkTransfer(transaction_id: string): Promise<TransferResponse> {
    try {
      const response = await this.notchTransferRequest('GET', transaction_id);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Check transfer failed: ${response.status} ${errorText}`,
        );
        throw new BadRequestException('Impossible de vérifier le transfert');
      }

      const transfer = (await response.json()) as TransferResponse;
      this.logger.log(
        `Transfer checked: ${transfer.transfer.reference}, status : ${transfer.transfer.status}`,
      );
      return transfer;
    } catch (error) {
      this.logger.error('checking-transfer-error =>', error);
      throw new ForbiddenException(
        'Erreur lors de la vérification du transfert',
      );
    }
  }

  /**
   * Lister tous les transferts
   */
  async listTransfers(): Promise<TransfersResponse> {
    try {
      const response = await this.notchTransferRequest('GET', '');

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `List transfers failed: ${response.status} ${errorText}`,
        );
        throw new BadRequestException(
          'Impossible de récupérer la liste des transferts',
        );
      }

      const transfers = (await response.json()) as TransfersResponse;
      this.logger.log('Transfers listed successfully');
      return transfers;
    } catch (error) {
      this.logger.error('listing-transfers-error =>', error);
      throw new ForbiddenException(
        'Erreur lors de la récupération des transferts',
      );
    }
  }
}
