# SafeConnect - Plataforma Premium de Clasificados

SafeConnect es una solución integral y de alta fidelidad para el mercado de clasificados premium. Diseñada con un enfoque en la **seguridad extrema**, la **verificación real** y una **economía circular blindada**, la plataforma ofrece una experiencia de usuario superior (UX) tanto para clientes como para anunciantes.

---

## 🌟 Características Principales

### 🔐 Seguridad y Verificación (Core)
- **Sistema de Verificación Multicapa**: Validación de documentos de identidad, escaneo de fotos con IA anti-fake y perfiles validados por administradores.
- **Badges de Confianza**: Indicadores visuales claros (ID verificado, Fotos reales) que aumentan la tasa de conversión.
- **Reviews Verificadas**: Sistema de reseñas y ratings atado a transacciones reales de monedas para evitar spam o difamación.
- **Defensa en Profundidad**: Implementación de `helmet`, `mongo-sanitize`, `xss-clean`, `hpp` y limitación de tasa (rate limiting) para protección contra ataques comunes.

### 💬 Mensajería Avanzada (Real-time)
- **Polling Adaptativo**: Sistema inteligente que ajusta la frecuencia de actualización (2s en chat activo, 10s en lista) para optimizar recursos y batería.
- **Contenido Bloqueado (Pay-per-view)**: Los anunciantes pueden enviar contenido que requiere un pago en monedas para ser desbloqueado.
- **Regalos Virtuales**: Sistema de propinas interactivas con animaciones en tiempo real.
- **Canal de Notificaciones**: Sistema de avisos de sistema (Read-only) para transacciones y seguridad.

### 💰 Economía y Monetización (Wallet)
- **Billetera Digital**: Gestión integral de monedas para compras de contenido y propinas.
- **Sistema de Niveles de Lealtad**: Los clientes suben de rango (Bronce, Oro, Platino, Leyenda) según su historial de compras, desbloqueando beneficios exclusivos.
- **Chat Monetizado**: Envío de regalos virtuales y desbloqueo de "Content Packs" privados directamente en la mensajería.
- **Retiros Seguros**: Flujo de aprobación para retiros de anunciantes con historial de auditoría y validación de cuenta de destino.

### 👑 Gestión y Visibilidad
- **Dashboard de Administración**: Panel completo para moderar usuarios, anuncios, verificar identidades y gestionar pagos.
- **Sección VIP Estelar**: Perfiles con bordes dorados, efecto de brillo (glow) y prioridad absoluta en el feed.
- **Boosts de Corto Plazo**: Impulso al TOP por 12 horas para maximizar la visibilidad en horas pico.
- **Planes Premium (Oro/Diamante)**: Membresías mensuales que incluyen herramientas avanzadas de gestión y exposición masiva.

### 🔍 Búsqueda y Navegación Pro
- **Filtros Inteligentes**: Búsqueda por sexo (Mujer, Hombre, Transexual, Gigoló), edad, precio y atributos.
- **Geolocalización**: Soporte para las 24 ciudades principales de Colombia mapeadas por departamentos.
- **UI de Alta Densidad**: Diseño optimizado para ver la mayor cantidad de perfiles relevantes sin scroll excesivo, utilizando Glassmorphism y animaciones fluidas.

---

## 📈 Análisis de la Economía (SafeConnect Economy v2.0)

El sistema financiero está diseñado bajo un esquema de **Diferencial de Tasa y Comisión (Spread + Fee)**, garantizando sostenibilidad y rentabilidad constante.

### 💰 Estructura de Precios y Tasas
| Operación | Valor / Tasa | Tipo | Margen Plataforma |
| :--- | :--- | :--- | :--- |
| **Compra Monedas (Min)** | $12,000 COP (100 coins) | Entrada | Tasa: $120/coin |
| **Compra Monedas (Max)** | $100,000 COP (1000 coins) | Entrada | Tasa: $100/coin |
| **Comisión x Transacción** | **20%** | Fee P2P | Ganancia Inmediata |
| **Suscripción Oro** | 500 Monedas | Canje | 100% Margen |
| **Suscripción Diamante** | 900 Monedas | Canje | 100% Margen |
| **Boost TOP (12 hrs)** | 100 Monedas | Canje | 100% Margen |
| **Retiro (Payout)** | **$80 COP / coin** | Salida | Diferencial Protegido |

### 🧠 Ejemplo de Operación Financiera
1. **Depósito**: Un cliente compra el pack de 100 monedas por **$12,000 COP**.
2. **Transferencia**: El cliente envía un regalo de 100 monedas a una anunciante.
3. **Fee**: La plataforma retiene el 20% (**20 monedas**). La anunciante recibe **80 monedas**.
4. **Payout**: La anunciante solicita retirar sus 80 monedas. A una tasa de $80, recibe **$6,400 COP**.
5. **Beneficio**: La plataforma se queda con **$5,600 COP** de ganancia neta (Margen del 46.6%).

---

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 19 + TypeScript**: Interfaz moderna y tipado fuerte.
- **Vite**: Build tool ultrarrápido.
- **Tailwind CSS 4**: Estilizado responsivo y moderno.
- **Lucide React**: Set de iconos consistente.
- **i18next**: Soporte multi-idioma (ES/EN).
- **Performance**: Build optimizado de ~385KB, carga instantánea y lazy loading de componentes.

### Backend
- **Node.js + Express**: Servidor robusto y escalable.
- **MongoDB + Mongoose**: Base de datos NoSQL con modelado de datos.
- **JWT (JSON Web Tokens)**: Autenticación segura y persistente.
- **Multer + Cloudinary**: Gestión de archivos y almacenamiento de imágenes en la nube.

### Infraestructura y Seguridad
- **Vercel**: Despliegue optimizado (Serverless).
- **Security Middleware**: `helmet`, `express-rate-limit`, `xss-clean`, `express-mongo-sanitize`, `hpp`.
- **Axios Interceptors**: Manejo centralizado de tokens y errores de API.

---

## 🛠️ Configuración del Entorno

### Variables de Entorno (.env)

Crea un archivo `.env` en la raíz del proyecto:

```env
# Database
MONGODB_URI=tu_mongodb_uri

# Auth
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRE=30d

# Cloudinary (Almacenamiento de Imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Frontend (Vite)
VITE_API_URL=http://localhost:5000/api
```

---

## 📂 Estructura del Proyecto

```bash
safeconnect/
├── src/                # Frontend (React + Vite)
│   ├── components/     # Componentes UI (Admin, Auth, Chat, Wallet, User)
│   ├── context/        # AuthContext y estados globales
│   ├── hooks/          # Custom hooks
│   ├── locales/        # Traducciones i18n
│   ├── services/       # Clientes de API (Axios)
│   └── types/          # Definiciones TypeScript
├── server/             # Backend (Node + Express)
│   ├── config/         # DB, Cloudinary y configuraciones
│   ├── controllers/    # Lógica de negocio (Ads, Auth, Messages, Users)
│   ├── middleware/     # Seguridad, Validación y Auth protect
│   ├── models/         # Esquemas de Mongoose (User, Ad, Transaction, Message)
│   ├── routes/         # Definición de Endpoints protegidos
│   └── scripts/        # Scripts de utilidad (Seed, etc.)
└── vercel.json         # Configuración de despliegue
```

---

## 🏃‍♂️ Instalación y Desarrollo

### 1. Requisitos Previos
- Node.js (v18 o superior)
- MongoDB (Local o Atlas)

### 2. Pasos de Instalación
```bash
# Clonar el repositorio e instalar todas las dependencias (Root y Server)
npm run install:all

# Inicializar un usuario administrador (Opcional)
npm run seed
```

### 3. Ejecución en Desarrollo
```bash
# Lanza Frontend y Backend simultáneamente
npm run dev

# O por separado
npm run client  # Puerto 5173
npm run server  # Puerto 5000 (dentro de server/)
```

---

## 🛡️ Seguridad y Buenas Prácticas

- **Validación de Datos**: Uso de `Joi` para validar entradas en el backend.
- **Sanitización**: Protección automática contra Inyección NoSQL y XSS.
- **Logs**: Sistema de logging personalizado para monitorear actividad y errores.
- **Seguridad de Archivos**: Validación de tipos y tamaños de archivos antes de subir a Cloudinary.
- **Certificaciones**: Implementación recomendada de SSL y WAF para producción.

---

## 📄 Licencia

Este es un sistema de grado empresarial para clasificados. Desarrollado con enfoque en la excelencia visual y solvencia financiera.
