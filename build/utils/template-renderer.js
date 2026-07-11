"use strict";
// src/utils/template-renderer.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTemplate = renderTemplate;
exports.validateTemplateVariables = validateTemplateVariables;
exports.wrapEmailHtml = wrapEmailHtml;
// Reemplaza {{variable}} por su valor
function renderTemplate(template, variables) {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        result = result.replace(regex, String(value));
    }
    return result;
}
// Valida que estén todas las variables requeridas
function validateTemplateVariables(required, provided) {
    const missing = required.filter(v => !(v in provided));
    return {
        valid: missing.length === 0,
        missing,
    };
}
// Envuelve HTML en layout base
function wrapEmailHtml(content) {
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
