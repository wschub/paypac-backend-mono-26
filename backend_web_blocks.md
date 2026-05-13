model WebBlockIndex {
  id          Int                @id @default(autoincrement())
  country_id  Int
  title       String
  type        WebBlockType
  banner_img  String?
  banner_text String?
  banner_link String?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
  country     Countries          @relation(fields: [country_id], references: [id])
  events      WebBlockEvents[]
  slides      WebBlockSlideImgs[]

  @@map("web_blocks_index")
}

model WebBlockEvents {
  id       Int           @id @default(autoincrement())
  block_id Int
  event_id Int
  block    WebBlockIndex @relation(fields: [block_id], references: [id], onDelete: Cascade)
  event    Event         @relation(fields: [event_id], references: [id], onDelete: Cascade)

  @@unique([block_id, event_id])
  @@map("web_blocks_events")
}

model WebBlockSlideImgs {
  id        Int           @id @default(autoincrement())
  block_id  Int
  event_id  Int?
  image_url String
  block     WebBlockIndex @relation(fields: [block_id], references: [id], onDelete: Cascade)
  event     Event?        @relation(fields: [event_id], references: [id], onDelete: SetNull)

  @@map("web_blocks_slide_imgs")
}

enum WebBlockType {
  EVENTOS
  BANNER
  SLIDE
  CAROUSEL
}

Endpoints /api/public/web-blocks — todos requieren X-Web-API-Key
WebBlockIndex

Método	URL	Descripción
GET	/api/public/web-blocks?country_id=1	Listar bloques (filtro opcional por país)
POST	/api/public/web-blocks	Crear bloque
GET	/api/public/web-blocks/:id	Obtener bloque con eventos y slides anidados
PUT	/api/public/web-blocks/:id	Actualizar bloque
DELETE	/api/public/web-blocks/:id	Eliminar bloque (cascade a eventos y slides)
WebBlockEvents

Método	URL	Descripción
POST	/api/public/web-blocks/:id/events	Agregar evento al bloque
DELETE	/api/public/web-blocks/:id/events/:eventId	Quitar evento del bloque
WebBlockSlideImgs

Método	URL	Descripción
POST	/api/public/web-blocks/:id/slides	Agregar slide (con image_url y event_id opcional)
PUT	/api/public/web-blocks/:id/slides/:slideId	Actualizar slide
DELETE	/api/public/web-blocks/:id/slides/:slideId	Eliminar slide
