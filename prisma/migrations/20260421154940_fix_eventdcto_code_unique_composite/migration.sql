-- Eliminar el unique global en code
ALTER TABLE "EventDcto" DROP CONSTRAINT IF EXISTS "EventDcto_code_key";

-- Agregar unique compuesto (event_id + code)
CREATE UNIQUE INDEX IF NOT EXISTS "EventDcto_event_id_code_key" 
ON "EventDcto"(event_id, code);