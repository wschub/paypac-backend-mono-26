-- Canal de venta de la factura (web o app)
CREATE TYPE "SaleChannel" AS ENUM ('WEB', 'APP');

ALTER TABLE "Invoice" ADD COLUMN "sale_channel" "SaleChannel" NOT NULL DEFAULT 'WEB';
