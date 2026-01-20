-- CreateEnum
CREATE TYPE "EVENT_STATUS" AS ENUM ('CREATED', 'APPROVED', 'SCHEDULED', 'ACTIVE', 'CANCELED', 'RE_SCHEDULED', 'FINALIZED');

-- CreateEnum
CREATE TYPE "EventDateType" AS ENUM ('SINGLE', 'MULTIPLE', 'RANGE_DATE', 'RANGE_DATE_EXCEPT', 'EXPLICIT_DATES');

-- CreateEnum
CREATE TYPE "EventRewardPromoters" AS ENUM ('NONE', 'PERCENTAGE', 'FIXED_AMOUNT', 'GUEST_LIST', 'TICKET_REWARD', 'CASH_REWARD', 'CONSUMPTION_REWARD');

-- CreateEnum
CREATE TYPE "TypeEvent" AS ENUM ('PUBLICO', 'PRIVADO');

-- CreateEnum
CREATE TYPE "Places" AS ENUM ('NUMERADO', 'SIN_NUMERAR');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PROGRAMADO', 'ACTIVO', 'CANCELADO', 'RE_PROGRAMADO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "TypePlaces" AS ENUM ('CLUB', 'DISCOTECA', 'TEATRO', 'CINE', 'ESTADIO');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('ISSUED', 'PRECESSING', 'PAID', 'PENDING', 'REJECTED', 'CANCELED');

-- CreateTable
CREATE TABLE "GeneralSettingsVariables" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneralSettingsVariables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email_verified_at" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "remember_token" TEXT,
    "phone_number" TEXT NOT NULL,
    "phone_number_verified_at" TIMESTAMP(3),
    "num_doc" TEXT,
    "type_doc" INTEGER,
    "role" TEXT NOT NULL,
    "role_default" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "company_id" INTEGER NOT NULL DEFAULT 1,
    "auth_method" TEXT,
    "provider_id" TEXT,
    "firebase_uid" TEXT,
    "lang_user" TEXT,
    "verified_user" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "user_id_register" INTEGER NOT NULL,
    "users_id_approved" INTEGER[],
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "phone_number" TEXT,
    "email" TEXT,
    "type_identification" TEXT,
    "num_identification" TEXT,
    "website" TEXT,
    "address" TEXT,
    "country_id" INTEGER,
    "state_id" INTEGER,
    "city_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCompanyRole" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "company_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCompanyRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyUserApproval" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "approved_by" INTEGER NOT NULL,
    "approved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyUserApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "name_section" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "link" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleSectionPermission" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "section_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "RoleSectionPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Countries" (
    "id" SERIAL NOT NULL,
    "name_country" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "phone_code" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "language_default" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "States" (
    "id" SERIAL NOT NULL,
    "country_id" INTEGER NOT NULL,
    "name_state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "States_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cities" (
    "id" SERIAL NOT NULL,
    "state_id" INTEGER NOT NULL,
    "country_id" INTEGER NOT NULL,
    "name_city" TEXT NOT NULL,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "country_id" INTEGER NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubCategory" (
    "id" SERIAL NOT NULL,
    "subcategory_name" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "SubCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subgenre" (
    "id" SERIAL NOT NULL,
    "subcategory_name" TEXT NOT NULL,
    "subcategory_id" INTEGER NOT NULL,

    CONSTRAINT "Subgenre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "cover" TEXT NOT NULL DEFAULT '',
    "date_event" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "place_address" TEXT NOT NULL DEFAULT '',
    "latitude" TEXT NOT NULL DEFAULT '',
    "longitude" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT 'COP',
    "city" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT '',
    "event_type" "TypeEvent" NOT NULL DEFAULT 'PUBLICO',
    "type_venue" "Places" NOT NULL DEFAULT 'SIN_NUMERAR',
    "url_video" TEXT NOT NULL DEFAULT '',
    "organizer_id" INTEGER NOT NULL DEFAULT 0,
    "num_max_tickets" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "EVENT_STATUS" NOT NULL DEFAULT 'CREATED',
    "date_type" "EventDateType" NOT NULL DEFAULT 'SINGLE',
    "apply_dcto" BOOLEAN NOT NULL DEFAULT false,
    "allow_external_promoters" BOOLEAN NOT NULL DEFAULT false,
    "allow_paypac_promotion" BOOLEAN NOT NULL DEFAULT false,
    "sales_channel" TEXT NOT NULL DEFAULT 'app',
    "commission_to_charge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commission_to_promoter" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "numbered_place_id" INTEGER,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventFavorites" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "price_ticket" INTEGER NOT NULL,
    "locality_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventFavorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventDcto" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "name_dcto" TEXT NOT NULL,
    "description" TEXT,
    "type_dcto" INTEGER NOT NULL,
    "value_dcto" INTEGER NOT NULL,
    "min_qty_tickets" INTEGER,
    "max_qty_tickets" INTEGER,
    "locality_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventDcto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRewardRules" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "reward_type" "EventRewardPromoters" NOT NULL DEFAULT 'NONE',
    "reward_percentage" INTEGER,
    "reward_amount" INTEGER,
    "min_qty_tickets" INTEGER,
    "min_amount_tickets" INTEGER,
    "locality_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRewardRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventBalancePromoters" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "promoter_id" INTEGER NOT NULL,
    "reward_rule_id" INTEGER,
    "reward_amount" INTEGER,
    "reward_description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expition_date" TIMESTAMP(3),
    "status" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EventBalancePromoters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLocalities" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "name_locality" TEXT NOT NULL,
    "bkg_color" TEXT NOT NULL,
    "title_color" TEXT NOT NULL,
    "text_color" TEXT NOT NULL,
    "title_color_location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventLocalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventStages" (
    "id" SERIAL NOT NULL,
    "locality_id" INTEGER NOT NULL,
    "stage_name" TEXT NOT NULL,
    "date_start" TIMESTAMP(3) NOT NULL,
    "date_end" TIMESTAMP(3) NOT NULL,
    "price_ticket" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventStages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPlaces" (
    "id" SERIAL NOT NULL,
    "name_place" TEXT NOT NULL,
    "type_place" "TypePlaces" NOT NULL,
    "map_place" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "EventPlaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPlacesSeats" (
    "id" SERIAL NOT NULL,
    "place_id" INTEGER NOT NULL,
    "name_row" TEXT NOT NULL,
    "num_seats" INTEGER NOT NULL,
    "total_seats" INTEGER NOT NULL,

    CONSTRAINT "EventPlacesSeats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethodsUI" (
    "id" SERIAL NOT NULL,
    "method_name" TEXT NOT NULL,
    "mehtod_img" TEXT NOT NULL,
    "method_status" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethodsUI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethodsUsers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "user_uid" TEXT NOT NULL,
    "method_id" INTEGER NOT NULL,
    "method_status" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethodsUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethodCard" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "user_uid" TEXT NOT NULL,
    "id_token" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "last_four" TEXT NOT NULL,
    "bin" TEXT NOT NULL,
    "exp_year" TEXT NOT NULL,
    "exp_month" TEXT NOT NULL,
    "card_holder" TEXT NOT NULL,
    "created_with_cvc" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TEXT NOT NULL,
    "validity_ends_at" TEXT NOT NULL,

    CONSTRAINT "PaymentMethodCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "user_uid" TEXT NOT NULL,
    "num_invoice" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "user_lastname" TEXT NOT NULL,
    "user_num_doc" TEXT NOT NULL,
    "user_type_doc" INTEGER NOT NULL,
    "num_items" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "apply_discount" INTEGER NOT NULL DEFAULT 0,
    "discount_type" INTEGER NOT NULL DEFAULT 0,
    "discount_value" INTEGER NOT NULL DEFAULT 0,
    "total_ticket_dcto" INTEGER NOT NULL DEFAULT 0,
    "total_ticket_regular" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "status" "InvoiceStatus" NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceTickets" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "stage_id" INTEGER NOT NULL,
    "stage_name" TEXT NOT NULL,
    "locality_id" INTEGER NOT NULL,
    "locality_name" TEXT NOT NULL,
    "qty_tickets" INTEGER NOT NULL,
    "price_ticket" INTEGER NOT NULL,
    "apply_discount" INTEGER NOT NULL DEFAULT 0,
    "discount_type" INTEGER NOT NULL DEFAULT 0,
    "discount_value" INTEGER NOT NULL DEFAULT 0,
    "total_ticket_dcto" INTEGER NOT NULL DEFAULT 0,
    "total_ticket_regular" INTEGER NOT NULL,
    "total_ticket_paid" INTEGER NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "status_item" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InvoiceTickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "customer_token" TEXT NOT NULL,
    "customer_uid" TEXT NOT NULL,
    "customer_ID_phone" TEXT NOT NULL,
    "reference_ticket" TEXT NOT NULL,
    "booking_ticket" TEXT NOT NULL,
    "token_ticket" TEXT NOT NULL,
    "ticket_first_time" INTEGER NOT NULL DEFAULT 1,
    "status_ticket" TEXT NOT NULL,
    "ev_name" TEXT NOT NULL,
    "ev_short_description" TEXT NOT NULL,
    "ev_cover" TEXT NOT NULL DEFAULT '',
    "ev_date_event" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ev_place_address" TEXT NOT NULL DEFAULT '',
    "ev_event_type" "TypeEvent" NOT NULL DEFAULT 'PUBLICO',
    "ev_type_venue" "Places" NOT NULL DEFAULT 'SIN_NUMERAR',
    "ev_place_seat" TEXT NOT NULL DEFAULT '',
    "ev_organizer_id" INTEGER NOT NULL DEFAULT 0,
    "ev_status" "EventStatus" NOT NULL DEFAULT 'PROGRAMADO',
    "loc_id_locality" INTEGER NOT NULL,
    "loc_name_locality" TEXT NOT NULL,
    "loc_bkg_color" TEXT NOT NULL,
    "loc_title_color" TEXT NOT NULL,
    "loc_text_color" TEXT NOT NULL,
    "loc_title_color_location" TEXT NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketTransaction" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "from_customer_id" INTEGER NOT NULL,
    "from_customer_token" TEXT NOT NULL,
    "from_customer_uid" TEXT NOT NULL,
    "from_customer_UUID_phone" TEXT NOT NULL,
    "reference_ticket" TEXT NOT NULL,
    "booking_ticket" TEXT NOT NULL,
    "to_customer_id" INTEGER NOT NULL,
    "to_customer_token" TEXT NOT NULL,
    "to_customer_uid" TEXT NOT NULL,
    "to_customer_UUID_phone" TEXT NOT NULL,
    "type_transaction" TEXT NOT NULL,
    "ev_name" TEXT NOT NULL,
    "transaction_description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "status_ticket" TEXT NOT NULL,

    CONSTRAINT "TicketTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transactions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "user_uid" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "finalized_at" TIMESTAMP(3) NOT NULL,
    "amount_in_cents" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "payment_method_type" TEXT NOT NULL,
    "payment_method" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "status_message" TEXT NOT NULL,
    "billing_data" TEXT NOT NULL,
    "shipping_address" TEXT NOT NULL,
    "redirect_url" TEXT NOT NULL,
    "payment_source_id" TEXT NOT NULL,
    "payment_link_id" TEXT NOT NULL,
    "customer_data" TEXT NOT NULL,
    "bill_id" TEXT NOT NULL,
    "taxes" TEXT[],
    "tip_in_cents" TEXT NOT NULL,
    "meta" JSONB NOT NULL,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "customer_token" TEXT NOT NULL,
    "customer_uid" TEXT NOT NULL,
    "customer_UUID_phone" TEXT NOT NULL,
    "reference_ticket" TEXT NOT NULL,
    "booking_ticket" TEXT NOT NULL,
    "token_ticket" TEXT NOT NULL,
    "ticket_first_time" INTEGER NOT NULL DEFAULT 1,
    "status_ticket" TEXT NOT NULL,
    "ev_name" TEXT NOT NULL,
    "ev_short_description" TEXT NOT NULL,
    "ev_cover" TEXT NOT NULL DEFAULT '',
    "ev_date_event" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ev_place_address" TEXT NOT NULL DEFAULT '',
    "ev_event_type" "TypeEvent" NOT NULL DEFAULT 'PUBLICO',
    "ev_type_venue" "Places" NOT NULL DEFAULT 'SIN_NUMERAR',
    "ev_place_seat" TEXT NOT NULL DEFAULT '',
    "ev_organizer_id" INTEGER NOT NULL DEFAULT 0,
    "ev_status" "EventStatus" NOT NULL DEFAULT 'PROGRAMADO',
    "loc_id_locality" INTEGER NOT NULL,
    "loc_name_locality" TEXT NOT NULL,
    "loc_bkg_color" TEXT NOT NULL,
    "loc_title_color" TEXT NOT NULL,
    "loc_text_color" TEXT NOT NULL,
    "loc_title_color_location" TEXT NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToEvent" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoryToEvent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventToSubCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EventToSubCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "GeneralSettingsVariables_name_key" ON "GeneralSettingsVariables"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Roles_name_key" ON "Roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Company_email_key" ON "Company"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RoleSectionPermission_role_id_section_id_permission_id_key" ON "RoleSectionPermission"("role_id", "section_id", "permission_id");

-- CreateIndex
CREATE INDEX "_CategoryToEvent_B_index" ON "_CategoryToEvent"("B");

-- CreateIndex
CREATE INDEX "_EventToSubCategory_B_index" ON "_EventToSubCategory"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_user_id_register_fkey" FOREIGN KEY ("user_id_register") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompanyRole" ADD CONSTRAINT "UserCompanyRole_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompanyRole" ADD CONSTRAINT "UserCompanyRole_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompanyRole" ADD CONSTRAINT "UserCompanyRole_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUserApproval" ADD CONSTRAINT "CompanyUserApproval_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUserApproval" ADD CONSTRAINT "CompanyUserApproval_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUserApproval" ADD CONSTRAINT "CompanyUserApproval_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleSectionPermission" ADD CONSTRAINT "RoleSectionPermission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleSectionPermission" ADD CONSTRAINT "RoleSectionPermission_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleSectionPermission" ADD CONSTRAINT "RoleSectionPermission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "States" ADD CONSTRAINT "States_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "Countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cities" ADD CONSTRAINT "Cities_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "States"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cities" ADD CONSTRAINT "Cities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "Countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "Countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subgenre" ADD CONSTRAINT "Subgenre_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "SubCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFavorites" ADD CONSTRAINT "EventFavorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFavorites" ADD CONSTRAINT "EventFavorites_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFavorites" ADD CONSTRAINT "EventFavorites_locality_id_fkey" FOREIGN KEY ("locality_id") REFERENCES "EventLocalities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDcto" ADD CONSTRAINT "EventDcto_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDcto" ADD CONSTRAINT "EventDcto_locality_id_fkey" FOREIGN KEY ("locality_id") REFERENCES "EventLocalities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDcto" ADD CONSTRAINT "EventDcto_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRewardRules" ADD CONSTRAINT "EventRewardRules_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRewardRules" ADD CONSTRAINT "EventRewardRules_locality_id_fkey" FOREIGN KEY ("locality_id") REFERENCES "EventLocalities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBalancePromoters" ADD CONSTRAINT "EventBalancePromoters_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBalancePromoters" ADD CONSTRAINT "EventBalancePromoters_promoter_id_fkey" FOREIGN KEY ("promoter_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBalancePromoters" ADD CONSTRAINT "EventBalancePromoters_reward_rule_id_fkey" FOREIGN KEY ("reward_rule_id") REFERENCES "EventRewardRules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLocalities" ADD CONSTRAINT "EventLocalities_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventStages" ADD CONSTRAINT "EventStages_locality_id_fkey" FOREIGN KEY ("locality_id") REFERENCES "EventLocalities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPlacesSeats" ADD CONSTRAINT "EventPlacesSeats_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "EventPlaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethodsUsers" ADD CONSTRAINT "PaymentMethodsUsers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethodCard" ADD CONSTRAINT "PaymentMethodCard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToEvent" ADD CONSTRAINT "_CategoryToEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToEvent" ADD CONSTRAINT "_CategoryToEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToSubCategory" ADD CONSTRAINT "_EventToSubCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToSubCategory" ADD CONSTRAINT "_EventToSubCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "SubCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
