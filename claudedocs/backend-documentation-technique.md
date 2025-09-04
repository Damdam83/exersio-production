# Documentation Technique Backend Exersio

> Documentation technique complète du backend Exersio pour développeurs  
> **Version :** 0.3.0 | **Stack :** NestJS + Prisma + PostgreSQL + Winston + NodeMailer  
> **Dernière mise à jour :** 01/09/2025

---

## 📋 Table des Matières

1. [Architecture Technique](#-architecture-technique)
2. [Base de Données](#-base-de-données)  
3. [API Documentation](#-api-documentation)
4. [Services et Logique Métier](#-services-et-logique-métier)
5. [Infrastructure](#-infrastructure)
6. [Sécurité](#-sécurité)
7. [Déploiement et Monitoring](#-déploiement-et-monitoring)

---

## 🏗️ Architecture Technique

### Stack Technologique

```typescript
// Dépendances principales
{
  "@nestjs/core": "^10.3.0",      // Framework Node.js
  "@prisma/client": "^5.20.0",    // ORM base de données  
  "winston": "^3.17.0",           // Logging professionnel
  "nodemailer": "^7.0.6",        // Envoi d'emails
  "@aws-sdk/client-s3": "^3.620", // Upload fichiers
  "bcryptjs": "^2.4.3",          // Hachage mots de passe
  "jsonwebtoken": "^9.0.2"       // Authentification JWT
}
```

### Patterns Architecturaux

#### 1. Dependency Injection (NestJS)
```typescript
// Exemple de service injecté
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mailService: MailService,
    private logger: CustomLoggerService
  ) {}
}
```

#### 2. Module-Based Architecture
```
src/
├── app.module.ts               # Module racine
├── common/                     # Utilitaires partagés
│   ├── auth/                   # Guards et autorisations
│   ├── filters/                # Filtres d'exceptions
│   ├── interceptors/           # Intercepteurs HTTP
│   └── logger/                 # Service de logging Winston
├── modules/                    # Modules métier
│   ├── auth/                   # Authentification
│   ├── users/                  # Gestion utilisateurs
│   ├── clubs/                  # Gestion clubs
│   ├── exercises/              # Exercices sportifs
│   ├── sessions/               # Séances d'entraînement
│   ├── favorites/              # Favoris utilisateur
│   ├── notifications/          # Système de notifications
│   ├── mail/                   # Service email
│   └── uploads/                # Upload fichiers AWS S3
└── prisma/                     # Service base de données
```

#### 3. Guards et Interceptors
```typescript
// Guard d'authentification JWT
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Intercepteur de logging HTTP  
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    // Log requêtes + performances + erreurs automatiquement
  }
}
```

### Structure des Dossiers

```
C:\PROJETS\Exersio\front\exersio-back/
├── dist/                       # Build production
├── logs/                       # Logs Winston avec rotation
│   ├── combined-YYYY-MM-DD.log # Tous les logs JSON
│   ├── error-YYYY-MM-DD.log    # Erreurs uniquement
│   ├── auth-YYYY-MM-DD.log     # Logs authentification
│   └── email-YYYY-MM-DD.log    # Logs emails envoyés
├── prisma/
│   ├── schema.prisma           # Modèle de données
│   ├── seed.ts                 # Données initiales
│   └── migrations/             # Migrations base de données
└── src/                        # Code source TypeScript
```

---

## 💾 Base de Données

### Schéma Prisma Complet

#### Entités Principales

```prisma
// Utilisateurs avec confirmation email
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  role         Role     @default(coach)
  avatar       String?
  clubId       String?
  club         Club?    @relation("ClubMembers", fields: [clubId], references: [id])
  
  // Confirmation email + réinitialisation mot de passe
  emailVerified            Boolean   @default(false)
  emailVerificationToken   String?
  emailVerificationExpires DateTime?
  passwordResetToken       String?
  passwordResetExpires     DateTime?
  
  // Relations
  ownedClubs               Club[]                    @relation("ClubOwner")
  exercises                Exercise[]                @relation("ExerciseCreatedBy")
  sessions                 Session[]                 @relation("SessionCreatedBy")
  favorites                UserExerciseFavorite[]
  notifications            Notification[]
  pushTokens               UserPushToken[]
}

// Clubs sportifs
model Club {
  id          String      @id @default(cuid())
  name        String
  description String?
  logo        String?
  ownerId     String      
  owner       User        @relation("ClubOwner", fields: [ownerId], references: [id])
  users       User[]      @relation("ClubMembers")
  exercises   Exercise[]
  sessions    Session[]
  invitations Invitation[]
}

// Exercices avec catégories et critères de réussite
model Exercise {
  id              String            @id @default(cuid())
  name            String
  description     String
  duration        Int               // en minutes
  sport           String
  instructions    Json              // Étapes détaillées
  fieldData       Json?             // Configuration terrain
  successCriteria Json?             // Critères de réussite
  
  // Catégories (ancienne + nouvelle structure)
  category        String            // Ancien système
  ageCategory     String
  categoryId      String?           // Nouvelles références
  categoryRef     ExerciseCategory? @relation(fields: [categoryId], references: [id])
  ageCategoryId   String?
  ageCategoryRef  AgeCategory?      @relation(fields: [ageCategoryId], references: [id])
  
  // Métadonnées
  level           String?           // Débutant, Intermédiaire, Avancé
  intensity       String?           // Faible, Modérée, Élevée
  playersMin      Int?
  playersMax      Int?
  tags            Json?
  notes           String?
  
  // Relations
  createdById     String
  createdBy       User              @relation("ExerciseCreatedBy", fields: [createdById], references: [id])
  clubId          String?
  club            Club?             @relation(fields: [clubId], references: [id])
  isPublic        Boolean           @default(false)
  sessions        SessionExercise[]
  favorites       UserExerciseFavorite[]
}
```

#### Relations Avancées

```prisma
// Sessions d'entraînement
model Session {
  id          String          @id @default(cuid())
  name        String
  description String?
  date        DateTime
  duration    Int
  objectives  Json?           // Objectifs pédagogiques
  status      SessionStatus   @default(planned)
  notes       String?
  
  // Relations exercices (many-to-many avec ordre)
  exercises   SessionExercise[]
  
  // Métadonnées
  createdById String
  createdBy   User            @relation("SessionCreatedBy", fields: [createdById], references: [id])
  clubId      String?
  club        Club?           @relation(fields: [clubId], references: [id])
  sport       String?
  ageCategory String?
  level       String?
}

// Table de liaison session-exercice avec ordre
model SessionExercise {
  sessionId  String
  exerciseId String
  order      Int      @default(0)  // Ordre dans la séance
  session    Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  exercise   Exercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
  
  @@id([sessionId, exerciseId])
  @@index([exerciseId])
}
```

#### Système de Notifications

```prisma
model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationType // session_reminder, exercise_added_to_club, system_notification
  title     String
  message   String
  data      Json?            // Metadata (sessionId, exerciseId, clubId)
  isRead    Boolean          @default(false)
  isSent    Boolean          @default(false)
  sentAt    DateTime?
  createdAt DateTime         @default(now())
  
  @@index([userId, isRead])
  @@index([type, isSent])
}

model UserPushToken {
  id       String   @id @default(cuid())
  userId   String
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token    String   @unique
  platform String   // 'android' | 'ios' | 'web'
  isActive Boolean  @default(true)
  
  @@unique([userId, platform])
  @@index([token, isActive])
}
```

### Migrations et Évolution

```bash
# Commandes Prisma
npx prisma generate        # Générer client TypeScript
npx prisma db push         # Appliquer schema à la DB (dev)
npx prisma migrate dev     # Créer migration (prod)
npx prisma studio          # Interface graphique

# Seed des données
npm run seed               # Populate catégories initiales
```

---

## 🔌 API Documentation

### Authentification

#### Endpoints Auth
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "securePassword123"
}

# Réponse
{
  "message": "Compte créé. Vérifiez votre email.",
  "user": {
    "id": "cuid...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "coach",
    "emailVerified": false
  }
}
```

```http
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securePassword123"
}

# Réponse (si email confirmé)
{
  "user": { "id": "...", "name": "...", "emailVerified": true },
  "token": "jwt-token...",
  "club": { "id": "...", "name": "..." } // Si membre d'un club
}

# Erreur si email non confirmé
{
  "statusCode": 401,
  "message": "Email not verified. Please check your email and confirm your account."
}
```

#### Confirmation Email
```http
GET /api/auth/confirm-email?token=abc123...
# Réponse : Confirmation + connexion automatique

POST /api/auth/resend-confirmation
{
  "email": "john@example.com"
}

POST /api/auth/forgot-password
{
  "email": "john@example.com"
}

POST /api/auth/reset-password
{
  "token": "reset-token...",
  "newPassword": "newSecurePassword123"
}
```

### Exercices

#### CRUD Exercices
```http
GET /api/exercises?page=1&limit=10&category=football&sport=football
Authorization: Bearer jwt-token

# Réponse
{
  "exercises": [
    {
      "id": "cuid...",
      "name": "Passe et va",
      "description": "Exercice technique de passes",
      "duration": 15,
      "category": "technique",
      "sport": "football",
      "instructions": [...],
      "successCriteria": [...],
      "isPublic": true,
      "createdBy": { "name": "Coach Martin" }
    }
  ],
  "total": 45,
  "page": 1,
  "totalPages": 5
}
```

```http
POST /api/exercises
Authorization: Bearer jwt-token
{
  "name": "Nouveau drill",
  "description": "Description détaillée",
  "duration": 20,
  "category": "physique", 
  "ageCategory": "senior",
  "sport": "football",
  "instructions": [
    { "step": 1, "description": "Échauffement 5min" },
    { "step": 2, "description": "Exercice principal 10min" }
  ],
  "successCriteria": [
    { "criteria": "80% de passes réussies" },
    { "criteria": "Respect du timing" }
  ],
  "level": "intermediaire",
  "playersMin": 8,
  "playersMax": 16
}
```

#### Permissions Granulaires
```http
GET /api/exercises/:id/permissions
Authorization: Bearer jwt-token

{
  "canEdit": true,    // Créateur ou admin club
  "canDelete": false  // Créateur uniquement ou owner club
}

POST /api/exercises/:id/share
# Partage exercice avec le club
```

### Sessions

```http
GET /api/sessions
POST /api/sessions
{
  "name": "Entraînement U15",
  "date": "2025-09-15T18:00:00Z",
  "duration": 90,
  "description": "Séance technique et physique",
  "objectives": ["Améliorer les passes", "Condition physique"],
  "exerciseIds": ["ex1", "ex2", "ex3"]  // Exercices avec ordre automatique
}
```

### Favoris

```http
GET /api/user/favorites/exercises
POST /api/user/favorites/exercises
{
  "exerciseId": "cuid..."
}
DELETE /api/user/favorites/exercises/:exerciseId
```

### Uploads AWS S3

```http
POST /api/uploads/presigned-url
{
  "filename": "exercise-diagram.jpg",
  "contentType": "image/jpeg"
}

# Réponse
{
  "uploadUrl": "https://s3.amazonaws.com/...",
  "fileUrl": "https://cdn.exersio.com/...",
  "key": "uploads/2025/09/..."
}
```

### Codes d'Erreur Standards

| Code | Description | Exemple |
|------|-------------|---------|
| `400` | Validation failed | Champ requis manquant |
| `401` | Unauthorized | Token JWT invalide/expiré |
| `403` | Forbidden | Pas les permissions |
| `404` | Not Found | Ressource inexistante |
| `409` | Conflict | Email déjà utilisé |
| `500` | Server Error | Erreur base de données |

---

## ⚙️ Services et Logique Métier

### AuthService - Authentification Sécurisée

```typescript
@Injectable()
export class AuthService {
  // Registration avec confirmation email obligatoire
  async register(dto: RegisterDto) {
    // 1. Hash bcrypt avec salt
    const passwordHash = await hash(dto.password, await genSalt(10));
    
    // 2. Token sécurisé crypto.randomBytes()
    const emailVerificationToken = this.generateToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // 3. Créer utilisateur (emailVerified: false)
    const user = await this.prisma.user.create({...});
    
    // 4. Envoyer email de confirmation
    await this.mailService.sendConfirmationEmail(user.email, user.name, token);
    
    // 5. Logger l'inscription
    this.logger.logAuth('User registration', { userId, email, role });
    
    return { message: 'Vérifiez votre email pour activer votre compte' };
  }
  
  // Login avec vérification email obligatoire
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({...});
    
    // Vérifications sécurisées
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!await compare(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.emailVerified) {
      throw new UnauthorizedException('Email not verified. Check your email.');
    }
    
    const token = this.jwt.sign(user, { expiresIn: '7d' });
    this.logger.logAuth('User login successful', { userId, email });
    
    return { user, token, club: user.club };
  }
}
```

### ExercisesService - Logique Métier Complexe

```typescript
@Injectable() 
export class ExercisesService {
  // Permissions granulaires
  async canEdit(exerciseId: string, userId: string): Promise<boolean> {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: { club: true, createdBy: true }
    });
    
    // Créateur peut toujours éditer
    if (exercise.createdById === userId) return true;
    
    // Owner du club peut éditer exercices du club  
    if (exercise.clubId && exercise.club?.ownerId === userId) return true;
    
    return false;
  }
  
  // Recherche avancée avec filtres
  async list(query: any, page: number, limit: number, userId: string) {
    const where = this.buildWhereClause(query, userId);
    
    const [exercises, total] = await Promise.all([
      this.prisma.exercise.findMany({
        where,
        include: { createdBy: { select: { name: true, id: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.exercise.count({ where })
    ]);
    
    return {
      exercises,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
  
  private buildWhereClause(query: any, userId: string) {
    const where: any = {
      OR: [
        { isPublic: true },                    // Exercices publics
        { createdById: userId },               // Mes exercices  
        { club: { users: { some: { id: userId } } } } // Club exercices
      ]
    };
    
    // Filtres dynamiques
    if (query.category) where.category = query.category;
    if (query.sport) where.sport = query.sport;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }
    
    return where;
  }
}
```

### MailService - Emails Professionnels

```typescript
@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  
  constructor() {
    // Auto-configuration : SMTP prod ou Ethereal test
    this.createTransporter();
  }
  
  async sendConfirmationEmail(email: string, name: string, token: string) {
    const confirmationUrl = `${FRONTEND_URL}/?token=${token}`;
    const html = this.generateConfirmationEmailHtml(name, confirmationUrl);
    
    const success = await this.sendEmail({
      to: email,
      subject: '🎯 Confirmez votre compte Exersio', 
      html
    });
    
    // Log spécialisé
    this.logger.logEmail('Confirmation email sent', {
      to: email, 
      success,
      provider: this.isTestMode ? 'Ethereal' : 'Production'
    });
    
    return success;
  }
  
  private generateConfirmationEmailHtml(name: string, url: string): string {
    // Template HTML professionnel avec CSS inline
    // Responsive, design moderne, branding Exersio
    return `<!DOCTYPE html>...`;
  }
}
```

### Algorithmes et Logique Complexe

#### Système de Permissions à Plusieurs Niveaux
```typescript
// Matrice de permissions
enum Permission {
  READ = 'read',
  EDIT = 'edit', 
  DELETE = 'delete',
  SHARE = 'share',
  ADMIN = 'admin'
}

class PermissionMatrix {
  private static rules = {
    exercise: {
      [Permission.READ]: ['creator', 'club_member', 'public'],
      [Permission.EDIT]: ['creator', 'club_owner'],
      [Permission.DELETE]: ['creator'],
      [Permission.SHARE]: ['creator', 'club_owner'],
    },
    session: {
      [Permission.READ]: ['creator', 'club_member'],
      [Permission.EDIT]: ['creator'],
      [Permission.DELETE]: ['creator', 'club_owner'],
    }
  };
}
```

#### Algorithme de Scoring et Recommandations
```typescript
// Score de pertinence pour recommandations d'exercices
calculateRelevanceScore(exercise: Exercise, userProfile: UserProfile): number {
  let score = 0;
  
  // Sport matching (poids: 40%)
  if (exercise.sport === userProfile.primarySport) score += 40;
  
  // Catégorie d'âge (poids: 25%)  
  if (exercise.ageCategory === userProfile.ageCategory) score += 25;
  
  // Niveau (poids: 20%)
  if (exercise.level === userProfile.level) score += 20;
  
  // Popularité dans le club (poids: 15%)
  score += Math.min(15, exercise.favoriteCount / userProfile.club.memberCount * 15);
  
  return Math.min(100, score);
}
```

---

## 🏛️ Infrastructure

### Configuration Environnements

#### Variables d'Environnement

```bash
# .env.development
NODE_ENV=development
PORT=3000

# Base de données
DATABASE_URL="postgresql://user:pass@localhost:5432/exersio_dev"

# JWT
JWT_SECRET="super-secret-key-change-in-production"

# Email (Ethereal auto en dev si vide)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587  
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM="Exersio <noreply@exersio.app>"

# Frontend  
FRONTEND_URL=http://localhost:5173

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=eu-west-3
AWS_S3_BUCKET=exersio-uploads

# Logging
LOG_LEVEL=debug
LOG_DIR=logs
```

```bash
# .env.production  
NODE_ENV=production
DATABASE_URL="postgresql://..."

# Sécurité renforcée
JWT_SECRET="complex-random-secret-256-bits"
BCRYPT_ROUNDS=12

# SMTP Production (Gmail/SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASSWORD=SG.real-sendgrid-api-key

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=https://...
```

### Logging Winston Professionnel

```typescript
// Structure des logs spécialisés
class CustomLoggerService {
  private winston: winston.Logger;
  
  constructor() {
    // Transport avec rotation quotidienne
    this.winston = winston.createLogger({
      transports: [
        // Console pour dev
        new winston.transports.Console(),
        
        // Fichiers avec rotation (production)
        new DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',    // Tous logs
          maxSize: '20m',
          maxFiles: '14d'
        }),
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',      // Erreurs uniquement
          level: 'error',
          maxFiles: '30d'
        }),
        new DailyRotateFile({
          filename: 'logs/auth-%DATE%.log',       // Authentification
          format: winston.format((info) => 
            info.category === 'auth' ? info : false
          )()
        }),
        new DailyRotateFile({
          filename: 'logs/email-%DATE%.log',      // Emails envoyés
          format: winston.format((info) => 
            info.category === 'email' ? info : false
          )()
        })
      ]
    });
  }
  
  // Méthodes spécialisées
  logAuth(event: string, context: LogContext, success = true) {
    this.winston.info(`AUTH: ${event}`, {
      category: 'auth',
      success,
      timestamp: new Date().toISOString(),
      ...context
    });
  }
  
  logEmail(event: string, context: EmailContext, success = true) {
    this.winston.info(`EMAIL: ${event}`, {
      category: 'email', 
      success,
      ...context
    });
  }
}
```

### Intercepteur HTTP Automatique

```typescript
// Logging automatique de toutes les requêtes
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest();
    const requestId = this.generateRequestId();
    
    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          
          // Log chaque requête avec contexte complet
          this.logger.logRequest({
            requestId,
            method: request.method,
            url: request.url,
            statusCode: response.statusCode,
            responseTime,
            ip: this.getClientIP(request),
            userAgent: request.get('User-Agent'),
            userId: request.user?.id
          });
          
          // Alertes performance (>1000ms)
          if (responseTime > 1000) {
            this.logger.logPerformance(`${method} ${url}`, responseTime, {
              requestId,
              userId: request.user?.id
            });
          }
        },
        error: (error) => {
          // Log erreurs avec stack trace
          this.logger.error(`Request failed: ${method} ${url}`, 
            error.stack, 'HTTP', { requestId, statusCode: error.status }
          );
        }
      })
    );
  }
}
```

### Upload AWS S3

```typescript
@Injectable()
export class UploadsService {
  private s3Client: S3Client;
  
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: fromEnv() // Utilise variables d'env
    });
  }
  
  // URL pré-signée pour upload direct navigateur -> S3
  async generatePresignedUrl(filename: string, contentType: string) {
    const key = `uploads/${new Date().getFullYear()}/${Date.now()}-${filename}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: contentType,
      Metadata: { uploadedBy: 'exersio-app' }
    });
    
    const uploadUrl = await getSignedUrl(this.s3Client, command, { 
      expiresIn: 3600 // 1h
    });
    
    return {
      uploadUrl,
      fileUrl: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`,
      key
    };
  }
}
```

---

## 🔒 Sécurité

### Authentification JWT

```typescript
// Configuration JWT sécurisée
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,          // Vérifier expiration
      secretOrKey: configService.get('JWT_SECRET'),
      algorithms: ['HS256']             // Algorithme spécifique
    });
  }
  
  async validate(payload: any) {
    // Validation supplémentaire du token
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id }
    });
    
    if (!user || !user.emailVerified) {
      throw new UnauthorizedException('Invalid token');
    }
    
    return { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    };
  }
}
```

### Hachage Mots de Passe

```typescript
// Bcrypt avec salt fort
export class PasswordService {
  private static readonly SALT_ROUNDS = 12; // Production
  
  static async hash(password: string): Promise<string> {
    const salt = await genSalt(this.SALT_ROUNDS);
    return hash(password, salt);
  }
  
  static async verify(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  }
}
```

### Tokens Sécurisés

```typescript
// Génération tokens crypto sécurisés
export class TokenService {
  static generateSecureToken(length = 32): string {
    return randomBytes(length).toString('hex');
  }
  
  static generateEmailToken(): {token: string, expires: Date} {
    return {
      token: this.generateSecureToken(),
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
    };
  }
  
  static generatePasswordResetToken(): {token: string, expires: Date} {
    return {
      token: this.generateSecureToken(),
      expires: new Date(Date.now() + 60 * 60 * 1000) // 1h
    };
  }
}
```

### Validation et Sanitization

```typescript
// DTOs avec validation stricte
export class CreateExerciseDto {
  @IsString()
  @Length(3, 100)
  @IsNotEmpty()
  name: string;
  
  @IsString()
  @Length(10, 2000)
  description: string;
  
  @IsInt()
  @Min(1)
  @Max(300)
  duration: number;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstructionDto)
  instructions: InstructionDto[];
  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SuccessCriteriaDto)
  successCriteria?: SuccessCriteriaDto[];
}
```

### Headers de Sécurité

```typescript
// Configuration helmet dans main.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://s3.amazonaws.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### CORS Configuration

```typescript
// CORS restrictif pour production
app.enableCors({
  origin: [
    'http://localhost:5173',        // Dev frontend
    'http://192.168.0.110:5173',    // Mobile dev
    'https://app.exersio.com',      // Production
    'capacitor://localhost'         // App mobile
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
```

---

## 🚀 Déploiement et Monitoring

### Health Checks

```typescript
// Endpoint santé système
app.getHttpAdapter().getInstance().get('/health', async (req, res) => {
  try {
    // Test connexion base de données
    await this.prisma.$queryRaw`SELECT 1`;
    
    // Test service email
    const emailHealthy = await this.mailService.testConnection();
    
    // Test AWS S3  
    const s3Healthy = await this.uploadsService.testConnection();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        email: emailHealthy ? 'healthy' : 'degraded',
        storage: s3Healthy ? 'healthy' : 'degraded'
      },
      version: process.env.npm_package_version
    });
  } catch (error) {
    res.status(503).json({
      status: 'error', 
      error: error.message
    });
  }
});
```

### Métriques et Monitoring

```typescript
// Service de métriques personnalisé
@Injectable()
export class MetricsService {
  private metrics = {
    totalRequests: 0,
    errorCount: 0,
    averageResponseTime: 0,
    activeUsers: new Set(),
    exercisesCreated: 0,
    sessionsPlanned: 0
  };
  
  recordRequest(responseTime: number, statusCode: number, userId?: string) {
    this.metrics.totalRequests++;
    
    if (statusCode >= 400) {
      this.metrics.errorCount++;
    }
    
    // Calcul moyenne mobile
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * 0.95) + (responseTime * 0.05);
    
    if (userId) {
      this.metrics.activeUsers.add(userId);
    }
    
    // Log métriques périodiquement
    if (this.metrics.totalRequests % 100 === 0) {
      this.logger.logPerformance('Metrics snapshot', 0, {
        totalRequests: this.metrics.totalRequests,
        errorRate: this.metrics.errorCount / this.metrics.totalRequests,
        averageResponseTime: this.metrics.averageResponseTime,
        activeUsers: this.metrics.activeUsers.size
      });
    }
  }
}
```

### Troubleshooting Commun

#### Problèmes Fréquents

1. **Erreur connexion base de données**
```bash
# Vérifier connexion PostgreSQL
psql $DATABASE_URL -c "SELECT version();"

# Logs Prisma pour débug
LOG_LEVEL=debug npm run start:dev
```

2. **JWT Token Invalid**
```typescript
// Vérifier secret JWT en cours d'utilisation
console.log('JWT Secret:', process.env.JWT_SECRET?.substring(0, 10) + '...');

// Token expiré - vérifier durée
const payload = jwt.verify(token, secret);
console.log('Token expires:', new Date(payload.exp * 1000));
```

3. **Emails non envoyés**
```bash
# Test configuration SMTP
curl -I telnet://${SMTP_HOST}:${SMTP_PORT}

# Vérifier logs email spécialisés  
tail -f logs/email-$(date +%Y-%m-%d).log
```

4. **Upload S3 échoue**
```typescript
// Test credentials AWS
const { GetCallerIdentityCommand, STSClient } = require('@aws-sdk/client-sts');
const client = new STSClient({ region: 'eu-west-3' });
const response = await client.send(new GetCallerIdentityCommand());
console.log('AWS Identity:', response);
```

### Performance Tuning

```typescript
// Optimisations base de données
class DatabaseOptimizations {
  // Index composite pour requêtes complexes
  static async createIndexes() {
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS 
      idx_exercise_search ON "Exercise" 
      USING GIN (to_tsvector('french', name || ' ' || description));
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_session_date_status 
      ON "Session" (date DESC, status) 
      WHERE status IN ('planned', 'in_progress');
    `;
  }
  
  // Connection pooling
  static configurePrisma() {
    return new PrismaClient({
      datasources: {
        db: {
          url: `${DATABASE_URL}?connection_limit=10&pool_timeout=20`
        }
      }
    });
  }
}
```

### Variables d'Environnement Complètes

```bash
# Production Environment Variables
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="postgresql://user:password@db-host:5432/exersio_prod?connection_limit=10"

# Security  
JWT_SECRET="your-256-bit-secret-key-change-this-in-production"
BCRYPT_ROUNDS=12

# Email Service (SendGrid recommended)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-sendgrid-api-key
SMTP_FROM="Exersio <noreply@exersio.app>"

# Frontend URLs
FRONTEND_URL=https://app.exersio.com

# AWS Storage
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE  
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=eu-west-3
AWS_S3_BUCKET=exersio-production-uploads

# Logging & Monitoring
LOG_LEVEL=warn
LOG_DIR=/var/log/exersio
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Performance
REDIS_URL=redis://redis-host:6379/0  # Pour cache (optionnel)
```

---

## 📚 Documentation API Swagger

Swagger UI disponible en développement : http://localhost:3000/api/docs

```typescript
// Configuration Swagger complète
const config = new DocumentBuilder()
  .setTitle('Exersio API')
  .setDescription(`
    API REST complète pour Exersio - Plateforme d'entraînement sportif
    
    ## Authentification
    Utilisez Bearer Token JWT dans l'header Authorization
    
    ## Rate Limiting  
    100 requêtes/minute par utilisateur authentifié
    
    ## Pagination
    Endpoints de liste supportent ?page=1&limit=10
  `)
  .setVersion('0.3.0')
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer', 
    bearerFormat: 'JWT'
  })
  .addServer('http://localhost:3000/api', 'Development')
  .addServer('https://api.exersio.com/api', 'Production')
  .build();
```

---

*Documentation générée automatiquement - Dernière mise à jour: 01/09/2025*  
*Pour contribuer : Lire la documentation en équipe et maintenir à jour avec les évolutions*