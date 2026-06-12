# Prompt de implementación — Front Web PayPac (métodos de pago Wompi)

> Cómo usarlo: comparte la carpeta `docs/payment-methods/` completa al dev del front
> web (o pégala como contexto en su asistente de IA) junto con el prompt de abajo.
> El prompt es agnóstico del framework: aplica igual para React/Next/Vue/Angular.

---

## PROMPT (copiar desde aquí)

Eres el desarrollador del front web de PayPac (venta de boletas para eventos en
Colombia). Vas a implementar el flujo de pago multi-método contra el backend
existente. **Toda la especificación del API está en los archivos .md adjuntos**
(`README.md` = flujo general; un archivo por método de pago). No inventes
endpoints ni campos: si algo no está en los docs, pregunta antes de asumir.

### Contexto

- Backend (producción): `https://paypac-backend-mono-26-production.up.railway.app`
- Autenticación: header `Authorization: Bearer <Firebase ID token>` en todos los endpoints.
- Notificaciones en tiempo real: Socket.IO en el mismo host; el backend emite al
  room del usuario. Eventos documentados en la sección 5 del README.
- La pasarela es Wompi, pero el front web **solo habla con nuestro backend**, con
  una única excepción: la tokenización de tarjeta (`POST {WOMPI_URL}/tokens/cards`
  con la **llave pública** `pub_test_/pub_prod_`, ver `card.md`).

### Tarea

Implementar el checkout con selección dinámica de método de pago:

1. **Selector de métodos**: pintar únicamente lo que devuelva
   `GET /api/payment-methods/active` (icono = `mehtod_img`, nombre = `method_name`,
   código = `method_code`). Si un método no viene en la lista, no existe para el usuario.
   `mehtod_img` puede ser ruta relativa: alojar los íconos en tu carpeta pública o
   usar fallback genérico si la imagen no resuelve (ver README §1).
1.5. **Datos del pagador**: prellenar documento/teléfono/email con
   `GET /api/users/me/profile` (perfil completo). NO usar `/api/auth/me` para esto
   (no trae documento ni teléfono). Ver README §1.5.
2. **Crear factura**: `POST /api/invoices` con `sale_channel: "WEB"` y el
   `payment_method` elegido (ver README §2). Guardar `invoice.id`.
3. **Formulario por método**: capturar solo los campos que pide el doc del método
   elegido (ej. Nequi = solo celular; PSE = banco + tipo persona + documento).
   Para PSE, los bancos salen de `GET /api/transactions/pse/financial-institutions`.
3.5. **Aceptación Wompi (Habeas Data)**: antes de habilitar el botón de pagar (y
   en la pantalla de guardar tarjeta) mostrar los DOS checkboxes con los links de
   `GET /api/transactions/acceptance-contracts` (ver README §2.5). Botón
   deshabilitado hasta marcar ambos.
4. **Ejecutar pago**: `POST /api/transactions/process` con `invoice_id`,
   `sale_channel: "WEB"`, `redirect_url` y el objeto `payment_method` del método
   (ver el JSON exacto en el doc de cada método).
5. **Manejar `next_action`** de la respuesta con un switch:
   - `NONE` → pantalla "procesando", esperar socket.
   - `REDIRECT_URL` → `window.location.href = data.async_payment_url`.
   - `QR_CODE` → renderizar `<img src="data:image/svg+xml;base64,{data.qr_image}">`.
   - `OTP` → abrir `data.url` en la misma pestaña (opción simple, ver `daviplata.md`).
   - `CASH_REFERENCE` → mostrar convenio + referencia con botón copiar.
6. **Resultado final**: escuchar Socket.IO. La señal de navegación es
   `payment:completed` con `can_continue: true`; `tickets:created` trae los tickets.
   La página de retorno (`redirect_url`) es SOLO informativa: al cargar debe
   mostrar "verificando pago" y esperar el socket (o consultar
   `GET /api/transactions/my-transactions` como respaldo). Nunca marcar éxito por
   el solo hecho de volver del banco.

### Reglas duras (no negociables)

- **Nunca** usar ni pedir la llave privada de Wompi, el secreto de integridad o el
  secreto de eventos. La firma la genera el backend.
- **Nunca** enviar el monto a cobrar: el backend lo toma de la factura.
- **Nunca** guardar datos de tarjeta (número/CVC): solo el token `tok_...` de Wompi.
- Registrar TODOS los callbacks de socket **antes** de conectar.
- `sale_channel: "WEB"` en `/api/invoices` y en `/api/transactions/process`.
- No hardcodear la lista de métodos: viene del backend.

### Orden de implementación sugerido

1. CARD (ya existe la base — migrar al flujo `invoice_id` + `next_action`)
2. NEQUI (sin redirección, el más simple)
3. PSE (listado de bancos + redirect)
4. BANCOLOMBIA_TRANSFER (redirect)
5. BANCOLOMBIA_QR (ideal en web)
6. BANCOLOMBIA_COLLECT, DAVIPLATA, BANCOLOMBIA_BNPL, PCOL (este último: leer la
   advertencia en `pcol.md` antes de empezar)

Cada método se activa en backend por separado (`PaymentMethodsUI`): el selector
debe funcionar con cualquier subconjunto activo sin cambios de código.

### Pruebas (Sandbox)

- Datos de prueba por método al final de cada doc (tarjetas 4242…, Nequi
  3991111111, banco PSE "1", OTPs Daviplata, etc.).
- Para simular la confirmación del webhook sin pagar de verdad, pedir al equipo
  backend que ejecute `src/tools/simulate-wompi-webhook.ts` (ver
  `webhook-testing.md`) con el `num_invoice` de tu factura de prueba.

### Criterios de aceptación

- [ ] El selector solo muestra métodos de `/active` y reacciona si se desactiva uno.
- [ ] Los 2 checkboxes de aceptación Wompi (con links a los PDFs) aparecen antes de pagar y al guardar tarjeta; el botón queda deshabilitado sin ambos.
- [ ] Compra completa con CARD y NEQUI termina en pantalla de éxito vía `payment:completed`.
- [ ] PSE redirige al banco y al volver muestra "verificando" hasta el socket.
- [ ] Un pago DECLINED muestra el mensaje de rechazo y permite reintentar (nueva factura).
- [ ] Refrescar la página durante un pago PENDING no rompe el flujo (respaldo por API).
- [ ] Ninguna llave privada/secreto en el bundle del front (revisar variables de entorno).

---

## Qué compartir exactamente

```
docs/payment-methods/
├── PROMPT-FRONT-WEB.md      ← este archivo (el prompt)
├── README.md                ← flujo general + socket events
├── card.md, nequi.md, pse.md, bancolombia-transfer.md,
│   bancolombia-qr.md, bancolombia-collect.md,
│   daviplata.md, bnpl.md, pcol.md
└── webhook-testing.md       ← solo referencia (las simulaciones las corre backend)
```

Adicional que el front web necesita de ti (no está en los docs):
1. **Llave pública de Wompi** del ambiente (pub_test_… para sandbox) — solo para tokenizar tarjetas.
2. **URL del backend** de staging/sandbox si difiere de producción.
3. Credenciales de un **usuario de prueba** y un **evento de prueba** con stages/localidades.
4. Detalles de conexión Socket.IO si su cliente difiere del de la app (room `user:{userId}`, auth con Firebase token).
