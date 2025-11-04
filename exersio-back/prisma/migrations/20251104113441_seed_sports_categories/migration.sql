-- Migration: Seed initial sports and categories
-- Created: 2025-11-04

-- 1. Insert Sports
INSERT INTO "Sport" (id, name, slug, icon, "order", "createdAt", "updatedAt") VALUES
  ('sport-volleyball', 'Volley-ball', 'volleyball', '🏐', 1, NOW(), NOW()),
  ('sport-football', 'Football', 'football', '⚽', 2, NOW(), NOW()),
  ('sport-basketball', 'Basketball', 'basketball', '🏀', 3, NOW(), NOW()),
  ('sport-handball', 'Handball', 'handball', '🤾', 4, NOW(), NOW()),
  ('sport-tennis', 'Tennis', 'tennis', '🎾', 5, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Exercise Categories - Volleyball
INSERT INTO "ExerciseCategory" (id, name, slug, description, "sportId", "createdAt", "updatedAt") VALUES
  ('cat-vb-attack', 'Attaque', 'attaque', 'Exercices d''attaque', 'sport-volleyball', NOW(), NOW()),
  ('cat-vb-defense', 'Défense', 'defense', 'Exercices de défense', 'sport-volleyball', NOW(), NOW()),
  ('cat-vb-serve', 'Service', 'service', 'Exercices de service', 'sport-volleyball', NOW(), NOW()),
  ('cat-vb-pass', 'Passe', 'passe', 'Exercices de passe', 'sport-volleyball', NOW(), NOW()),
  ('cat-vb-block', 'Contre', 'contre', 'Exercices de contre', 'sport-volleyball', NOW(), NOW()),
  ('cat-vb-warmup', 'Échauffement', 'echauffement', 'Exercices d''échauffement', 'sport-volleyball', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Exercise Categories - Football
INSERT INTO "ExerciseCategory" (id, name, slug, description, "sportId", "createdAt", "updatedAt") VALUES
  ('cat-fb-dribble', 'Dribble', 'dribble', 'Exercices de dribble', 'sport-football', NOW(), NOW()),
  ('cat-fb-pass', 'Passe', 'passe', 'Exercices de passe', 'sport-football', NOW(), NOW()),
  ('cat-fb-shoot', 'Tir', 'tir', 'Exercices de tir', 'sport-football', NOW(), NOW()),
  ('cat-fb-defense', 'Défense', 'defense', 'Exercices défensifs', 'sport-football', NOW(), NOW()),
  ('cat-fb-warmup', 'Échauffement', 'echauffement', 'Exercices d''échauffement', 'sport-football', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Exercise Categories - Basketball
INSERT INTO "ExerciseCategory" (id, name, slug, description, "sportId", "createdAt", "updatedAt") VALUES
  ('cat-bb-dribble', 'Dribble', 'dribble', 'Exercices de dribble', 'sport-basketball', NOW(), NOW()),
  ('cat-bb-shoot', 'Tir', 'tir', 'Exercices de tir', 'sport-basketball', NOW(), NOW()),
  ('cat-bb-pass', 'Passe', 'passe', 'Exercices de passe', 'sport-basketball', NOW(), NOW()),
  ('cat-bb-defense', 'Défense', 'defense', 'Exercices défensifs', 'sport-basketball', NOW(), NOW()),
  ('cat-bb-rebound', 'Rebond', 'rebond', 'Exercices de rebond', 'sport-basketball', NOW(), NOW()),
  ('cat-bb-warmup', 'Échauffement', 'echauffement', 'Exercices d''échauffement', 'sport-basketball', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Exercise Categories - Handball
INSERT INTO "ExerciseCategory" (id, name, slug, description, "sportId", "createdAt", "updatedAt") VALUES
  ('cat-hb-shoot', 'Tir', 'tir', 'Exercices de tir', 'sport-handball', NOW(), NOW()),
  ('cat-hb-pass', 'Passe', 'passe', 'Exercices de passe', 'sport-handball', NOW(), NOW()),
  ('cat-hb-defense', 'Défense', 'defense', 'Exercices défensifs', 'sport-handball', NOW(), NOW()),
  ('cat-hb-attack', 'Attaque', 'attaque', 'Exercices d''attaque', 'sport-handball', NOW(), NOW()),
  ('cat-hb-warmup', 'Échauffement', 'echauffement', 'Exercices d''échauffement', 'sport-handball', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 6. Exercise Categories - Tennis
INSERT INTO "ExerciseCategory" (id, name, slug, description, "sportId", "createdAt", "updatedAt") VALUES
  ('cat-tn-serve', 'Service', 'service', 'Exercices de service', 'sport-tennis', NOW(), NOW()),
  ('cat-tn-forehand', 'Coup droit', 'coup-droit', 'Exercices de coup droit', 'sport-tennis', NOW(), NOW()),
  ('cat-tn-backhand', 'Revers', 'revers', 'Exercices de revers', 'sport-tennis', NOW(), NOW()),
  ('cat-tn-volley', 'Volée', 'volee', 'Exercices de volée', 'sport-tennis', NOW(), NOW()),
  ('cat-tn-smash', 'Smash', 'smash', 'Exercices de smash', 'sport-tennis', NOW(), NOW()),
  ('cat-tn-warmup', 'Échauffement', 'echauffement', 'Exercices d''échauffement', 'sport-tennis', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 7. Age Categories - Volleyball
INSERT INTO "AgeCategory" (id, name, slug, "minAge", "maxAge", "sportId", "createdAt", "updatedAt") VALUES
  ('age-vb-m7', 'M7 Baby', 'm7', NULL, 7, 'sport-volleyball', NOW(), NOW()),
  ('age-vb-m9', 'M9 Pupilles', 'm9', 8, 9, 'sport-volleyball', NOW(), NOW()),
  ('age-vb-m11', 'M11 Poussins', 'm11', 10, 11, 'sport-volleyball', NOW(), NOW()),
  ('age-vb-m13', 'M13 Benjamins', 'm13', 12, 13, 'sport-volleyball', NOW(), NOW()),
  ('age-vb-m15', 'M15 Minimes', 'm15', 14, 15, 'sport-volleyball', NOW(), NOW()),
  ('age-vb-m18', 'M18 Cadets', 'm18', 16, 18, 'sport-volleyball', NOW(), NOW()),
  ('age-vb-m21', 'M21 Juniors', 'm21', 19, 21, 'sport-volleyball', NOW(), NOW()),
  ('age-vb-senior', 'Seniors', 'senior', 22, NULL, 'sport-volleyball', NOW(), NOW()),
  ('age-vb-master', 'Masters', 'master', 35, NULL, 'sport-volleyball', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 8. Age Categories - Football
INSERT INTO "AgeCategory" (id, name, slug, "minAge", "maxAge", "sportId", "createdAt", "updatedAt") VALUES
  ('age-fb-u7', 'U7 Débutants', 'u7', NULL, 7, 'sport-football', NOW(), NOW()),
  ('age-fb-u9', 'U9 Poussins', 'u9', 8, 9, 'sport-football', NOW(), NOW()),
  ('age-fb-u11', 'U11 Benjamins', 'u11', 10, 11, 'sport-football', NOW(), NOW()),
  ('age-fb-u13', 'U13 Minimes', 'u13', 12, 13, 'sport-football', NOW(), NOW()),
  ('age-fb-u15', 'U15 Cadets', 'u15', 14, 15, 'sport-football', NOW(), NOW()),
  ('age-fb-u17', 'U17 Juniors', 'u17', 16, 17, 'sport-football', NOW(), NOW()),
  ('age-fb-senior', 'Seniors', 'senior', 18, NULL, 'sport-football', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 9. Age Categories - Basketball
INSERT INTO "AgeCategory" (id, name, slug, "minAge", "maxAge", "sportId", "createdAt", "updatedAt") VALUES
  ('age-bb-u7', 'U7 Mini-poussins', 'u7', NULL, 7, 'sport-basketball', NOW(), NOW()),
  ('age-bb-u9', 'U9 Poussins', 'u9', 8, 9, 'sport-basketball', NOW(), NOW()),
  ('age-bb-u11', 'U11 Benjamins', 'u11', 10, 11, 'sport-basketball', NOW(), NOW()),
  ('age-bb-u13', 'U13 Minimes', 'u13', 12, 13, 'sport-basketball', NOW(), NOW()),
  ('age-bb-u15', 'U15 Cadets', 'u15', 14, 15, 'sport-basketball', NOW(), NOW()),
  ('age-bb-u17', 'U17 Juniors', 'u17', 16, 17, 'sport-basketball', NOW(), NOW()),
  ('age-bb-senior', 'Seniors', 'senior', 18, NULL, 'sport-basketball', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 10. Age Categories - Handball
INSERT INTO "AgeCategory" (id, name, slug, "minAge", "maxAge", "sportId", "createdAt", "updatedAt") VALUES
  ('age-hb-u9', 'U9 Poussins', 'u9', NULL, 9, 'sport-handball', NOW(), NOW()),
  ('age-hb-u11', 'U11 Benjamins', 'u11', 10, 11, 'sport-handball', NOW(), NOW()),
  ('age-hb-u13', 'U13 Minimes', 'u13', 12, 13, 'sport-handball', NOW(), NOW()),
  ('age-hb-u15', 'U15 Cadets', 'u15', 14, 15, 'sport-handball', NOW(), NOW()),
  ('age-hb-u17', 'U17 Juniors', 'u17', 16, 17, 'sport-handball', NOW(), NOW()),
  ('age-hb-u19', 'U19 Espoirs', 'u19', 18, 19, 'sport-handball', NOW(), NOW()),
  ('age-hb-senior', 'Seniors', 'senior', 20, NULL, 'sport-handball', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 11. Age Categories - Tennis
INSERT INTO "AgeCategory" (id, name, slug, "minAge", "maxAge", "sportId", "createdAt", "updatedAt") VALUES
  ('age-tn-u8', 'U8 Mini-tennis', 'u8', NULL, 8, 'sport-tennis', NOW(), NOW()),
  ('age-tn-u10', 'U10 Poussins', 'u10', 9, 10, 'sport-tennis', NOW(), NOW()),
  ('age-tn-u12', 'U12 Benjamins', 'u12', 11, 12, 'sport-tennis', NOW(), NOW()),
  ('age-tn-u14', 'U14 Minimes', 'u14', 13, 14, 'sport-tennis', NOW(), NOW()),
  ('age-tn-u16', 'U16 Cadets', 'u16', 15, 16, 'sport-tennis', NOW(), NOW()),
  ('age-tn-u18', 'U18 Juniors', 'u18', 17, 18, 'sport-tennis', NOW(), NOW()),
  ('age-tn-u21', 'U21 Espoirs', 'u21', 19, 21, 'sport-tennis', NOW(), NOW()),
  ('age-tn-senior', 'Seniors', 'senior', 22, NULL, 'sport-tennis', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
