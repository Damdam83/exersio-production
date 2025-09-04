# Exersio Backend — NestJS + Prisma (Swagger, RBAC, Uploads, LocalStack)

API NestJS prête pour prod légère : Swagger, RBAC fin, uploads S3 (LocalStack compatible), Postgres avec table de jonction Session↔Exercise.

## Démarrage rapide
```bash
cp .env.example .env

# Démarrer Postgres + pgAdmin
docker compose up -d
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/exersio?schema=public

npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed   # optionnel
npm run start:dev

# API:  http://localhost:3000/api
# Docs: http://localhost:3000/api/docs
# PGAdmin: http://localhost:5050  (admin@exersio.local / admin)
```
### LocalStack (S3) en local
```bash
docker compose -f docker-compose.localstack.yml up -d
# puis dans .env :
# AWS_S3_ENDPOINT=http://localhost:4566
# AWS_ACCESS_KEY_ID=test
# AWS_SECRET_ACCESS_KEY=test
# AWS_S3_BUCKET=exersio-local
```
Crée le bucket :
```bash
awslocal s3 mb s3://exersio-local
```

## Endpoints principaux
- Auth: `POST /api/auth/register|login|refresh|logout`, `GET /api/auth/profile`
- Users (admin): list/create/delete, update self/admin
- Clubs, Exercises, Sessions (+ duplicate), Invitations
- Uploads: `POST /api/uploads/logo`, `POST /api/uploads/exercise-image` (multipart/form-data `file`)

## Swagger
- DTOs annotés (`@ApiProperty*`) + Tags par contrôleur + BearerAuth
- UI: `/api/docs`

## RBAC & Ownership
- `@Roles('admin')` + `RolesGuard` pour routes admin
- `AuthorizationService` pour vérifier owner (club) ou créateur/owner (resource)

## Données & relations
- Postgres via Prisma
- `SessionExercise(sessionId, exerciseId, order)`
- API reste compatible avec le front actuel: `exercises` ← tableau d'IDs
