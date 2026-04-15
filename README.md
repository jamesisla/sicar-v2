# SICAR v2

Sistema de Administración de Cartera de Arriendos — Ministerio de Bienes Nacionales de Chile.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript, TypeORM |
| Base de datos | PostgreSQL (desarrollo) / Oracle (producción) |
| ORM | TypeORM — soporta PostgreSQL, Oracle, MySQL, SQLite |
| Contenedores | Docker + Docker Compose |
| CI/CD | GitHub Actions |

> El backend usa TypeORM como capa de abstracción. Cambiar de PostgreSQL a Oracle solo requiere ajustar las variables de entorno `DB_TYPE`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

---

## Inicio rápido

### Requisitos

- Node.js 20+
- Docker y Docker Compose
- Acceso a la base de datos Oracle SICAR

### 1. Clonar y configurar

```bash
git clone https://github.com/your-org/sicar-v2.git
cd sicar-v2
cp backend/.env.example backend/.env
# Editar backend/.env con las credenciales Oracle reales
```

### 2. Desarrollo local (con hot reload)

```bash
# Levanta PostgreSQL + backend + frontend con hot reload
docker compose -f docker-compose.dev.yml up

# La BD se inicializa automáticamente con schema.sql + seed.sql
# Backend: http://localhost:3001
# Frontend: http://localhost:3000
# API Docs: http://localhost:3001/api/docs
```

O sin Docker:

```bash
# Primero levanta solo PostgreSQL
docker compose -f docker-compose.dev.yml up postgres

# Backend
cd backend && npm install && npm run start:dev

# Frontend (otra terminal)
cd frontend && npm install && npm run dev
```

### 3. Producción local

```bash
docker compose up --build
```

---

## Flujo de trabajo Git

```
main          ← producción (protegida, solo merge via PR)
  └── develop ← staging (protegida, solo merge via PR)
        └── feature/nombre-feature
        └── fix/nombre-fix
```

### Crear una rama de trabajo

```bash
git checkout develop
git pull origin develop
git checkout -b feature/mi-nueva-funcionalidad
```

### Abrir un Pull Request

1. Push de la rama: `git push origin feature/mi-nueva-funcionalidad`
2. Abrir PR hacia `develop` en GitHub
3. El CI corre automáticamente (tests + build)
4. Merge solo si CI pasa ✅

### Publicar a producción

```bash
# Merge develop → main via PR
# Luego crear un tag de versión:
git tag v1.0.0
git push origin v1.0.0
# El CD construye las imágenes Docker y despliega automáticamente
```

---

## CI/CD (GitHub Actions)

### Pipeline CI — `.github/workflows/ci.yml`

Se ejecuta en cada push a `main`/`develop` y en cada PR.

| Job | Qué hace |
|-----|---------|
| `backend` | `tsc --noEmit` → `npm test` → `npm run build` |
| `frontend` | `tsc --noEmit` → `npm run build` |

### Pipeline CD — `.github/workflows/cd.yml`

Se ejecuta solo en push a `main` o al crear un tag `v*.*.*`.

| Job | Cuándo | Qué hace |
|-----|--------|---------|
| `docker` | Siempre | Build + push imágenes a `ghcr.io` |
| `deploy-staging` | Push a `main` | SSH deploy al servidor de staging |
| `deploy-production` | Tag `v*.*.*` | SSH deploy al servidor de producción |

### Secrets requeridos en GitHub

Ve a **Settings → Secrets and variables → Actions** y agrega:

| Secret | Descripción |
|--------|-------------|
| `STAGING_HOST` | IP o hostname del servidor de staging |
| `STAGING_USER` | Usuario SSH del servidor de staging |
| `STAGING_SSH_KEY` | Clave SSH privada para staging |
| `PROD_HOST` | IP o hostname del servidor de producción |
| `PROD_USER` | Usuario SSH del servidor de producción |
| `PROD_SSH_KEY` | Clave SSH privada para producción |

> `GITHUB_TOKEN` es automático — no necesitas configurarlo.

### Environments en GitHub

Ve a **Settings → Environments** y crea:
- `staging` — sin restricciones adicionales
- `production` — con "Required reviewers" para aprobación manual

---

## Cambiar de base de datos

El backend usa TypeORM. Para conectar a Oracle en producción, solo cambia el `.env`:

```bash
DB_TYPE=oracle
DB_HOST=oracle-host
DB_PORT=1521
DB_NAME=SICAR
DB_USER=mbnowner
DB_PASSWORD=tu-password
```

No se requiere cambiar código. TypeORM traduce las queries automáticamente.

---

## Base de datos PostgreSQL (desarrollo)

```bash
# Backend — todos los tests (unitarios + PBT)
cd backend && npm test

# Con cobertura
cd backend && npm run test:cov
```

---

## API Docs

Con el backend corriendo, la documentación OpenAPI está disponible en:

```
http://localhost:3001/api/docs
```

---

## Variables de entorno

Ver `backend/.env.example` para la lista completa. Las variables críticas son:

```bash
ORACLE_USER=mbnowner
ORACLE_PASSWORD=...
ORACLE_CONNECTION_STRING=host:1521/SICAR
JWT_SECRET=...
JWT_REFRESH_SECRET=...
SIGFE_CODIGO_INSTITUCION=...
SIGFE_CORREO_NOTIFICACION=...
```

**Nunca commitear `.env` con valores reales.**

---

## Cambiar de base de datos

El backend usa TypeORM. Para conectar a Oracle en producción, solo cambia el `.env`:

```bash
DB_TYPE=oracle
DB_HOST=oracle-host
DB_PORT=1521
DB_NAME=SICAR
DB_USER=mbnowner
DB_PASSWORD=tu-password
```

No se requiere cambiar código. TypeORM traduce las queries automáticamente.

---

## Base de datos PostgreSQL (desarrollo)

El schema se crea automáticamente al levantar Docker. Para aplicarlo manualmente:

```bash
psql -U sicar -d sicar_v2 -f backend/db/schema.sql
psql -U sicar -d sicar_v2 -f backend/db/seed.sql
```

Usuario de prueba: `admin` / `admin123`
