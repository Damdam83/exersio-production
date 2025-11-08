-- CreateEnum NotificationType (idempotent)
DO $$ BEGIN
    CREATE TYPE "NotificationType" AS ENUM ('session_reminder', 'exercise_added_to_club', 'member_joined_club', 'system_notification');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable Sport (idempotent)
CREATE TABLE IF NOT EXISTS "Sport" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sport_pkey" PRIMARY KEY ("id")
);

-- CreateTable ExerciseCategory (idempotent)
CREATE TABLE IF NOT EXISTS "ExerciseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "sportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable AgeCategory (idempotent)
CREATE TABLE IF NOT EXISTS "AgeCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "sportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable UserExerciseFavorite (idempotent)
CREATE TABLE IF NOT EXISTS "UserExerciseFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserExerciseFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable UserNotificationSettings (idempotent)
CREATE TABLE IF NOT EXISTS "UserNotificationSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionReminders" BOOLEAN NOT NULL DEFAULT true,
    "exerciseNotifications" BOOLEAN NOT NULL DEFAULT true,
    "systemNotifications" BOOLEAN NOT NULL DEFAULT true,
    "reminderHours" INTEGER NOT NULL DEFAULT 24,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNotificationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable Notification (idempotent)
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable UserPushToken (idempotent)
CREATE TABLE IF NOT EXISTS "UserPushToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPushToken_pkey" PRIMARY KEY ("id")
);

-- AlterTable User - Add missing fields (idempotent)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "preferredSportId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerificationExpires" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetExpires" TIMESTAMP(3);

-- AlterTable Exercise - Add missing fields (idempotent)
ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "ageCategoryId" TEXT;
ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "sportId" TEXT;
ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "successCriteria" JSONB;

-- AlterTable Session - Add missing fields (idempotent)
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "sportId" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "level" TEXT;

-- CreateIndex (idempotent)
DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "Sport_name_key" ON "Sport"("name");
    CREATE UNIQUE INDEX IF NOT EXISTS "Sport_slug_key" ON "Sport"("slug");
    CREATE UNIQUE INDEX IF NOT EXISTS "ExerciseCategory_slug_sportId_key" ON "ExerciseCategory"("slug", "sportId");
    CREATE UNIQUE INDEX IF NOT EXISTS "AgeCategory_slug_sportId_key" ON "AgeCategory"("slug", "sportId");
    CREATE UNIQUE INDEX IF NOT EXISTS "UserExerciseFavorite_userId_exerciseId_key" ON "UserExerciseFavorite"("userId", "exerciseId");
    CREATE INDEX IF NOT EXISTS "UserExerciseFavorite_userId_idx" ON "UserExerciseFavorite"("userId");
    CREATE INDEX IF NOT EXISTS "UserExerciseFavorite_exerciseId_idx" ON "UserExerciseFavorite"("exerciseId");
    CREATE UNIQUE INDEX IF NOT EXISTS "UserNotificationSettings_userId_key" ON "UserNotificationSettings"("userId");
    CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");
    CREATE INDEX IF NOT EXISTS "Notification_type_isSent_idx" ON "Notification"("type", "isSent");
    CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");
    CREATE UNIQUE INDEX IF NOT EXISTS "UserPushToken_token_key" ON "UserPushToken"("token");
    CREATE UNIQUE INDEX IF NOT EXISTS "UserPushToken_userId_platform_key" ON "UserPushToken"("userId", "platform");
    CREATE INDEX IF NOT EXISTS "UserPushToken_token_isActive_idx" ON "UserPushToken"("token", "isActive");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- AddForeignKey (idempotent)
DO $$ BEGIN
    ALTER TABLE "User" ADD CONSTRAINT "User_preferredSportId_fkey" FOREIGN KEY ("preferredSportId") REFERENCES "Sport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "ExerciseCategory" ADD CONSTRAINT "ExerciseCategory_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "AgeCategory" ADD CONSTRAINT "AgeCategory_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExerciseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_ageCategoryId_fkey" FOREIGN KEY ("ageCategoryId") REFERENCES "AgeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Session" ADD CONSTRAINT "Session_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "UserExerciseFavorite" ADD CONSTRAINT "UserExerciseFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "UserExerciseFavorite" ADD CONSTRAINT "UserExerciseFavorite_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "UserNotificationSettings" ADD CONSTRAINT "UserNotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "UserPushToken" ADD CONSTRAINT "UserPushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Insert seed data for Sports (idempotent with ON CONFLICT DO NOTHING)
INSERT INTO "Sport" ("id", "name", "slug", "icon", "order", "createdAt", "updatedAt") VALUES
    ('sport_volleyball', 'Volleyball', 'volleyball', '🏐', 1, NOW(), NOW()),
    ('sport_football', 'Football', 'football', '⚽', 2, NOW(), NOW()),
    ('sport_basketball', 'Basketball', 'basketball', '🏀', 3, NOW(), NOW()),
    ('sport_handball', 'Handball', 'handball', '🤾', 4, NOW(), NOW()),
    ('sport_tennis', 'Tennis', 'tennis', '🎾', 5, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Insert seed data for Exercise Categories (idempotent with ON CONFLICT DO NOTHING)
INSERT INTO "ExerciseCategory" ("id", "name", "slug", "color", "icon", "order", "sportId", "createdAt", "updatedAt") VALUES
    -- Volleyball categories
    ('cat_vb_service', 'Service', 'service', '#3b82f6', '🎯', 1, 'sport_volleyball', NOW(), NOW()),
    ('cat_vb_reception', 'Réception', 'reception', '#10b981', '🛡️', 2, 'sport_volleyball', NOW(), NOW()),
    ('cat_vb_attack', 'Attaque', 'attack', '#ef4444', '⚡', 3, 'sport_volleyball', NOW(), NOW()),
    ('cat_vb_block', 'Contre', 'block', '#8b5cf6', '🧱', 4, 'sport_volleyball', NOW(), NOW()),
    ('cat_vb_defense', 'Défense', 'defense', '#f59e0b', '🛡️', 5, 'sport_volleyball', NOW(), NOW()),
    ('cat_vb_setting', 'Passe', 'setting', '#06b6d4', '🤲', 6, 'sport_volleyball', NOW(), NOW()),

    -- Football categories
    ('cat_fb_dribbling', 'Dribble', 'dribbling', '#3b82f6', '⚡', 1, 'sport_football', NOW(), NOW()),
    ('cat_fb_passing', 'Passes', 'passing', '#10b981', '🎯', 2, 'sport_football', NOW(), NOW()),
    ('cat_fb_shooting', 'Tirs', 'shooting', '#ef4444', '⚽', 3, 'sport_football', NOW(), NOW()),
    ('cat_fb_defense', 'Défense', 'defense', '#f59e0b', '🛡️', 4, 'sport_football', NOW(), NOW()),
    ('cat_fb_tactics', 'Tactique', 'tactics', '#8b5cf6', '📋', 5, 'sport_football', NOW(), NOW()),

    -- Basketball categories
    ('cat_bb_dribbling', 'Dribble', 'dribbling', '#3b82f6', '⚡', 1, 'sport_basketball', NOW(), NOW()),
    ('cat_bb_passing', 'Passes', 'passing', '#10b981', '🤝', 2, 'sport_basketball', NOW(), NOW()),
    ('cat_bb_shooting', 'Tirs', 'shooting', '#ef4444', '🎯', 3, 'sport_basketball', NOW(), NOW()),
    ('cat_bb_defense', 'Défense', 'defense', '#f59e0b', '🛡️', 4, 'sport_basketball', NOW(), NOW()),
    ('cat_bb_rebounding', 'Rebonds', 'rebounding', '#8b5cf6', '↕️', 5, 'sport_basketball', NOW(), NOW()),
    ('cat_bb_tactics', 'Tactique', 'tactics', '#06b6d4', '📋', 6, 'sport_basketball', NOW(), NOW()),

    -- Handball categories
    ('cat_hb_dribbling', 'Dribble', 'dribbling', '#3b82f6', '⚡', 1, 'sport_handball', NOW(), NOW()),
    ('cat_hb_passing', 'Passes', 'passing', '#10b981', '🤝', 2, 'sport_handball', NOW(), NOW()),
    ('cat_hb_shooting', 'Tirs', 'shooting', '#ef4444', '🎯', 3, 'sport_handball', NOW(), NOW()),
    ('cat_hb_defense', 'Défense', 'defense', '#f59e0b', '🛡️', 4, 'sport_handball', NOW(), NOW()),
    ('cat_hb_tactics', 'Tactique', 'tactics', '#8b5cf6', '📋', 5, 'sport_handball', NOW(), NOW()),

    -- Tennis categories
    ('cat_tn_serve', 'Service', 'serve', '#3b82f6', '🎾', 1, 'sport_tennis', NOW(), NOW()),
    ('cat_tn_forehand', 'Coup droit', 'forehand', '#10b981', '➡️', 2, 'sport_tennis', NOW(), NOW()),
    ('cat_tn_backhand', 'Revers', 'backhand', '#ef4444', '⬅️', 3, 'sport_tennis', NOW(), NOW()),
    ('cat_tn_volley', 'Volée', 'volley', '#f59e0b', '⚡', 4, 'sport_tennis', NOW(), NOW()),
    ('cat_tn_smash', 'Smash', 'smash', '#8b5cf6', '💥', 5, 'sport_tennis', NOW(), NOW()),
    ('cat_tn_tactics', 'Tactique', 'tactics', '#06b6d4', '📋', 6, 'sport_tennis', NOW(), NOW())
ON CONFLICT (slug, "sportId") DO NOTHING;

-- Insert seed data for Age Categories (idempotent with ON CONFLICT DO NOTHING)
INSERT INTO "AgeCategory" ("id", "name", "slug", "minAge", "maxAge", "order", "sportId", "createdAt", "updatedAt") VALUES
    -- Volleyball age categories
    ('age_vb_u11', 'U11 (Poussins)', 'u11', NULL, 11, 1, 'sport_volleyball', NOW(), NOW()),
    ('age_vb_u13', 'U13 (Benjamins)', 'u13', 11, 13, 2, 'sport_volleyball', NOW(), NOW()),
    ('age_vb_u15', 'U15 (Minimes)', 'u15', 13, 15, 3, 'sport_volleyball', NOW(), NOW()),
    ('age_vb_u17', 'U17 (Cadets)', 'u17', 15, 17, 4, 'sport_volleyball', NOW(), NOW()),
    ('age_vb_u18', 'U18 (Juniors)', 'u18', 17, 18, 5, 'sport_volleyball', NOW(), NOW()),
    ('age_vb_u20', 'U20 (Espoirs)', 'u20', 18, 20, 6, 'sport_volleyball', NOW(), NOW()),
    ('age_vb_seniors', 'Seniors', 'seniors', 18, NULL, 7, 'sport_volleyball', NOW(), NOW()),
    ('age_vb_veterans', 'Vétérans', 'veterans', 35, NULL, 8, 'sport_volleyball', NOW(), NOW()),
    ('age_vb_all', 'Tous âges', 'all-ages', NULL, NULL, 9, 'sport_volleyball', NOW(), NOW()),

    -- Football age categories
    ('age_fb_u9', 'U9', 'u9', NULL, 9, 1, 'sport_football', NOW(), NOW()),
    ('age_fb_u11', 'U11', 'u11', 9, 11, 2, 'sport_football', NOW(), NOW()),
    ('age_fb_u13', 'U13', 'u13', 11, 13, 3, 'sport_football', NOW(), NOW()),
    ('age_fb_u15', 'U15', 'u15', 13, 15, 4, 'sport_football', NOW(), NOW()),
    ('age_fb_u17', 'U17', 'u17', 15, 17, 5, 'sport_football', NOW(), NOW()),
    ('age_fb_seniors', 'Seniors', 'seniors', 17, NULL, 6, 'sport_football', NOW(), NOW()),
    ('age_fb_all', 'Tous âges', 'all-ages', NULL, NULL, 7, 'sport_football', NOW(), NOW()),

    -- Basketball age categories
    ('age_bb_u11', 'U11 (Poussins)', 'u11', NULL, 11, 1, 'sport_basketball', NOW(), NOW()),
    ('age_bb_u13', 'U13 (Benjamins)', 'u13', 11, 13, 2, 'sport_basketball', NOW(), NOW()),
    ('age_bb_u15', 'U15 (Minimes)', 'u15', 13, 15, 3, 'sport_basketball', NOW(), NOW()),
    ('age_bb_u17', 'U17 (Cadets)', 'u17', 15, 17, 4, 'sport_basketball', NOW(), NOW()),
    ('age_bb_seniors', 'Seniors', 'seniors', 17, NULL, 5, 'sport_basketball', NOW(), NOW()),
    ('age_bb_all', 'Tous âges', 'all-ages', NULL, NULL, 6, 'sport_basketball', NOW(), NOW()),

    -- Handball age categories
    ('age_hb_u11', 'U11 (Poussins)', 'u11', NULL, 11, 1, 'sport_handball', NOW(), NOW()),
    ('age_hb_u13', 'U13 (Benjamins)', 'u13', 11, 13, 2, 'sport_handball', NOW(), NOW()),
    ('age_hb_u15', 'U15 (Minimes)', 'u15', 13, 15, 3, 'sport_handball', NOW(), NOW()),
    ('age_hb_u17', 'U17 (Cadets)', 'u17', 15, 17, 4, 'sport_handball', NOW(), NOW()),
    ('age_hb_seniors', 'Seniors', 'seniors', 17, NULL, 5, 'sport_handball', NOW(), NOW()),
    ('age_hb_veterans', 'Vétérans', 'veterans', 35, NULL, 6, 'sport_handball', NOW(), NOW()),
    ('age_hb_all', 'Tous âges', 'all-ages', NULL, NULL, 7, 'sport_handball', NOW(), NOW()),

    -- Tennis age categories
    ('age_tn_u10', 'U10 (10 ans et moins)', 'u10', NULL, 10, 1, 'sport_tennis', NOW(), NOW()),
    ('age_tn_u12', 'U12 (11-12 ans)', 'u12', 10, 12, 2, 'sport_tennis', NOW(), NOW()),
    ('age_tn_u14', 'U14 (13-14 ans)', 'u14', 12, 14, 3, 'sport_tennis', NOW(), NOW()),
    ('age_tn_u16', 'U16 (15-16 ans)', 'u16', 14, 16, 4, 'sport_tennis', NOW(), NOW()),
    ('age_tn_u18', 'U18 (17-18 ans)', 'u18', 16, 18, 5, 'sport_tennis', NOW(), NOW()),
    ('age_tn_seniors', 'Seniors (18+)', 'seniors', 18, NULL, 6, 'sport_tennis', NOW(), NOW()),
    ('age_tn_veterans35', 'Vétérans 35+', 'veterans-35', 35, NULL, 7, 'sport_tennis', NOW(), NOW()),
    ('age_tn_all', 'Tous âges', 'all-ages', NULL, NULL, 8, 'sport_tennis', NOW(), NOW())
ON CONFLICT (slug, "sportId") DO NOTHING;
