API de pagos
Haz una integración totalmente a la medida
Creamos el API RESTful de pagos más simple, seguro y poderoso del mercado. Puedes crear integraciones a la medida y experiencias de pago únicas para web, móvil o donde quieras. Nuestro API es simple e intuitivo y te permite hacer transacciones con varios medios de pago y consultar el estado de las mismas muy fácilmente. También es posible tokenizar tarjetas de crédito para hacer pagos recurrentes o implementar usos más complejos, si tu modelo de negocio así lo requiere.
Haz click aquí para ver la referencia completa de nuestro API. Y lee más sobre los métodos de pago disponibles en el API haciendo clic aquí.
¡Habla con nosotros!
Si tienes alguna duda, sugerencia o comentario, no dudes en escribirnos aquí
¡Gracias por usar Wompi!

Ambientes y llaves
Para integrar Wompi en tu comercio, debes tener siempre presente que existen llaves de autenticación. Estas llaves son la forma en la que Wompi te identifica como comercio a la hora de procesar transacciones y, en general, interactuar con todos nuestros servicios. Más abajo encontrarás una explicación detallada de los tipos de llaves que existen en Wompi.
Las llaves también definen si las operaciones que estás realizando son de prueba o con dinero real. En términos más precisos, la llave que utilices define el ambiente de ejecución que estás usando.
La forma de diferenciar cada ambiente es simplemente a través de dos cosas: la llave utilizada y la URL del API.
Llaves
En Wompi se tienen varios tipos de llaves los cuales se utilizan para dar seguridad al momento de enviar o recibir mensajes de Wompi.
Hay una de cada tipo de llave por cada ambiente de ejecución, es decir, una para Sandbox y otra para Producción. La diferencia está en el prefijo que usa cada una:
•	Para Sandbox las llaves tienen el prefijo pub_test_, prv_test_, test_events_ y test_integrity_
•	Para Producción las llaves tienen el prefijo pub_prod_ y prv_prod_, prod_events_ y prod_integrity_
Llaves de autenticación
En Wompi existen dos tipos de llaves:
1.	Una llave pública que siempre tiene el prefijo pub_ y se ve como la siguiente, por ejemplo:
pub_prod_Kw4aC0rZVgLZQn209NbEKPuXLzBD28Zx
2.	Una llave privada que siempre tiene el prefijo prv_ y se ve como la siguiente, por ejemplo:
prv_prod_434092Xa65F54dd6a181D1f87DFa03CzS
Secretos de integración
Además de las llaves de autenticación, también se tienen dos tipos de secretos:
1.	Una llave de eventos que siempre tiene el prefijo prod_events_ y se ve como la siguiente, por ejemplo:
prod_events_Y49rL5FGw4vTeiUaZaJ957hlpezdPQ0r
2.	Una llave de integridad que siempre tiene el prefijo prod_integrity_ y se ve como la siguiente, por ejemplo:
prod_integrity_ep4b3kSYJg2bWHwL7ulhPCDvaiyGDW7V
Consigue tus llaves
Si todavía no tienes un par de llaves de autenticación, regístrate en comercios.wompi.co y obtén tus llaves en segundos, para que comiences a integrar tu comercio.
Ambientes de ejecución
En Wompi existen dos ambientes de ejecución que cumplen distintos propósitos:
•	Sandbox: Es el ambiente de pruebas, el cual puedes utilizar para realizar transacciones "falsas" y simular resultados (aprobada, declinada). Su uso se recomienda mientras se esté desarrollando la integración y haciendo pruebas en tus servidores locales o de pruebas.
•	Producción: Es el ambiente sobre el cual se ejecutan transacciones con dinero real. Este lo debes usar una vez termines una integración con Wompi y quieras aceptar pagos.
Mientras integras, tienes la posibilidad de hacer operaciones que no son con dinero real u operaciones que sí lo son. Esto se logra gracias a que existe un ambiente de pruebas, llamado Sandbox y otro para operaciones reales, llamado ambiente de Producción.
Ambos ambientes pueden ser usados en cualquier momento, sólo debes tener presente que éstos son independientes y la información de uno no está disponible en el otro. Así por ejemplo si realizas transacciones o creas links de pago en Sandbox, esta información no estará disponible ni afectará de ninguna manera la que esté en Producción, ni viceversa.
Cada ambiente de ejecución es un API completamente separado del otro, sin embargo la especificación del API es exactamente la misma. Así que los endpoints (que puedes consultar en nuestra referencia del API) se mantienen; el único cambio es la URL base que se utiliza.
Para Sandbox la URL base que debes usar actualmente es:
https://sandbox.wompi.co/v1

Para Producción la URL base que debes usar actualmente es:
https://production.wompi.co/v1

Usa las llaves respectivas en cada entorno
Ten siempre presente que cuando usas la URL de un entorno, debes usar sus respectivas llaves. Así:
•	Para la URL de Sandbox debes usar las llaves con prefijo pub_test_ y prv_test_
•	Para la URL de Producción debes usar las llaves con prefijo pub_prod_ y prv_prod_
Después de tener listo tu secreto de integración, deberas generar un hash SHA256 con la siguiente información (el orden importa):
1.	Referencia de la transacción: sk8-438k4-xmxm392-sn2m
2.	Monto de la transacción en centavos: 2490000
3.	Moneda de la transacción: COP
4.	Secreto de integridad: prod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6
Estos valores se concatenan:
  "<Referencia><Monto><Moneda><SecretoIntegridad>"

Así se vería con valores de ejemplo:
  "sk8-438k4-xmxm392-sn2m2490000COPprod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6"

Importante, al usar el parámetro expiration-time se deberá concatenar como valor adicional:
1.	Fecha de expiración: 2023-06-09T20:28:50.000Z
Los valores anteriores se concatenan con el valor adicional en el siguiente orden:

"<Referencia><Monto><Moneda><FechaExpiracion><SecretoIntegridad>"

Así se verían con el valor adicional de ejemplo:
  "sk8-438k4-xmxm392-sn2m2490000COP2023-06-09T20:28:50.000Zprod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6"

Y lo encriptamos con SHA256:
Te recomendamos fuertemente crear este hash criptografico en tu servidor y nunca en tu frontend, pues expondrías el secreto de integración a un potencial atacante
En Javascript:
var cadenaConcatenada =
  "sk8-438k4-xmxm392-sn2m2490000COPprod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6";
//Ejemplo
const encondedText = new TextEncoder().encode(cadenaConcatenada);
const hashBuffer = await crypto.subtle.digest("SHA-256", encondedText);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join(""); 

Paso 4: URL de redirección
Al finalizar una transacción, opcionalmente, Wompi puede redirigir al usuario a una URL (que debe pertenecer a tu sitio web), en la cual podrás consultar el resultado final (status) de la transacción. Esto lo puedes hacer usando el id de la transacción, el cual estará disponible como un parámetro de la URL.
Así por ejemplo, si tu URL es:
https://mitienda.com.co/pagos/respuesta

La URL a la que Wompi redirigirá es similar a la siguiente:
https://mitienda.com.co/pagos/respuesta?id=01-1531231271-19365

Así, puedes usar el parámetro id disponible en la URL para verificar la transacción usando nuestro API apuntando a la URL https://production.wompi.co/v1/transactions/<ID_TRANSACCION>. Por ejemplo https://production.wompi.co/v1/transactions/01-1531231271-19365 (este ID puede NO ser real y sirve solo para dar un ejemplo)

Paso 5: Parámetros de la transacción
Para cada transacción puedes proveer parámetros como el monto a cobrar, la moneda en la que quieres cobrar, etc. Algunos de estos parámetros son obligatorios y otros son opcionales.
Parámetros obligatorios
Los siguientes son los parámetros obligatorios que debes tener en cuenta para crear una transacción:
•	public-key (Llave pública de comercio): Llave pública de comercio.
•	currency (Moneda): Moneda en la que vas a hacer el cobro. La única moneda disponible actualmente es COP (pesos colombianos).
•	amount-in-cents (Monto en centavos): Monto a cobrar, en centavos. Por ejemplo si deseas cobrar $95.000 COP, deberás ingresar: 9500000
•	reference (Referencia única de pago): Referencia única de pago.
•	signature:integrity (Firma de integridad): Es un hash criptográfico que utilizamos para validar la integridad de la información de la transacción y evitar alteraciones.
Parámetros opcionales
Los siguientes son parámetros opcionales que, aunque no sean necesarios, proveen una mejor experiencia de integración:
•	redirect-url (URL de redirección): Es la URL a la que el usuario será redirigido luego completar el proceso de pago, conteniendo el id de la transacción respectiva.
•	shipping-address (Información de envío): Es la información de dirección de envío del cliente, donde recibirá los productos y/o servicios, si aplica. Los datos que se pueden enviar son los siguientes:
o	address-line-1: (Obligatorio) para la dirección del lugar de la entrega
o	address-line-2: para referencias extras
o	country: (Obligatorio) para el código ISO 3166-1 Alpha-2 (2 letras mayúsculas) del país donde se encuentra la dirección (ej: CO)
o	city: (Obligatorio) para especificar la ciudad donde se encuentra la dirección
o	phone-number: (Obligatorio) para el número de teléfono de quien recibe
o	region: (Obligatorio) para la región donde se encuentra la dirección
o	name: para el nombre de quien recibe
o	postal-code: para el código postal
•	collect-shipping (Activar formulario de envío): Este parámetro activa la vista de información de envío, y si se diligenciaron los campos anteriores, aparecerán prellenados en la vista.
•	customer-data (Información del pagador): Es la información del pagador, la cual se prellenara en la vista de "Ingresa tus datos". Los datos permitidos son:
o	email: para el correo electrónico del pagador
o	full-name: para el nombre completo del pagador
o	phone-number: para el número de teléfono del pagador, debe ir acompañado del campo phone-number-prefix
o	phone-number-prefix: para el prefijo o código del país del teléfono del pagador (ej: +57), debe ir acompañado del campo phone-number
o	legal-id: para el número de documento de identidad del pagador, este parámetro activa el campo de documento de identidad del pagador en la vista de "Ingresa tus datos" y debe ir acompañado del campo legal-id-type
o	legal-id-type: para el tipo de documento del pagador, este parámetro activa el campo de documento de identidad del pagador en la vista de "Ingresa tus datos" y debe ir acompañado del campo legal-id. Los tipos de documento permitidos son:
	CC: Cédula de Ciudadanía
	CE: Cédula de Extranjería
	NIT: Número de Identificación Tributaria
	PP: Pasaporte
	TI: Tarjeta de Identidad
	DNI: Documento Nacional de Identidad
	RG: Carteira de Identidade / Registro Geral
	OTHER: Otro
•	collect-customer-legal-id: Activa el campo de documento de identidad del pagador, usando true como valor. Este parámetro activa el campo de documento de identidad del pagador en la vista de "Ingresa tus datos". Si se diligenciaron los campos de legal_id y legal_id_type de customer_data, se prellenara con dicha información
•	tax-in-cents (Detalle de impuestos en pago): Es la información de impuestos en la que puedes detallar el tipo de impuesto y el monto del impuesto dentro del precio total de la transacción en centavos. Más adelante se explica la manera de usarlo en las distintas formas de integración. Los tipos de impuestos permitidos son los siguientes:
o	VAT: para el IVA (Impuesto de Valor Agregado)
o	CONSUMPTION: para el Impuesto al Consumo
•	expiration-time: Fecha y hora en formato ISO8601 (UTC+0000), activa un contador regresivo indicando el tiempo restante para la expiración del inicio del pago
•	payment-method
o	reference-one: Campo opcional. Su valor por defecto es la dirección IP de origen de la petición. Si se envían reference-two y reference-three sin incluir este campo, se asignará automáticamente la IP de origen. La definición de este valor puede variar según la actividad económica del comercio, de acuerdo con la documentación oficial de PSE.
o	reference-two: Fecha de apertura del producto en formato yyyymmdd
o	reference-three: Número de documento del beneficiario del producto financiero
A tener en cuenta: Con el fin de mitigar el fraude en el servicio PSE, se han definido acciones adicionales que deben ser implementadas por todas las empresas vinculadas a la categoría de Servicios Financieros. Entre estas acciones se encuentra la inclusión de tres campos obligatorios en la trama transaccional, relacionados con la dirección IP del usuario, la fecha de apertura del producto y la identificación del beneficiario.
De cumplir con la descripción anterior se recomienda enviar el objeto payment-method con los campos reference-one, reference-two, reference-three
CIFRADO OPCIONAL DE CAMPOS DE REFERENCIA (JWE)
Si tu comercio maneja información sensible en los campos reference-one, reference-two o reference-three, puedes cifrarlos usando JWE (JSON Web Encryption) antes de enviarlos. Wompi detecta automáticamente si un campo viene cifrado o en texto plano. Consulta la guía de cifrado JWE para PSE para más detalles.
Los impuestos no se sumarán al monto de la transacción
Es importante resaltar que los impuestos enviados en el objeto taxes no se sumarán al total de la transacción.
Por ejemplo, en una transacción cuyo total (amount_in_cents) es de COP$119,000 y cuyo IVA es de COP$19,000, este último monto ya hace parte del total, implicando entonces que: la base sin impuestos ($100,000) + el IVA ($19,000) = el total ($119,000).
En otras palabras, Wompi no sumará $19,000 a los $119,000, sino que simplemente compartirá esta información tributaria con el respectivo procesador del pago.

Paso 6: Escoge un método de integración
Web Checkout
Este es el método más rápido para integrar Wompi en tu sitio web, usando únicamente un formulario HTML estándar:
<form action="https://checkout.wompi.co/p/" method="GET">
  <!-- OBLIGATORIOS -->
  <input type="hidden" name="public-key" value="LLAVE_PUBLICA_DEL_COMERCIO" />
  <input type="hidden" name="currency" value="MONEDA" />
  <input type="hidden" name="amount-in-cents" value="MONTO_EN_CENTAVOS" />
  <input type="hidden" name="reference" value="REFERENCIA_DE_PAGO" />
  <input type="hidden" name="signature:integrity" value="FIRMA_DE_INTEGRIDAD" />
  <!-- OPCIONALES -->
  <input type="hidden" name="redirect-url" value="URL_REDIRECCION" />
  <input type="hidden" name="expiration-time" value="FECHA_EXPIRACION" />
  <input type="hidden" name="tax-in-cents:vat" value="IVA_EN_CENTAVOS" />
  <input
    type="hidden"
    name="tax-in-cents:consumption"
    value="IMPOCONSUMO_EN_CENTAVOS"
  />
  <input type="hidden" name="customer-data:email" value="CORREO_DEL_PAGADOR" />
  <input
    type="hidden"
    name="customer-data:full-name"
    value="NOMBRE_DEL_PAGADOR"
  />
  <input
    type="hidden"
    name="customer-data:phone-number"
    value="NUMERO_DE_TELEFONO_DEL_PAGADOR"
  />
  <input
    type="hidden"
    name="customer-data:legal-id"
    value="DOCUMENTO_DE_IDENTIDAD_DEL_PAGADOR"
  />
  <input
    type="hidden"
    name="customer-data:legal-id-type"
    value="TIPO_DEL_DOCUMENTO_DE_IDENTIDAD_DEL_PAGADOR"
  />
  <input
    type="hidden"
    name="shipping-address:address-line-1"
    value="DIRECCION_DE_ENVIO"
  />
  <input type="hidden" name="shipping-address:country" value="PAIS_DE_ENVIO" />
  <input
    type="hidden"
    name="shipping-address:phone-number"
    value="NUMERO_DE_TELEFONO_DE_QUIEN_RECIBE"
  />
  <input type="hidden" name="shipping-address:city" value="CIUDAD_DE_ENVIO" />
  <input type="hidden" name="shipping-address:region" value="REGION_DE_ENVIO" />
  <button type="submit">Pagar con Wompi</button>
</form>

De esta forma, sólo debes asegurarte de llenar correctamente los parámetros obligatorios e incluir este código en donde quieras que tus clientes vean el botón para completar el pago. Una vez hagan clic en él, serán llevados a nuestro Web Checkout donde podrán completar el pago de manera rápida y segura.
Paso 7: Escucha el evento de una transacción
Usa siempre los eventos para finalizar tu integración
Al haber integrado el Widget o Web Checkout en tu website, sólo resta que escuches un Evento en tu servidor, para enterarte cuando una transacción finalizó. No utilices la redirección como método de validación de tus transacciones, sino únicamente con propósitos informativos para tus usuarios.
Una vez un usuario haya finalizado una transacción, Wompi te informará a través de un Evento que la misma llegó a un estado final. Para ello deberás proveer una URL de Eventos (a webhook), donde Wompi te enviará un objeto JSON con la información completa de la transacción. Haz clic acá y visita la guía de Eventos para conocer en detalle todo sobre esta funcionalidad.
Datos de prueba en Sandbox
Para realizar una transacción de pruebas sólo debes asegurarte que estás usando la llave pública de comercio para el ambiente Sandbox. Recuerda que esta tiene el prefijo pub_test_.
A continuación verás los datos de prueba necesarios para cada uno de los métodos de pago:
Tarjetas
Para una transacción de pruebas con tarjeta puedes usar los siguientes números de tarjeta a la hora de usar el endpoint de tokenización (si usas una integración con API) o al llenar los datos de la tarjeta en el Widget, para obtener respuestas distintas:
•	4242 4242 4242 4242 para una transacción aprobada (APPROVED). Cualquier fecha de expiración en el futuro y CVC de 3 dígitos son válidos.
•	4111 1111 1111 1111 para una transacción declinada (DECLINED). Cualquier fecha de expiración en el futuro y CVC de 3 dígitos son válidos.
Si usas cualquier otra tarjeta que no sea alguna de estas dos, el estado final de la transacción será ERROR.
Nequi
Para realizar transacciones aprobadas o rechazadas en el ambiente Sandbox sólo debes tener en cuenta los siguientes números:
•	3991111111 para generar una transacción aprobada (APPROVED)
•	3992222222 para generar una transacción declinada (DECLINED)
Ten en cuenta que cualquier otro número que utilices resultará en una transacción con status final en ERROR.
Por ejemplo:
{
  // Otros campos de la transacción a crear...
  "payment_method": {
    "type": "NEQUI",
    "phone_number": "3991111111" // Esto resultará current una transacción APROBADA
  }
}

PSE
Para pagos con PSE, en caso de usar integración directa con el API debes enviar un tipo de banco específico, con la propiedad financial_institution_code del objeto payment_method, en el momento que estés creando una transacción (con el endpoint POST /transactions). Por ejemplo:
{
  // Otros campos de la transacción a crear...
  "payment_method": {
    "type": "PSE",
    "user_type": 0, // Tipo de persona, natural (0) o jurídica (1)
    "user_legal_id_type": "CC", // Tipo de documento, CC o NIT
    "user_legal_id": "1999888777", // Número de documento
    "financial_institution_code": "1", // "1" para transacciones APROBADAS, "2" para transacciones DECLINADAS
    "payment_description": "Pago a Tienda Wompi" // Nombre de lo que se está pagando. Máximo 30 caracteres
  }
}

Para la integración con Widget, verás listados los siguientes bancos para tu elección:
•	Banco que aprueba: Con este, obtienes una transacción APROBADA de PSE.
•	Banco que rechaza: Con este, obtienes una transacción DECLINADA de PSE.
Botón de Transferencia Bancolombia
Para pagos con Botón Bancolombia, en caso de usar integración directa con el API debes usar la propiedad sandbox_status dentro del objeto payment_method, en el momento que estés creando una transacción (con el endpoint POST /transactions). Por ejemplo:
{
  // Otros campos de la transacción a crear...
  "payment_method": {
    "type": "BANCOLOMBIA_TRANSFER",
    "payment_description": "Pago a Tienda Wompi", // Nombre de lo que se está pagando. Máximo 64 caracteres
  }
}

Una vez iniciada la transacción y consultando el estado de la misma se puede ejecutar la aprobación seleccionando el botón en la redirección del campo data -> payment_method -> async_payment_url
{
  "data": {
    "id": "11004-1718123303-80111",
    "created_at": "2024-06-11T16:28:23.299Z",
    "finalized_at": null,
    "amount_in_cents": 150000,
    "reference": "jvo4t513zc9",
    "currency": "COP",
    "payment_method_type": "BANCOLOMBIA_TRANSFER",
    "payment_method": {
      "type": "BANCOLOMBIA_TRANSFER",
      "extra": {
        "is_three_ds": false,
        "async_payment_url": "<<URL a cargar el paso de autenticación>>"
      },
      "user_type": "PERSON",
      "payment_description": "Prueba"
    },
    "payment_link_id": null,
    ............ Demas datos de respuesta

Esa URL te llevara la siguiente vista donde puedes seleccionar el estado en el que quires que la transacción termine
Bancolombia QR
Para pagos con Bancolombia QR, en caso de usar integración directa con el API debes usar la propiedad sandbox_status dentro del objeto payment_method, en el momento que estés creando una transacción (con el endpoint POST /transactions). Por ejemplo:
{
  // Otros campos de la transacción a crear...
  "payment_method": {
    "type": "BANCOLOMBIA_QR",
    "payment_description": "Pago a Tienda Wompi", // Nombre de lo que se está pagando. Máximo 64 caracteres
    "sandbox_status": "APPROVED" // Status final deseado en el Sandbox. Uno de los siguientes: APPROVED, DECLINED o ERROR
  }
}

Para la integración con Widget, verás listados los siguientes estados para tu elección:
•	Transacción APROBADA
•	Transacción DECLINADA
•	Transacción con ERROR
Puntos Colombia
Para pago con Puntos Colombia, en caso de usar integración directa con el API debes usar la propiedad sandbox_status dentro del objeto payment_method, en el momento que estés creando una transacción (con el endpoint POST /transactions). Ejemplo:
{
  // Otros campos de la transacción a crear...
  "payment_method": {
    "type": "PCOL",
    "sandbox_status": "APPROVED_ONLY_POINTS" // Status final deseado en el Sandbox.
  }
}

Los posibles estados de prueba para el campo sandbox_status son:
•	APPROVED_ONLY_POINTS: Pago total con puntos
•	APPROVED_HALF_POINTS: Pago 50% con puntos
•	DECLINED: Pago solo puntos declinado
•	ERROR: Error al realizar el pago con solo puntos
BNPL Bancolombia
Para el entorno de prueba de BNPL, la única variación que notarás es que la URL que te dirige a la experiencia de BNPL te llevará a una página donde podrás definir el estado final en el que concluirá la transacción. El aspecto del sitio web será el siguiente:
 
DAVIPLATA - Pago simple
Cuando inicias una transacción con el medio de pago Daviplata y utilizas la interfaz proporcionada por Wompi, tendrás la posibilidad de elegir el estado final de la transacción, como se muestra en la siguiente imagen:
Para llevar a cabo transacciones mediante la API, simplemente debes tener en cuenta los siguientes códigos OTP:
•	574829 para generar una transacción aprobada (APPROVED)
•	932015 para generar una transacción declinada (DECLINED)
•	186743 para generar una transacción declinada sin saldo (DECLINED)
•	999999 para generar una transacción error (ERROR)
DAVIPLATA - Pago recurrente
Para crear un token Daviplata podemos usar los siguientes numeros de prueba:
•	3991111111 para crear un token, y obtener transacciones aprobadas (APPROVED)
•	3992222222 para crear un token, y obtener transacciones declinadas (DECLINED)
•	3993333333 para crear un token declinado monedero invalido (DECLINED)
Codigos OTPs:
•	574829 para confirmar un token como aprobado (APPROVED)
•	932016 para confirmar un token como declinado por suscripción ya existente (DECLINED)
•	Para simular un mensaje de codigo OTP invalido debes ingresar cualquier numero de 6 digitos
Eventos
Los eventos son la manera en la que Wompi te informa sobre algo importante que sucedió, sin que lo solicites activamente, usando un webhook. En pocas palabras, haremos una petición HTTP de tipo POST a una URL que especifiques, con un JSON que contiene toda la información relativa al evento que sucedió.
Así, por ejemplo, cada vez que una transacción sea aprobada o rechazada, Wompi te informará sobre esta actividad en la URL de eventos que hayas configurado en tu cuenta, con el fin de que tomes las medidas necesarias del lado de tu negocio. Para configurar dicha URL, lo puedes hacer en nuestro Dashboard de comercios.
Una URL de eventos para cada ambiente
Ten presente que tanto para Sandbox como Producción, debes configurar una URL de eventos diferente para cada ambiente. Esto, con el fin de evitar la mezcla accidental de transacciones de prueba con datos reales.
Manejar un evento
Cada vez que Wompi quiera notificar un evento a tu sistema, usará la URL de eventos, a la cual hará una petición HTTP de tipo POST, que contendrá un objeto como el que se muestra más abajo. A dicha petición HTTP, tu sistema deberá responder con un status HTTP 200 (que es el status de respuesta exitosa por defecto en los frameworks y librerías más populares). El cuerpo de respuesta que envíes no tiene importancia, ya que Wompi no lo utilizará de ninguna manera, así que puedes responder con un cuerpo vacío, un objeto JSON, etc.
Mientras el status HTTP de la respuesta por parte de tu sistema sea diferente a 200, Wompi considerará que el evento no pudo ser notificado correctamente y reintentará notificar nuevamente el evento, máximo 3 veces durante las siguientes 24 horas, hasta obtener un 200 como respuesta. El primer reintento será efectuado 30 minutos después, el segundo a las 3 horas y el último pasadas 24 horas.
Usa HTTPS
Te recomendamos usar HTTPS para la URL de eventos que especifiques. De esta manera se garantiza que la información viaja con encripción de punta a punta sin que nadie la pueda modificar durante el proceso de comunicación.
Cuerpo de un evento
Cualquier evento que Wompi envíe tendrá siempre la misma estructura:
{
  "event": "transaction.updated", // Nombre del tipo de evento
  "data": {
    // Data específica del evento
  },
  "environment": "prod", // "test" para Sandbox, "prod" para Producción
  "signature": {
    "properties": [
      // Lista de propiedades con las que se construye la firma
    ],
    "checksum": "..." // Hash calculado con una firma asimétrica SHA256
  },
  "timestamp": 1530291411, // Timestamp UNIX del evento usado para la firma del mismo
  "sent_at":  "2018-07-18T08:35:20.000Z" // Fecha current la que se notificó el evento por primera vez
}

Así por ejemplo, en el caso del evento transaction.updated, el cual indica que el estado de una transacción cambió, el cuerpo JSON enviado a la URL de eventos se verá como el siguiente:
{
  "event": "transaction.updated",
  "data": {
    "transaction": {
        "id": "1234-1610641025-49201",
        "amount_in_cents": 4490000,
        "reference": "MZQ3X2DE2SMX",
        "customer_email": "juan.perez@gmail.com",
        "currency": "COP",
        "payment_method_type": "NEQUI",
        "redirect_url": "https://mitienda.com.co/pagos/redireccion",
        "status": "APPROVED",
        "shipping_address": null,
        "payment_link_id": null,
        "payment_source_id": null
      }
  },
  "environment": "prod",
  "signature": {
    "properties": [
      "transaction.id",
      "transaction.status",
      "transaction.amount_in_cents"
    ],
    "checksum": "3476DDA50F64CD7CBD160689640506FEBEA93239BC524FC0469B2C68A3CC8BD0"
  },
  "timestamp": 1530291411,
  "sent_at":  "2018-07-20T16:45:05.000Z"
}

Tipos de eventos
A continuación encuentras una lista con los tipos de eventos que Wompi usa. Esta lista puede crecer con el tiempo, así que te sugerimos consultarla periódicamente:
Tipo	Descripción
transaction.updated	El estado de una transacción cambió, usualmente a un estado final (APPROVED, VOIDED, DECLINED o ERROR)
nequi_token.updated	El estado de un token de Nequi cambió, usualmente a un estado final (APPROVED o DECLINED)
bancolombia_transfer_token.updated	El estado de un token de Bancolombia cambió, usualmente a un estado final (APPROVED o DECLINED)
Seguridad
Para validar la integridad de la información notificada a tu URL de eventos y evitar suplantaciones, Wompi utiliza un hash criptográfico asimétrico, cuyo valor se encuentra en dos sitios:
•	El Header HTTP X-Event-Checksum
•	El campo checksum, del objeto signature
Los proveemos en ambos sitios por conveniencia, así que eres libre de extraerlo de cualquiera de los dos para hacer la respectiva validación de seguridad.
El algoritmo usado para generar esta firma asimétrica es SHA256. El valor de este checksum se genera concantenando en orden lo siguientes datos:
•	Los valores de los campos especificados en el arreglo properties, que apuntan a campos del objeto data
•	El campo timestamp (número entero) que es el Tiempo UNIX del evento
•	Un Secreto conocido únicamente por el comercio y Wompi, que está disponible en la opción Mi cuenta del Dashboard de Comercios, bajo la sección Secretos para integración técnica. Este secreto debe ser custodiado con la máxima seguridad en tus servidores
Paso a paso: Verifica la autenticidad de un evento
Siguiendo estas instrucciones, explicamos a continuación cómo calcular y validar por ejemplo el checksum del evento de una Transacción, mostrado más arriba, paso a paso:
Paso 1: Concatena los valores de los datos del evento
En el objeto signature del evento debes concatenar el valor de los datos descritos en el campo properties. En este caso tenemos:
•	transaction.id: Cuyo valor es 1234-1610641025-49201
•	transaction.status: Cuyo valor es APPROVED
•	transaction.amount_in_cents: Cuyo valor es 4490000
El valor resultante de la concatenación de estos datos, respetando el orden especificados en el arreglo signature.properties es:
1234-1610641025-49201APPROVED4490000

Los properties pueden variar.
Los valores del campo properties pueden variar en el tiempo y en cada evento, por eso es muy importante que no los asumas como un arreglo fijo dentro de tu código, sino que siempre los extraigas del evento y utilices apropiadamente en cada validación.
Paso 2: Concatena el campo timestamp
A la concatenación de las propiedades mostradas en el Paso 1, debes concatenarle también el campo timestamp del evento, que en este caso es 1530291411. El valor que deberías tener ahora en la cadena en este punto es:
1234-1610641025-49201APPROVED44900001530291411

Paso 3: Concatena tu secreto
En este paso debes concatenar tu secreto al string que estás generando hasta este punto. Vamos a asumir, en este ejemplo, que tu secreto es:
prod_events_OcHnIzeBl5socpwByQ4hA52Em3USQ93Z

El Secreto de Eventos es distinto a la Llave Privada
Es importante que aclarar que este Secreto para Eventos es diferente de tu Llave Privada y Llave Pública.
El resultado final de la concatenación debería ser:
1234-1610641025-49201APPROVED44900001530291411prod_events_OcHnIzeBl5socpwByQ4hA52Em3USQ93Z

Paso 4: Usa SHA256 para generar el checksum
Con estos datos concatenados apropiadamente, es momento de generar el checksum usando SHA256. Pasando la cadena por este algoritmo se obtiene por ejemplo el siguiente resultado:
3476DDA50F64CD7CBD160689640506FEBEA93239BC524FC0469B2C68A3CC8BD0

La manera en la que usa SHA256 para calcular este valor, varía dependiendo de cada lenguaje de programación. Sin embargo, el resultado debe ser siempre el mismo, dada la naturaleza de este algoritmo seguro de encripción asimétrica. Mostramos algunos ejemplos a continuación:
Paso 5: Compara tu checksum calculado con el proveído en el evento
Al generar, tú mismo, el valor del checksum en tu servidor, puedes ahora compararlo con el que llegó en el evento. Si ambos son iguales entonces puedes estar seguro que la información presentada es legítima y enviada por Wompi, y no una suplantación de un tercero. De lo contrario, debes ignorar dicho evento.

Seguimiento de transacciones
En Wompi, hay varias maneras a través de las cuales podrás saber el estado de una transacción, una vez iniciado un proceso de pago por parte un cliente de tu comercio.
Notificaciones por correo
Cada vez que se complete una transacción en Wompi, tanto el usuario como el comercio recibirán una notificación vía e-mail con el resultado de la misma. El correo enviado contiene los detalles del método de pago y datos específicos de éste. Esta es la manera más simple en la que ambas partes son notificadas de una transacción en Wompi, sin necesidad de configurar o integrar nada previamente.
Cómo identificar una transacción
Una vez se crea una transacción en Wompi, existen varios datos disponibles que te permitirán identificarla, bien sea para cruzarla con información de tus sistemas internos, o simplemente para tener una trazabilidad de tus ventas. Los atributos más importantes que debes tener en cuenta cuando Wompi te informa sobre una transacción, o tú mismo consultas una utilizando nuestro API, son los siguientes:
•	id: Es el identificador único de la transacción que genera Wompi. Este será un texto que te permitirá identificar tu transacción de manera unívoca en nuestro sistema. Un id de transacción se ve como el siguiente: 1132-903100443-27458
•	reference: Es la referencia que tú como comercio asignaste previamente a la transacción, al momento de crearla, o en su defecto es una referencia generada automáticamente en el caso de los links de pago. Esta debe ser única. Puede ser cualquier tipo de texto, usualmente te recomendamos que sea alfanumérico, con o sin guiones o guiones bajos, por ejemplo: 3893893, wqu3Xshw3aaKgM42S, etc.
•	customer_email: Es el correo electrónico de la persona que realizó el pago.
•	amount_in_cents: Monto en centavos de la transacción. Por ejemplo, para $9.500 es 950000
•	created_at: La fecha y hora en la que se creó la transacción, en UTC (GMT-0), por ejemplo 2018-06-12T13:14:01.000Z.
•	finalized_at: La fecha y hora en que la transacción pasó a su estado final, en UTC (GMT-0), por ejemplo 2018-06-12T13:14:01.000Z.
•	payment_method_type: Forma de pago, que puede ser CARD (tarjeta de crédito o débito), NEQUI o PSE.
Estado de una transacción
El status, o estado de una transacción representa en qué punto del proceso de pago se encuentra la misma. El status permite saber si la transacción sigue en proceso (estado PENDING) o si ya llegó a un estado final.
El estado final de una transacción es uno de los siguientes:
•	APPROVED: Transacción aprobada
•	DECLINED: Transacción rechazada
•	VOIDED: Transacción anulada (sólo aplica pra transacciones con tarjeta)
•	ERROR: Error interno del método de pago respectivo
Obtener información sobre una transacción
Adicional a las notificaciones vía e-mail, Wompi te ofrece dos maneras a través de las cuales puedes obtener información completa sobre una transacción:
1.	Activamente: haciendo una petición a nuestro API, por ejemplo al endpoint GET /v1/transactions/{ID_DE_TRANSACCION}.
2.	Pasivamente: a través del evento transaction.updated. Para leer más sobre cómo funcionan los eventos en Wompi haz clic acá.
Seguimiento a una transacción con reintento
Para obtener la información sobre que es y como consultar una transacción con reintento, haz click aquí.
Tokens de aceptación
Para Wompi la privacidad y el correcto manejo de los datos personales de los usuarios son una prioridad. Por ello, cumpliendo con la regulación colombiana y la ley de Habeas data, en todos aquellos endpoints donde se recoja información personal de un usuario, como al crear una transacción (POST /transactions) o una fuente de pago (POST /payment_sources), deberás enviar en el cuerpo de la petición dos Token de Aceptación. Uno de los tokens corresponde a la aceptación de la política de privacidad (acceptance_token), y el otro indica la aceptación para el tratamiento de datos personales (accept_personal_auth). Esto asegura que al usuario se le presentaron las versiones más recientes de los contratos (documentos PDF) que explican el manejo que Wompi hará de sus datos personales. El usuario debe aceptar explícitamente que leyó ambos contratos en la interfaz de tu website o aplicación, a través de checkboxes por ejemplo, y acto seguido se deben enviar los dos tokens.
Los pasos a seguir para este proceso son:
•	Paso 1: Obtener los tokens de aceptación prefirmados.
•	Paso 2: Mostrarle los links de los respectivos contratos al usuario.
•	Paso 3: Asegurarse que el usuario acepte explícitamente que leyó y aceptó dichos contratos.
•	Paso 4: Enviar los tokens.
A continuación se explica en detalle cada paso del proceso, que aplica tanto para la creación de Transacciones como de Fuentes de Pago.
Paso 1: Obtener los tokens de aceptación prefirmados
Para obtener los tokens de aceptación prefirmados debes acceder al endpoint usando tu llave pública GET /merchants/:llave_publica_de_comercio. Este endpoint mostrará los datos de tu comercio incluyendo los Tokens de Aceptación de la siguiente manera:
{
    "data": {
        "presigned_acceptance": {
            "acceptance_token": "eyJhbGciOiJIUzI1NiJ9.eyJjb250cmFjdF9pZCI6MSwicGVybWFsaW5rIjoiaHR0cHM6Ly93b21waS5jby93cC1jb250ZW50L3VwbG9hZHMvMjAxOS8wOS9URVJNSU5PUy1ZLUNPTkRJQ0lPTkVTLURFLVVTTy1VU1VBUklPUy1XT01QSS5wZGYiLCJmaWxlX2hhc2giOiIzZGNkMGM5OGU3NGFhYjk3OTdjZmY3ODExNzMxZjc3YiIsImppdCI6IjE1ODEwOTIzNjItMzk1NDkiLCJleHAiOjE1ODEwOTU5NjJ9.JwGfnfXsP9fbyOiQXFtQ_7T4r-tjvQrkFx0NyfIED5s",
            "permalink": "https://wompi.co/wp-content/uploads/2019/09/TERMINOS-Y-CONDICIONES-DE-USO-USUARIOS-WOMPI.pdf",
            "type": "END_USER_POLICY"
        },
        "presigned_personal_data_auth": {
          "acceptance_token": "eyJhbGciOiJIUzI1NiJ9.eyJjb250cmFjdF9pZCI6NDQxLCJwZXJtYWxpbmsiOiJodHRwczovL3dvbXBpLmNvbS9hc3NldHMvZG93bmxvYWRibGUvYXV0b3JpemFjaW9uLWFkbWluaXN0cmFjaW9uLWRhdG9zLXBlcnNvbmFsZXMucGRmIiwiZmlsZV9oYXNoIjoiOTVkYzcwN2M0M2UxYmViMDAwMDUyZDNkNWJhZThhMDAiLCJqaXQiOiIxNzI5NTYwMTg3LTM3NDkxIiwiZW1haWwiOiIifQ.BhCzd8KyV0S_M5m22pmNu5lq8JV0L16JXkA2-OgZ5tQ",
          "permalink": "https://wompi.com/assets/downloadble/autorizacion-administracion-datos-personales.pdf",
          "type": "PERSONAL_DATA_AUTH"
      }
    }
}

Paso 2: Mostrarle los links de los respectivos contratos al usuario
En el mismo endpoint del paso anterior podrás tener acceso a los links de cada archivo PDF de los contratos al los cuales tus usuarios deben acceder y estar de acuerdo para proceder con el pago. Estos links los puedes encontrar en el campo que se llama permalink.
 
Paso 3: Aceptación explícita de los contratos por parte del usuario
En este paso, debes asegurarte que el usuario esté de acuerdo con cada uno de los contratos . Para esto, por ejemplo, es buena idea poner un checkbox por cada contrato por aceptar. Una vez que el usuario haya activado cada checkbox, se confirma y se asume que este leyó los contratos propuestos.
 
Paso 4: Enviar los tokens de aceptación
Una vez el usuario acepta los contratos debes agregar los Tokens de Aceptación en los campo llamados acceptance_token y accept_personal_auth en el cuerpo de la petición.
Por ejemplo al crear una transacción, en POST /transactions:
{
  "acceptance_token": "eyJhbGciOiJIUzI1NiJ9.eyJjb250cmFjdF9pZCI6MSwicGVybWFsaW5rIjoiaHR0cHM6Ly93b21waS5jby93cC1jb250ZW50L3VwbG9hZHMvMjAxOS8wOS9URVJNSU5PUy1ZLUNPTkRJQ0lPTkVTLURFLVVTTy1VU1VBUklPUy1XT01QSS5wZGYiLCJmaWxlX2hhc2giOiIzZGNkMGM5OGU3NGFhYjk3OTdjZmY3ODExNzMxZjc3YiIsImppdCI6IjE1ODEwOTIzNjItMzk1NDkiLCJleHAiOjE1ODEwOTU5NjJ9.JwGfnfXsP9fbyOiQXFtQ_7T4r-tjvQrkFx0NyfIED5s",
  "accept_personal_auth": "eyJhbGciOiJIUzI1NiJ9.eyJjb250cmFjdF9pZCI6NDQxLCJwZXJtYWxpbmsiOiJodHRwczovL3dvbXBpLmNvbS9hc3NldHMvZG93bmxvYWRibGUvYXV0b3JpemFjaW9uLWFkbWluaXN0cmFjaW9uLWRhdG9zLXBlcnNvbmFsZXMucGRmIiwiZmlsZV9oYXNoIjoiOTVkYzcwN2M0M2UxYmViMDAwMDUyZDNkNWJhZThhMDAiLCJqaXQiOiIxNzI5NTY0MTM2LTU2NjMwIiwiZW1haWwiOiIifQ.0f-hFte-mpCcnxlrPgEG-fLdGBWUoQaUhU71pPuij40",
  "amount_in_cents": 2500000,
  "currency": "COP",
  "signature": "37c8407747e595535433ef8f6a811d853cd943046624a0ec04662b17bbf33bf5",
  "customer_email": "pepito_perez@example.com",
  "reference": "2322er3234ed4",
  "payment_method": {
    "type": "NEQUI",
    "phone_number": "3107654321"
  }
}

NOTA: Si tienes dudas de como generar el valor de la firma de integridad puedes revisar la siguiente documentación: ** Genera una firma de integridad**
Por ejemplo al crear una fuente de pago, en POST /payment_sources:
{
  "acceptance_token": "eyJhbGciOiJIUzI1NiJ9.eyJjb250cmFjdF9pZCI6MSwicGVybWFsaW5rIjoiaHR0cHM6Ly93b21waS5jby93cC1jb250ZW50L3VwbG9hZHMvMjAxOS8wOS9URVJNSU5PUy1ZLUNPTkRJQ0lPTkVTLURFLVVTTy1VU1VBUklPUy1XT01QSS5wZGYiLCJmaWxlX2hhc2giOiIzZGNkMGM5OGU3NGFhYjk3OTdjZmY3ODExNzMxZjc3YiIsImppdCI6IjE1ODEwOTIzNjItMzk1NDkiLCJleHAiOjE1ODEwOTU5NjJ9.JwGfnfXsP9fbyOiQXFtQ_7T4r-tjvQrkFx0NyfIED5s",
  "accept_personal_auth": "eyJhbGciOiJIUzI1NiJ9.eyJjb250cmFjdF9pZCI6NDQxLCJwZXJtYWxpbmsiOiJodHRwczovL3dvbXBpLmNvbS9hc3NldHMvZG93bmxvYWRibGUvYXV0b3JpemFjaW9uLWFkbWluaXN0cmFjaW9uLWRhdG9zLXBlcnNvbmFsZXMucGRmIiwiZmlsZV9oYXNoIjoiOTVkYzcwN2M0M2UxYmViMDAwMDUyZDNkNWJhZThhMDAiLCJqaXQiOiIxNzI5NTY0MTM2LTU2NjMwIiwiZW1haWwiOiIifQ.0f-hFte-mpCcnxlrPgEG-fLdGBWUoQaUhU71pPuij40",
  "customer_email": "pepito_perez@example.com",
  "type": "NEQUI",
  "token": "nequi_prod_RQkUiuv3lEnDLiSao2Cz0iQLdFlyQOI5"
}


Métodos de pago
Cambio importante en el API
Para la creación de transacciones y fuentes de pago, pensando en la privacidad y el correcto manejo de los datos personales de nuestros usuarios, es ahora obligatorio el uso de Tokens de Aceptación a la hora de crear cualquiera de estos dos recursos a través de nuestro API.
Cada vez que creas una transacción usando nuestro API, tienes la opción de procesar el pago usando distintos métodos de pago. Actualmente se encuentran disponibles los siguientes métodos de pago:
•	Tarjetas de Crédito o Débito: Permite a tus clientes usar tarjetas de crédito o débito para realizar el pago.
•	Botón de Transferencia Bancolombia: Permite a tus clientes usar sus cuentas de ahorros o corrientes Bancolombia para realizar el pago.
•	Nequi: Ofrece a tus clientes la posibilidad de usar su cuenta Nequi desde su celular, para completar el pago.
•	PSE: Permite a tus clientes realizar el pago usando su cuenta bancaria, de ahorros o corriente de cualquier banco colombiano.
•	Pago en efectivo en Corresponsales Bancarios Bancolombia: Permite a tus clientes realizar el pago en efectivo en cualquiera de los más de 15.000 Corresponsales Bancarios Bancolombia.
•	PCOL: Permite a tus clientes realizar el pago redimiendo Puntos Colombia.
•	BNPL BANCOLOMBIA: Permite a tus clientes optar por un crédito de libre inversión de BANCOLOMBIA, sin intereses, dividido en 4 cuotas mensuales para transacciones superiores a $100,000 pesos.
•	DAVIPLATA: Proporciona a tus clientes la opción de utilizar su cuenta Daviplata para realizar el pago de forma conveniente.
•	SU+ PAY: Permite a los usuarios comprar productos o servicios y pagarlos en cuotas, facilitando la gestión financiera y el acceso a una amplia gama de productos.
Para usar un método de pago al hacer POST en el endpoint de /transactions debes:
1.	Especificar el campo payment_method con un objeto JSON que contiene detalles específicos de cada método, descritos más abajo.
2.	Especificar el campo payment_method_type y especifique uno de estos 3 valores: TARJETA, NEQUI o PSE.
Al finalizar el proceso de pago de cualquiera de los métodos disponibles, te recomendamos siempre verificar periódicamente (long polling) el estado de una transacción, esperando un status final (aprobada, rechazada o error), usando el ID de transacción y nuestro API, ya que ninguno de los métodos de pago otorga un resultado síncrono (inmediato). Una transacción recién creada siempre tiene un status: PENDING.
Estados finales de una transacción
El status final posible de una transacción puede ser: APPROVED (aprobada), DECLINED (rechazada), VOIDED (anulada, sólo aplica para transacciones con Tarjeta) o ERROR (si sucedió algún error externo a Wompi autorizando la transacción).
Tarjetas de Crédito o Débito
En Wompi, tus clientes pueden procesar pagos usando tarjetas crédito y débito de las franquicias Visa, MasterCard y American Express, siempre y cuando cuenten con un CVC (Código de Verificación de Tarjeta), usualmente impreso en el reverso de la tarjeta, lo que significa que está habilitada para comprar en internet.
El nombre del método de pago que debes usar al crear la transacción es CARD. Al usar el tipo de método de pago CARD debes tener en cuenta que:
1.	Debes haber tokenizado una tarjeta previamente (instrucciones a continuación)
2.	Debes haber preguntado a tu usuario en cuántas cuotas desea hacer el pago.
¡No guardes nunca la información de una tarjeta!
Desaconsejamos completamente que guardes información sensible de tarjetas. No sólo pones en riesgo la información de tus usuarios sino que puedes enfrentar sanciones económicas y problemas legales. Wompi cuenta con una certificación PCI DSS para al manejo, transmisión y procesamiento seguro de datos de tarjeta, de manera que ningún comercio deba guardar estos datos, usando únicamente los tokens seguros generados.
Tokeniza una tarjeta
Para tokenizar de manera segura una tarjeta debes usar nuestro endpoint (autenticado con tu llave pública):
POST /v1/tokens/cards

A este endpoint, debes enviar la siguiente información de la tarjeta:
{
  "number": "4242424242424242", // Número de la tarjeta
  "cvc": "123", // Código de seguridad de la tarjeta (3 o 4 dígitos según corresponda)
  "exp_month": "08", // Mes de expiración (string de 2 dígitos)
  "exp_year": "28", // Año expresado current 2 dígitos
  "card_holder": "José Pérez" // Nombre del tarjetahabiente
}

A lo que el endpoint responderá:
{
  "status": "CREATED",
  "data": {
    "id": "tok_prod_1_BBb749EAB32e97a2D058Dd538a608301", // TOKEN que debe ser usado para crear la transacción
    "created_at": "2020-01-02T18:52:35.850+00:00",
    "brand": "VISA",
    "name": "VISA-4242",
    "last_four": "4242",
    "bin": "424242",
    "exp_year": "28",
    "exp_month": "08",
    "card_holder": "José Pérez",
    "expires_at": "2020-06-30T18:52:35.000Z"
  }
}

De esta respuesta, el valor del campo "id" es el token que debes usar dentro del método de pago (en este caso "tok_prod_1_BBb749EAB32e97a2D058Dd538a608301"), para posteriormente crear una transacción.
¡No uses un token más de dos veces!
Si necesitas hacer múltiples cobros a una misma tarjeta, utiliza Fuentes de Pago.
Realiza la transacción
Con estos detalles y habiendo consultado al usuario final sobre el número de cuotas ("installments") en las que desea pagar, los campos del método de pago para una nueva transacción con tarjeta de crédito o débito deberían ser los siguientes:
{
  "payment_method": {
    "type": "CARD",
    "installments": 2, // Número de cuotas
    "token": "tok_prod_1_BBb749EAB32e97a2D058Dd538a608301" // Token de la tarjeta de crédito
  }
  // Otros campos de la transacción a crear...
}

Por último, es fundamental verificar periódicamente el estado de una transacción en Wompi desde tu sistema. Para obtener el estado de una transacción, utiliza el ID de transacción y accede al siguiente endpoint:
GET /v1/transactions/<ID_TRANSACCION>

Asegúrate de reemplazar <ID_TRANSACCION> con el ID real de la transacción que deseas consultar. Este endpoint te proporcionará detalles sobre el estado y la información de pago de la transacción.
A continuación se muestra un ejemplo de los campos necesarios para realizar una nueva transacción con tarjeta de crédito o débito:
{
  "data": {
    "id": "0101010-0101010101-10101",
    "created_at": "2023-01-17T18:16:06.287Z",
    "amount_in_cents": 1000000,
    "reference": "Prime_102305887219213_108224918",
    "currency": "COP",
    "payment_method_type": "CARD",
    "payment_method": {
      "type": "CARD",
      "extra": {
        "name": "MASTERCARD-0110",
        "brand": "MASTERCARD",
        "last_four": "0110",
        "processor_response_code": "51" // Código de respuesta del procesador y/o emisor de la tarjeta
      },
      "installments": 2
    },
    "redirect_url": null,
    "status": "DECLINED",
    "status_message": "Fondos Insuficientes",
    "merchant": {
      "name": "HULU PRIME",
      "legal_name": " HULU S.A.S.",
      "contact_name": "John Doe",
      "phone_number": "+573001111111",
      "logo_url": null,
      "legal_id_type": "NIT",
      "email": "payins+01codiprime@hulu.com",
      "legal_id": "100111111-01"
    },
    "taxes": []
  },
  "meta": {}
}

En la respuesta, se proporciona el processor_response_code, status y status_message de la transacción.
NOTA: Le recomendamos utilizar el campo processor_response_code para obtener la respuesta del procesador. Además, tenga presente que en la respuesta del endpoint puede recibir campos adicionales en el objeto extra.
Botón de Transferencia Bancolombia
Pago Simple
En Wompi, tus clientes pueden completar el pago de una transacción usando su cuenta de ahorros o corriente Bancolombia. El nombre del método de pago que debes usar al crear la transacción es BANCOLOMBIA_TRANSFER.
Al usar el tipo de método de pago BANCOLOMBIA_TRANSFER debes tener en cuenta lo siguiente:
1.	Tu cliente debe escoger qué tipo de persona es en el campo user_type. Por el momento únicamente está disponible Persona Natural, como PERSON
i.	Debes especificar un nombre de lo que se está pagando en el campo payment_description. Máximo 64 caracteres. No puedes incluir comillas simples en este dato (').
Así, los campos de método de pago una nueva transacción con BANCOLOMBIA_TRANSFER deben ser similares a los siguientes:
{
  "payment_method": {
    "type": "BANCOLOMBIA_TRANSFER",
    "payment_description": "Pago a Tienda Wompi", // Nombre de lo que se está pagando. Máximo 64 caracteres
    "ecommerce_url": "https://comercio.co/thankyou_page" // Permite al cliente omitir la pantalla resumen de la transacción de wompi, y redireccionar a un resumen personalizado current el comercio
  }
  // Otros campos de la transacción a crear...
}

Al crear la transacción, debes consultarla continuamente (long polling) hasta que ésta contenga un campo llamado async_payment_url dentro de un objeto extra, que estará dentro de la propiedad payment_method. Una vez la obtengas, debes redireccionar a tu cliente a esta URL para que complete el pago en la respectiva institución financiera (banco). El campo que debes esperar de la transacción se vería como el siguiente:
{
  "payment_method": {
    "type": "BANCOLOMBIA_TRANSFER",
    // Otros campos del payment_method
    "extra": {
      "async_payment_url": "https://..." // URL para redireccionar al cliente
    }
  }
  // Otros campos de la transacción...
}

Compra Recurrente Nuevo
Dentro de la plataforma de Wompi, ofrecemos a tus clientes la posibilidad de permitir pagos recurrentes desde su cuenta Bancolombia. Este servicio es la solución perfecta para quienes buscan comodidad y eficiencia en la gestión de sus pagos periódicos. Esta innovadora opción de pago permite a los clientes autorizar de manera segura cobros automáticos y programados.
Para la creación de una transacción recurrente es nesecario haber creado una fuente de pago como se ve aquí
Con el campo <<ID_FUENTE_DE_PAGO>> procederas a crear la transacción en el caso de que el token se encuentre en estado APPROVED la transacción se realizara sin necesidad de que el cliente se autentique en Bancolombia
{
  "payment_method": {
    "type": "BANCOLOMBIA_TRANSFER",
    "payment_description": "Pago a Tienda Wompi", // Nombre de lo que se está pagando. Máximo 64 caracteres
    "ecommerce_url": "https://comercio.co/thankyou_page" // Permite al cliente omitir la pantalla resumen de la transacción de wompi, y redireccionar a un resumen personalizado current el comercio
  },
  "payment_source_id": <<ID_FUENTE_DE_PAGO>>, // ID de la fuente de pago creada previamente
  // Otros campos de la transacción a crear...
}

Al finalizarse el proceso de pago a través de Bancolombia, éste redireccionará a la redirect_url que hayas especificado originalmente en la transacción, para que puedas verificar el resultado de la transacción, nuevamente con un long polling hasta obtener un status final.
Por último, recuerda siempre verificar periódicamente el estado de una transacción en Wompi desde tu sistema usando el ID de transacción y nuestro API, con el endpoint GET /v1/transactions/<ID_DE_TRANSACCION>
Bancolombia QR
Permite a tus clientes usar sus cuentas a la mano de Bancolombia, cuentas de ahorros o corrientes Bancolombia y cuentas de Nequi, a través de la generación de un QR que deberá ser leído por la respectiva app del banco. El nombre del método de pago que debes usar al crear la transacción es BANCOLOMBIA_QR. Debes tener en cuenta que los pagos a través de este medio solo aplican para personas naturales.
Los campos de método de pago para una nueva transacción con BANCOLOMBIA_QR deben ser similares a los siguientes:
{
  "payment_method": {
    "type": "BANCOLOMBIA_QR",
    "payment_description": "Pago a Tienda Wompi", // Nombre de lo que se está pagando. Máximo 64 caracteres
    // El siguiente dato SOLO aplica si estás haciendo transacciones en Sandbox:
    "sandbox_status": "APPROVED" // Status final deseado en el Sandbox. Uno de los siguientes: APPROVED, DECLINED o ERROR
  }
  // Otros campos de la transacción a crear...
}

Al crear la transacción, debes consultarla continuamente (long polling) hasta que ésta contenga un campo llamado qr_image y qr_id, que estará dentro de la propiedad payment_method, el cual tendrá la imagen del QR en base64 dentro de un objeto extra.
Una vez la obtengas, puedes renderizar el QR en un tag img de la siguiente manera:
<img src="data:image/svg+xml;base64 + ${qr_image}"/>

El campo que debes esperar de la transacción se vería como el siguiente:
{
  "payment_method": {
    "type": "BANCOLOMBIA_QR",
    // Otros campos del payment_method
    "extra": {
      "qr_id": "a3827b90-501b-11ed-ae9b-3156df51ed75", // ID del código QR
      "qr_image": "PD94bWwgdmVyc2lvbj0iK.....", // Imágen del código QR codificada en Base64
      "external_identifier": "d00000000000" //Id de conciliación una vez hecho el pago
    }
  }
  // Otros campos de la transacción...
}

Al finalizarse el proceso de pago a través de BANCOLOMBIA_QR, éste redireccionará a la redirect_url que hayas especificado originalmente en la transacción, para que puedas verificar el resultado de la transacción, nuevamente con un long polling hasta obtener un status final.
Por último, recuerda siempre verificar periódicamente el estado de una transacción en Wompi desde tu sistema usando el ID de transacción y nuestro API, con el endpoint GET /v1/transactions/<ID_DE_TRANSACCION>
Nequi
En Wompi, tus clientes pueden completar el pago de una transacción usando su cuenta Nequi en su celular. El nombre del método de pago que debes usar al crear la transacción es NEQUI.
Al usar el tipo de método de pago NEQUI solamente debes solicitarle a tu cliente un número celular colombiano, de 10 dígitos, que esté registrado con Nequi, para enviarlo dentro de la información necesaria para nuestro API. Recuérdale a tu cliente que debe contar con la app de Nequi instalada en su celular para poder completar el pago usando este método.
Teniendo el número celular, los campos de método de pago una nueva transacción con Nequi deben ser similares a los siguientes:
{
  "payment_method": {
    "type": "NEQUI"
    "phone_number": "3107654321" // Número celular de la cuenta Nequi
  }
  // Otros campos de la transacción a crear...
}

Al crear la transacción, debes indicarle a tus clientes que recibirán una notificación push de parte de Nequi en su celular, en la cual deberán aceptar o rechazar dicha transacción. Este resultado se verá reflejado en Wompi en cuestión de segundos, luego de que el usuario haya tomado acción.
Por último, recuerda siempre verificar periódicamente el estado de una transacción en Wompi desde tu sistema usando el ID de transacción y nuestro API.
PSE
En Wompi, tus clientes pueden completar el pago de una transacción usando su cuenta de ahorros o corriente de cualquier banco colombiano, a través de PSE. El nombre del método de pago que debes usar al crear la transacción es PSE.
Al usar el tipo de método de pago PSE debes tener en cuenta lo siguiente:
1.	Debes obtener primero una lista de instituciones financieras usando nuestro API, en el endpoint GET /v1/pse/financial_institutions
2.	Tu cliente debe escoger en qué institución (banco) quiere realizar el pago
3.	Tu cliente debe especificar el tipo de persona que es: natural (0) o jurídica (1).
4.	Tu cliente debe especificar su tipo y número de documento
5.	Tu cliente debe especificar su nombre completo
6.	Tu cliente debe especificar una cuenta de correo electrónico
7.	Tu cliente debe especificar un número de teléfono
8.	Finalmente debes especificar la descripción de lo que tu cliente está pagando, máximo 64 caracteres
Luego de que tu cliente haya escogido una institución financiera, usa su código (code) como el identificador que vas a enviar al crear la transacción. Así, los campos de método de pago de una nueva transacción tipo PSE deben ser similares a los siguientes:
{
  "customer_email": "cliente@example.com",
  "payment_method": {
    "type": "PSE",
    "user_type": 0, // Tipo de persona, natural (0) o jurídica (1)
    "user_legal_id_type": "CC", // Tipo de documento, CC o NIT
    "user_legal_id": "1099888777", // Número de documento
    "financial_institution_code": "1", // Código (`code`) de la institución financiera
    "payment_description": "Pago a Tienda Wompi, ref: JD38USJW2XPLQA" // Descripción de lo que está pagando. Máximo 64 caracteres
  },
  "customer_data": {
    "phone_number": "573145678901",
    "full_name": "Nombre(s) Apellido(s)"
  }
  // Otros campos de la transacción a crear...
}

A tener en cuenta: Con el fin de mitigar el fraude en el servicio PSE, se han definido acciones adicionales que deben ser implementadas por todas las empresas vinculadas a la categoría de Servicios Financieros. Entre estas acciones se encuentra la inclusión de tres campos obligatorios en la trama transaccional, relacionados con la dirección IP del usuario, la fecha de apertura del producto y la identificación del beneficiario.
De cumplir con la descripción anterior se recomienda enviar el objeto payment_method con los campos reference_one, reference_two, reference_three
{
  // Otros campos de la transacción...
  "payment_method": {
    "type": "PSE",
    "user_type": 0,
    "user_legal_id_type": "CC",
    "user_legal_id": "1999888777",
    "financial_institution_code": "1",
    "payment_description": "Pago a Tienda Wompi",
    "reference_one": "192.168.0.1", // Dirección IP del cliente pagador, en caso de no enviarla se tomará la ip de origen de la petición
    "reference_two": "20240101",    // Fecha de apertura del producto en formato yyyymmdd
    "reference_three": "123456"   // Número de documento del beneficiario del producto financiero
  }
}

Al crear la transacción, debes consultarla continuamente (long polling) hasta que ésta contenga un campo llamado async_payment_url dentro de un objeto extra, que estará dentro de la propiedad payment_method. Una vez la obtengas, debes redireccionar a tu cliente a esta URL para que complete el pago en la respectiva institución financiera (banco). El campo que debes esperar de la transacción se vería como el siguiente:
{
  "payment_method": {
    // Otros campos del payment_method
    "extra": {
      "async_payment_url": "https://..." // URL para redireccionar al cliente
    }
  }
  // Otros campos de la transacción...
}

Al finalizarse el proceso de pago a través de PSE, éste redireccionará a la redirect_url que hayas especificado originalmente en la transacción, para que puedas verificar el resultado de la transacción, nuevamente con un long polling hasta obtener un status final.
Por último, recuerda siempre verificar periódicamente el estado de una transacción en Wompi desde tu sistema usando el ID de transacción y nuestro API, con el endpoint GET /v1/transactions/<ID_DE_TRANSACCION>
Pago en efectivo en Corresponsales Bancarios Bancolombia
Este medio de pago le permite al tus clientes acercarce a cualquier Corresponsal Bancario Bancolombia y realizar el pago en efectivo. Para generar una intención de pago en efectivo debes seguir los siguientes pasos:
Paso 1: Crea la transacción
Debes crear una transacción insertando BANCOLOMBIA_COLLECT en el campo type de payment_method:
{
  "payment_method": {
    "type": "BANCOLOMBIA_COLLECT" // medio de pago current corresponsal bancario
  }
  // Otros campos de la transacción a crear...
}

Como respuesta obtendrás una transacción con el campo status en PENDING.
Paso 2: Consulta la transacción creada
Después de crear la transacción debes hacer long polling a la misma usando el endpoint el endpoint GET /v1/transactions/<ID_DE_TRANSACCION> hasta obtner la información de convenio que te será presentada de la siguiente manera en el campo payment_method en el objeto extra de la transacción:
{
  "payment_method": {
    "type": "BANCOLOMBIA_COLLECT",
    "extra": {
        "business_agreement_code": "12345", // Esto current un valor de ejemplo
        "payment_intention_identifier": "65770204276" // Esto current un valor de ejemplo
    }
  // El resto de la información de transacción...
}

Paso 3: Comparte la información de pago
Una vez tengas la información de pago como se muestra en el paso anterior, puedes compartir con tus clientes el número de convenio business_agreement_code y el número de intención de pago payment_intention_identifier, para que estos efectúen el pago en cualquier Corresponsal Bancario Bancolombia.
Puntos Colombia (PCOL)
En Wompi, tus clientes pueden completar el pago de una transacción usando pago total con Puntos Colombia o Puntos + un segundo metodo de pago: Tarjetas de Crédito o Débito, Botón de Transferencia Bancolombia, Nequi, PSE. Para crear una transacción con pago con Puntos Colombia, el nombre del método de pago que debes usar es PCOL.
Paso 1: Crea la transacción con Método de pago PCOL
Para crear una transacción de Pago con Puntos (PCOL), los campos del método de pago deben ser similares a los siguientes:
{
  "customer_email": "myemail@mail.com",
  "customer_data": {
    "phone_number": "+573121111111",
    "full_name": "Nombre Apellido"
  },
  "payment_method": {
    "type": "PCOL"
  }
  // Otros campos de la transacción a crear...
}

Al crear la transacción, debes consultarla continuamente (long polling) hasta que ésta contenga un campo llamado async_payment_url dentro de un objeto extra, que estará dentro de la propiedad payment_method. Una vez la obtengas, debes redireccionar a tu cliente a esta URL para que realice la redención de Puntos. El campo que debes esperar de la transacción se ve como el siguiente:
{
  "payment_method": {
    // Otros campos del payment_method
    "extra": {
      "async_payment_url": "https://..." // URL para redireccionar al cliente
    }
  }
  // Otros campos de la transacción...
}

Paso 2: Validar resultado de la redención en Puntos Colombia
Al finalizarse el proceso de redención a través de PCOL, éste redireccionará a la redirect_url que hayas especificado originalmente en la transacción, para que puedas verificar el resultado de la redención, e identificar si el pago con Puntos fue completo o parcial.
Para esto, al recibir la redirección se debe hacer nuevamente un long polling de la transacción hasta obtener en el campo status diferente de PENDING y los campos point_redeemed, redeemed_amount_in_cents_pcol y remaining_amount_in_cents dentro de un objeto extra, que estará dentro de la propiedad payment_method:
{
  "payment_method": {
    "type": "PCOL",
    "extra": {
      "async_payment_url": "https://...", // URL para redireccionar al cliente
      "points_redeemed": 1000, // Puntos Colombia redimidos
      "remaining_amount_in_cents": 0, // Saldo pendiente por pagar con segundo medio de pago
      "redeemed_amount_in_cents_pcol": 700000 // Dinero redimido
    }
  },
  "status": "APPROVED"
  // Otros campos de la transacción...
}

Debes validar el valor recibido en el campo remaining_amount_in_cents: (i) Si este es igual a 0, y el estado de la transacción es APPROVED esto indicará que el cliente realizó el pago total con Puntos y en este caso finaliza la transacción y se puede mostrar el resumen del pago. (ii) Si el valor es igual a 0, y el estado de la transacción es ERROR o DECLINED esto indicará que no se realizó redención de Puntos; en este caso puedes habilitar al cliente la opción de pagar el total de la transacción con un segundo medio de pago. (Paso 3) (iii) Si el valor es mayor a 0, debes habilitar la opción de pagar con segundo medio de pago el valor pendiente por pagar. (Paso 3)
Paso 3: Pago con segundo medio de pago
Si en el paso anterior se cumple la condición (ii) Pago total con segundo medio de pago o (iii) Pago de saldo restante con segundo medio de pago se deberá habilitar la selección del segundo medio de pago (Tarjetas de Crédito o Débito, Botón de Transferencia Bancolombia, Nequi o PSE) para pagar el valor restante (remaining_amount_in_cents). Una vez seleccionado el segundo medio de pago, se deberá crear una segunda transacción asociada a la creada en el Paso 1. Para esto debes seguir las indicaciones del medio de pago respectivo agregando en la petición el campo parent_transaction_id como se muestra a continuación:
Segundo medio de Pago con Tarjeta
{
  "payment_method": {
    "type": "CARD",
    "installments": 2, // Número de cuotas
    "token": "tok_prod_1_BBb749EAB32e97a2D058Dd538a608301" // Token de la tarjeta de crédito
  },
  "parent_transaction_id": "1929-1666902167-47609" // Transacción PCOL
  // Otros campos de la transacción a crear...
}

Segundo medio de Pago con Botón de Transferencia Bancolombia
{
  "payment_method": {
    "type": "BANCOLOMBIA_TRANSFER",
    "user_type": "PERSON", // Tipo de persona
    "payment_description": "Pago a Tienda Wompi", // Nombre de lo que se está pagando. Máximo 64 caracteres
    "ecommerce_url": "https://comercio.co/thankyou_page" // Permite al cliente omitir la pantalla resumen de la transacción de wompi, y redireccionar a un resumen personalizado current el comercio
  },
  "parent_transaction_id": "1929-1666902167-47609" // Transacción PCOL
  // Otros campos de la transacción a crear...
}

Segundo medio de Pago con Nequi
{
  "payment_method": {
    "type": "NEQUI"
    "phone_number": "3107654321" // Número celular de la cuenta Nequi
  },
  "parent_transaction_id": "1929-1666902167-47609" // Transacción PCOL
  // Otros campos de la transacción a crear...
}

Segundo medio de Pago con PSE
{
  "payment_method": {
    "type": "PSE",
    "user_type": 0, // Tipo de persona, natural (0) o jurídica (1)
    "user_legal_id_type": "CC", // Tipo de documento, CC o NIT
    "user_legal_id": "1099888777", // Número de documento
    "financial_institution_code": "1", // Código (`code`) de la institución financiera
    "payment_description": "Pago a Tienda Wompi, ref: JD38USJW2XPLQA", // Nombre de lo que se está pagando. Máximo 30 caracteres
    "ecommerce_url": "https://comercio.co/thankyou_page" // Permite al cliente omitir la pantalla resumen de la transacción de wompi, y redireccionar a un resumen personalizado current el comercio
  },
  "parent_transaction_id": "1929-1666902167-47609" // Transacción PCOL
  // Otros campos de la transacción a crear...
}

Por último, recuerda siempre verificar periódicamente el estado de una transacción en Wompi desde tu sistema usando el ID de transacción y nuestro API, con el endpoint GET /v1/transactions/<ID_DE_TRANSACCION>. Al consultar una transacción PCOL que tenga asociado un segundo medio de pago, encontrarás un campo llamado child_transaction_id dentro de un objeto extra, que estará dentro de la propiedad payment_method; este campo corresponde al identificador de la transacción del segundo medio de pago:
{
  "payment_method": {
    "type": "PCOL",
    "extra": {
      "points_redeemed": 0,
      "async_payment_url": "https://....",
      "external_identifier": "external-id-123",
      "remaining_amount_in_cents": 300000,
      "redeemed_amount_in_cents_pcol": 0,
      "child_transaction_id": "11463-1666651097-12919" // Transacción segundo medio de pago
    }
  }
}

De igual forma, al consultar la transacción asociada (child_transaction_id), encontrarás el identificador de la transacción PCOL:
{
  "payment_method": {
    "type": "NEQUI", // Segundo medio de pago
    "phone_number": "3222222222",
    "extra": {
      "parent_transaction_id": "11463-1666649502-97081" // Transacción PCOL
    }
}

BNPL Bancolombia
Dentro de la plataforma Wompi, brindamos a tus clientes la posibilidad de completar sus transacciones mediante un crédito de libre inversión proporcionado por BANCOLOMBIA, caracterizado por su atractiva tasa de interés del 0%. Este conveniente servicio permite a los usuarios disfrutar de la flexibilidad financiera al dividir el pago en 4 cuotas mensuales. Destacando su accesibilidad, este método de pago está disponible para transacciones con montos a partir de $100.000 pesos, garantizando así una experiencia financiera adaptada a diversas necesidades. Si deseas más información sobre esta opción de pago innovadora, te invitamos a encontrar detalles adicionales aquí.
Paso 1: Crea la transacción con Método de pago BNPL Bancolombia
Para crear una transacción de Pago con BNPL Bancolombia, los campos del método de pago deben ser similares a los siguientes:
{
  "amount_in_cents": 10000000, //$100.000 pesos en centavos
  "currency": "COP", // Tipo de moneda
  "customer_email": "myemail@mail.com", // Correo el cliente
  "reference": "{{REFERENCE}}", // Referencia creada por el comercio
  "payment_method": {
    "type": "BANCOLOMBIA_BNPL", // El metodo de pago
    "name": "Pedro", // Nombres del cliente
    "last_name": "Perez", // Apellidos del cliente
    "user_legal_id_type": "CC", // Tipo de documento del cliente
    "user_legal_id": "12345678", // Numero de documento del cliente
    "phone_number": "3222222222", // Telefono del cliente
    "phone_code": "+57", // Indicativo del cliente
    "redirect_url": "https://www.wompi.com", // URL de redirección despues de finalizar la experiencia BNPL
    "payment_description": "Pago a Tienda Wompi, ref: JD38USJW2XPLQA" // Nombre de lo que se está pagando. Máximo 30 caracteres
  },
  "acceptance_token": "{{ACCEPTANCE_TOKEN}}", // Token de aceptación
  "payment_method_type": "BANCOLOMBIA_BNPL" // El metodo de pago
}

Al crear la transacción, debes consultarla continuamente (long polling) hasta que ésta contenga un campo llamado url dentro de un objeto extra, que estará dentro de la propiedad payment_method. Una vez la obtengas, debes redireccionar a tu cliente a esta URL para entrar a la experiencia BNPL Bancolombia. El campo que debes esperar de la transacción se ve como el siguiente:
{
  "data": {
    "id": "12041-1701116325-63662",
    "created_at": "2023-11-27T20:18:45.527Z",
    "finalized_at": null,
    "amount_in_cents": 50000000,
    "reference": "wvnofptru4s",
    "currency": "COP",
    "payment_method_type": "BANCOLOMBIA_BNPL",
    "payment_method": {
      "name": "Pedro",
      "type": "BANCOLOMBIA_BNPL",
      "extra": {
        "url": "https://test.com", // <------ Campo URL
        "steps": ["ProvideAuthenticate"],
        "is_three_ds": false
      },
      "last_name": "Perez",
      "phone_code": "+57",
      "phone_number": "3222222222",
      "redirect_url": "https://www.wompi.com",
      "user_legal_id": "12345678",
      "user_legal_id_type": "CC",
      "payment_description": "Pago a Tienda Wompi, ref: JD38USJW2XPLQA" // Nombre de lo que se está pagando. Máximo 30 caracteres
    },
    "payment_link_id": null,
    "redirect_url": null,
    "status": "PENDING",
    "status_message": null,
    "merchant": {
      "id": 1,
      "name": "Test",
      "legal_name": "Test",
      "contact_name": "Test",
      "phone_number": "+573222222222",
      "logo_url": null,
      "legal_id_type": "CC",
      "email": "test@wompi.com",
      "legal_id": "12345678",
      "public_key": "{{PUBLIC_KEY}}"
    },
    "taxes": [],
    "tip_in_cents": null
  },
  "meta": {}
}

Paso 2: Validar resultado de la transacción
Al finalizarse el proceso de redención a través de BNPL, éste redireccionará a la redirect_url que hayas especificado originalmente en la transacción, para que puedas verificar el resultado de la transacción al recibir la redirección se debe hacer nuevamente un long polling de la transacción hasta obtener en el campo status un valor diferente de PENDING:
{
  "data": {
    "id": "12041-1701116325-63662",
    "created_at": "2023-11-27T20:18:45.527Z",
    "finalized_at": null,
    "amount_in_cents": 50000000,
    "reference": "wvnofptru4s",
    "currency": "COP",
    "payment_method_type": "BANCOLOMBIA_BNPL",
    "payment_method": {
      "name": "Pedro",
      "type": "BANCOLOMBIA_BNPL",
      "extra": {
        "url": "https://test.com",
        "steps": ["ProvideAuthenticate"],
        "is_three_ds": false
      },
      "last_name": "Perez",
      "phone_code": "+57",
      "phone_number": "3222222222",
      "redirect_url": "https://www.wompi.com",
      "user_legal_id": "12345678",
      "user_legal_id_type": "CC",
      "payment_description": "Pago a Tienda Wompi, ref: JD38USJW2XPLQA" // Nombre de lo que se está pagando. Máximo 30 caracteres
    },
    "payment_link_id": null,
    "redirect_url": null,
    "status": "APPROVED", // <------ Status
    "status_message": null,
    "merchant": {
      "id": 1,
      "name": "Test",
      "legal_name": "Test",
      "contact_name": "Test",
      "phone_number": "+573222222222",
      "logo_url": null,
      "legal_id_type": "CC",
      "email": "test@wompi.com",
      "legal_id": "12345678",
      "public_key": "{{PUBLIC_KEY}}"
    },
    "taxes": [],
    "tip_in_cents": null
  },
  "meta": {}
}

Daviplata
Dentro de la plataforma Wompi, ofrecemos a tus clientes la posibilidad de facilitar sus pagos al utilizar su cuenta Daviplata. Este servicio brinda una alternativa conveniente para completar transacciones de manera eficiente. Aprovechando la facilidad de uso de Daviplata, tus clientes pueden realizar pagos de manera sencilla y adaptada a su estilo de vida financiero.
Para utilizar este método de pago, se requiere solicitar al cliente el tipo y número de documento, así como asegurar una cobertura telefónica. Además, el cliente debe tener la aplicación instalada en su celular. El sistema realizará una búsqueda y enviará un código OTP a través de un mensaje de texto al número de teléfono asociado a los dos campos mencionados anteriormente, con el propósito de confirmar la transacción.
Paso 1: Crea la transacción con Método de pago Daviplata
Para iniciar una transacción de pago con Daviplata, es necesario que los campos de la transacción se ajusten a la siguiente estructura:
{
  "amount_in_cents": 150000, //Monto en centavos ($1.500 pesos)
  "currency": "COP", //Tipo de moneda
  "customer_email": "test@test.com", //Correo del cliente
  "reference": "{{REFERENCE}}", //Referencia creada por el comercio
  "payment_method": {
    "type": "DAVIPLATA", //Metodo de pago
    "user_legal_id": "1134568019", //Numero de documento del cliente
    "user_legal_id_type": "CC", //Tipo de documento del cliente
    "payment_description": "Pago a Tienda Wompi, ref: JD38USJW2XPLQA" // Nombre de lo que se está pagando. Máximo 30 caracteres
  },
  "acceptance_token": "{{ACCEPTANCE_TOKEN}}", //Token de aceptación
  "payment_method_type": "DAVIPLATA", //Metodo de pago
  "redirect_url": "https://www.google.com" //Campo opcional: URL de redirección al finalizar la transacción.
}

Al crear la transacción, es necesario realizar consultas continuas (long polling) hasta que la misma incluya un campo denominado url, el cual estará ubicado en la propiedad data -> payment_method -> extra -> url:
{
  "data": {
    "id": "12518-1707838356-68178",
    "created_at": "2024-02-13T15:32:37.046Z", //Fecha de creación
    "finalized_at": null,
    "amount_in_cents": 150000, //Monto en centavos ($1.500 pesos)
    "reference": "6lmmyl8howq", //Referencia creada por el comercio
    "currency": "COP", //Moneda
    "payment_method_type": "DAVIPLATA", //Metodo de pago
    "payment_method": {
      "type": "DAVIPLATA", //Metodo de pago
      "extra": {
        "url": "https://test.com", //URL interfaz Wompi para digitar codigo OTP
        "steps": ["Create"],
        "is_three_ds": false,
        "afe_decision": "FRAUD_CHECK",
        "url_services": {
          //Servicios para implementar el reenvio y confirmación del OTP
          "token": "token", //JSON Token
          "code_otp_send": "https://test.com", //URL para reenviar el codigo OTP
          "code_otp_validate": "https://test.com" //URL para validar el codigo OTP
        }
      },
      "user_legal_id": "53234234", //Número de documento del cliente
      "user_legal_id_type": "CC", //Tipo de documento del cliente
      "payment_description": "Pago a Tienda Wompi, ref: JD38USJW2XPLQA" // Nombre de lo que se está pagando. Máximo 30 caracteres
    },
    "payment_link_id": null,
    "redirect_url": "https://www.test.com", //URL de redirección al concluir la transacción (si se especifica)
    "status": "PENDING", //Estado de la transacción
    "status_message": null,
    "merchant": {
      //Informacion del comercio
      "id": 999,
      "name": "test",
      "legal_name": "Pepito Perez",
      "contact_name": "Pepito Perez",
      "phone_number": "+573222222222",
      "logo_url": null,
      "legal_id_type": "CC",
      "email": "test@gmail.com",
      "legal_id": "32452341",
      "public_key": "public_key" //Llave publica del comercio
    },
    "taxes": [] //Impuestos
  },
  "meta": {}
}

•	Utilizando nuestra experiencia
Una vez que obtengas esta información, debes redirigir a tu cliente hacia la URL correspondiente para acceder a la experiencia que ofrecemos, donde podrá insertar el código OTP de confirmación, dicha experiencia luce de la siguiente manera:
 
•	Aplicando tu experiencia
Esta vez nos centramos en el JSON data -> payment_method -> extra -> url_services. Aquí encontrarás los siguientes campos:
1.	token: Este debes enviarlo como token Bearer en tus Headers.
2.	code_otp_send: Se emplea para reenviar un código OTP al cliente. Para utilizarlo, debes realizar una solicitud tipo POST. No olvides incluir el token Bearer en tus encabezados Headers. En caso de una solicitud exitosa, la respuesta será la siguiente:
{
  "status": 200,
  "code": "OK",
  "message": "Solicitud ejecutada correctamente.",
  "data": {
    "transaction": {
      "PK": "12518-1707777099-36709", //Identificador de la transacción
      "status": "PENDING", //Estado de la transacción
      "statusMessage": "",
      "amountInCents": 150000, //Monto en centavos ($1.500 pesos)
      "clientInfo": {
        "typeDocument": "CC", // Tipo de documento pagador
        "numberDocument": "1043843543", // Numero de documento pagador
        "email": "test@sandbox.com" // Correo del pagador
      },
      "steps": {
        "PurchaseIntention": [
          {
            "fechaExpiracionToken": "2024-02-13T15:03:08.272-05:00", //Fecha expiracion OTP
            "idSessionToken": "24748382" //Identificador OTP
          },
          {
            "fechaExpiracionToken": "2024-02-13T15:16:15.744-05:00", //Fecha expiracion OTP
            "idSessionToken": "19935125" //Identificador OTP
          }
        ]
      },
      "redirectUrl": "https://www.google.com", //URL de redirección al concluir la transacción (si se especifica)
      "createdAt": "2024-02-12T22:31:57.903Z", //Fecha de creación
      "updatedAt": "2024-02-12T22:32:11.975Z" //Fecha de modificación
    },
    "authorization": {
      "access_token": "access_token" //Nuevo token de acceso
    },
    "attempts": {
      "currentSendCode": 2, //Número de veces que has solicitado el reénvio de codigo OTP
      "limitSendCode": 2, //Número de veces que puedes solicitar el codigo OTP
      "currentValidateCode": 0, //Número de veces que has confirmado el OTP
      "limitValidateCode": 2 //Número de veces que puedes confirmar el OTP
    }
  }
}

IMPORTANTE
Cuando realizas un reenvío de código OTP, antes de hacer la petición para validar el nuevo código OTP, debes actualizar tu token Bearer en la cabecera, utilizando el nuevo access_token que se encuentra en el campo JSON authorization de la solicitud code_otp_send.
3.	code_otp_validate: Esta función te permite enviar el código OTP que el cliente ha ingresado para confirmar la transacción. Para validar el OTP, realiza una solicitud tipo POST asegurándote de incluir el token Bearer en los encabezados Headers y un cuerpo JSON, como se muestra a continuación:
{
  "code": 123456
}

En caso de una petición exitosa, la respuesta será la siguiente:
{
  "status": 200,
  "meta": {
    "trace_id": "5d9eb010-c9f7-11ee-aaec-a50d7c8df505"
  },
  "code": "OK",
  "message": "Solicitud ejecutada correctamente.",
  "data": {
    "transaction": {
      "PK": "12518-1707777099-36709", //Identificador de la transacción
      "status": "PENDING", //Estado de la transacción
      "statusMessage": "",
      "amountInCents": 1500000, //Monto en centavos ($1.500 pesos)
      "clientInfo": {
        "typeDocument": "CC", // Tipo de documento pagador
        "numberDocument": "1043843543", // Numero de documento pagador
        "email": "test@sandbox.com" // Correo del pagador
      },
      "steps": {
        "PurchaseIntention": [
          {
            "fechaExpiracionToken": "2024-02-12T17:35:11.554-05:00",
            "idSessionToken": "93016224"
          }
        ],
        "ConfirmIntention": [
          {
            "idTransaccionAutorizador": "000000368995", //ID Authorizador
            "estado": "Aprobado", //Estado final de la transacción (DAVIPLATA)
            "fechaTransaccion": "2024-02-13T14:55:56", //Fecha finalización transacción
            "numAprobacion": "452341" //Numero de aprobación
          }
        ]
      },
      "redirectUrl": "https://www.test.com", //URL de redirección al concluir la transacción (si se especifica)
      "createdAt": "2024-02-12T22:31:57.903Z", //Fecha de creación
      "updatedAt": "2024-02-12T22:37:56.592Z" //Fecha de modificación
    },
    "authorization": {
      "access_token": "access_token" //Token de acceso
    },
    "attempts": {
      "currentSendCode": 1, //Número de veces que has solicitado el reénvio de codigo OTP
      "limitSendCode": 2, //Número de veces que puedes solicitar el codigo OTP
      "currentValidateCode": 1, //Número de veces que has confirmado el OTP
      "limitValidateCode": 2 //Número de veces que puedes confirmar el OTP
    }
  }
}

Paso 2: Validar resultado de la transacción
Una vez finalizado el proceso de redención a través de Daviplata, serás redirigido a la redirect_url que hayas especificado al crear la transacción (en caso de haberla definido) o a nuestra interfaz. En este punto, podrás verificar el estado final de la transacción. Si has especificado una redirect_url al crear la transacción, se aconseja realizar un long polling continuo hasta que la transacción alcance un estado final:
{
  "data": {
    "id": "12518-1707854036-89959",
    "created_at": "2024-02-13T19:53:56.879Z", //Fecha de creación
    "finalized_at": "2024-02-13T19:55:58.000Z", //Fecha de finalización
    "amount_in_cents": 150000, //Monto en centavos ($1.500 pesos)
    "reference": "zieemgxkai", //Referencia
    "currency": "COP", //Moneda
    "payment_method_type": "DAVIPLATA", //Metodo de pago
    "payment_method": {
      "type": "DAVIPLATA", //Metodo de pago
      "extra": {
        "url": "https://test.com", //URL interfaz Wompi para digitar codigo OTP
        "steps": [
          "ConfirmIntention",
          "ConfirmIntention",
          "PurchaseIntention",
          "Create"
        ],
        "is_three_ds": false,
        "afe_decision": "FRAUD_CHECK",
        "url_services": {
          //Servicios Daviplata
          "token": "token", //JSON Token
          "code_otp_send": "https://test.com", //URL para reenviar el codigo OTP
          "code_otp_validate": "https://test.com" //URL para validar el codigo OTP
        },
        "external_identifier": "452341", //Numero de aprobación
        "daviplata_transaction_id": "452341" //Numero de aprobación
      },
      "user_legal_id": "53234234", //Número de documento del cliente
      "user_legal_id_type": "CC", //Tipo de documento del cliente
      "payment_description": "Pago a Tienda Wompi, ref: JD38USJW2XPLQA" // Nombre de lo que se está pagando. Máximo 30 caracteres
    },
    "payment_link_id": null,
    "redirect_url": null, //URL de redirección al concluir la transacción (si se especifica)
    "status": "APPROVED", //Estado de la transacción
    "status_message": null,
    "merchant": {
      //Informacion del comercio
      "id": 999,
      "name": "test",
      "legal_name": "Pepito Perez",
      "contact_name": "Pepito Perez",
      "phone_number": "+573222222222",
      "logo_url": null,
      "legal_id_type": "CC",
      "email": "test@gmail.com",
      "legal_id": "32452341",
      "public_key": "public_key" //Llave publica del comercio
    },
    "taxes": [] //Impuestos
  },
  "meta": {}
}

Suscripción Daviplata
Wompi es una plataforma de pagos que facilita las transacciones electrónicas, ofreciendo diversas funcionalidades para los usuarios. Una de las opciones disponibles es la suscripción con Daviplata, la cual se puede utilizar de tres formas distintas para mayor comodidad y eficiencia:
1. Pago favorito
Wompi permite a los usuarios seleccionar Daviplata como su método de pago favorito. Esto significa que cada vez que realices una transacción, no necesitarás ingresar nuevamente los detalles de tu cuenta Daviplata.
Ventajas
•	Ahorro de tiempo en futuras transacciones.
•	Mayor comodidad al no tener que ingresar los detalles de pago repetidamente.
•	Seguridad al utilizar un método de pago confiable.
2. Débito automático
Wompi también ofrece la opción de configurar pagos recurrentes automáticamente desde tu cuenta Daviplata. Esta función es ideal para suscripciones y servicios que requieren pagos periódicos.
Ventajas
•	Garantiza que los pagos se realicen puntualmente.
•	Elimina la necesidad de recordar fechas de pago.
•	Facilita la gestión de tus finanzas personales.
3. Pago favorito y débito automático
La combinación de pago favorito y débito automático te ofrece lo mejor de ambos mundos: comodidad y automatización. Al configurar Daviplata como tu método de pago favorito y activar el débito automático, te aseguras de que los pagos recurrentes se realicen automáticamente utilizando tu método de pago preferido.
Ventajas
•	Simplificación máxima del proceso de pago.
•	Automatización de pagos recurrentes con tu método de pago preferido.
•	Mayor tranquilidad al saber que los pagos se gestionan de manera eficiente y segura.
Si quieres saber como funciona el API de esta funcionalidad podrás consultarlo en Fuentes de pago & Tokenización: Cuentas DaviPlata

uentes de pago & Tokenización
Cambio importante en el API
Para la creación de transacciones y fuentes de pago, pensando en la privacidad y el correcto manejo de los datos personales de nuestros usuarios, es ahora obligatorio el uso de los Tokens de Aceptación a la hora de crear cualquiera de estos dos recursos a través de nuestro API.


En Wompi, no sólo puedes ofrecer a tus usuarios realizar pagos de una sola vez -como el de un carrito de compras-, sino que también puedes ofrecer que paguen por tus productos y servicios sin su intervención directa, como es el caso de un cobro periódico -una suscripción a una revista por ejemplo-, o el cobro de un servicio on-demand, como entregas a domicilio o servicios de transporte, por ejemplo, donde idealmente tus usuarios sólo provean su información de pago una única vez y los cargos se hagan a futuro, según lo requiera tu modelo de negocio.
A este tipo de pagos se les conoce también como pagos automáticos.
Esto lo puedes ofrecer usando nuestra funcionalidad de fuentes de pago del API. Tus usuarios los pueden realizar usando tarjetas o cuentas Nequi, y requieren que el usuario lleve a cabo un único proceso inicial, donde provea bien sea la información de su tarjeta o de su cuenta Nequi, que será usada posteriormente para hacer los cobros respectivos.
Tan sólo debes seguir el paso a paso descrito a continuación:
Guía de nivel intermedio - avanzado
Los pasos descritos a continuación requieren una integración y uso directo de nuestra API, por lo cual está orientado a desarrolladores de nivel intermedio-avanzado que estén familiarizados con el uso de APIs. Sin embargo, Wompi planea facilitar el proceso pronto, ofreciendo realizar el primer paso a través de nuestro Widget.
Paso a paso
•	Paso 1 — Solicita la información del método de pago.
•	Paso 2 — Crea una fuente de pago.
•	Paso 3 — Crea una transacción usando la fuente de pago.
Paso 1: Solicita la información del método de pago
El primero de estos 3 pasos para realizar un cobro usando fuentes de pago, requiere el almacenamiento de forma segura de una tarjeta, cuenta Nequi o cuenta DaviPlata. Para eso, usarás nuestro API de manera que Wompi almacene de manera segura información de tarjetas, cuentas Nequi y cuentas DaviPlata.
¡Nunca guardes información sensible!
Desaconsejamos completamente que guardes información sensible de tarjetas, cuentas Nequi, cuentas DaviPlata o cualquier método de pago, pues no sólo pones en riesgo la información de tus usuarios sino que podrías enfrentar sanciones y problemas legales según la regulación de tu país. Wompi cuenta con los más altos estándares de la industria en cuanto a seguridad y encripción, de manera que la información repose de manera 100% segura.
Al proceso de guardar y representar la información de una tarjeta de manera segura le llamamos: Tokenización. Esto quiere decir que debes enviar al endpoint respectivo del API de Wompi la información del método de pago, una única vez, y obtendrás un token el cual podrás usar para crear la fuente de pago en el Paso 2 de esta guía.
Ten en cuenta el ambiente del API
Recuerda que en Wompi hay ambiente de Sandbox, para que realices pruebas sin usar información real de métodos de pago, y ambiente de Producción, contra el cual debes procesar tus pagos reales.
Tarjetas
Para tarjetas de crédito o débito el endpoint que debes usar es /v1/tokens/cards realizando un POST con el siguiente cuerpo JSON:
{
  "number": "4242424242424242", // Número de tarjeta (como un string, sin espacios)
  "exp_month": "06", // Mes de expiración (como string de 2 dígitos)
  "exp_year": "29", // Año de expiración (como string de 2 dígitos)
  "cvc": "123", // Código de seguridad (como string de 3 o 4 dígitos)
  "card_holder": "Pedro Pérez" // Nombre del tarjeta habiente (string de mínimo 5 caracteres)
}

Como resultado a esta petición recibirás la siguiente respuesta:
{
  "status": "CREATED",
  "data": {
    "id": "tok_prod_15_44c5638281if67l04eA63f705bfA5bde",
    "created_at": "2020-09-07T19:09:31.585+00:00",
    "brand": "VISA",
    "name": "VISA-4242",
    "last_four": "4242",
    "bin": "538696",
    "exp_year": "29",
    "exp_month": "06",
    "card_holder": "Pedro Pérez",
    "expires_at": "2021-09-05T19:09:30.000Z"
  }
}

Si en el campo status recibes el valor "CREATED", esto quiere decir que la tarjeta ha sido tokenizada correctamente y puedes usar la propiedad id para registrar la fuente de pago.
Cuentas Nequi
Para pagos con Nequi, el endpoint que debes usar es /v1/tokens/nequi realizando un POST con la Llave Pública como autorizador con el siguiente cuerpo JSON:
{
  "phone_number": "3017654321"
}

Recibirás como respuesta en la propiedad id el token con el que podrás registrar la fuente de pago. Sin embargo, el cliente tendrá que haber aceptado primero la suscripción en su celular de modo que el estado pase de "PENDING" a "APPROVED".
{
  "data": {
    "id": "nequi_prod_RQkUiuv3lEnDLiSao2Cz0iQLdFlyQOI5",
    "status": "PENDING",
    "phone_number": "3107654321",
    "name": "Company Name"
  }
}

Para chequear el estado de la suscripción, puedes hacer GET en el endpoint de /v1/tokens/nequi/ con el token obtenido:
GET /v1/tokens/nequi/nequi_prod_RQkUiuv3lEnDLiSao2Cz0iQLdFlyQOI5

Una vez se obtenga un "APPROVED" en la propiedad "status" será posible registrar la fuente de pago.
{
  "data": {
    "id": "nequi_prod_RQkUiuv3lEnDLiSao2Cz0iQLdFlyQOI5",
    "status": "APPROVED",
    "phone_number": "3107654321",
    "name": "Company Name"
  }
}

Cuentas DaviPlata
Antes de utilizar este medio de pago en el ambiente productivo, debes solicitar al equipo comercial su respectiva activación.
Requisitos
•	Llave pública del comercio
•	Datos de prueba.
Explicación del uso de las APIs
1.	Para inicializar el proceso de tokenización de una cuenta Daviplata, el endpoint que debes utilizar es:
POST /v1/tokens/daviplata

Con la Llave publica como Bearer token para poder autenticarla, con el siguiente cuerpo JSON:
{
  "type_document": "CC",
  "number_document": "1122233",
  "product_number": "3991111111"
}

Nota: Debes tener en cuenta que el comportamiento dependera del valor que pongas en el campo product_number, como se especifica en los datos de prueba ya que es un ambiente Sandbox.
Como resultado a esta petición recibirás la siguiente respuesta:
{
  "data": {
    "id": "daviplata_devtest_KYbozzUqNlHVQ3Rxgi1skM3991111111",
    "status": "PENDING",
    "url_services": {
      "token": "token_de_autenticacion",
      "code_otp_send": "https://test.com",
      "code_otp_validate": "https://test.com"
    }
  },
  "meta": {}
}

•	id: Corresponde al token que se le es asociado a la cuenta Daviplata.
•	status: Estado actual del token.
•	token: Es la llave que nos permitirá consumir el siguiente servicio (code_otp_send), este token es de un solo uso.
•	code_otp_send: URL del API que enviara el código OTP al cliente pagador.
•	code_otp_validate: URL del API que validará el código OTP que el cliente pagador digite.
2.	Enviar el código OTP al cliente pagador:
Requisitos
•	Token: Lo encuentras en el resultado de la petición anterior: data -> url_services -> token.
•	URL: La encuentras en el resultado de la petición anterior: data -> url_services -> code_otp_send.
Debes realizar una petición POST a la URL y enviar como Bearer Token el Token, ejemplo:
POST https://test.com

Como resultado a esta petición recibirás la siguiente respuesta:
{
  "status": 200,
  "code": "OK",
  "message": "Solicitud ejecutada correctamente.",
  "data": {
    "subscription": {
      "PK": "daviplata_devtest_KYbozzUqNlHVQ3Rxgi1skM3991111111",
      "status": "PENDING",
      "statusMessage": "",
      "steps": {
        "PurchaseIntention": [
          {
            "resultStatus": {
              "message": "Transacción aprobada",
              "transactionDate": "2024-07-31T21:52:04.146+00:00",
              "transactionId": "KlfxX9Ir-rDlY-KVzI-oOzwQyGaYRmC",
              "status": 0
            },
            "infoOtp": {
              "idSesionOTP": "20270866",
              "expirationDateOTP": "2024-07-31T21:52:04.146+00:00",
              "expirationTimeOTP": 3
            }
          }
        ]
      }
    },
    "authorization": {
      "access_token": "pub_devtest_lfGsG2o7X6OL8fOSVcaP2r20sMGpMgT9"
    },
    "attempts": {
      "currentSendCode": 1,
      "limitSendCode": 2,
      "currentValidateCode": 0,
      "limitValidateCode": 2
    }
  }
}

Nos vamos a centrar en la información que viene en data -> subscription:
•	PK: Corresponde al token asociado a la cuenta Daviplata.
•	status: Estado actual del token.
•	statusMessage: En caso de ser distinto de vacío, informa el motivo del fallo.
•	steps -> PurchaseIntention: Es un arreglo que, en cada una de sus iteraciones en orden descendente, indica el número de veces que se ha enviado el código OTP al cliente.
•	steps -> PurchaseIntention -> resultStatus: Información de la respuesta a la solicitud de envío del código OTP.
•	steps -> PurchaseIntention -> infoOtp -> idSesionOTP: Este ID es de uso único y expira cuando el cliente pagador digita erróneamente el código OTP (se sugiere solicitar otro código OTP).
•	steps -> PurchaseIntention -> infoOtp -> expirationDateOTP: Hora hasta la que tiene vigencia el código OTP.
•	steps -> PurchaseIntention -> infoOtp -> expirationTimeOTP: Minutos de vigencia del código OTP
Adicional a esto:
•	authorization -> access_token: Token que puede ser usado para consumir code_otp_send o code_otp_validate; es un token de uso único.
•	attemps -> currentSendCode: Número de veces que se ha enviado el código OTP al cliente pagador.
•	attemps -> limitSendCode: Número máximo de veces permitido para el envío del código OTP al cliente pagador.
•	attemps -> currentValidateCode: Número de veces que el cliente pagador ha digitado y validado el código OTP.
•	attemps -> limitValidateCode: Número máximo de veces permitido para la validación del código OTP.
3.	Validar el código OTP que digita el cliente pagador:
Requisitos
•	Token: Lo encuentras en el resultado de la petición anterior: data -> authorization -> access_token.
•	URL: La encuentras en el resultado de la petición del primer paso: data -> url_services -> code_otp_validate.
•	Código OTP: Lo recibe el cliente pagador como mensaje de texto. En Sandbox utilizar los datos de prueba.
Debes realizar una petición POST a la URL, utilizar como Bearer Token el token, ejemplo:
POST https://test.com

y enviar en el cuerpo de la petición:
{
  "code": "574829"
}

Como resultado a esta petición recibirás la siguiente respuesta:
{
  "status": 200,
  "code": "OK",
  "message": "Solicitud ejecutada correctamente.",
  "data": {
    "subscription": {
      "PK": "daviplata_devtest_KYbozzUqNlHVQ3Rxgi1skM3991111111",
      "status": "APPROVED",
      "statusMessage": "",
      "steps": {
        "PurchaseIntention": [
          {
            "resultStatus": {
              "message": "Transacción aprobada",
              "transactionDate": "2024-07-31T22:28:50.974+00:00",
              "transactionId": "6Ggyd3w7-efqj-PZd8-40RMbLM32veV",
              "status": 0
            },
            "infoOtp": {
              "idSesionOTP": "20270866",
              "expirationDateOTP": "2024-07-31T22:28:50.974+00:00",
              "expirationTimeOTP": 3
            }
          }
        ],
        "ConfirmIntention": [
          {
            "resultStatus": {
              "message": "Transacción aprobada",
              "transactionDate": "2024-07-31T22:28:50.974+00:00",
              "transactionId": "wkwoA4TR-R1ti-yw46-0sBSeQ7vi0gB",
              "status": 0
            },
            "Subscription": {
              "Commerce": {
                "commerceId": 1004,
                "commerceName": "Juan Manuel Tamayo Monje"
              },
              "Product": {
                "productCode": "DVP_CO",
                "productNumber": "3991111111"
              },
              "Identification": {
                "identificationNumber": "1234567890",
                "identificationType": "CC"
              },
              "subscriptionId": 5734,
              "maxValue": {
                "currencyType": "COP",
                "value": 0
              },
              "TppPartner": {
                "tppPartnerName": "Test Daviplata Sandbox",
                "tppPartnerId": "00000001"
              }
            }
          }
        ]
      }
    },
    "authorization": {
      "access_token": "pub_devtest_lfGsG2o7X6OL8fOSVcaP2r20sMGpMgT9"
    },
    "attempts": {
      "currentSendCode": 1,
      "limitSendCode": 2,
      "currentValidateCode": 0,
      "limitValidateCode": 2
    }
  }
}

Nos vamos a centrar nuevamente en la información que viene en data -> subscription; en esta ocasión, recibiremos un campo adicional.
•	status: Como podemos observar el token ha sido APPROVED, aquí terminaríamos el proceso de tokenización.
•	steps -> ConfirmIntention: Es un arreglo que, en cada una de sus iteraciones en orden descendente, indica el número de veces que el cliente a tratado de confirmar el código OTP.
•	steps -> ConfirmIntention -> resultStatus: Información de la respuesta a la solicitud de envío del código OTP.
•	steps -> ConfirmIntention -> subscription: Información relacionada con la suscripción.
Si el cliente ha digitado un código OTP incorrecto, obtendremos la siguiente respuesta:
{
  "status": 200,
  "code": "OK",
  "message": "Solicitud ejecutada correctamente.",
  "data": {
    "subscription": {
      "PK": "daviplata_devtest_KYbozzUqNlHVQ3Rxgi1skM3220164001",
      "status": "PENDING",
      "statusMessage": "",
      "steps": {
        "PurchaseIntention": [
          {
            "resultStatus": {
              "message": "Transacción aprobada",
              "transactionDate": "2024-08-01T15:49:02.558+00:00",
              "transactionId": "FAZpFUnO-3JUa-aUiy-yurjWxOeJo7z",
              "status": 0
            },
            "infoOtp": {
              "idSesionOTP": "20270866",
              "expirationDateOTP": "2024-08-01T15:49:02.558+00:00",
              "expirationTimeOTP": 3
            }
          }
        ],
        "ConfirmIntention": [
          {
            "resultStatus": {
              "message": "No se puede ejecutar la transacción",
              "transactionDate": "2024-05-08T16:23:33.104-00:00",
              "transactionId": "8eb61a58-5df1-4838-945c-0f634fdd8686",
              "status": "2"
            },
            "faultstring": "OTP_INVALIDO"
          }
        ]
      }
    },
    "authorization": {
      "access_token": "pub_devtest_lfGsG2o7X6OL8fOSVcaP2r20sMGpMgT9"
    },
    "attempts": {
      "currentSendCode": 1,
      "limitSendCode": 2,
      "currentValidateCode": 0,
      "limitValidateCode": 2
    }
  }
}

Nos vamos a centrar nuevamente en la información que viene en data -> subscription; en esta ocasión, recibiremos un campo adicional.
•	status: Como podemos observar el proceso de tokenización continua en estado PENDING.
•	steps -> ConfirmIntention -> resultStatus: Información de la respuesta a la solicitud de envío del código OTP.
•	steps -> ConfirmIntention -> faultstring: Motivo del fallo de la autenticación.
Recomendaciones
•	He de recordar que el token que obtenemos de data -> authorization -> access_token es de uso único; por ende, en cada petición exitosa que se haga, este sera generado y devuelto para ser usado.
•	steps -> PurchaseIntention y steps -> ConfirmIntention son dos arrays que crecen descendientemente de acuerdo con los envíos de código OTP que solicite el cliente y las validaciones de código OTP que realice el cliente. (En ambiente Sandbox, solo encontrarás una iteración en cada uno de los escenarios mencionados anteriormente). En cualquiera de los dos casos, la última posición del array muestra el resultado de la petición solicitada.
•	attemps:
1.	Estos escenarios no se pueden replicar en el ambiente Sandbox; por ende, la información que obtenemos en attempts es netamente informativa.
2.	El número máximo de reenvío de códigos OTPs en ambiente productivo es 2.
3.	El número máximo de intentos permitido para validar el código OTP es 2.
4.	Al exceder el número de intentos en cualquiera de los dos escenarios anteriores obtendremos:
{
  "status": 500,
  "meta": {
    "trace_id": "92a53630-503e-11ef-b637-b76fbbdbd451"
  },
  "code": "500",
  "message": "Ha agotado el número de intentos de envío de código OTP",
  "data": {
    "PK": "daviplata_devint_h2UEgbEE30H29iVoS1aBXUlA961zfXJL",
    "status": "DECLINED",
    "statusMessage": "Ha agotado el número de intentos de envío de código OTP",
    "steps": {
      "PurchaseIntention": [
        {
          "resultStatus": {
            "message": "Transacción aprobada",
            "transactionDate": "2024-08-01T14:45:12.270-05:00",
            "transactionId": "068e2764-dece-4b85-8921-56016c554be3",
            "status": 0
          },
          "infoOtp": {
            "idSesionOTP": "84446823",
            "value": "135301",
            "expirationDateOTP": "2024-08-01 14:48:12.104",
            "expirationTimeOTP": 3
          }
        },
        {
          "resultStatus": {
            "message": "Transacción aprobada",
            "transactionDate": "2024-08-01T14:45:13.803-05:00",
            "transactionId": "4118cad1-fe17-43c1-b2fe-30e3e0f3b0a7",
            "status": 0
          },
          "infoOtp": {
            "idSesionOTP": "33041739",
            "value": "609102",
            "expirationDateOTP": "2024-08-01 14:48:13.741",
            "expirationTimeOTP": 3
          }
        }
      ]
    },
    "createdAt": "2024-08-01T19:45:09.281Z",
    "updatedAt": "2024-08-01T19:45:13.903Z"
  },
  "type": "Technical"
}

Cuando obtengamos un token con status APPROVED, hemos finalizado la tokenización y podemos continuar con el siguiente paso, Crear una fuente de pago, si requieres consultar un token debes realizar una petición:
GET /v1/tokens/daviplata/daviplata_prod_qOVWahMgs2oOYHvggC1Mxc3991111111

Y enviar la Llave pública como Bearer token, como resultado a esta petición recibirás la siguiente respuesta:
{
  "data": {
    "id": "daviplata_devtest_KYbozzUqNlHVQ3Rxgi1skM3991111111",
    "status": "APPROVED",
    "status_message": "",
    "client_info": {
      "type_document": "CC",
      "number_document": "14395323",
      "phone_number": "3991111111"
    }
  },
  "meta": {}
}

Cuentas Bancolombia (Botón Bancolombia)
Con este proceso podras habilitar el proceso de suscripción de cuentras Bancolombia, permitiendo realizar cobros directamente a las cuentas inscritas exitosamente.
El primer paso del flujo se necesita generar un token de bancolombia, para continuar con el proceso a travez del endpoint
POST /v1/tokens/bancolombia_transfer

En esta petición se debe enviar la llave publica de tu comercio como Bearer Token para poder autenticarla y en el cuerpo de la petición la información asociada al Cliente.
Para el proceso de selección de cuenta, por parte del cliente, se debera primero realizar la creación de los tokens.
Acontinuación se muestran dos ejemplos distintos:
•	"redirect_url" URL a la cual se dirigirá la experiencia Una vez la ventana de selección de cuenta en el portal Bancolombia termine
•	"type_auth" Tipo de solicitud de suscripción, Si es TOKEN la autorización se debera de realizar al momento de la respuesta de la petición, si es TRANSACTION esta autorización se ejecutaria en la primera autorización
•	Selección de Cuenta durante Transacción Petición
{
  "redirect_url": "https://www.redirect_url_example.com",
  "type_auth": "TRANSACTION"
}

o	Respuesta
{
  "data": {
    "id": "<<ID_DEL_TOKEN_CREADO>>",
    "status": "AVAILABLE",
    "status_message": "",
    "bank_account_type": "",
    "bank_account_last_four": "",
    "redirect_url": "https://www.redirect_url_example.com",
    "authorization_url": "",
    "created_at": "2024-06-07T16:26:21.289Z",
    "updated_at": "2024-06-07T16:26:21.289Z"
  },
  "meta": {}
}

Importante que el estado este en AVAILABLE esto permite que se pueda usar el token en el paso de creación de la fuente de pago
•	Selección de Cuenta Previo a la transacción Petición
{
  "redirect_url": "https://www.redirect_url_example.com",
  "type_auth": "TOKEN"
}

o	Respuesta
{
  "data": {
    "id": "<<ID_DEL_TOKEN_CREADO>>",
    "status": "PENDING",
    "status_message": "",
    "bank_account_type": "",
    "bank_account_last_four": "",
    "redirect_url": "https://www.redirect_url_example.com",
    "authorization_url": "https://<<URL para realizar la selección y autorización de la cuenta desde Bancolombia>>",
    "created_at": "2024-06-07T14:50:25.389Z",
    "updated_at": "2024-06-07T14:50:26.104Z"
  },
  "meta": {}
}

authorization_url
Por medio de este campo nos podemos dirigir a Bancolombia a realizar la suscripción sin realizar la transacción, teniendo en cuenta que una vez que esta finalize se redireccionara a la URL enviada previamente en el parametro redirect_url  
o	Ya posterior a que el cliente pagador autorize la cuenta el comercio debera de consultar el estado de la misma por medio del API
v1/tokens/bancolombia_transfer/<<ID_DEL_TOKEN_CREADO>>

El resultado de ser completa la subcripción sería parecida a la siguiente
{
  "data": {
    "id": "<<ID_DEL_TOKEN_CREADO>>",
    "status": "APPROVED",
    "status_message": "",
    "bank_account_type": "CUENTA AHORROS",
    "bank_account_last_four": "***1234",
    "redirect_url": "https://www.redirect_url_example.com",
    "authorization_url": "<<URL para realizar la selección y autorización de la cuenta desde Bancolombia en esta respuesta ya nose usaria>>",
    "created_at": "2024-06-07T16:21:19.904Z",
    "updated_at": "2024-06-07T16:22:22.072Z"
  },
  "meta": {}
}

Ya con el estado APPROVED Se puede seguir al paso de la creación de la fuente de pago
Paso 2: Crea una fuente de pago
Usa tu llave privada para crear fuentes de pago
Ten presente que en este caso, el endpoint de creación de fuentes de pago requiere el uso de tu llave privada y que debe hacerse desde tu back-end (servidor) para mantener protegida dicha llave. Nunca debes hacerlo desde el dispositivo del usuario (navegador, dispositivo móvil, etc)
Para crear una fuente de pago, se debe hacer un POST a
/v1/payment_sources

Con los campos:
•	"customer_email" que es el email del pagador
•	"type" para indicar el medio de pago correspondiente al token, que puede ser "NEQUI" o "CARD"
•	"token" el token de Nequi o Tarjeta que hayas obtenido
•	"acceptance_token" un token de aceptación para la política de privacidad
•	"accept_personal_auth" un token de aceptación para la autorización de tratamiento de datos personales
Tarjetas
El cuerpo de la petición debe ser similar al siguiente:
{
  "type": "CARD",
  "token": "tok_prod_1_BBb749EAB32e97a2D058Dd538a608301",
  "customer_email": "pepito_perez@example.com",
  "acceptance_token": "eyJhbGciOiJIUzI1NiJ9.eyJjb250cmFjdF9pZCI6MSwicGVybWFsaW5rIjoiaHR0cHM6Ly93b21waS5jby93cC1jb250ZW50L3VwbG9hZHMvMjAxOS8wOS9URVJNSU5PUy1ZLUNPTkRJQ0lPTkVTLURFLVVTTy1VU1VBUklPUy1XT01QSS5wZGYiLCJmaWxlX2hhc2giOiIzZGNkMGM5OGU3NGFhYjk3OTdjZmY3ODExNzMxZjc3YiIsImppdCI6IjE1ODEwOTIzNjItMzk1NDkiLCJleHAiOjE1ODEwOTU5NjJ9.JwGfnfXsP9fbyOiQXFtQ_7T4r-tjvQrkFx0NyfIED5s",
  "accept_personal_auth": "eyJhbGciOiJIUzI1NiJ9.eyJjb250cmFjdF9pZCI6NDQxLCJwZXJtYWxpbmsiOiJodHRwczovL3dvbXBpLmNvbS9hc3NldHMvZG93bmxvYWRibGUvYXV0b3JpemFjaW9uLWFkbWluaXN0cmFjaW9uLWRhdG9zLXBlcnNvbmFsZXMucGRmIiwiZmlsZV9oYXNoIjoiOTVkYzcwN2M0M2UxYmViMDAwMDUyZDNkNWJhZThhMDAiLCJqaXQiOiIxNzI5NTY0MTM2LTU2NjMwIiwiZW1haWwiOiIifQ.0f-hFte-mpCcnxlrPgEG-fLdGBWUoQaUhU71pPuij40"
}

Obtendremos una respuesta con una estructura como la siguiente indicándonos que fue creada exitosamente:
{
  "data": {
    "id": 3891,
    "public_data": {
      "type": "CARD"
    },
    "type": "CARD",
    "status": "AVAILABLE"
  }
}

Cuentas Nequi
El cuerpo de la petición debe ser similar al siguiente:
{
  "type": "NEQUI",
  "token": "nequi_prod_RQkUiuv3lEnDLiSao2Cz0iQLdFlyQOI5",
  "customer_email": "pepito_perez@example.com",
  "acceptance_token": "eyJhbGciOiJIUzI1NiJ9.eyJjb250cmFjdF9pZCI6MSwicGVybWFsaW5rIjoiaHR0cHM6Ly93b21waS5jby93cC1jb250ZW50L3VwbG9hZHMvMjAxOS8wOS9URVJNSU5PUy1ZLUNPTkRJQ0lPTkVTLURFLVVTTy1VU1VBUklPUy1XT01QSS5wZGYiLCJmaWxlX2hhc2giOiIzZGNkMGM5OGU3NGFhYjk3OTdjZmY3ODExNzMxZjc3YiIsImppdCI6IjE1ODEwOTIzNjItMzk1NDkiLCJleHAiOjE1ODEwOTU5NjJ9.JwGfnfXsP9fbyOiQXFtQ_7T4r-tjvQrkFx0NyfIED5s",
  "accept_personal_auth": "eyJhbGciOiJIUzI1NiJ9.eyJjb250cmFjdF9pZCI6NDQxLCJwZXJtYWxpbmsiOiJodHRwczovL3dvbXBpLmNvbS9hc3NldHMvZG93bmxvYWRibGUvYXV0b3JpemFjaW9uLWFkbWluaXN0cmFjaW9uLWRhdG9zLXBlcnNvbmFsZXMucGRmIiwiZmlsZV9oYXNoIjoiOTVkYzcwN2M0M2UxYmViMDAwMDUyZDNkNWJhZThhMDAiLCJqaXQiOiIxNzI5NTY0MTM2LTU2NjMwIiwiZW1haWwiOiIifQ.0f-hFte-mpCcnxlrPgEG-fLdGBWUoQaUhU71pPuij40"
}

Obtendremos una respuesta con una estructura como la siguiente indicándonos que fue creada exitosamente:
{
  "data": {
    "id": 3891,
    "public_data": {
      "type": "NEQUI",
      "phone_number": "3105671703"
    },
    "type": "NEQUI",
    "status": "AVAILABLE"
  }
}

Cuentas DaviPlata
Requisitos
•	Llave privada.
•	Token Daviplata con status APPROVED.
•	Email del pagador.
1.	Antes de crear una fuente de pago debes obtener un Token de aceptación.
2.	Para crear una fuente de pago debes realizar una petición:
POST /v1/payment_sources

Usa tu Llave privada como Bearer token y envia como cuerpo de la petición la siguiente información:
{
  "type": "DAVIPLATA",
  "token": "daviplata_devtest_KYbozzUqNlHVQ3Rxgi1skM3991111111",
  "customer_email": "test@test.com",
  "acceptance_token": "token_de_aceptacion",
  "accept_personal_auth": "token_de_aceptacion_tratamiento_de_datos_personales"
}

Como resultado a esta petición recibirás la siguiente respuesta:
{
  "data": {
    "id": 8276,
    "public_data": {
      "type": "DAVIPLATA",
      "type_document": "CC",
      "number_document": "14395323",
      "phone_number": "3991111111"
    },
    "token": "daviplata_devtest_KYbozzUqNlHVQ3Rxgi1skM3991111111",
    "type": "DAVIPLATA",
    "status": "AVAILABLE",
    "customer_email": "test@test.com"
  },
  "meta": {}
}

•	id: Es el identificador de la fuente de pago, se utiliza para:
•	Crear transacciones.
•	Cancelar la fuente de pago y desuscribir el Daviplata del comercio.
•	public_data:
•	type_document: Tipo de documento del cliente pagador.
•	number_document: Número de documento del cliente pagador.
•	phone_number: Número del Daviplata del cliente pagador.
•	token: Token con el que se creó la fuente de pago.
•	type: Medio de pago de la fuente de pago.
•	status: Estado de la fuente de pago, para ser usado, el status debe ser AVAILABLE.
•	customer_email: Correo del cliente pagador.
Si tratamos de crear una fuente de pago con un token cuyo estado final es diferente de APPROVED, obtendremos la siguiente respuesta:
{
  "error": {
    "type": "UNPROCESSABLE",
    "reason": "La fuente de pago ha sido declinada"
  }
}

Recomendaciones
•	Una vez creada una fuente de pago con el status AVAILABLE, puedes crear transacciones utilizando el ID de la fuente de pago.
•	Cuando la tokenización es exitosa (status APPROVED), se ha realizado una suscripción del Daviplata del cliente pagador con el comercio. Sin embargo, no se puede utilizar para realizar pagos ni para hacer la desuscripción. En cualquiera de los dos escenarios mencionados anteriormente, debes crear una fuente de pago.
•	Un cliente pagador puede tokenizar su Daviplata con el comercio una sola vez, este escenario no se puede replicar en el ambiente Sandbox. Si trata de realizar una tokenización con una cuenta ya tokenizada obtendrá el siguiente error:
{
  "status": 500,
  "meta": {
    "trace_id": "417adc60-503e-11ef-b637-b76fbbdbd451"
  },
  "code": "2",
  "message": "SUSCRIPCION_YA_EXISTE",
  "data": {
    "PK": "daviplata_devint_yam2QkUw0jRx3PzeSYFtvhGGfXQlC96J",
    "status": "DECLINED",
    "statusMessage": "SUSCRIPCION_YA_EXISTE",
    "steps": {
      "PurchaseIntention": [
        {
          "resultStatus": {
            "message": "Transacción aprobada",
            "transactionDate": "2024-08-01T14:42:56.414-05:00",
            "transactionId": "a1a30968-0494-42ae-a3fa-a33b08f73c76",
            "status": 0
          },
          "infoOtp": {
            "idSesionOTP": "29268759",
            "value": "155345",
            "expirationDateOTP": "2024-08-01 14:45:56.341",
            "expirationTimeOTP": 3
          }
        }
      ]
    },
    "createdAt": "2024-08-01T19:42:53.407Z",
    "updatedAt": "2024-08-01T19:42:56.539Z"
  },
  "type": "Technical"
}

Nota: Para la desuscripción de una cuenta Daviplata con el comercio, se recomienda crear la fuente de pago y realizar la siguiente petición:
PUT /v1/payment_sources/{{ID_FUENTE_DE_PAGO}}/void

Utilizando tu Llave privada como Bearer token, recibiras la siguiente respuesta:
{
  "data": {
    "id": 8276,
    "public_data": {
      "type": "DAVIPLATA",
      "type_document": "CC",
      "number_document": "300051",
      "phone_number": "3991111111"
    },
    "token": "daviplata_devint_O2RJ3a6e7ayYjzadMmtZ1q81jQr03mZ9",
    "type": "DAVIPLATA",
    "status": "VOIDED",
    "customer_email": "test@test.com"
  },
  "meta": {}
}

Como podemos observar, el status cambió a VOIDED. En este estado, si intentas crear una transacción con esta fuente de pago, no va a ser posible.
Cuentas Bancolombia (Botón Bancolombia)
El cuerpo de la petición debe ser similar al siguiente:
{
  "type": "BANCOLOMBIA_TRANSFER",
  "token": "<<ID_DEL_TOKEN_CREADO>>",
  "payment_description": "<<Descripción de la suscripción creada, 'Este campo es el valor por defecto con el cual se describe cada cobro, aunque también cada cobro se podra personalizar durante la creación de la transacción'>>",
  "customer_email": "pepito_perez@example.com",
  "acceptance_token": "eyJhbGciOiJIUzI1NiJ9.eyJjb250cmFjdF9pZCI6MSwicGVybWFsaW5rIjoiaHR0cHM6Ly93b21waS5jby93cC1jb250ZW50L3VwbG9hZHMvMjAxOS8wOS9URVJNSU5PUy1ZLUNPTkRJQ0lPTkVTLURFLVVTTy1VU1VBUklPUy1XT01QSS5wZGYiLCJmaWxlX2hhc2giOiIzZGNkMGM5OGU3NGFhYjk3OTdjZmY3ODExNzMxZjc3YiIsImppdCI6IjE1ODEwOTIzNjItMzk1NDkiLCJleHAiOjE1ODEwOTU5NjJ9.JwGfnfXsP9fbyOiQXFtQ_7T4r-tjvQrkFx0NyfIED5s",
  "accept_personal_auth": "eyJhbGciOiJIUzI1NiJ9.eyJjb250cmFjdF9pZCI6NDQxLCJwZXJtYWxpbmsiOiJodHRwczovL3dvbXBpLmNvbS9hc3NldHMvZG93bmxvYWRibGUvYXV0b3JpemFjaW9uLWFkbWluaXN0cmFjaW9uLWRhdG9zLXBlcnNvbmFsZXMucGRmIiwiZmlsZV9oYXNoIjoiOTVkYzcwN2M0M2UxYmViMDAwMDUyZDNkNWJhZThhMDAiLCJqaXQiOiIxNzI5NTY0MTM2LTU2NjMwIiwiZW1haWwiOiIifQ.0f-hFte-mpCcnxlrPgEG-fLdGBWUoQaUhU71pPuij40"
}

Obtendremos una respuesta con una estructura como la siguiente indicándonos que fue creada exitosamente:
{
  "data": {
    "id": <<{ID_FUENTE_DE_PAGO} Id de la fuente de pago, 'Este es el campo que se usaría para realizar las transacciones'>>,
    "public_data": {
      "type": "BANCOLOMBIA_TRANSFER",
      "payment_description": "Prueba",
      "bank_account_type": "CUENTA AHORROS",
      "bank_account_last_four": "***1234"
    },
    "token": "<<ID_DEL_TOKEN_CREADO>>",
    "type": "BANCOLOMBIA_TRANSFER",
    "status": "AVAILABLE",
    "customer_email": "john@email.com"
  },
  "meta": {}
}

Nota: Si quieres ofrecer a tus clientes la posibilidad de cancelar una suscripción de su cuenta Bancolombia, debes realizar el consumo de la siguiente petición
PUT /v1/payment_sources/{{ID_FUENTE_DE_PAGO}}/void

Al consumir esta petición debemos asegurarnos que el estado que se nos retorne quede en VOID para la fuente de pago.
{
  "data": {
    "id": <<ID_FUENTE_DE_PAGO>>,
    "public_data": {
      "type": "BANCOLOMBIA_TRANSFER",
      "payment_description": "Prueba",
      "bank_account_type": "CUENTA AHORROS",
      "bank_account_last_four": "***1234"
    },
    "token": "<<ID_DEL_TOKEN_CREADO>>",
    "type": "BANCOLOMBIA_TRANSFER",
    "status": "VOIDED",
    "customer_email": "john@email.com"
  },
  "meta": {}
}

Paso 3: Crea una transacción
Usa tu llave privada para crear transacciones usando fuentes de pago
Ten presente que, para crear transacciones usando una fuente de pago, el endpoint de creación de transacciones requiere el uso de tu llave privada y que debe hacerse desde tu back-end (servidor) para mantener protegida dicha llave. Nunca debes hacerlo desde el dispositivo del usuario (navegador, dispositivo móvil, etc)
Al tener disponible un id de una fuente de pago, podrás usarlo para hacer cargos a tus usuarios sin necesidad de que ellos intervengan directamente en cada ocasión. Así podrás por ejemplo cobrar mensualmente una suscripción a un servicio, realizar cobros por servicios on-demand (como ventas a domicilio o servicios de transporte), cobrar por el uso de tu plataforma, etc.
Para esto, debes usar el mismo endpoint de transacciones que usan los pagos simples (POST a /v1/transactions), con la diferencia de que en esta ocasión enviarás información del método de pago (objeto payment_method) con el número de cuotas si la fuente de pago representa una tarjeta, de lo contrario este objeto no se tiene que enviar. En cualquier caso debes enviar un payment_source_id, por ejemplo:
{
  "amount_in_cents": 4990000, // Monto current centavos
  "currency": "COP", // Moneda
  "signature": "37c8407747e595535433ef8f6a811d853cd943046624a0ec04662b17bbf33bf5", //Firma de integridad
  "customer_email": "example@gmail.com", // Email del usuario
  "payment_method": {
    "installments": 2 // Número de cuotas si la fuente de pago representa una tarjeta de lo contrario el campo payment_method puede ser ignorado.
  },
  "reference": "sJK4489dDjkd390ds02", // Referencia única de pago
  "payment_source_id": 3891 // ID de la fuente de pago
}

NOTA: Si tienes dudas de como generar el valor de la firma de integridad puedes revisar la siguiente documentación: ** Genera una firma de integridad**
Transacciones con COF
Cuando el medio de pago corresponde a una tarjeta de la franquicia MasterCard o VISA y el procesador de pagos es RBM, se puede hacer uso de Credential On File (COF) y así aumentar la taza de aprobación en las transacciones del comercio. Para esto, es necesario enviar recurrent, teniendo en cuenta que payment_source_id se convierte en un campo obligatorio.
recurrent debe ser un valor Booleano:
•	true: Hace referencia a todas las transacciones en las que el titular autoriza que se almacenen los datos de su tarjeta y posteriormente se realicen cobros con el mismo monto de manera periódica. (Transacción de venta COF con recurrencia)
•	false: Hace referencia a todas las transacciones en las que el titular autoriza que se almacenen los datos de su tarjeta y posteriormente se realicen cobros con diferentes montos sin ningún tipo de periodicidad. (Transacción de venta COF almacenada)
{
  "amount_in_cents": 4990000, // Monto en centavos
  "currency": "COP", // Moneda
  "customer_email": "example@gmail.com", // Email del usuario
  "payment_method": {
    "installments": 2 // Número de cuotas si la fuente de pago representa una tarjeta de lo contrario el campo payment_method puede ser ignorado.
  },
  "reference": "sJK4489dDjkd390ds02", // Referencia única de pago
  "payment_source_id": 3891, // ID de la fuente de pago (obligatorio)
  "recurrent": true // Recurrente
}

Aclaración
Ten presente que:
•	Sí no se envía recurrent, la transacción se realizará sin COF.
•	Sí se envía recurrent en transacciones con tarjetas de franquicia diferente a MasterCard o VISA, la transacción se realizará sin COF.
•	Sí se envía recurrent y el procesador habilitado para el comercio es diferente a RBM, la transacción se realizará sin COF.



