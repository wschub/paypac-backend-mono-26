-- Issue 2: Invoice — agregar timestamps
ALTER TABLE "Invoice"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Issue 3: InvoiceTickets — agregar timestamps + FK a Invoice
ALTER TABLE "InvoiceTickets"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "InvoiceTickets"
  ADD CONSTRAINT "InvoiceTickets_invoice_id_fkey"
  FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Issue 4: Transactions — cambiar invoice_id de TEXT a INT (nullable) + FKs
ALTER TABLE "Transactions"
  ALTER COLUMN "invoice_id" TYPE INTEGER USING ("invoice_id"::INTEGER),
  ALTER COLUMN "invoice_id" DROP NOT NULL;

ALTER TABLE "Transactions"
  ADD CONSTRAINT "Transactions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Transactions"
  ADD CONSTRAINT "Transactions_invoice_id_fkey"
  FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Issue 5: Ticket — agregar FKs a Event y User
ALTER TABLE "Ticket"
  ADD CONSTRAINT "Ticket_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES "Event"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Ticket"
  ADD CONSTRAINT "Ticket_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
