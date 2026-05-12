-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE "PointsTransactionType" AS ENUM (
  'EARNED', 
  'REDEEMED', 
  'EXPIRED', 
  'ADJUSTMENT', 
  'BONUS', 
  'REFUND',
  'TRANSFER_SENT',
  'TRANSFER_RECEIVED'
);

CREATE TYPE "InterestSource" AS ENUM ('MANUAL', 'PURCHASE', 'VIEW', 'IMPLICIT');
CREATE TYPE "FollowStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'MUTED');
CREATE TYPE "NotificationType" AS ENUM (
  'FRIEND_REQUEST', 
  'FRIEND_ACCEPTED', 
  'FRIEND_ACTIVITY', 
  'EVENT_REMINDER', 
  'EVENT_NEW', 
  'EVENT_PRICE_DROP', 
  'EVENT_SOLD_OUT', 
  'TICKET_TRANSFER', 
  'TICKET_USED', 
  'POINTS_EARNED', 
  'POINTS_EXPIRING',
  'POINTS_TRANSFER_SENT',
  'POINTS_TRANSFER_RECEIVED',
  'PROMOTIONAL', 
  'SYSTEM'
);
CREATE TYPE "NotificationChannel" AS ENUM ('WEB', 'PUSH', 'WHATSAPP', 'EMAIL');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED');

-- ============================================
-- TABLA: UserPointsBalance
-- ============================================

CREATE TABLE "UserPointsBalance" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "total_earned" INTEGER NOT NULL DEFAULT 0,
    "total_redeemed" INTEGER NOT NULL DEFAULT 0,
    "total_expired" INTEGER NOT NULL DEFAULT 0,
    "current_balance" INTEGER NOT NULL DEFAULT 0,
    "last_earned_at" TIMESTAMP(3),
    "last_redeemed_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPointsBalance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserPointsBalance_user_id_key" ON "UserPointsBalance"("user_id");
CREATE INDEX "UserPointsBalance_user_id_idx" ON "UserPointsBalance"("user_id");
CREATE INDEX "UserPointsBalance_current_balance_idx" ON "UserPointsBalance"("current_balance");

-- ============================================
-- TABLA: PointsTransaction
-- ============================================

CREATE TABLE "PointsTransaction" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "balance_id" INTEGER NOT NULL,
    "transaction_type" "PointsTransactionType" NOT NULL,
    "points_amount" INTEGER NOT NULL,
    "balance_before" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "reference_type" TEXT,
    "reference_id" INTEGER,
    "description" TEXT,
    "expires_at" TIMESTAMP(3),
    "expired" BOOLEAN NOT NULL DEFAULT false,
    "transfer_from_user_id" INTEGER,
    "transfer_to_user_id" INTEGER,
    "transfer_pair_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointsTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PointsTransaction_user_id_createdAt_idx" ON "PointsTransaction"("user_id", "createdAt");
CREATE INDEX "PointsTransaction_user_id_transaction_type_idx" ON "PointsTransaction"("user_id", "transaction_type");
CREATE INDEX "PointsTransaction_reference_type_reference_id_idx" ON "PointsTransaction"("reference_type", "reference_id");
CREATE INDEX "PointsTransaction_expires_at_expired_idx" ON "PointsTransaction"("expires_at", "expired");
CREATE INDEX "PointsTransaction_transfer_pair_id_idx" ON "PointsTransaction"("transfer_pair_id");

-- ============================================
-- TABLA: UserInterest
-- ============================================

CREATE TABLE "UserInterest" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER,
    "subcategory_id" INTEGER,
    "subgenre_id" INTEGER,
    "interest_level" INTEGER NOT NULL DEFAULT 1,
    "source" "InterestSource" NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInterest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserInterest_user_id_category_id_subcategory_id_subgenre_i_key" ON "UserInterest"("user_id", "category_id", "subcategory_id", "subgenre_id");
CREATE INDEX "UserInterest_user_id_idx" ON "UserInterest"("user_id");
CREATE INDEX "UserInterest_category_id_idx" ON "UserInterest"("category_id");
CREATE INDEX "UserInterest_subcategory_id_idx" ON "UserInterest"("subcategory_id");
CREATE INDEX "UserInterest_subgenre_id_idx" ON "UserInterest"("subgenre_id");

-- ============================================
-- TABLA: UserFollower
-- ============================================

CREATE TABLE "UserFollower" (
    "id" SERIAL NOT NULL,
    "follower_id" INTEGER NOT NULL,
    "following_id" INTEGER NOT NULL,
    "status" "FollowStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserFollower_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserFollower_follower_id_following_id_key" ON "UserFollower"("follower_id", "following_id");
CREATE INDEX "UserFollower_follower_id_idx" ON "UserFollower"("follower_id");
CREATE INDEX "UserFollower_following_id_idx" ON "UserFollower"("following_id");
CREATE INDEX "UserFollower_follower_id_status_idx" ON "UserFollower"("follower_id", "status");
CREATE INDEX "UserFollower_following_id_status_idx" ON "UserFollower"("following_id", "status");

-- ============================================
-- TABLA: NotificationPreference
-- ============================================

CREATE TABLE "NotificationPreference" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "notification_type" "NotificationType" NOT NULL,
    "channel_web" BOOLEAN NOT NULL DEFAULT true,
    "channel_push" BOOLEAN NOT NULL DEFAULT true,
    "channel_whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "channel_email" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NotificationPreference_user_id_notification_type_key" ON "NotificationPreference"("user_id", "notification_type");
CREATE INDEX "NotificationPreference_user_id_idx" ON "NotificationPreference"("user_id");

-- ============================================
-- TABLA: NotificationQueue
-- ============================================

CREATE TABLE "NotificationQueue" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "notification_type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "max_retries" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationQueue_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NotificationQueue_user_id_status_idx" ON "NotificationQueue"("user_id", "status");
CREATE INDEX "NotificationQueue_status_createdAt_idx" ON "NotificationQueue"("status", "createdAt");
CREATE INDEX "NotificationQueue_user_id_read_at_idx" ON "NotificationQueue"("user_id", "read_at");

-- ============================================
-- FOREIGN KEYS
-- ============================================

ALTER TABLE "UserPointsBalance" ADD CONSTRAINT "UserPointsBalance_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PointsTransaction" ADD CONSTRAINT "PointsTransaction_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PointsTransaction" ADD CONSTRAINT "PointsTransaction_balance_id_fkey" 
  FOREIGN KEY ("balance_id") REFERENCES "UserPointsBalance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_category_id_fkey" 
  FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_subcategory_id_fkey" 
  FOREIGN KEY ("subcategory_id") REFERENCES "SubCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_subgenre_id_fkey" 
  FOREIGN KEY ("subgenre_id") REFERENCES "Subgenre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserFollower" ADD CONSTRAINT "UserFollower_follower_id_fkey" 
  FOREIGN KEY ("follower_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserFollower" ADD CONSTRAINT "UserFollower_following_id_fkey" 
  FOREIGN KEY ("following_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NotificationQueue" ADD CONSTRAINT "NotificationQueue_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
