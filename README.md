# 🎮 Sistema de Votación de Addons - Servidor Minecraft UFT

## Descripción

Sistema completo de votación para addons del servidor Minecraft Bedrock de la Universidad Finis Terrae. Incluye:

- ✅ Modal de anuncio que aparece después de 10 segundos
- ✅ Sistema de votación (Sí, No, Quizás)
- ✅ Base de datos JSON con registro completo de votos
- ✅ Información detallada: navegador, SO, país, ciudad, IP, fecha/hora
- ✅ Panel de administración con estadísticas
- ✅ Todo en español

## Estructura de Archivos

```
├── index.html           # Página principal del servidor
├── admin.html           # Panel de administración de votos
├── script.js            # JavaScript del cliente
├── style.css            # Estilos CSS
├── servidor.js          # Servidor Node.js/Express
├── package.json         # Dependencias de Node.js
├── basedatos_votos.json # Base de datos de votos (se crea automáticamente)
└── README.md            # Este archivo
```

## Requisitos

- Node.js 14 o superior
- npm (incluido con Node.js)

## Instalación

### 1. Instalar dependencias

```bash
cd "ruta/a/Pag_server_minecraft"
npm install
```

Esto instalará:
- `express` - Framework web
- `axios` - Cliente HTTP para geolocalización

### 2. Iniciar el servidor

```bash
npm start
```

O en modo desarrollo (con reinicio automático):

```bash
npm run desarrollo
```

El servidor se iniciará en: `http://localhost:3000`

## Uso

### Acceder a la página principal

```
http://localhost:3000
```

La página mostrará:
1. Anuncio modal después de 10 segundos
2. Sistema de votación para el addon
3. Resultados en tiempo real

### Panel de Administración

```
http://localhost:3000/admin.html
```

En el panel puedes ver:
- Total de votos
- Detalles individuales de cada voto
- Estadísticas por país
- Información del navegador, SO, IP, etc.
- Filtros por tipo de voto

## API Endpoints

### 1. Registrar Voto

**POST** `/api/registrar-voto`

Request:
```json
{
  "voto": "si"  // "si", "no", "quiza"
}
```

Response:
```json
{
  "exito": true,
  "mensaje": "Voto registrado correctamente",
  "votos": {
    "si": 10,
    "no": 3,
    "quiza": 5,
    "total": 18,
    "porcentajes": {
      "si": "55.6",
      "no": "16.7",
      "quiza": "27.8"
    }
  }
}
```

### 2. Obtener Estadísticas

**GET** `/api/estadisticas-votos`

Response:
```json
{
  "addon": "Better on Bedrock v1.1.3",
  "votos": {
    "si": 10,
    "no": 3,
    "quiza": 5,
    "total": 18,
    "porcentajes": {
      "si": "55.6",
      "no": "16.7",
      "quiza": "27.8"
    }
  }
}
```

### 3. Obtener Detalles de Votos

**GET** `/api/detalles-votos`

Response:
```json
{
  "addon": "Better on Bedrock v1.1.3",
  "resumen": {
    "totalVotos": 18,
    "si": 10,
    "no": 3,
    "quiza": 5
  },
  "detalles": [
    {
      "id": 1,
      "voto": "si",
      "fecha": "2/12/2025 14:30:45",
      "timestamp": 1733145045000,
      "navegador": "Google Chrome",
      "sistemaOperativo": "Windows",
      "ip": "192.168.1.100",
      "pais": "Chile",
      "ciudad": "Santiago"
    },
    ...
  ]
}
```

### 4. Estadísticas por País

**GET** `/api/estadisticas-pais`

### 5. Estadísticas por Navegador

**GET** `/api/estadisticas-navegador`

## Base de Datos (JSON)

La base de datos se guarda en `basedatos_votos.json`:

```json
{
  "addonNombre": "Better on Bedrock v1.1.3",
  "totalVotos": 18,
  "votos": {
    "si": 10,
    "no": 3,
    "quiza": 5
  },
  "detallesVotos": [
    {
      "id": 1,
      "voto": "si",
      "fecha": "2/12/2025 14:30:45",
      "timestamp": 1733145045000,
      "navegador": "Google Chrome",
      "sistemaOperativo": "Windows",
      "ip": "192.168.1.100",
      "pais": "Chile",
      "ciudad": "Santiago",
      "userAgent": "Mozilla/5.0..."
    }
  ]
}
```

## Variables de Entorno

Puedes configurar el puerto del servidor:

```bash
set PUERTO=8000
npm start
```

O en Linux/Mac:

```bash
export PUERTO=8000
npm start
```

## Características

### Sistema de Votación
- Modal moderno con countdown de 10 segundos
- Tres opciones: Sí, No, Quizás
- Prevención de votación múltiple (localStorage)
- Resultados en tiempo real

### Información Recopilada
- 🌐 Navegador (Chrome, Firefox, Safari, Edge, Opera)
- 💻 Sistema Operativo (Windows, Mac, Linux, Android, iOS)
- 🌍 País y Ciudad
- 📍 Dirección IP
- 🕐 Fecha y Hora exacta
- 📊 User Agent completo

### Panel de Administración
- Gráficos de estadísticas
- Tabla detallada de votos
- Filtros por tipo de voto
- Estadísticas por país
- Actualización en tiempo real cada 30 segundos

## Seguridad

Para usar en producción:

1. **Proteger el panel admin** con autenticación básica
2. **Validar IPs** para evitar spam
3. **Rate limiting** para limitar votaciones
4. **HTTPS** en lugar de HTTP
5. **Backup** regular de la base de datos

Ejemplo de middleware para proteger admin:

```javascript
app.use('/api/detalles-votos', (req, res, next) => {
    const auth = req.get('Authorization');
    if (auth !== 'Bearer token-secreto') {
        return res.status(401).json({ error: 'No autorizado' });
    }
    next();
});
```

## Solución de Problemas

### "Cannot find module 'express'"
```bash
npm install
```

### Puerto en uso
```bash
# Ver qué está usando el puerto 3000
netstat -ano | findstr :3000

# Cambiar a otro puerto
set PUERTO=3001
npm start
```

### Geolocalización no funciona
- La geolocalización depende de una API externa (ipapi.co)
- Si no está disponible, mostrará "No disponible"
- Es solo informativo, no afecta la votación

## Personalización

### Cambiar nombre del addon

Edita en `servidor.js`:
```javascript
addonNombre: 'Nombre del Addon v1.0.0'
```

### Cambiar tiempo del anuncio

Edita en `script.js`:
```javascript
let tiempoRestante = 10; // Cambiar a segundos deseados
```

### Cambiar colores

Edita en `style.css`:
```css
/* Cambiar colores de votos */
.vote-yes { background: rgba(34, 197, 94, 0.15); }
.vote-no { background: rgba(239, 68, 68, 0.15); }
.vote-maybe { background: rgba(245, 158, 11, 0.15); }
```

## Contacto

Creado por: **MiKelSX**
Servidor: **Universidad Finis Terrae - Minecraft Bedrock**

## Licencia

MIT

---

**Nota**: Este sistema fue diseñado específicamente para la comunidad del Servidor UFT. Todos los textos están en español como se solicitó.
