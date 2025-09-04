# Documentation Technique - Frontend Exersio

**Version :** 1.0.0  
**Stack :** React 18 + TypeScript + Vite + TailwindCSS  
**Target :** Développeurs frontend - Compréhension, maintenance et extension  
**Dernière mise à jour :** 01/09/2025

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture React](#architecture-react)
3. [Gestion d'état](#gestion-détat)
4. [Interface utilisateur](#interface-utilisateur)
5. [Mobile et offline](#mobile-et-offline)
6. [Performance et optimisations](#performance-et-optimisations)
7. [Build et déploiement](#build-et-déploiement)
8. [Guides pratiques](#guides-pratiques)

---

## Vue d'ensemble

### Stack technique
- **React 18.3.1** - Framework UI avec Concurrent Features
- **TypeScript 5.3.3** - Typage statique et IntelliSense avancé
- **Vite 5.0.0** - Build tool moderne avec HMR ultra-rapide
- **TailwindCSS 3.4.7** - Utility-first CSS framework
- **Radix UI** - Composants accessibles et primitives headless
- **Capacitor 7.4.3** - Déploiement natif mobile (Android/iOS)

### Architecture générale
```
Frontend React SPA
├── API REST (NestJS Backend)
├── IndexedDB (Mode offline)
├── LocalStorage (Auth tokens, préférences)
└── Capacitor (Fonctionnalités natives)
```

### Flux de données
1. **Server State** → API REST → Context/Hooks → Components
2. **Client State** → React State → Context Providers → Components  
3. **Offline State** → IndexedDB → Sync Service → Context/Hooks

---

## Architecture React

### Structure des dossiers
```
src/
├── components/           # Composants réutilisables
│   ├── ui/              # Design system (shadcn/ui)
│   ├── forms/           # Composants de formulaires
│   ├── layout/          # Layout et navigation
│   └── modals/          # Composants modaux
├── contexts/            # Context API pour l'état global
├── hooks/               # Hooks personnalisés réutilisables
├── services/            # Services API et utilitaires
├── types/               # Types TypeScript globaux
├── utils/               # Fonctions utilitaires
└── App.tsx             # Point d'entrée principal
```

### Patterns architecturaux utilisés

#### 1. Provider Pattern hiérarchique
```typescript
<AppProvider>
  <ErrorProvider>
    <LoadingProvider>
      <AuthProvider>
        <UserProvider>
          <ExercisesProvider>
            {children}
          </ExercisesProvider>
        </UserProvider>
      </AuthProvider>
    </LoadingProvider>
  </ErrorProvider>
</AppProvider>
```

**Avantages :**
- État global structuré par domaine
- Évite le prop drilling
- Facilite les tests unitaires
- Séparation claire des responsabilités

#### 2. Custom Hooks Pattern
```typescript
// Hook personnalisé avec état et actions
export function useExercises() {
  const context = useContext(ExercisesContext);
  if (!context) throw new Error('useExercises must be used within ExercisesProvider');
  return context;
}

// Usage dans un composant
const { state, actions } = useExercises();
```

**Conventions :**
- Préfixe `use` obligatoire
- Retour sous forme `{ state, actions }`
- Validation de contexte avec erreur explicite
- Types TypeScript stricts

#### 3. Compound Component Pattern
```typescript
// Composant composé pour interfaces complexes
<MobileHeader title="Exercices">
  <MobileHeader.BackButton />
  <MobileHeader.Actions>
    <MobileHeader.FilterButton />
    <MobileHeader.AddButton />
  </MobileHeader.Actions>
</MobileHeader>
```

---

## Gestion d'état

### Architecture d'état global

#### 1. Hiérarchie des contexts
```typescript
// Base - État application
AppProvider: {
  currentPage, isMobile, isOnline, notifications
}

// Infrastructure
ErrorProvider: { errors, showError, clearError }
LoadingProvider: { isLoading, loadingStates }

// Authentication
AuthProvider: { user, token, loginState }

// Domaines métier
ExercisesProvider: { exercises, favorites, filters }
SessionsProvider: { sessions, activeSession }
```

#### 2. Pattern State + Actions
```typescript
interface ExercisesState {
  exercises: Exercise[];
  filteredExercises: Exercise[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  selectedTags: string[];
  sortBy: 'name' | 'date' | 'category';
}

interface ExercisesActions {
  loadExercises: () => Promise<void>;
  createExercise: (data: CreateExerciseData) => Promise<Exercise>;
  updateExercise: (id: string, data: UpdateExerciseData) => Promise<Exercise>;
  deleteExercise: (id: string) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setSortBy: (sort: ExercisesState['sortBy']) => void;
}
```

**Principes de design :**
- **État immutable** : Toujours créer de nouveaux objets
- **Actions pures** : Pas d'effets de bord dans les reducers
- **Séparation lecture/écriture** : State en lecture, Actions pour modifications
- **Type safety** : Types stricts pour state et actions

#### 3. Hooks personnalisés avancés

##### useOffline - Gestion mode hors connexion
```typescript
export function useOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingSync, setPendingSync] = useState<SyncItem[]>([]);
  
  return {
    isOffline,
    pendingSync,
    actions: {
      syncPendingItems,
      saveOffline,
      loadFromOffline
    }
  };
}
```

##### useIsMobile - Détection responsive
```typescript
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    // Capacitor détection
    if (window.location.protocol === 'capacitor:') return true;
    // Screen size détection
    if (window.innerWidth <= 768) return true;
    // User agent détection
    return /Mobile|Tablet/i.test(navigator.userAgent);
  });
  
  // Écoute les changements de taille
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile;
}
```

##### useSwipeBack - Navigation tactile
```typescript
export function useSwipeBack({ enabled, minDistance, maxVertical }) {
  const swipeRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!enabled) return;
    
    let startX = 0, startY = 0, isTracking = false;
    
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isTracking = touch.clientX < 50; // Zone de déclenchement
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!isTracking) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = Math.abs(touch.clientY - startY);
      
      if (deltaX > minDistance && deltaY < maxVertical) {
        window.history.back(); // Navigation arrière
      }
    };
    
    // Event listeners setup...
  }, [enabled, minDistance, maxVertical]);
  
  return { swipeRef };
}
```

---

## Interface utilisateur

### Design System Architecture

#### 1. TailwindCSS + Radix UI Strategy
```typescript
// Base: TailwindCSS utilities
<div className="flex items-center justify-between p-4 bg-white border-b">

// Enhanced: Radix primitives + Tailwind
<Dialog.Root>
  <Dialog.Trigger className="btn btn-primary">
  <Dialog.Content className="modal-content">
</Dialog.Root>

// Compound: Custom components + utilities
<MobileHeader className="sticky top-0 z-50 bg-white/95 backdrop-blur">
```

#### 2. Composants réutilisables

##### Button Component avec variants
```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        outline: "border border-gray-300 hover:bg-gray-50",
        ghost: "hover:bg-gray-100"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8"
      }
    }
  }
);

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

##### MobileHeader - Composant unifié
```typescript
interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function MobileHeader({ title, showBack = true, actions, className }: MobileHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className={cn("flex items-center justify-between h-14 px-4 bg-white border-b", className)}>
      <div className="flex items-center">
        {showBack && (
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <h1 className="ml-2 text-lg font-semibold truncate">{title}</h1>
      </div>
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  );
}
```

#### 3. Responsive Design Strategy

##### Mobile-First Approach
```css
/* Base: Mobile styles (default) */
.container { @apply px-4 py-2; }
.text-responsive { @apply text-sm; }

/* Tablet: md breakpoint (768px+) */
.container { @apply md:px-6 md:py-4; }
.text-responsive { @apply md:text-base; }

/* Desktop: lg breakpoint (1024px+) */
.container { @apply lg:px-8 lg:py-6; }
.text-responsive { @apply lg:text-lg; }
```

##### Adaptive Component Rendering
```typescript
export function ExercisesPage() {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <MobileLayout>
        <MobileHeader title="Exercices">
          <FilterButton />
          <AddButton />
        </MobileHeader>
        <ExercisesList />
      </MobileLayout>
    );
  }
  
  return (
    <DesktopLayout>
      <Sidebar />
      <MainContent>
        <FilterBar />
        <ExercisesGrid />
      </MainContent>
    </DesktopLayout>
  );
}
```

---

## Mobile et offline

### Architecture Capacitor

#### 1. Configuration Native
```typescript
// capacitor.config.ts
export default {
  appId: 'com.votrenom.exersio',
  appName: 'Exersio',
  webDir: 'dist',
  server: {
    androidScheme: 'https', // HTTPS obligatoire pour PWA features
    allowNavigation: ['*'], // API calls autorisés
  },
  plugins: {
    SplashScreen: { launchShowDuration: 1000 },
    StatusBar: { style: 'light' },
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] }
  }
};
```

#### 2. Services natifs intégrés
```typescript
// services/notificationService.ts
class NotificationService {
  async initialize(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.requestPermissions();
      await PushNotifications.requestPermissions();
    }
  }
  
  async scheduleLocal(notification: LocalNotification): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({ notifications: [notification] });
    }
  }
}
```

### Mode Offline Architecture

#### 1. IndexedDB Storage Service
```typescript
class OfflineStorageService {
  private dbName = 'ExersioOfflineDB';
  
  async saveExercise(exercise: Exercise, syncStatus: 'pending' | 'synced' = 'pending'): Promise<void> {
    const offlineExercise: OfflineExercise = {
      id: exercise.id,
      data: exercise,
      syncStatus,
      lastModified: Date.now(),
      lastSynced: syncStatus === 'synced' ? Date.now() : undefined
    };
    
    const db = await this.getDB();
    const transaction = db.transaction(['exercises'], 'readwrite');
    await transaction.objectStore('exercises').put(offlineExercise);
  }
  
  async getPendingExercises(): Promise<OfflineExercise[]> {
    const db = await this.getDB();
    const transaction = db.transaction(['exercises'], 'readonly');
    const index = transaction.objectStore('exercises').index('syncStatus');
    return await index.getAll('pending');
  }
}
```

#### 2. Synchronisation bidirectionnelle
```typescript
class SyncService {
  async syncToServer(): Promise<SyncResult> {
    const [pendingExercises, pendingSessions] = await Promise.all([
      offlineStorage.getPendingExercises(),
      offlineStorage.getPendingSessions()
    ]);
    
    const results = await Promise.allSettled([
      ...pendingExercises.map(ex => this.uploadExercise(ex)),
      ...pendingSessions.map(session => this.uploadSession(session))
    ]);
    
    return this.processResults(results);
  }
  
  async syncFromServer(): Promise<void> {
    const lastSync = await offlineStorage.getLastSyncTime() || 0;
    const updates = await api.get('/sync/updates', { since: lastSync });
    
    await Promise.all([
      this.applyExerciseUpdates(updates.exercises),
      this.applySessionUpdates(updates.sessions)
    ]);
    
    await offlineStorage.setLastSyncTime(Date.now());
  }
}
```

#### 3. Integration Context Offline
```typescript
export function ExercisesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(exercisesReducer, initialState);
  const { isOffline } = useOffline();
  
  const actions = useMemo(() => ({
    async loadExercises() {
      if (isOffline) {
        // Mode offline: charger depuis IndexedDB
        const offlineExercises = await offlineStorage.getAllExercises();
        dispatch({ type: 'SET_EXERCISES', payload: offlineExercises.map(ex => ex.data) });
      } else {
        // Mode online: API puis mise en cache
        const exercises = await api.get<Exercise[]>('/exercises');
        dispatch({ type: 'SET_EXERCISES', payload: exercises });
        
        // Sauvegarder en offline pour la prochaine fois
        await Promise.all(exercises.map(ex => 
          offlineStorage.saveExercise(ex, 'synced')
        ));
      }
    },
    
    async createExercise(data: CreateExerciseData) {
      if (isOffline) {
        // Créer un ID temporaire et sauvegarder localement
        const tempId = `temp_${Date.now()}`;
        const exercise: Exercise = { ...data, id: tempId };
        
        await offlineStorage.saveExercise(exercise, 'pending');
        dispatch({ type: 'ADD_EXERCISE', payload: exercise });
        
        return exercise;
      } else {
        const exercise = await api.post<Exercise>('/exercises', data);
        await offlineStorage.saveExercise(exercise, 'synced');
        dispatch({ type: 'ADD_EXERCISE', payload: exercise });
        
        return exercise;
      }
    }
  }), [isOffline]);
  
  return (
    <ExercisesContext.Provider value={{ state, actions }}>
      {children}
    </ExercisesContext.Provider>
  );
}
```

---

## Performance et optimisations

### 1. Bundle Splitting Strategy

#### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select', 'lucide-react'],
          
          // Feature chunks
          'exercises': ['./src/contexts/ExercisesContext', './src/components/ExercisesPage'],
          'sessions': ['./src/contexts/SessionsContext', './src/components/SessionsPage'],
          
          // Mobile-specific
          'mobile': ['@capacitor/core', '@capacitor/android']
        }
      }
    }
  }
});
```

#### Lazy Loading Implementation
```typescript
import { lazy, Suspense } from 'react';

// Code splitting par route
const ExercisesPage = lazy(() => import('./components/ExercisesPage'));
const SessionsPage = lazy(() => import('./components/SessionsPage'));

function AppRoutes() {
  return (
    <Suspense fallback={<DynamicLoader />}>
      <Routes>
        <Route path="/exercises" element={<ExercisesPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. React Optimizations

#### Memoization Strategy
```typescript
// Memoisation des composants lourds
export const ExerciseCard = memo(function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <div className="exercise-card">
      {/* Contenu du composant */}
    </div>
  );
});

// Memoisation des calculs complexes
function ExercisesList({ exercises }: { exercises: Exercise[] }) {
  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => ex.category === selectedCategory)
                   .sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, selectedCategory]);
  
  return (
    <div>
      {filteredExercises.map(exercise => 
        <ExerciseCard key={exercise.id} exercise={exercise} />
      )}
    </div>
  );
}
```

#### Virtual Scrolling pour listes longues
```typescript
import { FixedSizeList as List } from 'react-window';

function VirtualExercisesList({ exercises }: { exercises: Exercise[] }) {
  const Row = useCallback(({ index, style }: { index: number; style: any }) => (
    <div style={style}>
      <ExerciseCard exercise={exercises[index]} />
    </div>
  ), [exercises]);
  
  return (
    <List
      height={600}
      itemCount={exercises.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

### 3. Performance Monitoring

#### Bundle Analyzer Integration
```typescript
// utils/bundleAnalysis.ts
class BundleAnalyzer {
  constructor() {
    if (import.meta.env.DEV) {
      this.initializePerformanceObserver();
    }
  }
  
  private initializePerformanceObserver() {
    // Observer pour les Core Web Vitals
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`Performance: ${entry.name} took ${entry.duration}ms`);
        }
      });
    }).observe({ entryTypes: ['measure', 'navigation'] });
  }
  
  measureComponentRender(componentName: string) {
    performance.mark(`${componentName}-start`);
    
    return () => {
      performance.mark(`${componentName}-end`);
      performance.measure(
        `${componentName}-render`,
        `${componentName}-start`,
        `${componentName}-end`
      );
    };
  }
}
```

---

## Build et déploiement

### 1. Configuration Vite

#### Environnements multiples
```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  
  build: {
    // Production optimizations
    minify: 'terser',
    sourcemap: mode === 'development',
    
    // Build targets
    target: ['es2020', 'chrome80', 'firefox78', 'safari13'],
    
    rollupOptions: {
      output: {
        // Hash pour cache busting
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
  
  server: {
    // Development proxy
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
}));
```

#### Variables d'environnement
```bash
# .env.development
VITE_API_URL=http://localhost:3000/api
VITE_APP_ENV=development
VITE_ENABLE_DEBUG=true

# .env.production
VITE_API_URL=https://api.exersio.com/api
VITE_APP_ENV=production
VITE_ENABLE_DEBUG=false

# .env.mobile
VITE_API_URL=http://192.168.0.110:3000/api
VITE_APP_ENV=mobile
VITE_ENABLE_DEBUG=true
```

### 2. Scripts de déploiement

#### Package.json scripts
```json
{
  "scripts": {
    // Development
    "dev": "vite",
    "dev:mobile": "vite --mode mobile",
    
    // Testing
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    
    // Building
    "build": "vite build",
    "build:analyze": "vite build --mode analyze",
    "preview": "vite preview",
    
    // Mobile deployment
    "mobile:init": "npx cap init exersio com.votrenom.exersio",
    "mobile:add": "npm run build && npx cap add android",
    "mobile:sync": "npm run build && npx cap sync android",
    "mobile:run": "npm run mobile:sync && npx cap run android",
    "mobile:build": "npm run build && npx cap sync android && npx cap build android"
  }
}
```

#### Processus de déploiement mobile
```bash
# 1. Build de production
npm run build

# 2. Synchronisation Capacitor
npx cap sync android

# 3. Ouverture Android Studio
npx cap open android

# 4. Build APK depuis Android Studio
# ou via Gradle CLI
cd android && ./gradlew assembleDebug
```

### 3. Configuration PWA

#### Service Worker Strategy
```typescript
// vite-plugin-pwa configuration
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.exersio\.com\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60 // 24h
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Exersio',
        short_name: 'Exersio',
        description: 'Application de gestion d\'exercices sportifs',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
```

---

## Guides pratiques

### 1. Ajouter un nouveau Context

```typescript
// 1. Créer le fichier context
// src/contexts/NewFeatureContext.tsx

interface NewFeatureState {
  data: DataType[];
  isLoading: boolean;
  error: string | null;
}

interface NewFeatureActions {
  loadData: () => Promise<void>;
  createItem: (data: CreateData) => Promise<DataType>;
  updateItem: (id: string, data: UpdateData) => Promise<DataType>;
  deleteItem: (id: string) => Promise<void>;
}

const initialState: NewFeatureState = {
  data: [],
  isLoading: false,
  error: null
};

function newFeatureReducer(state: NewFeatureState, action: any): NewFeatureState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_DATA':
      return { ...state, data: action.payload, isLoading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

export function NewFeatureProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(newFeatureReducer, initialState);
  
  const actions: NewFeatureActions = {
    async loadData() {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const data = await api.get<DataType[]>('/new-feature');
        dispatch({ type: 'SET_DATA', payload: data });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },
    // ... autres actions
  };
  
  return (
    <NewFeatureContext.Provider value={{ state, actions }}>
      {children}
    </NewFeatureContext.Provider>
  );
}

export function useNewFeature() {
  const context = useContext(NewFeatureContext);
  if (!context) throw new Error('useNewFeature must be used within NewFeatureProvider');
  return context;
}

// 2. Ajouter au AppProvider
// src/contexts/AppProvider.tsx
export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AppContextProvider>
      {/* ... autres providers */}
      <NewFeatureProvider>
        {children}
      </NewFeatureProvider>
    </AppContextProvider>
  );
}
```

### 2. Créer un composant mobile optimisé

```typescript
// src/components/NewMobileComponent.tsx
import { useIsMobile } from '../hooks/useIsMobile';
import { MobileHeader } from './MobileHeader';

interface NewMobileComponentProps {
  title: string;
  data: DataType[];
  onAction: () => void;
}

export function NewMobileComponent({ title, data, onAction }: NewMobileComponentProps) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader title={title}>
          <Button onClick={onAction} size="sm">
            Action
          </Button>
        </MobileHeader>
        
        <div className="px-4 py-6">
          <div className="space-y-4">
            {data.map(item => (
              <MobileItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button onClick={onAction}>Action</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map(item => (
          <DesktopItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
```

### 3. Intégrer le mode offline

```typescript
// src/hooks/useOfflineFeature.ts
export function useOfflineFeature() {
  const { isOffline } = useOffline();
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  
  const actions = {
    async saveItem(item: ItemData) {
      if (isOffline) {
        // Sauvegarder localement avec statut pending
        const offlineItem = {
          id: `temp_${Date.now()}`,
          data: item,
          syncStatus: 'pending' as const,
          lastModified: Date.now()
        };
        
        await offlineStorage.saveItem(offlineItem);
        setPendingItems(prev => [...prev, offlineItem]);
        
        return offlineItem;
      } else {
        // Sauvegarder via API et marquer comme synced
        const savedItem = await api.post<ItemType>('/items', item);
        await offlineStorage.saveItem({
          ...savedItem,
          syncStatus: 'synced',
          lastModified: Date.now(),
          lastSynced: Date.now()
        });
        
        return savedItem;
      }
    },
    
    async syncPendingItems() {
      const pending = await offlineStorage.getPendingItems();
      const results = await Promise.allSettled(
        pending.map(async (item) => {
          try {
            const synced = await api.post('/items', item.data);
            await offlineStorage.markAsSynced('item', item.id);
            return { success: true, item: synced };
          } catch (error) {
            return { success: false, error, item };
          }
        })
      );
      
      return results;
    }
  };
  
  return { actions, pendingItems, isOffline };
}
```

### 4. Debugging et monitoring

#### Performance debugging
```typescript
// utils/debugHelpers.ts
export function withPerformanceLogging<T extends any[]>(
  fn: (...args: T) => any,
  name: string
) {
  return (...args: T) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    if (import.meta.env.DEV) {
      console.log(`🚀 ${name} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  };
}

// Usage dans un composant
const optimizedFilter = withPerformanceLogging(
  (exercises: Exercise[], searchTerm: string) => {
    return exercises.filter(ex => 
      ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },
  'Exercise filtering'
);
```

#### Context debugging
```typescript
// hooks/useContextDebugger.ts
export function useContextDebugger<T>(contextName: string, value: T) {
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(`📊 Context ${contextName} updated:`, value);
    }
  }, [contextName, value]);
}

// Usage dans un provider
export function ExercisesProvider({ children }: ProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  useContextDebugger('ExercisesContext', state);
  
  return (
    <ExercisesContext.Provider value={{ state, actions }}>
      {children}
    </ExercisesContext.Provider>
  );
}
```

---

## Checklist développeur

### ✅ Avant de commencer un développement
- [ ] Analyser l'impact sur l'architecture existante
- [ ] Vérifier les contexts concernés
- [ ] Identifier les optimisations mobile nécessaires
- [ ] Planifier l'intégration offline si applicable

### ✅ Pendant le développement
- [ ] Respecter les patterns etablis (State + Actions)
- [ ] Implémenter la responsivité mobile-first
- [ ] Ajouter les types TypeScript stricts
- [ ] Tester sur mobile ET desktop
- [ ] Vérifier les performances avec le bundle analyzer

### ✅ Avant la mise en production
- [ ] Tests unitaires pour les nouveaux hooks
- [ ] Tests d'intégration pour les nouveaux contexts
- [ ] Validation mobile avec Capacitor
- [ ] Vérification bundle size impact
- [ ] Documentation des nouvelles APIs

---

*Cette documentation est maintenue par l'équipe développement et mise à jour à chaque évolution majeure de l'architecture.*