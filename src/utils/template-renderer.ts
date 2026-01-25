// src/utils/template-renderer.ts

// Reemplaza {{variable}} por su valor
export function renderTemplate(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, String(value));
  }

  return result;
}

// Valida que estén todas las variables requeridas
export function validateTemplateVariables(
  required: string[],
  provided: Record<string, any>
): { valid: boolean; missing: string[] } {
  const missing = required.filter(v => !(v in provided));
  return {
    valid: missing.length === 0,
    missing,
  };
}

// Envuelve HTML en layout base
export function wrapEmailHtml(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; background: #f6f6f6; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 6px;">
          ${content}
        </div>
      </body>
    </html>
  `;
}
