-- CreateEnum NotificationType
CREATE TYPE "NotificationType" AS ENUM ('session_reminder', 'exercise_added_to_club', 'member_joined_club', 'system_notification');

-- CreateTable Sport
CREATE TABLE "Sport" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sport_pkey" PRIMARY KEY ("id")
);

-- CreateTable ExerciseCategory
CREATE TABLE "ExerciseCategory" (
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

-- CreateTable AgeCategory
CREATE TABLE "AgeCategory" (
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

-- CreateTable UserExerciseFavorite
CREATE TABLE "UserExerciseFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserExerciseFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable UserNotificationSettings
CREATE TABLE "UserNotificationSettings" (
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

-- CreateTable Notification
CREATE TABLE "Notification" (
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

-- CreateTable UserPushToken
CREATE TABLE "UserPushToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPushToken_pkey" PRIMARY KEY ("id")
);

-- AlterTable User - Add missing fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "preferredSportId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerificationExpires" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetExpires" TIMESTAMP(3);

-- AlterTable Exercise - Add missing fields
ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "ageCategoryId" TEXT;
ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "sportId" TEXT;
ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "successCriteria" JSONB;

-- AlterTable Session - Add missing fields
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "sportId" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "level" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Sport_name_key" ON "Sport"("name");
CREATE UNIQUE INDEX "Sport_slug_key" ON "Sport"("slug");
CREATE UNIQUE INDEX "ExerciseCategory_slug_sportId_key" ON "ExerciseCategory"("slug", "sportId");
CREATE UNIQUE INDEX "AgeCategory_slug_sportId_key" ON "AgeCategory"("slug", "sportId");
CREATE UNIQUE INDEX "UserExerciseFavorite_userId_exerciseId_key" ON "UserExerciseFavorite"("userId", "exerciseId");
CREATE INDEX "UserExerciseFavorite_userId_idx" ON "UserExerciseFavorite"("userId");
CREATE INDEX "UserExerciseFavorite_exerciseId_idx" ON "UserExerciseFavorite"("exerciseId");
CREATE UNIQUE INDEX "UserNotificationSettings_userId_key" ON "UserNotificationSettings"("userId");
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");
CREATE INDEX "Notification_type_isSent_idx" ON "Notification"("type", "isSent");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
CREATE UNIQUE INDEX "UserPushToken_token_key" ON "UserPushToken"("token");
CREATE UNIQUE INDEX "UserPushToken_userId_platform_key" ON "UserPushToken"("userId", "platform");
CREATE INDEX "UserPushToken_token_isActive_idx" ON "UserPushToken"("token", "isActive");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_preferredSportId_fkey" FOREIGN KEY ("preferredSportId") REFERENCES "Sport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExerciseCategory" ADD CONSTRAINT "ExerciseCategory_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AgeCategory" ADD CONSTRAINT "AgeCategory_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExerciseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_ageCategoryId_fkey" FOREIGN KEY ("ageCategoryId") REFERENCES "AgeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserExerciseFavorite" ADD CONSTRAINT "UserExerciseFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserExerciseFavorite" ADD CONSTRAINT "UserExerciseFavorite_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserNotificationSettings" ADD CONSTRAINT "UserNotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserPushToken" ADD CONSTRAINT "UserPushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert Sports
INSERT INTO "Sport" (id, name, slug, icon, "order", "createdAt", "updatedAt") VALUES
  ('sport-volleyball', 'Volley-ball', 'volleyball', '🏐', 1, NOW(), NOW()),
  ('sport-football', 'Football', 'football', '⚽', 2, NOW(), NOW()),
  ('sport-basketball', 'Basketball', 'basketball', '🏀', 3, NOW(), NOW()),
  ('sport-handball', 'Handball', 'handball', '🤾', 4, NOW(), NOW()),
  ('sport-tennis', 'Tennis', 'tennis', '🎾', 5, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Exercise Categories - Volleyball
INSERT INTO "ExerciseCategory" (id, name, slug, icon, color, "order", "sportId", "createdAt", "updatedAt") VALUES
  ('cat-vb-attack', 'Attaque', 'attaque', '⚔️', '#ef4444', 1, 'sport-volleyball', NOW(), NOW()),
  ('cat-vb-defense', 'Défense', 'defense', '🛡️', '#3b82f6', 2, 'sport-volleyball', NOW(), NOW()),
  ('cat-vb-serve', 'Service', 'service', '🎯', '#10b981', 3, 'sport-volleyball', NOW(), NOW()),
  ('cat-vb-pass', 'Passe', 'passe', '📥', '#f59e0b', 4, 'sport-volleyball', NOW(), NOW()),
  ('cat-vb-block', 'Contre', 'contre', '🚫', '#8b5cf6', 5, 'sport-volleyball', NOW(), NOW()),
  ('cat-vb-warmup', 'Échauffement', 'echauffement', '🔥', '#ec4899', 6, 'sport-volleyball', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Exercise Categories - Football
INSERT INTO "ExerciseCategory" (id, name, slug, icon, color, "order", "sportId", "createdAt", "updatedAt") VALUES
  ('cat-fb-dribble', 'Dribble', 'dribble', '⚽', '#10b981', 1, 'sport-football', NOW(), NOW()),
  ('cat-fb-pass', 'Passe', 'passe', '🤝', '#3b82f6', 2, 'sport-football', NOW(), NOW()),
  ('cat-fb-shoot', 'Tir', 'tir', '🎯', '#ef4444', 3, 'sport-football', NOW(), NOW()),
  ('cat-fb-defense', 'Défense', 'defense', '🛡️', '#8b5cf6', 4, 'sport-football', NOW(), NOW()),
  ('cat-fb-warmup', 'Échauffement', 'echauffement', '🔥', '#ec4899', 5, 'sport-football', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Exercise Categories - Basketball
INSERT INTO "ExerciseCategory" (id, name, slug, icon, color, "order", "sportId", "createdAt", "updatedAt") VALUES
  ('cat-bb-dribble', 'Dribble', 'dribble', '🏀', '#10b981', 1, 'sport-basketball', NOW(), NOW()),
  ('cat-bb-shoot', 'Tir', 'tir', '🎯', '#ef4444', 2, 'sport-basketball', NOW(), NOW()),
  ('cat-bb-pass', 'Passe', 'passe', '🤝', '#f59e0b', 3, 'sport-basketball', NOW(), NOW()),
  ('cat-bb-defense', 'Défense', 'defense', '🛡️', '#3b82f6', 4, 'sport-basketball', NOW(), NOW()),
  ('cat-bb-rebound', 'Rebond', 'rebond', '↕️', '#8b5cf6', 5, 'sport-basketball', NOW(), NOW()),
  ('cat-bb-warmup', 'Échauffement', 'echauffement', '🔥', '#ec4899', 6, 'sport-basketball', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Exercise Categories - Handball
INSERT INTO "ExerciseCategory" (id, name, slug, icon, color, "order", "sportId", "createdAt", "updatedAt") VALUES
  ('cat-hb-shoot', 'Tir', 'tir', '🎯', '#10b981', 1, 'sport-handball', NOW(), NOW()),
  ('cat-hb-pass', 'Passe', 'passe', '🤝', '#f59e0b', 2, 'sport-handball', NOW(), NOW()),
  ('cat-hb-defense', 'Défense', 'defense', '🛡️', '#3b82f6', 3, 'sport-handball', NOW(), NOW()),
  ('cat-hb-attack', 'Attaque', 'attaque', '⚔️', '#ef4444', 4, 'sport-handball', NOW(), NOW()),
  ('cat-hb-warmup', 'Échauffement', 'echauffement', '🔥', '#ec4899', 5, 'sport-handball', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Exercise Categories - Tennis
INSERT INTO "ExerciseCategory" (id, name, slug, icon, color, "order", "sportId", "createdAt", "updatedAt") VALUES
  ('cat-tn-serve', 'Service', 'service', '🎯', '#10b981', 1, 'sport-tennis', NOW(), NOW()),
  ('cat-tn-forehand', 'Coup droit', 'coup-droit', '➡️', '#ef4444', 2, 'sport-tennis', NOW(), NOW()),
  ('cat-tn-backhand', 'Revers', 'revers', '⬅️', '#3b82f6', 3, 'sport-tennis', NOW(), NOW()),
  ('cat-tn-volley', 'Volée', 'volee', '🏐', '#f59e0b', 4, 'sport-tennis', NOW(), NOW()),
  ('cat-tn-smash', 'Smash', 'smash', '💥', '#8b5cf6', 5, 'sport-tennis', NOW(), NOW()),
  ('cat-tn-warmup', 'Échauffement', 'echauffement', '🔥', '#ec4899', 6, 'sport-tennis', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Age Categories - Volleyball
INSERT INTO "AgeCategory" (id, name, slug, "minAge", "maxAge", "order", "sportId", "createdAt", "updatedAt") VALUES
  ('age-vb-m7', 'M7 Baby', 'm7', NULL, 7, 1, 'sport-volleyball', NOW(), NOW()),
  ('age-vb-m9', 'M9 Pupilles', 'm9', 8, 9, 2, 'sport-volleyball', NOW(), NOW()),
  ('age-vb-m11', 'M11 Poussins', 'm11', 10, 11, 3, 'sport-volleyball', NOW(), NOW()),
  ('age-vb-m13', 'M13 Benjamins', 'm13', 12, 13, 4, 'sport-volleyball', NOW(), NOW()),
  ('age-vb-m15', 'M15 Minimes', 'm15', 14, 15, 5, 'sport-volleyball', NOW(), NOW()),
  ('age-vb-m18', 'M18 Cadets', 'm18', 16, 18, 6, 'sport-volleyball', NOW(), NOW()),
  ('age-vb-m21', 'M21 Juniors', 'm21', 19, 21, 7, 'sport-volleyball', NOW(), NOW()),
  ('age-vb-senior', 'Seniors', 'senior', 22, NULL, 8, 'sport-volleyball', NOW(), NOW()),
  ('age-vb-master', 'Masters', 'master', 35, NULL, 9, 'sport-volleyball', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Age Categories - Football
INSERT INTO "AgeCategory" (id, name, slug, "minAge", "maxAge", "order", "sportId", "createdAt", "updatedAt") VALUES
  ('age-fb-u7', 'U7 Débutants', 'u7', NULL, 7, 1, 'sport-football', NOW(), NOW()),
  ('age-fb-u9', 'U9 Poussins', 'u9', 8, 9, 2, 'sport-football', NOW(), NOW()),
  ('age-fb-u11', 'U11 Benjamins', 'u11', 10, 11, 3, 'sport-football', NOW(), NOW()),
  ('age-fb-u13', 'U13 Minimes', 'u13', 12, 13, 4, 'sport-football', NOW(), NOW()),
  ('age-fb-u15', 'U15 Cadets', 'u15', 14, 15, 5, 'sport-football', NOW(), NOW()),
  ('age-fb-u17', 'U17 Juniors', 'u17', 16, 17, 6, 'sport-football', NOW(), NOW()),
  ('age-fb-senior', 'Seniors', 'senior', 18, NULL, 7, 'sport-football', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Age Categories - Basketball
INSERT INTO "AgeCategory" (id, name, slug, "minAge", "maxAge", "order", "sportId", "createdAt", "updatedAt") VALUES
  ('age-bb-u7', 'U7 Mini-poussins', 'u7', NULL, 7, 1, 'sport-basketball', NOW(), NOW()),
  ('age-bb-u9', 'U9 Poussins', 'u9', 8, 9, 2, 'sport-basketball', NOW(), NOW()),
  ('age-bb-u11', 'U11 Benjamins', 'u11', 10, 11, 3, 'sport-basketball', NOW(), NOW()),
  ('age-bb-u13', 'U13 Minimes', 'u13', 12, 13, 4, 'sport-basketball', NOW(), NOW()),
  ('age-bb-u15', 'U15 Cadets', 'u15', 14, 15, 5, 'sport-basketball', NOW(), NOW()),
  ('age-bb-u17', 'U17 Juniors', 'u17', 16, 17, 6, 'sport-basketball', NOW(), NOW()),
  ('age-bb-senior', 'Seniors', 'senior', 18, NULL, 7, 'sport-basketball', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Age Categories - Handball
INSERT INTO "AgeCategory" (id, name, slug, "minAge", "maxAge", "order", "sportId", "createdAt", "updatedAt") VALUES
  ('age-hb-u9', 'U9 Poussins', 'u9', NULL, 9, 1, 'sport-handball', NOW(), NOW()),
  ('age-hb-u11', 'U11 Benjamins', 'u11', 10, 11, 2, 'sport-handball', NOW(), NOW()),
  ('age-hb-u13', 'U13 Minimes', 'u13', 12, 13, 3, 'sport-handball', NOW(), NOW()),
  ('age-hb-u15', 'U15 Cadets', 'u15', 14, 15, 4, 'sport-handball', NOW(), NOW()),
  ('age-hb-u17', 'U17 Juniors', 'u17', 16, 17, 5, 'sport-handball', NOW(), NOW()),
  ('age-hb-u19', 'U19 Espoirs', 'u19', 18, 19, 6, 'sport-handball', NOW(), NOW()),
  ('age-hb-senior', 'Seniors', 'senior', 20, NULL, 7, 'sport-handball', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Age Categories - Tennis
INSERT INTO "AgeCategory" (id, name, slug, "minAge", "maxAge", "order", "sportId", "createdAt", "updatedAt") VALUES
  ('age-tn-u8', 'U8 Mini-tennis', 'u8', NULL, 8, 1, 'sport-tennis', NOW(), NOW()),
  ('age-tn-u10', 'U10 Poussins', 'u10', 9, 10, 2, 'sport-tennis', NOW(), NOW()),
  ('age-tn-u12', 'U12 Benjamins', 'u12', 11, 12, 3, 'sport-tennis', NOW(), NOW()),
  ('age-tn-u14', 'U14 Minimes', 'u14', 13, 14, 4, 'sport-tennis', NOW(), NOW()),
  ('age-tn-u16', 'U16 Cadets', 'u16', 15, 16, 5, 'sport-tennis', NOW(), NOW()),
  ('age-tn-u18', 'U18 Juniors', 'u18', 17, 18, 6, 'sport-tennis', NOW(), NOW()),
  ('age-tn-u21', 'U21 Espoirs', 'u21', 19, 21, 7, 'sport-tennis', NOW(), NOW()),
  ('age-tn-senior', 'Seniors', 'senior', 22, NULL, 8, 'sport-tennis', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
