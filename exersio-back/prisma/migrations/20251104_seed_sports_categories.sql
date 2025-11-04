-- Migration: Seed initial sports and categories
-- Created: 2025-11-04

-- 1. Insert Sports
INSERT INTO "Sport" (id, name, slug, icon, "order") VALUES
  ('sport-volleyball', 'Volley-ball', 'volleyball', '🏐', 1),
  ('sport-football', 'Football', 'football', '⚽', 2),
  ('sport-basketball', 'Basketball', 'basketball', '🏀', 3),
  ('sport-handball', 'Handball', 'handball', '🤾', 4),
  ('sport-tennis', 'Tennis', 'tennis', '🎾', 5)
ON CONFLICT (id) DO NOTHING;

-- 2. Exercise Categories - Volleyball
INSERT INTO "ExerciseCategory" (id, name, slug, description, "sportId") VALUES
  ('cat-vb-attack', 'Attaque', 'attaque', 'Exercices d''attaque', 'sport-volleyball'),
  ('cat-vb-defense', 'Défense', 'defense', 'Exercices de défense', 'sport-volleyball'),
  ('cat-vb-serve', 'Service', 'service', 'Exercices de service', 'sport-volleyball'),
  ('cat-vb-pass', 'Passe', 'passe', 'Exercices de passe', 'sport-volleyball'),
  ('cat-vb-block', 'Contre', 'contre', 'Exercices de contre', 'sport-volleyball'),
  ('cat-vb-warmup', 'Échauffement', 'echauffement', 'Exercices d''échauffement', 'sport-volleyball')
ON CONFLICT (id) DO NOTHING;

-- 3. Exercise Categories - Football
INSERT INTO "ExerciseCategory" (id, name, slug, description, "sportId") VALUES
  ('cat-fb-dribble', 'Dribble', 'dribble', 'Exercices de dribble', 'sport-football'),
  ('cat-fb-pass', 'Passe', 'passe', 'Exercices de passe', 'sport-football'),
  ('cat-fb-shoot', 'Tir', 'tir', 'Exercices de tir', 'sport-football'),
  ('cat-fb-defense', 'Défense', 'defense', 'Exercices défensifs', 'sport-football'),
  ('cat-fb-warmup', 'Échauffement', 'echauffement', 'Exercices d''échauffement', 'sport-football')
ON CONFLICT (id) DO NOTHING;

-- 4. Exercise Categories - Basketball
INSERT INTO "ExerciseCategory" (id, name, slug, description, "sportId") VALUES
  ('cat-bb-dribble', 'Dribble', 'dribble', 'Exercices de dribble', 'sport-basketball'),
  ('cat-bb-shoot', 'Tir', 'tir', 'Exercices de tir', 'sport-basketball'),
  ('cat-bb-pass', 'Passe', 'passe', 'Exercices de passe', 'sport-basketball'),
  ('cat-bb-defense', 'Défense', 'defense', 'Exercices défensifs', 'sport-basketball'),
  ('cat-bb-rebound', 'Rebond', 'rebond', 'Exercices de rebond', 'sport-basketball'),
  ('cat-bb-warmup', 'Échauffement', 'echauffement', 'Exercices d''échauffement', 'sport-basketball')
ON CONFLICT (id) DO NOTHING;

-- 5. Exercise Categories - Handball
INSERT INTO "ExerciseCategory" (id, name, slug, description, "sportId") VALUES
  ('cat-hb-shoot', 'Tir', 'tir', 'Exercices de tir', 'sport-handball'),
  ('cat-hb-pass', 'Passe', 'passe', 'Exercices de passe', 'sport-handball'),
  ('cat-hb-defense', 'Défense', 'defense', 'Exercices défensifs', 'sport-handball'),
  ('cat-hb-attack', 'Attaque', 'attaque', 'Exercices d''attaque', 'sport-handball'),
  ('cat-hb-warmup', 'Échauffement', 'echauffement', 'Exercices d''échauffement', 'sport-handball')
ON CONFLICT (id) DO NOTHING;

-- 6. Exercise Categories - Tennis
INSERT INTO "ExerciseCategory" (id, name, slug, description, "sportId") VALUES
  ('cat-tn-serve', 'Service', 'service', 'Exercices de service', 'sport-tennis'),
  ('cat-tn-forehand', 'Coup droit', 'coup-droit', 'Exercices de coup droit', 'sport-tennis'),
  ('cat-tn-backhand', 'Revers', 'revers', 'Exercices de revers', 'sport-tennis'),
  ('cat-tn-volley', 'Volée', 'volee', 'Exercices de volée', 'sport-tennis'),
  ('cat-tn-smash', 'Smash', 'smash', 'Exercices de smash', 'sport-tennis'),
  ('cat-tn-warmup', 'Échauffement', 'echauffement', 'Exercices d''échauffement', 'sport-tennis')
ON CONFLICT (id) DO NOTHING;

-- 7. Age Categories - Volleyball
INSERT INTO "AgeCategory" (id, name, slug, "minAge", "maxAge", "sportId") VALUES
  ('age-vb-m7', 'M7 Baby', 'm7', NULL, 7, 'sport-volleyball'),
  ('age-vb-m9', 'M9 Pupilles', 'm9', 8, 9, 'sport-volleyball'),
  ('age-vb-m11', 'M11 Poussins', 'm11', 10, 11, 'sport-volleyball'),
  ('age-vb-m13', 'M13 Benjamins', 'm13', 12, 13, 'sport-volleyball'),
  ('age-vb-m15', 'M15 Minimes', 'm15', 14, 15, 'sport-volleyball'),
  ('age-vb-m18', 'M18 Cadets', 'm18', 16, 18, 'sport-volleyball'),
  ('age-vb-m21', 'M21 Juniors', 'm21', 19, 21, 'sport-volleyball'),
  ('age-vb-senior', 'Seniors', 'senior', 22, NULL, 'sport-volleyball'),
  ('age-vb-master', 'Masters', 'master', 35, NULL, 'sport-volleyball')
ON CONFLICT (id) DO NOTHING;

-- 8. Age Categories - Football
INSERT INTO "AgeCategory" (id, name, slug, "minAge", "maxAge", "sportId") VALUES
  ('age-fb-u7', 'U7 Débutants', 'u7', NULL, 7, 'sport-football'),
  ('age-fb-u9', 'U9 Poussins', 'u9', 8, 9, 'sport-football'),
  ('age-fb-u11', 'U11 Benjamins', 'u11', 10, 11, 'sport-football'),
  ('age-fb-u13', 'U13 Minimes', 'u13', 12, 13, 'sport-football'),
  ('age-fb-u15', 'U15 Cadets', 'u15', 14, 15, 'sport-football'),
  ('age-fb-u17', 'U17 Juniors', 'u17', 16, 17, 'sport-football'),
  ('age-fb-senior', 'Seniors', 'senior', 18, NULL, 'sport-football')
ON CONFLICT (id) DO NOTHING;

-- 9. Age Categories - Basketball
INSERT INTO "AgeCategory" (id, name, slug, "minAge", "maxAge", "sportId") VALUES
  ('age-bb-u7', 'U7 Mini-poussins', 'u7', NULL, 7, 'sport-basketball'),
  ('age-bb-u9', 'U9 Poussins', 'u9', 8, 9, 'sport-basketball'),
  ('age-bb-u11', 'U11 Benjamins', 'u11', 10, 11, 'sport-basketball'),
  ('age-bb-u13', 'U13 Minimes', 'u13', 12, 13, 'sport-basketball'),
  ('age-bb-u15', 'U15 Cadets', 'u15', 14, 15, 'sport-basketball'),
  ('age-bb-u17', 'U17 Juniors', 'u17', 16, 17, 'sport-basketball'),
  ('age-bb-senior', 'Seniors', 'senior', 18, NULL, 'sport-basketball')
ON CONFLICT (id) DO NOTHING;

-- 10. Age Categories - Handball
INSERT INTO "AgeCategory" (id, name, slug, "minAge", "maxAge", "sportId") VALUES
  ('age-hb-u9', 'U9 Poussins', 'u9', NULL, 9, 'sport-handball'),
  ('age-hb-u11', 'U11 Benjamins', 'u11', 10, 11, 'sport-handball'),
  ('age-hb-u13', 'U13 Minimes', 'u13', 12, 13, 'sport-handball'),
  ('age-hb-u15', 'U15 Cadets', 'u15', 14, 15, 'sport-handball'),
  ('age-hb-u17', 'U17 Juniors', 'u17', 16, 17, 'sport-handball'),
  ('age-hb-u19', 'U19 Espoirs', 'u19', 18, 19, 'sport-handball'),
  ('age-hb-senior', 'Seniors', 'senior', 20, NULL, 'sport-handball')
ON CONFLICT (id) DO NOTHING;

-- 11. Age Categories - Tennis
INSERT INTO "AgeCategory" (id, name, slug, "minAge", "maxAge", "sportId") VALUES
  ('age-tn-u8', 'U8 Mini-tennis', 'u8', NULL, 8, 'sport-tennis'),
  ('age-tn-u10', 'U10 Poussins', 'u10', 9, 10, 'sport-tennis'),
  ('age-tn-u12', 'U12 Benjamins', 'u12', 11, 12, 'sport-tennis'),
  ('age-tn-u14', 'U14 Minimes', 'u14', 13, 14, 'sport-tennis'),
  ('age-tn-u16', 'U16 Cadets', 'u16', 15, 16, 'sport-tennis'),
  ('age-tn-u18', 'U18 Juniors', 'u18', 17, 18, 'sport-tennis'),
  ('age-tn-u21', 'U21 Espoirs', 'u21', 19, 21, 'sport-tennis'),
  ('age-tn-senior', 'Seniors', 'senior', 22, NULL, 'sport-tennis')
ON CONFLICT (id) DO NOTHING;
