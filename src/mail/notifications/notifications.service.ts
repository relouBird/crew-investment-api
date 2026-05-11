import { Injectable } from '@nestjs/common';
import { MailService } from '../mail.service';

import {
  WelcomeEmail,
  OTPEmail,
  PasswordResetConfirmationEmail,
  PasswordChangedEmail,
  TransactionSuccessEmail,
  TransactionFailedEmail,
} from '../templates/index';

// ─── Payloads typés par action ────────────────────────────────────────────

type WelcomePayload = {
  userName: string;
  activationUrl: string;
  logoUrl?: string;
};

type OTPPayload = {
  otp: string;
  purpose: 'login' | 'reset';
  userName?: string;
  logoUrl?: string;
};

type PasswordResetConfirmationPayload = {
  userName?: string;
  logoUrl?: string;
};

type PasswordChangedPayload = {
  userName?: string;
  changeDate?: string;
  logoUrl?: string;
};

type TransactionSuccessPayload = {
  amount: number;
  transactionId: string;
  userName?: string;
  logoUrl?: string;
};

type TransactionFailedPayload = {
  transactionId: string;
  userName?: string;
  logoUrl?: string;
};

// ─── Union discriminée ────────────────────────────────────────────────────

type NotificationContext =
  | { type: 'WELCOME';                  email: string; payload: WelcomePayload }
  | { type: 'OTP';                      email: string; payload: OTPPayload }
  | { type: 'PASSWORD_RESET_CONFIRM';   email: string; payload: PasswordResetConfirmationPayload }
  | { type: 'PASSWORD_CHANGED';         email: string; payload: PasswordChangedPayload }
  | { type: 'TRANSACTION_SUCCESS';      email: string; payload: TransactionSuccessPayload }
  | { type: 'TRANSACTION_FAILED';       email: string; payload: TransactionFailedPayload };

// ─── Service ──────────────────────────────────────────────────────────────

@Injectable()
export class NotificationsService {
  constructor(private readonly mailService: MailService) {}

  async send(context: NotificationContext): Promise<void> {
    const { type, email, payload } = context;

    const subjects: Record<NotificationContext['type'], string> = {
      WELCOME:                'Bienvenue sur InvestIA — Activez votre compte',
      OTP:                    (payload as OTPPayload).purpose === 'login' ? 'Votre code de connexion' : 'Réinitialisez votre mot de passe',
      PASSWORD_RESET_CONFIRM: 'Mot de passe réinitialisé',
      PASSWORD_CHANGED:       'Votre mot de passe a été modifié',
      TRANSACTION_SUCCESS:    'Recharge effectuée avec succès',
      TRANSACTION_FAILED:     'Échec de votre recharge',
    };

    const templates: Record<NotificationContext['type'], string> = {
      WELCOME:                WelcomeEmail((payload as WelcomePayload).userName, (payload as WelcomePayload).activationUrl, (payload as WelcomePayload).logoUrl),
      OTP:                    OTPEmail((payload as OTPPayload).otp, (payload as OTPPayload).purpose, payload.userName, payload.logoUrl),
      PASSWORD_RESET_CONFIRM: PasswordResetConfirmationEmail(payload.userName, payload.logoUrl),
      PASSWORD_CHANGED:       PasswordChangedEmail(payload.userName, (payload as PasswordChangedPayload).changeDate, payload.logoUrl),
      TRANSACTION_SUCCESS:    TransactionSuccessEmail((payload as TransactionSuccessPayload).amount, (payload as TransactionSuccessPayload).transactionId, payload.userName, payload.logoUrl),
      TRANSACTION_FAILED:     TransactionFailedEmail((payload as TransactionFailedPayload).transactionId, payload.userName, payload.logoUrl),
    };

    await this.mailService.sendMail(email, subjects[type], templates[type]);
  }
}