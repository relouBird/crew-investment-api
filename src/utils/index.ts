export const rand = () => {
  return Math.round(Math.random() * 100000);
};

export function safeJsonParse(value: any): any {
  if (value == null) return null; // ou la valeur par défaut de ton choix
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value; // ou une valeur par défaut
    }
  }
  return value; // déjà un objet
}