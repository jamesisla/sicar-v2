# SICAR v2

Sistema de Administración de Cartera de Arriendos — Ministerio de Bienes Nacionales de Chile.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript, TypeORM |
| Base de datos | PostgreSQL (desarrollo/producción) / Oracle (producción MBN) |
| Proxy | Nginx |
| Contenedores | Docker + Docker Compose |

---

## Credenciales por defecto

| Campo | Valor |
|-------|-------|
| Usuario | `admin` |
| Contraseña | `admin123` |
| DB usuario | `sicar` |
| DB contraseña | `sicar123` |
| DB nombre | `sicar_v2` |

---

## Desarrollo local

### Requisitos

- Docker Desktop (o Docker Engine + Docker Compose)
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/jamesisla/sicar-v2.git
cd sicar-v2
git checkout feature/frontend-modulos-completos
```

### 2. Configurar variables de entorno

```bash
cp backend/.env.example backend/.env
```

El archivo `.env` ya viene configurado para desarrollo local con PostgreSQL. No necesitas cambiar nada.

### 3. Levantar la aplicación

```bash
docker compose -f docker-compose.dev.yml up --build
```

La primera vez tarda ~5-10 minutos mientras descarga imágenes y compila.

### 4. Acceder

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Swagger Docs | http://localhost:3001/api/docs |

### Comandos útiles en local

```bash
# Ver logs en tiempo real
docker compose -f docker-compose.dev.yml logs -f

# Ver logs de un servicio específico
docker compose -f docker-compose.dev.yml logs -f backend

# Detener todo
docker compose -f docker-compose.dev.yml down

# Detener y borrar la base de datos (reset completo)
docker compose -f docker-compose.dev.yml down -v

# Reiniciar un servicio
docker compose -f docker-compose.dev.yml restart backend
```

---

## Producción — Oracle Cloud (OCI)

### Requisitos en el servidor

- Oracle Linux 8 (o compatible RHEL 8)
- Docker Engine + Docker Compose Plugin
- Git
- Puerto 80 abierto en el Security List de OCI y en el firewall del SO

### 1. Preparar el servidor (primera vez)

Conectarse por SSH:

```bash
ssh -i tu-clave.pem opc@<IP-PUBLICA>
```

Instalar Docker:

```bash
sudo dnf update -y
sudo dnf install -y dnf-utils git
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker opc
newgrp docker
```

Abrir puerto 80 en el firewall del SO:

```bash
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --reload
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
```

> También debes abrir el puerto 80 en el **Security List** de OCI:
> Networking → VCN → Security Lists → Add Ingress Rule → Puerto 80 TCP

### 2. Clonar el repositorio

```bash
cd /opt
sudo git clone https://github.com/jamesisla/sicar-v2.git
sudo chown -R opc:opc sicar-v2
cd sicar-v2
git checkout feature/frontend-modulos-completos
```

### 3. Configurar variables de entorno

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Editar los valores obligatorios (sin comentarios en la misma línea):

```bash
DB_TYPE=postgres
DB_HOST=postgres
DB_PORT=5432
DB_USER=sicar
DB_PASSWORD=sicar123
DB_NAME=sicar_v2
DB_SYNC=false
DB_LOGGING=false
DB_SSL=false

JWT_SECRET=<ejecutar: openssl rand -hex 64>
JWT_REFRESH_SECRET=<ejecutar: openssl rand -hex 64>

PORT=3001
CORS_ORIGINS=http://<IP-PUBLICA-OCI>
NODE_ENV=production
```

Generar los JWT secrets:

```bash
openssl rand -hex 64   # copiar resultado en JWT_SECRET
openssl rand -hex 64   # copiar resultado en JWT_REFRESH_SECRET
```

### 4. Configurar la IP en docker-compose.prod.yml

```bash
nano docker-compose.prod.yml
```

En el bloque `frontend.build.args`, reemplazar la IP:

```yaml
args:
  NEXT_PUBLIC_API_URL: "http://<IP-PUBLICA-OCI>"
```

También verificar que `POSTGRES_PASSWORD` coincida con `DB_PASSWORD` del `.env`:

```yaml
POSTGRES_PASSWORD: sicar123
```

### 5. Levantar la aplicación

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

La primera vez tarda ~10-15 minutos.

### 6. Verificar que todo esté corriendo

```bash
docker compose -f docker-compose.prod.yml ps
```

Deben aparecer 4 contenedores en estado `Up`: postgres, backend, frontend, nginx.

### 7. Acceder

```
http://<IP-PUBLICA-OCI>
```

---

## Actualizar la aplicación en producción

```bash
cd /opt/sicar-v2

# Guardar cambios locales (como el .env y docker-compose.prod.yml)
git stash

# Bajar los cambios del repositorio
git pull

# Restaurar cambios locales
git stash pop

# Reconstruir y reiniciar
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

---

## Comandos útiles en producción

```bash
# Ver estado de los contenedores
docker compose -f docker-compose.prod.yml ps

# Ver logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f

# Ver logs de un servicio
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f nginx

# Reiniciar un servicio sin rebuild
docker compose -f docker-compose.prod.yml restart backend

# Detener todo (sin borrar datos)
docker compose -f docker-compose.prod.yml down

# Detener y borrar la base de datos (reset completo — CUIDADO)
docker compose -f docker-compose.prod.yml down -v
```

---

## Solución de problemas comunes

### El backend no arranca — "Cannot find module /app/dist/src/main"

El build no compiló correctamente. Forzar rebuild:

```bash
docker rmi sicar-v2-backend -f
docker compose -f docker-compose.prod.yml build --no-cache backend
docker compose -f docker-compose.prod.yml up -d
```

### Error de autenticación en PostgreSQL — "password authentication failed"

El usuario `sicar` no tiene la contraseña correcta. Resetearla:

```bash
docker exec sicar-v2-postgres-1 psql -U sicar -d sicar_v2 -c "ALTER USER sicar WITH PASSWORD 'sicar123';"
docker compose -f docker-compose.prod.yml restart backend
```

### La página no carga desde el navegador pero `curl localhost` funciona

El firewall del SO está bloqueando el puerto 80:

```bash
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --reload
```

### El login da "Error de conexión"

El frontend está apuntando a la URL incorrecta. Verificar que el `docker-compose.prod.yml` tenga la IP correcta en `NEXT_PUBLIC_API_URL` y hacer rebuild del frontend:

```bash
docker rmi sicar-v2-frontend -f
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml up -d
```

### git pull falla por cambios locales

```bash
git stash
git pull
git stash pop
```

---

## Estructura del proyecto

```
sicar-v2/
├── backend/              # NestJS API
│   ├── db/
│   │   ├── schema.sql    # Estructura de la base de datos
│   │   └── seed.sql      # Datos iniciales
│   ├── src/              # Código fuente
│   ├── Dockerfile
│   └── .env.example      # Plantilla de variables de entorno
├── frontend/             # Next.js App
│   ├── app/              # Páginas (App Router)
│   ├── components/       # Componentes reutilizables
│   ├── lib/              # Utilidades (api.ts, validators)
│   └── Dockerfile
├── nginx/
│   └── nginx.conf        # Configuración del proxy inverso
├── docker-compose.dev.yml    # Desarrollo local
└── docker-compose.prod.yml   # Producción
```

---

## Flujo de trabajo Git

```
main          ← producción (protegida)
  └── develop ← staging (protegida)
        └── feature/nombre-feature
        └── fix/nombre-fix
```

```bash
# Crear rama de trabajo
git checkout develop
git pull origin develop
git checkout -b feature/mi-nueva-funcionalidad

# Subir cambios
git add .
git commit -m "feat: descripción del cambio"
git push origin feature/mi-nueva-funcionalidad
```

Abrir Pull Request hacia `develop` en GitHub.
