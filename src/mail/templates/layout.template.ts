// email.layout.ts
import { C, FONT, SPACING, RADIUS } from './variable.template';

export function EmailLayout(
  title: string,
  content: string,
  preheader = '',
  logoUrl?: string,
): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <meta name="x-apple-disable-message-reformatting" />
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${C.bg};font-family:${FONT};-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
 
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>` : ''}
 
  <!-- Wrapper principal -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.bg};padding:${SPACING.xl} ${SPACING.md};">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
 
          <!-- Header avec gradient -->
          <tr>
            <td style="
              background:linear-gradient(135deg, ${C.gradientStart} 0%, ${C.gradientEnd} 100%);
              border-radius:${RADIUS.lg} ${RADIUS.lg} 0 0;
              padding:${SPACING.xl} ${SPACING.lg};
              text-align:center;
            ">
              ${logoUrl ? `
              <div style="
                width:60px;
                height:60px;
                margin:0 auto ${SPACING.lg};
                background:rgba(255,255,255,0.2);
                border-radius:${RADIUS.md};
                display:flex;
                align-items:center;
                justify-content:center;
                backdrop-filter:blur(10px);
              ">
                <img src="${logoUrl}" alt="Logo" style="width:100%;height:100%;object-fit:contain;" />
              </div>
              ` : ''}
              <h1 style="
                font-family:${FONT};
                font-size:24px;
                font-weight:700;
                color:${C.white};
                margin:0 0 ${SPACING.xs} 0;
                letter-spacing:-0.5px;
              ">${title}</h1>
              <p style="
                font-family:${FONT};
                font-size:16px;
                color:${C.white};
                opacity:0.9;
                margin:0;
              ">InvestIA - Plateforme sécurisée</p>
            </td>
          </tr>
 
          <!-- Corps du message -->
          <tr>
            <td style="
              background:${C.white};
              border-radius:0 0 ${RADIUS.lg} ${RADIUS.lg};
              padding:${SPACING.xl} ${SPACING.lg};
              box-shadow:0 4px 20px rgba(0,0,0,0.1);
            ">
              ${content}
            </td>
          </tr>
 
          <!-- Footer -->
          <tr>
            <td style="padding:${SPACING.lg} 0 0 0;text-align:center;">
              <p style="
                margin:0 0 ${SPACING.xs} 0;
                font-family:${FONT};
                font-size:12px;
                color:${C.tertiary};
                line-height:1.6;
              ">
                <strong style="color:${C.secondary};">InvestIA</strong> — Plateforme d'investissement sécurisée<br/>
                © ${new Date().getFullYear()} InvestIA. Tous droits réservés.
              </p>
              <p style="margin:${SPACING.sm} 0 0 0;font-family:${FONT};font-size:11px;color:${C.tertiary};">
                <a href="#" style="color:${C.primary};text-decoration:none;margin:0 ${SPACING.xs};">Politique de confidentialité</a>
                <span style="color:${C.border};">|</span>
                <a href="#" style="color:${C.primary};text-decoration:none;margin:0 ${SPACING.xs};">Conditions d'utilisation</a>
                <span style="color:${C.border};">|</span>
                <a href="#" style="color:${C.primary};text-decoration:none;margin:0 ${SPACING.xs};">Se désabonner</a>
              </p>
            </td>
          </tr>
 
        </table>
      </td>
    </tr>
  </table>
 
</body>
</html>`;
}

// ─── Composants réutilisables ──────────────────────────────────────────────

export function Divider(margin = SPACING.lg): string {
  return `<div style="height:1px;background:${C.border};margin:${margin} 0;"></div>`;
}

export function Greeting(name?: string): string {
  const greeting = name ? `Bonjour <strong style="color:${C.primary};">${name}</strong>,` : 'Bonjour,';
  return `<p style="font-family:${FONT};font-size:18px;color:${C.title};font-weight:500;margin:0 0 ${SPACING.md} 0;">${greeting}</p>`;
}

export function Paragraph(text: string): string {
  return `<p style="font-family:${FONT};font-size:16px;color:${C.text};line-height:1.6;margin:0 0 ${SPACING.md} 0;">${text}</p>`;
}

export function Button(label: string, url: string, variant: 'primary' | 'success' | 'warning' = 'primary'): string {
  const colors = {
    primary: { bg: C.primary, hover: C.primaryDark },
    success: { bg: C.success, hover: '#15803d' },
    warning: { bg: C.warning, hover: '#d97706' },
  };
  
  return `
  <table cellpadding="0" cellspacing="0" border="0" style="margin:${SPACING.lg} 0;">
    <tr>
      <td style="background:${colors[variant].bg};border-radius:${RADIUS.md};padding:0;">
        <a href="${url}" style="
          display:inline-block;
          padding:14px 32px;
          font-family:${FONT};
          font-size:16px;
          font-weight:600;
          color:${C.white};
          text-decoration:none;
          border-radius:${RADIUS.md};
        ">${label}</a>
      </td>
    </tr>
  </table>`;
}

export function InfoBox(text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): string {
  const styles = {
    info: { bg: C.infoLight, border: C.info, icon: 'ℹ️' },
    success: { bg: C.successLight, border: C.success, icon: '✓' },
    warning: { bg: C.warningLight, border: C.warning, icon: '⚠️' },
    error: { bg: C.errorLight, border: C.error, icon: '✗' },
  };
  
  return `
  <div style="
    background:${styles[type].bg};
    border-left:4px solid ${styles[type].border};
    border-radius:${RADIUS.sm};
    padding:${SPACING.md} ${SPACING.lg};
    margin:${SPACING.lg} 0;
  ">
    <p style="margin:0;font-family:${FONT};font-size:14px;color:${C.text};line-height:1.6;">
      <span style="font-size:18px;margin-right:${SPACING.sm};">${styles[type].icon}</span>
      ${text}
    </p>
  </div>`;
}

export function CodeBox(code: string, label = 'Code de vérification'): string {
  return `
  <div style="
    background:linear-gradient(135deg, #f8fafc, #e2e8f0);
    border:2px dashed ${C.border};
    border-radius:${RADIUS.lg};
    padding:${SPACING.xl};
    margin:${SPACING.lg} 0;
    text-align:center;
  ">
    <p style="
      font-family:${FONT};
      font-size:14px;
      color:${C.secondary};
      font-weight:600;
      text-transform:uppercase;
      letter-spacing:1px;
      margin:0 0 ${SPACING.sm} 0;
    ">${label}</p>
    <div style="
      font-size:36px;
      font-weight:800;
      color:${C.title};
      letter-spacing:8px;
      font-family:'Courier New', monospace;
      background:linear-gradient(135deg, ${C.gradientStart}, ${C.gradientEnd});
      -webkit-background-clip:text;
      -webkit-text-fill-color:transparent;
      background-clip:text;
      margin:${SPACING.md} 0;
    ">${code}</div>
    <p style="
      font-family:${FONT};
      font-size:14px;
      color:${C.error};
      font-weight:500;
      margin:${SPACING.md} 0 0 0;
    ">⏱️ Valide pendant 10 minutes</p>
  </div>`;
}

export function SupportSection(): string {
  return `
  <div style="
    background:${C.bg};
    border-radius:${RADIUS.md};
    padding:${SPACING.lg};
    margin:${SPACING.xl} 0 0 0;
    text-align:center;
  ">
    <h3 style="
      font-family:${FONT};
      font-size:16px;
      color:${C.title};
      margin:0 0 ${SPACING.sm} 0;
    ">Besoin d'aide ?</h3>
    <p style="font-family:${FONT};font-size:14px;color:${C.secondary};margin:${SPACING.xs} 0;">
      Si vous rencontrez des difficultés, contactez notre support :
    </p>
    <p style="margin:${SPACING.xs} 0;">
      <a href="mailto:support@investia.com" style="color:${C.primary};text-decoration:none;font-weight:500;">support@investia.com</a>
    </p>
  </div>`;
}