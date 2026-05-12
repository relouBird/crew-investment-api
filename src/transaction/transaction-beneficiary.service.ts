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
  InitializeBeneficiaryPayload,
  beneficiaryResponse,
  beneficiariesResponse,
} from 'src/types/notchpay/all.type';

interface NotchPayAPIProps {
  BASE_URL: string;
  PUBLIC_KEY: string;
  PRIVATE_KEY: string;
}

@Injectable()
export class NotchPayBeneficiaryService {
  private readonly logger = new Logger(NotchPayBeneficiaryService.name);
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
   * Méthode générique pour gérer les bénéficiaires
   */
  private async notchBeneficiaryRequest(
    method: METHOD_REQUEST,
    endpoint: string = '',
    payload?: InitializeBeneficiaryPayload,
  ): Promise<Response> {
    const url = `${this.API.BASE_URL}/beneficiaries/${endpoint ? encodeURIComponent(endpoint) : ''}`;
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
        `NotchPay beneficiary request failed: ${(error as any).message}`,
      );
      throw new ForbiddenException('Erreur de communication avec NotchPay');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BENEFICIARIES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lister tous les bénéficiaires
   */
  async listBeneficiaries(): Promise<beneficiariesResponse> {
    try {
      const response = await this.notchBeneficiaryRequest('GET', '');

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `List beneficiaries failed: ${response.status} ${errorText}`,
        );
        throw new BadRequestException(
          'Impossible de récupérer la liste des bénéficiaires',
        );
      }

      const beneficiaries = (await response.json()) as beneficiariesResponse;
      this.logger.log('Beneficiaries listed successfully');
      return beneficiaries;
    } catch (error) {
      this.logger.error('listing-beneficiaries-error =>', error);
      throw new ForbiddenException(
        'Erreur lors de la récupération des bénéficiaires',
      );
    }
  }

  /**
   * Récupérer un bénéficiaire par son ID
   */
  async getBeneficiary(beneficiary_id: string): Promise<beneficiaryResponse> {
    try {
      const response = await this.notchBeneficiaryRequest(
        'GET',
        beneficiary_id,
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Get beneficiary failed: ${response.status} ${errorText}`,
        );
        throw new BadRequestException(
          'Impossible de récupérer le bénéficiaire',
        );
      }

      const beneficiary = (await response.json()) as beneficiaryResponse;
      this.logger.log(`Beneficiary retrieved: ${beneficiary.beneficiary.id}`);
      return beneficiary;
    } catch (error) {
      this.logger.error('getting-beneficiary-error =>', error);
      throw new ForbiddenException(
        'Erreur lors de la récupération du bénéficiaire',
      );
    }
  }

  /**
   * Créer un bénéficiaire
   */
  async createBeneficiary(
    name: string,
    email: string,
    phone: string,
    channel: string = 'cm.mobile',
  ): Promise<beneficiaryResponse> {
    try {
      const payload: InitializeBeneficiaryPayload = {
        channel,
        name,
        email,
        account_number: phone.replace('+', ''),
        description: `Create Beneficiary: ${name}`,
        country: 'CM',
      };

      this.logger.log('BENEFICIARY-PAYLOAD =>', payload);

      const response = await this.notchBeneficiaryRequest('POST', '', payload);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Create beneficiary failed: ${response.status} ${errorText}`,
        );
        throw new BadRequestException('Impossible de créer le bénéficiaire');
      }

      const beneficiary = (await response.json()) as beneficiaryResponse;
      this.logger.log(`Beneficiary created: ${beneficiary.beneficiary.id}`);
      return beneficiary;
    } catch (error) {
      this.logger.error('creating-beneficiary-error =>', error);
      throw new ForbiddenException(
        'Erreur lors de la création du bénéficiaire',
      );
    }
  }

  /**
   * Mettre à jour un bénéficiaire
   */
  async updateBeneficiary(
    beneficiary_id: string,
    name: string,
    email: string,
    phone: string,
  ): Promise<beneficiaryResponse> {
    try {
      const payload: InitializeBeneficiaryPayload = {
        channel: 'cm.mobile',
        name,
        email,
        account_number: phone.replace('+', ''),
        country: 'CM',
        description: `Update Beneficiary: ${name}`,
      };

      const response = await this.notchBeneficiaryRequest(
        'PUT',
        beneficiary_id,
        payload,
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Update beneficiary failed: ${response.status} ${errorText}`,
        );
        throw new BadRequestException(
          'Impossible de mettre à jour le bénéficiaire',
        );
      }

      const beneficiary = (await response.json()) as beneficiaryResponse;
      this.logger.log(`Beneficiary updated: ${beneficiary.beneficiary.id}`);
      return beneficiary;
    } catch (error) {
      this.logger.error('updating-beneficiary-error =>', error);
      throw new ForbiddenException(
        'Erreur lors de la mise à jour du bénéficiaire',
      );
    }
  }
}
