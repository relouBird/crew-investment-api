// email.templates.ts
import { EmailLayout, Greeting, Paragraph, Button, InfoBox, CodeBox, SupportSection, Divider } from './layout.template';

// ─── Template: Création de compte ────────────────────────────────────────

export function WelcomeEmail(userName: string, activationUrl: string, logoUrl?: string): string {
  const content = `
    ${Greeting(userName)}
    ${Paragraph('Bienvenue sur <strong>InvestIA</strong> ! Nous sommes ravis de vous compter parmi nous.')}
    ${Paragraph('Votre compte a été créé avec succès. Pour commencer à utiliser notre plateforme, veuillez activer votre compte en cliquant sur le bouton ci-dessous :')}
    ${Button('Activer mon compte', activationUrl, 'success')}
    ${Divider()}
    ${InfoBox('Ce lien est valide pendant 24 heures. Après cette période, vous devrez en demander un nouveau.', 'info')}
    ${Paragraph('Une fois votre compte activé, vous pourrez :')}
    <ul style="margin:0;padding-left:20px;color:#374151;font-family:'Segoe UI', sans-serif;font-size:16px;line-height:1.6;">
      <li>Accéder à votre tableau de bord personnalisé</li>
      <li>Commencer à investir sur nos paris sportifs</li>
      <li>Suivre vos performances en temps réel</li>
    </ul>
    ${SupportSection()}
  `;
  
  return EmailLayout(
    'Bienvenue sur InvestIA !',
    content,
    `Bienvenue ${userName} ! Activez votre compte pour commencer.`,
    logoUrl
  );
}

// ─── Template: OTP (Connexion / Reset password) ──────────────────────────

export function OTPEmail(otp: string, purpose: 'login' | 'reset', userName?: string, logoUrl?: string): string {
  const titles = {
    login: 'Code de vérification',
    reset: 'Réinitialisation du mot de passe',
  };
  
  const messages = {
    login: 'Vous avez demandé un code de vérification pour accéder à votre compte.',
    reset: 'Vous avez demandé à réinitialiser votre mot de passe.',
  };
  
  const content = `
    ${Greeting(userName)}
    ${Paragraph(messages[purpose])}
    ${Paragraph('Voici votre code de vérification à usage unique :')}
    ${CodeBox(otp)}
    ${InfoBox('⚠️ <strong>Important :</strong> Ne partagez jamais ce code avec quiconque. Notre équipe ne vous demandera jamais ce code.', 'warning')}
    ${Paragraph('Si vous n\'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.')}
    ${SupportSection()}
  `;
  
  return EmailLayout(
    titles[purpose],
    content,
    `Votre code de vérification : ${otp}`,
    logoUrl
  );
}

// ─── Template: Confirmation reset password ───────────────────────────────

export function PasswordResetConfirmationEmail(userName?: string, logoUrl?: string): string {
  const content = `
    ${Greeting(userName)}
    ${Paragraph('Votre mot de passe a été <strong style="color:#16a34a;">réinitialisé avec succès</strong>.')}
    ${InfoBox('Votre compte est maintenant sécurisé avec votre nouveau mot de passe.', 'success')}
    ${Paragraph('Vous pouvez désormais vous connecter à votre compte avec votre nouveau mot de passe.')}
    ${Divider()}
    ${InfoBox('Si vous n\'êtes pas à l\'origine de cette modification, contactez immédiatement notre support.', 'warning')}
    ${SupportSection()}
  `;
  
  return EmailLayout(
    'Mot de passe réinitialisé',
    content,
    'Votre mot de passe a été réinitialisé avec succès',
    logoUrl
  );
}

// ─── Template: Changement de mot de passe ────────────────────────────────

export function PasswordChangedEmail(userName?: string, changeDate?: string, logoUrl?: string): string {
  const date = changeDate || new Date().toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const content = `
    ${Greeting(userName)}
    ${Paragraph('Votre mot de passe a été <strong style="color:#16a34a;">modifié avec succès</strong>.')}
    ${InfoBox(`Modification effectuée le ${date}`, 'info')}
    ${Paragraph('Cette modification renforce la sécurité de votre compte InvestIA.')}
    ${Divider()}
    ${InfoBox('⚠️ <strong>Vous n\'êtes pas à l\'origine de cette modification ?</strong><br/>Si vous n\'avez pas changé votre mot de passe, votre compte pourrait être compromis. Contactez immédiatement notre support.', 'warning')}
    ${Button('Contacter le support', 'mailto:support@investia.com', 'warning')}
    ${SupportSection()}
  `;
  
  return EmailLayout(
    'Mot de passe modifié',
    content,
    'Votre mot de passe a été modifié',
    logoUrl
  );
}

// ─── Template: Transaction réussie ────────────────────────────────────────

export function TransactionSuccessEmail(
  amount: number,
  transactionId: string,
  userName?: string,
  logoUrl?: string
): string {
  const content = `
    ${Greeting(userName)}
    ${Paragraph('Votre recharge a été <strong style="color:#16a34a;">effectuée avec succès</strong>.')}
    <div style="
      background:linear-gradient(135deg, #f0fdf4, #dcfce7);
      border:2px solid #16a34a;
      border-radius:16px;
      padding:32px;
      margin:24px 0;
      text-align:center;
    ">
      <p style="margin:0 0 8px 0;font-size:14px;color:#15803d;font-weight:600;text-transform:uppercase;">Montant rechargé</p>
      <div style="
        font-size:42px;
        font-weight:800;
        color:#16a34a;
        margin:12px 0;
      ">${amount} €</div>
      <p style="margin:8px 0 0 0;font-size:12px;color:#15803d;">Transaction ID: ${transactionId}</p>
    </div>
    ${Paragraph('Le montant a été crédité sur votre compte et est disponible immédiatement.')}
    ${Button('Voir mon solde', 'https://investia.com/wallet', 'success')}
    ${SupportSection()}
  `;
  
  return EmailLayout(
    'Recharge effectuée',
    content,
    `Recharge de ${amount}€ effectuée avec succès`,
    logoUrl
  );
}

// ─── Template: Transaction échouée ───────────────────────────────────────

export function TransactionFailedEmail(
  transactionId: string,
  userName?: string,
  logoUrl?: string
): string {
  const content = `
    ${Greeting(userName)}
    ${Paragraph('Nous avons rencontré un problème lors du traitement de votre recharge.')}
    <div style="
      background:linear-gradient(135deg, #fef2f2, #fee2e2);
      border:2px solid #ef4444;
      border-radius:16px;
      padding:32px;
      margin:24px 0;
      text-align:center;
    ">
      <div style="font-size:48px;margin-bottom:16px;">❌</div>
      <p style="margin:0;font-size:18px;color:#dc2626;font-weight:700;">Transaction échouée</p>
      <p style="margin:8px 0 0 0;font-size:12px;color:#dc2626;">Transaction ID: ${transactionId}</p>
    </div>
    ${InfoBox('Aucun montant n\'a été débité de votre compte. Vous pouvez réessayer en toute sécurité.', 'error')}
    ${Paragraph('Raisons possibles :')}
    <ul style="margin:0;padding-left:20px;color:#374151;font-family:'Segoe UI', sans-serif;font-size:16px;line-height:1.6;">
      <li>Fonds insuffisants</li>
      <li>Problème technique temporaire</li>
      <li>Carte expirée ou invalide</li>
    </ul>
    ${Button('Réessayer', 'https://investia.com/wallet/deposit', 'warning')}
    ${SupportSection()}
  `;
  
  return EmailLayout(
    'Échec de la recharge',
    content,
    `Transaction ${transactionId} échouée`,
    logoUrl
  );
}