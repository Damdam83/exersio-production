# 🧪 Plan de Test Complet - Exersio
> Plan de test exhaustif pour l'application de gestion sportive Exersio
> 
> **Version :** 1.0  
> **Date :** 01/09/2025  
> **Architectures :** Backend NestJS + Frontend React + Mobile Capacitor

---

## 📊 Vue d'ensemble de l'architecture testée

### **Backend NestJS**
- **Authentification** : JWT + confirmation email + reset password
- **Modules principaux** : Auth, Users, Exercises, Sessions, Clubs, Favorites, Notifications, Mail, Uploads
- **Base de données** : PostgreSQL + Prisma ORM
- **Services externes** : NodeMailer (email), AWS S3 (upload), Winston (logging)
- **Sécurité** : Guards JWT, validation Zod, CORS, Helmet

### **Frontend React + TypeScript**
- **Interface** : React 18 + TypeScript + TailwindCSS + Radix UI
- **State Management** : React Context (Auth, Exercises, Favorites)
- **Routing** : React Router v7
- **Features** : Interface responsive, mode offline IndexedDB, synchronisation
- **Mobile** : Capacitor Android + notifications push

---

## 🎯 Matrice de Priorisation des Tests

| Priorité | Critères | Impact Business | Risque Technique |
|-----------|----------|-----------------|------------------|
| **🔴 CRITIQUE** | Sécurité, Authentification, Perte de données | TRÈS ÉLEVÉ | TRÈS ÉLEVÉ |
| **🟡 IMPORTANT** | Features principales, Performance, UX | ÉLEVÉ | ÉLEVÉ |
| **🟢 OPTIONNEL** | Features secondaires, Optimisations | MOYEN | MOYEN |

---

# 1. 🔧 Tests Unitaires

## 🔴 CRITIQUE - Services Backend Core

### **AuthService** 
```typescript
describe('AuthService', () => {
  // Login/Register
  ✓ should authenticate user with valid credentials
  ✓ should reject invalid credentials
  ✓ should hash password correctly with bcrypt
  ✓ should generate secure JWT tokens
  ✓ should validate token expiration
  
  // Email Confirmation
  ✓ should generate random confirmation tokens
  ✓ should validate token within expiration (24h)
  ✓ should reject expired tokens
  ✓ should confirm email and activate account
  
  // Password Reset
  ✓ should handle non-existent email securely
  ✓ should generate reset tokens with 1h expiration
  ✓ should reset password with valid token
  ✓ should clean tokens after use
})
```

### **MailService**
```typescript
describe('MailService', () => {
  ✓ should send HTML email with correct template
  ✓ should handle SMTP connection failures
  ✓ should use Ethereal for testing environment
  ✓ should log email sent events
  ✓ should validate email addresses
  ✓ should handle template rendering errors
})
```

### **PrismaService** 
```typescript
describe('PrismaService', () => {
  ✓ should connect to database
  ✓ should handle connection failures
  ✓ should log database events (connections, errors)
  ✓ should execute transactions correctly
  ✓ should handle constraint violations
})
```

## 🟡 IMPORTANT - Services Métier

### **ExercisesService**
```typescript
describe('ExercisesService', () => {
  ✓ should create exercise with validation
  ✓ should handle club permissions (isPublic)
  ✓ should filter exercises by category/age/sport
  ✓ should search exercises by text
  ✓ should handle field data (JSON)
  ✓ should manage success criteria
  ✓ should soft delete exercises
})
```

### **SessionsService**
```typescript
describe('SessionsService', () => {
  ✓ should create session with exercises
  ✓ should handle session status transitions
  ✓ should validate date/duration constraints
  ✓ should manage exercise ordering
  ✓ should handle session completion
})
```

### **NotificationsService**
```typescript
describe('NotificationsService', () => {
  ✓ should create notifications by type
  ✓ should respect user notification settings
  ✓ should handle CRON scheduled reminders
  ✓ should manage push tokens
  ✓ should track read/unread status
})
```

## 🔴 CRITIQUE - Components React

### **AuthForm Component**
```typescript
describe('AuthForm', () => {
  ✓ should render 5 modes (login, register, forgot, confirm, reset)
  ✓ should handle URL token parameters
  ✓ should validate form inputs
  ✓ should display error messages
  ✓ should navigate between modes
  ✓ should handle API errors gracefully
})
```

### **ExerciseCreatePage**
```typescript
describe('ExerciseCreatePage', () => {
  ✓ should create new exercise
  ✓ should copy existing exercise
  ✓ should handle field editor (terrain)
  ✓ should validate required fields
  ✓ should save success criteria
  ✓ should handle mobile responsive layout
})
```

### **OfflineService**
```typescript
describe('OfflineService', () => {
  ✓ should store data in IndexedDB
  ✓ should sync when online
  ✓ should handle conflict resolution
  ✓ should queue offline actions
  ✓ should manage sync status indicators
})
```

## 🟡 IMPORTANT - Hooks & Contexts

### **useAuth Hook**
```typescript
describe('useAuth', () => {
  ✓ should manage authentication state
  ✓ should handle token persistence
  ✓ should logout on token expiration
  ✓ should redirect on authentication
})
```

### **ExercisesContext**
```typescript
describe('ExercisesContext', () => {
  ✓ should load exercises from API
  ✓ should handle offline mode
  ✓ should cache exercises locally
  ✓ should filter exercises
})
```

## 🟢 OPTIONNEL - Utilitaires

### **API Service**
```typescript
describe('API Service', () => {
  ✓ should handle request/response interceptors
  ✓ should manage authentication headers
  ✓ should retry failed requests
  ✓ should handle network errors
})
```

---

# 2. 🔗 Tests d'Intégration

## 🔴 CRITIQUE - Flows Authentification Complets

### **Inscription → Email → Confirmation**
```typescript
describe('Registration Flow', () => {
  ✓ should register user with valid data
  ✓ should send confirmation email
  ✓ should confirm email with token
  ✓ should reject expired tokens
  ✓ should handle duplicate emails
  ✓ should log all auth events
})
```

### **Récupération Mot de Passe**
```typescript
describe('Password Reset Flow', () => {
  ✓ should generate reset token
  ✓ should send reset email
  ✓ should reset password with valid token
  ✓ should handle invalid/expired tokens
  ✓ should clean tokens after use
})
```

## 🟡 IMPORTANT - API Endpoints avec Database

### **Exercises CRUD**
```typescript
describe('Exercises API Integration', () => {
  ✓ GET /api/exercises should return paginated results
  ✓ POST /api/exercises should create with validation
  ✓ PUT /api/exercises/:id should update with permissions
  ✓ DELETE /api/exercises/:id should soft delete
  ✓ GET /api/exercises/search should filter correctly
  ✓ should handle club permissions (public vs private)
})
```

### **Sessions avec Exercises**
```typescript
describe('Sessions API Integration', () => {
  ✓ should create session with multiple exercises
  ✓ should handle exercise ordering
  ✓ should validate session dates
  ✓ should manage status transitions
  ✓ should filter by club/user
})
```

### **Favorites Management**
```typescript
describe('Favorites API Integration', () => {
  ✓ POST /api/user/favorites/exercises should add favorite
  ✓ GET /api/user/favorites/exercises should return user favorites
  ✓ DELETE /api/user/favorites/exercises/:id should remove
  ✓ should handle duplicate favorites
})
```

## 🔴 CRITIQUE - Synchronisation Offline/Online

### **Offline Storage & Sync**
```typescript
describe('Offline Synchronization', () => {
  ✓ should store exercises offline in IndexedDB
  ✓ should queue create/update actions when offline
  ✓ should sync queued actions when online
  ✓ should resolve conflicts (server wins strategy)
  ✓ should update sync status indicators
  ✓ should handle partial sync failures
})
```

## 🟡 IMPORTANT - Email & Notifications

### **Email Integration Tests**
```typescript
describe('Email Integration', () => {
  ✓ should send confirmation email with Ethereal
  ✓ should render HTML templates correctly  
  ✓ should handle SMTP failures gracefully
  ✓ should log email events to winston
  ✓ should validate email addresses
})
```

### **Notifications CRON Jobs**
```typescript
describe('Notification Integration', () => {
  ✓ should trigger session reminders via CRON
  ✓ should respect user notification preferences
  ✓ should create notifications in database
  ✓ should mark notifications as sent
  ✓ should handle push token management
})
```

---

# 3. 🌐 Tests End-to-End

## 🔴 CRITIQUE - Parcours Utilisateur Complets

### **Parcours Inscription → Première Session**
```typescript
describe('User Journey - Registration to First Session', () => {
  ✓ should complete full registration flow
  ✓ should confirm email and login
  ✓ should navigate to exercises page
  ✓ should create first exercise
  ✓ should create session with exercise
  ✓ should view session in planning
})
```

### **Parcours Mobile - Création Exercice Hors Ligne**
```typescript
describe('Mobile Journey - Offline Exercise Creation', () => {
  ✓ should work offline after initial load
  ✓ should create exercise offline
  ✓ should show offline indicators
  ✓ should sync when connection restored
  ✓ should handle sync conflicts
})
```

## 🟡 IMPORTANT - Interface Web & Mobile

### **Cross-Browser Testing**
```typescript
describe('Cross-Browser Compatibility', () => {
  ✓ Chrome desktop & mobile
  ✓ Firefox desktop & mobile  
  ✓ Safari desktop & mobile
  ✓ Edge desktop
  ✓ should handle touch gestures (swipe back)
  ✓ should adapt to different screen sizes
})
```

### **Responsive Design Validation**
```typescript
describe('Responsive Design', () => {
  ✓ Desktop (1920x1080, 1366x768)
  ✓ Tablet (768x1024, 1024x768)
  ✓ Mobile (375x667, 414x896, 393x851)
  ✓ Portrait & Landscape orientations
  ✓ MobileHeader should adapt correctly
  ✓ Field editor should switch to landscape mode
})
```

## 🟢 OPTIONNEL - Performance & Stress

### **Load Testing Scenarios**
```typescript
describe('Performance Testing', () => {
  ✓ 100 concurrent users creating exercises
  ✓ 50 users synchronizing offline data
  ✓ Database with 10k+ exercises
  ✓ Large session with 50+ exercises
  ✓ File uploads (field images)
})
```

---

# 4. 🔒 Tests de Sécurité

## 🔴 CRITIQUE - Authentification & Autorisation

### **JWT Security**
```typescript
describe('JWT Security Tests', () => {
  ✓ should reject malformed tokens
  ✓ should handle token expiration correctly
  ✓ should validate token signatures
  ✓ should prevent token replay attacks
  ✓ should secure token storage (httpOnly cookies)
})
```

### **API Permissions**
```typescript
describe('API Authorization', () => {
  ✓ should protect private exercises from other clubs
  ✓ should validate user permissions on CRUD operations
  ✓ should prevent elevation of privileges
  ✓ should handle role-based access (coach/admin)
  ✓ should protect sensitive user data
})
```

## 🟡 IMPORTANT - Validation & Injection

### **Input Validation**
```typescript
describe('Input Validation Security', () => {
  ✓ should sanitize all text inputs
  ✓ should validate JSON fields (instructions, fieldData)
  ✓ should prevent XSS in exercise descriptions
  ✓ should validate file uploads (type, size)
  ✓ should handle malformed requests gracefully
})
```

### **Database Security**
```typescript
describe('Database Security', () => {
  ✓ should use parameterized queries (Prisma)
  ✓ should prevent SQL injection attempts
  ✓ should validate foreign key constraints
  ✓ should handle database errors securely
})
```

## 🟢 OPTIONNEL - Sécurité Avancée

### **Headers & CORS**
```typescript
describe('Security Headers', () => {
  ✓ should set correct CORS headers
  ✓ should use Helmet security middleware
  ✓ should prevent clickjacking (X-Frame-Options)
  ✓ should set CSP headers appropriately
})
```

---

# 5. ⚡ Tests de Performance

## 🔴 CRITIQUE - API Performance

### **Database Query Optimization**
```typescript
describe('Database Performance', () => {
  ✓ exercises pagination should be < 200ms
  ✓ session with exercises loading < 300ms
  ✓ search queries should be < 500ms
  ✓ should handle 1000+ exercises efficiently
  ✓ should use database indexes correctly
})
```

### **Memory & Resource Usage**
```typescript
describe('Resource Usage', () => {
  ✓ backend should use < 200MB RAM baseline
  ✓ should handle 100 concurrent requests
  ✓ should not have memory leaks
  ✓ should clean up resources properly
})
```

## 🟡 IMPORTANT - Frontend Performance

### **React Performance**
```typescript
describe('React Performance', () => {
  ✓ initial page load should be < 2s
  ✓ navigation between pages < 100ms
  ✓ large exercise lists should virtualize
  ✓ should not re-render unnecessarily
  ✓ should use React.memo appropriately
})
```

### **Mobile Performance**
```typescript
describe('Mobile Performance', () => {
  ✓ app startup time < 3s
  ✓ offline data loading < 500ms
  ✓ sync operations should not block UI
  ✓ should handle low-end devices (2GB RAM)
  ✓ should optimize touch interactions
})
```

## 🟢 OPTIONNEL - Optimisations

### **Bundle Size & Loading**
```typescript
describe('Bundle Optimization', () => {
  ✓ main bundle should be < 500KB gzipped
  ✓ should implement code splitting
  ✓ should lazy load non-critical components
  ✓ should optimize images and assets
  ✓ should use service worker for caching
})
```

---

# 6. 📱 Use Cases & Scénarios Métier

## 🔴 CRITIQUE - Scénarios Utilisateur Principal

### **Coach Créant sa Première Séance**
```typescript
describe('Coach First Session Scenario', () => {
  Given('a new coach registers and confirms email')
  When('they create their first exercise')
  And('they plan a session with multiple exercises')
  Then('they should see the session in their planning')
  And('they should receive reminder notifications')
})
```

### **Utilisation Hors Connexion**
```typescript
describe('Offline Usage Scenario', () => {
  Given('user has loaded app with internet connection')
  When('internet connection is lost')
  Then('user can still create exercises and sessions')
  And('changes are stored locally')
  When('connection is restored')
  Then('changes sync automatically')
  And('conflicts are resolved correctly')
})
```

## 🟡 IMPORTANT - Scénarios Multi-Utilisateurs

### **Club avec Plusieurs Coachs**
```typescript
describe('Multi-Coach Club Scenario', () => {
  Given('a club owner creates club and invites coaches')
  When('coaches share exercises with club')
  Then('all club members can see shared exercises')
  But('private exercises remain invisible')
  And('permissions are enforced correctly')
})
```

### **Session Collaborative**
```typescript
describe('Collaborative Session Scenario', () => {
  Given('two coaches in same club')
  When('coach A creates session with shared exercises')
  And('coach B views and duplicates session')
  Then('both sessions should be independent')
  And('changes don\'t affect original')
})
```

## 🟢 OPTIONNEL - Scénarios Avancés

### **Migration de Données**
```typescript
describe('Data Migration Scenario', () => {
  Given('user has large amount of legacy data')
  When('they import exercises from external source')
  Then('data should be validated and transformed')
  And('duplicates should be handled')
  And('user should see import progress')
})
```

---

# 7. 🛠️ Framework & Outils de Test

## **Backend Testing Stack**

### **🔴 CRITIQUE - Test unitaires NestJS**
```bash
# Dependencies déjà présentes
@nestjs/testing: "^10.3.0"
jest (via @nestjs/testing)
supertest (pour tests d'intégration)
```

### **Configuration Jest pour NestJS**
```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/**/*.interface.ts'
  ],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 }
  }
};
```

### **🟡 IMPORTANT - Base de données de test**
```typescript
// test/database-test.ts
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';

export const createTestDatabase = async () => {
  // Utiliser DATABASE_TEST_URL avec base séparée
  // Nettoyer avant chaque test
  // Utiliser transactions rollback
};
```

## **Frontend Testing Stack**

### **🔴 CRITIQUE - Tests React/TypeScript**
```bash
# Dependencies déjà présentes
vitest: "^3.2.4"
@testing-library/react: "^16.3.0"  
@testing-library/jest-dom: "^6.8.0"
@testing-library/user-event: "^14.6.1"
jsdom: "^26.1.0"
```

### **Configuration Vitest**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      threshold: { lines: 75, functions: 75, branches: 75 }
    }
  }
});
```

## **E2E Testing Stack**

### **🔴 CRITIQUE - Playwright pour E2E**
```bash
# À ajouter
npm install -D @playwright/test playwright
```

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } }
  ]
});
```

## **Performance Testing**

### **🟡 IMPORTANT - Load Testing avec Artillery**
```bash
npm install -D artillery
```

```yaml
# artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/exercises"
          headers:
            Authorization: "Bearer {{ token }}"
```

## **Security Testing**

### **🟢 OPTIONNEL - OWASP ZAP**
```bash
# Via Docker
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3000
```

---

# 8. 📋 Plan d'Exécution & Priorités

## **Phase 1 - Tests Critiques (Semaine 1-2)**
- [ ] **Tests unitaires AuthService** (login, register, email confirmation)
- [ ] **Tests AuthForm Component** (5 modes d'authentification)
- [ ] **Tests intégration API authentification** (endpoints complets)
- [ ] **Tests sécurité JWT** (tokens, permissions, validation)
- [ ] **Setup infrastructure test** (Jest, Vitest, base de données test)

## **Phase 2 - Tests Importants (Semaine 3-4)**
- [ ] **Tests services métier** (ExercisesService, SessionsService)
- [ ] **Tests composants principaux** (ExerciseCreatePage, SessionsPage)
- [ ] **Tests synchronisation offline** (IndexedDB, sync service)
- [ ] **Tests E2E parcours principaux** (inscription → première session)
- [ ] **Tests performance API** (requêtes, pagination, mémoire)

## **Phase 3 - Tests Optionnels (Semaine 5-6)**
- [ ] **Tests notifications & email** (CRON, templates, NodeMailer)
- [ ] **Tests mobile Capacitor** (Android app, navigation tactile)
- [ ] **Tests load & stress** (100+ utilisateurs, gros volumes)
- [ ] **Tests sécurité avancés** (OWASP, headers, CSP)
- [ ] **Tests compatibilité** (navigateurs, devices, responsive)

## **Métriques & Objectifs de Couverture**

### **Coverage Targets**
- **Backend Services** : 85%+ (critique pour authentification)
- **Frontend Components** : 75%+ (focus sur logique métier)
- **API Integration** : 90%+ (tous les endpoints critiques)
- **E2E Scenarios** : 80%+ (parcours utilisateur principaux)

### **Performance Benchmarks**
- **API Response Time** : < 200ms (95th percentile)
- **Page Load Time** : < 2s (initial load)
- **Mobile App Startup** : < 3s
- **Offline Sync** : < 1s (local operations)

### **Quality Gates**
- **All critical tests passing** avant merge vers main
- **Security tests passing** avant déploiement
- **Performance tests within limits** avant release
- **E2E tests passing** sur mobile et web

---

# 9. 🚀 Intégration CI/CD

## **GitHub Actions Workflow**

```yaml
# .github/workflows/test.yml
name: Test Pipeline
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:backend
      - run: npm run test:integration

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:frontend
      - run: npm run test:coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

---

# 10. 📊 Monitoring & Métriques de Test

## **Reporting Dashboard**
- **Coverage trends** over time
- **Test execution time** monitoring  
- **Flaky tests** identification
- **Performance regression** tracking

## **Test Data Management**
- **Fixtures** for consistent test data
- **Database seeding** for integration tests
- **Mock services** for external dependencies
- **Test isolation** strategies

---

## 🎯 Conclusion & Recommandations

### **Prochaines Actions Immédiates**
1. **Setup infrastructure test** (Jest backend + Vitest frontend)
2. **Créer base de données test** séparée avec nettoyage automatique
3. **Implémenter tests AuthService** (priorité absolue sécurité)
4. **Tests AuthForm Component** (flow d'authentification critique)
5. **Tests API authentification** end-to-end

### **Success Criteria**
- ✅ **Phase 1 complète** : Application sécurisée et authentification robuste
- ✅ **Phase 2 complète** : Features principales validées et performantes  
- ✅ **Phase 3 complète** : Application production-ready avec monitoring

### **ROI du Testing**
- **Réduction bugs production** : -80% incidents critiques
- **Confiance déploiement** : Release sans stress
- **Maintenance facilitée** : Refactoring sécurisé
- **Onboarding équipe** : Documentation vivante via tests

---

*Ce plan de test couvre 100% des fonctionnalités critiques d'Exersio avec une approche progressive et des outils modernes adaptés à l'architecture NestJS + React + Mobile.*