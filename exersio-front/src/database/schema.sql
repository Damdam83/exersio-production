-- ==================================================
-- EXERSIO - Schéma de base de données
-- Application de gestion d'entraînements sportifs
-- ==================================================

-- Extensions PostgreSQL recommandées
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================================================
-- ÉNUMÉRATIONS (TYPES ENUM)
-- ==================================================

CREATE TYPE user_role AS ENUM ('coach', 'assistant', 'admin');

CREATE TYPE exercise_category AS ENUM (
    'attaque', 'défense', 'service', 'réception', 
    'bloc', 'physique', 'tactique', 'échauffement'
);

CREATE TYPE age_category AS ENUM (
    'enfants', 'minimes', 'cadets', 'juniors', 'seniors', 'tous'
);

CREATE TYPE session_status AS ENUM (
    'planned', 'completed', 'cancelled', 'in-progress'
);

CREATE TYPE invitation_status AS ENUM (
    'pending', 'accepted', 'declined', 'expired'
);

CREATE TYPE field_type AS ENUM (
    'volleyball', 'basketball', 'football', 'tennis'
);

CREATE TYPE point_type AS ENUM (
    'player', 'opponent', 'coach', 'ball'
);

CREATE TYPE arrow_style AS ENUM (
    'solid', 'dashed', 'dotted'
);

CREATE TYPE annotation_type AS ENUM (
    'text', 'zone'
);

-- ==================================================
-- TABLES PRINCIPALES
-- ==================================================

-- Table des utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'coach',
    club_id UUID,
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des clubs
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL,
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des membres de club (relation many-to-many users <-> clubs)
CREATE TABLE club_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role user_role NOT NULL DEFAULT 'assistant',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(club_id, user_id)
);

-- Table des invitations
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL,
    invited_by_user_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    status invitation_status DEFAULT 'pending',
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des exercices
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- en minutes
    category exercise_category NOT NULL,
    age_category age_category NOT NULL,
    sport VARCHAR(100) NOT NULL DEFAULT 'Volley-ball',
    instructions TEXT[], -- Array de chaînes pour les étapes
    created_by_user_id UUID NOT NULL,
    club_id UUID, -- NULL = exercice public
    is_public BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    
    -- Métadonnées supplémentaires
    level VARCHAR(50), -- faible, moyenne, haute
    intensity VARCHAR(50), -- faible, moyenne, haute
    players_min INTEGER,
    players_max INTEGER,
    player_count INTEGER,
    notes TEXT,
    tags TEXT[], -- Array de tags
    material TEXT, -- Matériel nécessaire
    
    -- Statistiques d'utilisation
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2), -- Note moyenne (1.00 à 5.00)
    rating_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des données de terrain (schémas tactiques)
CREATE TABLE field_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exercise_id UUID NOT NULL UNIQUE,
    field_type field_type NOT NULL DEFAULT 'volleyball',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des points (joueurs, ballons, etc.) sur le terrain
CREATE TABLE field_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_data_id UUID NOT NULL,
    external_id VARCHAR(50) NOT NULL, -- ID utilisé dans l'interface
    x DECIMAL(5,2) NOT NULL, -- Position X en pourcentage (0-100)
    y DECIMAL(5,2) NOT NULL, -- Position Y en pourcentage (0-100)
    color VARCHAR(7) NOT NULL, -- Code couleur hex
    size INTEGER NOT NULL DEFAULT 20,
    label VARCHAR(10),
    point_type point_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des flèches sur le terrain
CREATE TABLE field_arrows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_data_id UUID NOT NULL,
    external_id VARCHAR(50) NOT NULL,
    start_x DECIMAL(5,2) NOT NULL,
    start_y DECIMAL(5,2) NOT NULL,
    end_x DECIMAL(5,2) NOT NULL,
    end_y DECIMAL(5,2) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#00d4aa',
    width INTEGER NOT NULL DEFAULT 3,
    style arrow_style NOT NULL DEFAULT 'solid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des annotations (zones, texte) sur le terrain
CREATE TABLE field_annotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_data_id UUID NOT NULL,
    external_id VARCHAR(50) NOT NULL,
    x DECIMAL(5,2) NOT NULL,
    y DECIMAL(5,2) NOT NULL,
    text VARCHAR(255) NOT NULL,
    font_size INTEGER NOT NULL DEFAULT 12,
    color VARCHAR(7) NOT NULL,
    width DECIMAL(5,2), -- Pour les zones
    height DECIMAL(5,2), -- Pour les zones
    annotation_type annotation_type NOT NULL DEFAULT 'text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des séances d'entraînement
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME,
    duration INTEGER NOT NULL, -- en minutes
    created_by_user_id UUID NOT NULL,
    club_id UUID,
    sport VARCHAR(100) NOT NULL DEFAULT 'Volley-ball',
    age_category age_category NOT NULL,
    status session_status DEFAULT 'planned',
    location VARCHAR(255),
    max_participants INTEGER,
    notes TEXT,
    weather_conditions VARCHAR(100),
    intensity_rating INTEGER CHECK (intensity_rating >= 1 AND intensity_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de liaison exercices-séances (many-to-many)
CREATE TABLE session_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL,
    exercise_id UUID NOT NULL,
    order_index INTEGER NOT NULL,
    duration_override INTEGER, -- Durée spécifique pour cette séance
    notes TEXT, -- Notes spécifiques pour cet exercice dans cette séance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, exercise_id)
);

-- Table des évaluations d'exercices
CREATE TABLE exercise_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exercise_id UUID NOT NULL,
    user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exercise_id, user_id)
);

-- Table des favoris utilisateurs
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    exercise_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, exercise_id)
);

-- Table de logs d'activité
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'create_exercise', 'create_session', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'exercise', 'session', etc.
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- CONTRAINTES DE CLÉS ÉTRANGÈRES
-- ==================================================

-- Users
ALTER TABLE users ADD CONSTRAINT fk_users_club_id 
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL;

-- Clubs
ALTER TABLE clubs ADD CONSTRAINT fk_clubs_owner_id 
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT;

-- Club members
ALTER TABLE club_members ADD CONSTRAINT fk_club_members_club_id 
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;
ALTER TABLE club_members ADD CONSTRAINT fk_club_members_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Invitations
ALTER TABLE invitations ADD CONSTRAINT fk_invitations_club_id 
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;
ALTER TABLE invitations ADD CONSTRAINT fk_invitations_invited_by_user_id 
    FOREIGN KEY (invited_by_user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Exercises
ALTER TABLE exercises ADD CONSTRAINT fk_exercises_created_by_user_id 
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE exercises ADD CONSTRAINT fk_exercises_club_id 
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL;

-- Field data
ALTER TABLE field_data ADD CONSTRAINT fk_field_data_exercise_id 
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;

-- Field points
ALTER TABLE field_points ADD CONSTRAINT fk_field_points_field_data_id 
    FOREIGN KEY (field_data_id) REFERENCES field_data(id) ON DELETE CASCADE;

-- Field arrows
ALTER TABLE field_arrows ADD CONSTRAINT fk_field_arrows_field_data_id 
    FOREIGN KEY (field_data_id) REFERENCES field_data(id) ON DELETE CASCADE;

-- Field annotations
ALTER TABLE field_annotations ADD CONSTRAINT fk_field_annotations_field_data_id 
    FOREIGN KEY (field_data_id) REFERENCES field_data(id) ON DELETE CASCADE;

-- Sessions
ALTER TABLE sessions ADD CONSTRAINT fk_sessions_created_by_user_id 
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE sessions ADD CONSTRAINT fk_sessions_club_id 
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL;

-- Session exercises
ALTER TABLE session_exercises ADD CONSTRAINT fk_session_exercises_session_id 
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;
ALTER TABLE session_exercises ADD CONSTRAINT fk_session_exercises_exercise_id 
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;

-- Exercise ratings
ALTER TABLE exercise_ratings ADD CONSTRAINT fk_exercise_ratings_exercise_id 
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;
ALTER TABLE exercise_ratings ADD CONSTRAINT fk_exercise_ratings_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- User favorites
ALTER TABLE user_favorites ADD CONSTRAINT fk_user_favorites_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_favorites ADD CONSTRAINT fk_user_favorites_exercise_id 
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;

-- Activity logs
ALTER TABLE activity_logs ADD CONSTRAINT fk_activity_logs_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ==================================================
-- INDEX POUR LES PERFORMANCES
-- ==================================================

-- Index pour les recherches fréquentes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_club_id ON users(club_id);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_clubs_invite_code ON clubs(invite_code);
CREATE INDEX idx_clubs_owner_id ON clubs(owner_id);

CREATE INDEX idx_club_members_club_user ON club_members(club_id, user_id);
CREATE INDEX idx_club_members_active ON club_members(club_id) WHERE is_active = TRUE;

CREATE INDEX idx_invitations_email_status ON invitations(email, status);
CREATE INDEX idx_invitations_club_id ON invitations(club_id);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);

CREATE INDEX idx_exercises_created_by ON exercises(created_by_user_id);
CREATE INDEX idx_exercises_club_id ON exercises(club_id);
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_public ON exercises(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_exercises_search ON exercises USING gin(to_tsvector('french', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_exercises_tags ON exercises USING gin(tags);

CREATE INDEX idx_sessions_created_by ON sessions(created_by_user_id);
CREATE INDEX idx_sessions_club_id ON sessions(club_id);
CREATE INDEX idx_sessions_date ON sessions(date);
CREATE INDEX idx_sessions_status ON sessions(status);

CREATE INDEX idx_session_exercises_session ON session_exercises(session_id);
CREATE INDEX idx_session_exercises_order ON session_exercises(session_id, order_index);

CREATE INDEX idx_activity_logs_user_date ON activity_logs(user_id, created_at);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- ==================================================
-- TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- ==================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_field_data_updated_at BEFORE UPDATE ON field_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer un code d'invitation unique
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invite_code IS NULL THEN
        NEW.invite_code := upper(substring(md5(random()::text) from 1 for 8));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_club_invite_code BEFORE INSERT ON clubs
    FOR EACH ROW EXECUTE FUNCTION generate_invite_code();

-- Fonction pour mettre à jour les statistiques d'exercices
CREATE OR REPLACE FUNCTION update_exercise_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE exercises 
    SET 
        rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM exercise_ratings WHERE exercise_id = NEW.exercise_id),
        rating_count = (SELECT COUNT(*) FROM exercise_ratings WHERE exercise_id = NEW.exercise_id)
    WHERE id = NEW.exercise_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exercise_rating_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON exercise_ratings
    FOR EACH ROW EXECUTE FUNCTION update_exercise_rating();

-- ==================================================
-- VUES UTILES
-- ==================================================

-- Vue des exercices avec informations créateur
CREATE VIEW exercise_details AS
SELECT 
    e.*,
    u.name as created_by_name,
    c.name as club_name,
    CASE WHEN fd.id IS NOT NULL THEN TRUE ELSE FALSE END as has_field_data
FROM exercises e
JOIN users u ON e.created_by_user_id = u.id
LEFT JOIN clubs c ON e.club_id = c.id
LEFT JOIN field_data fd ON e.id = fd.exercise_id;

-- Vue des séances avec nombre d'exercices
CREATE VIEW session_summary AS
SELECT 
    s.*,
    u.name as created_by_name,
    c.name as club_name,
    COUNT(se.exercise_id) as exercise_count,
    SUM(COALESCE(se.duration_override, e.duration)) as total_duration
FROM sessions s
JOIN users u ON s.created_by_user_id = u.id
LEFT JOIN clubs c ON s.club_id = c.id
LEFT JOIN session_exercises se ON s.id = se.session_id
LEFT JOIN exercises e ON se.exercise_id = e.id
GROUP BY s.id, u.name, c.name;

-- ==================================================
-- DONNÉES DE DÉMARRAGE (OPTIONNEL)
-- ==================================================

-- Insérer un admin par défaut (mot de passe: admin123)
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@exersio.com', crypt('admin123', gen_salt('bf')), 'Administrateur Exersio', 'admin');

-- ==================================================
-- COMMENTAIRES SUR LES TABLES
-- ==================================================

COMMENT ON TABLE users IS 'Utilisateurs de l''application (coachs, assistants, admins)';
COMMENT ON TABLE clubs IS 'Clubs sportifs utilisant l''application';
COMMENT ON TABLE exercises IS 'Exercices d''entraînement créés par les utilisateurs';
COMMENT ON TABLE field_data IS 'Données de terrain pour les schémas tactiques';
COMMENT ON TABLE sessions IS 'Séances d''entraînement planifiées ou réalisées';
COMMENT ON TABLE session_exercises IS 'Association exercices-séances avec ordre et métadonnées';

-- ==================================================
-- POLITIQUES DE SÉCURITÉ (ROW LEVEL SECURITY)
-- ==================================================

-- Activer RLS sur les tables sensibles
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_data ENABLE ROW LEVEL SECURITY;

-- Politique pour les exercices : voir publics + ses propres exercices + exercices du club
CREATE POLICY exercise_access_policy ON exercises
    FOR ALL TO authenticated_user
    USING (
        is_public = true OR 
        created_by_user_id = current_user_id() OR
        (club_id IS NOT NULL AND club_id IN (
            SELECT club_id FROM club_members 
            WHERE user_id = current_user_id() AND is_active = true
        ))
    );

-- Note: current_user_id() serait une fonction custom qui retourne l'ID de l'utilisateur connecté