// email.variables.ts
// ─── Palette & Design Tokens ──────────────────────────────────────────────

export const C = {
  // Primary colors
  primary: '#1e3a8a',
  primaryLight: '#eff6ff',
  primaryDark: '#1e293b',
  
  // Status colors
  success: '#16a34a',
  successLight: '#f0fdf4',
  warning: '#f59e0b',
  warningLight: '#fffbeb',
  error: '#ef4444',
  errorLight: '#fef2f2',
  info: '#3b82f6',
  infoLight: '#eff6ff',
  
  // Text colors
  title: '#1f2937',
  text: '#374151',
  secondary: '#6b7280',
  tertiary: '#9ca3af',
  
  // UI colors
  border: '#e5e7eb',
  bg: '#f9fafb',
  white: '#ffffff',
  
  // Gradients
  gradientStart: '#1e3a8a',
  gradientEnd: '#3b82f6',
};

export const FONT = `'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif`;

export const SPACING = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const RADIUS = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
};

// ─── Styles réutilisables ─────────────────────────────────────────────────

export const S = {
  // Titres
  h1: `font-family:${FONT};font-size:28px;font-weight:700;color:${C.title};line-height:1.2;margin:0;`,
  h2: `font-family:${FONT};font-size:22px;font-weight:700;color:${C.title};line-height:1.3;margin:0;`,
  h3: `font-family:${FONT};font-size:18px;font-weight:600;color:${C.title};line-height:1.4;margin:0;`,
  
  // Textes
  body: `font-family:${FONT};font-size:16px;color:${C.text};line-height:1.6;margin:0;`,
  bodySmall: `font-family:${FONT};font-size:14px;color:${C.text};line-height:1.6;margin:0;`,
  caption: `font-family:${FONT};font-size:12px;color:${C.secondary};line-height:1.5;margin:0;`,
  
  // Highlights
  highlight: `font-weight:600;color:${C.primary};`,
  success: `font-weight:600;color:${C.success};`,
  warning: `font-weight:600;color:${C.warning};`,
  error: `font-weight:600;color:${C.error};`,
  muted: `color:${C.secondary};`,
  
  // Liens
  link: `color:${C.primary};text-decoration:none;font-weight:500;`,
};