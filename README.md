# Guía de Instalación y Ejecución - MentorIA

## Descripción del Proyecto

**MentorIA** es una aplicación híbrida de inteligencia artificial que combina análisis de voz, transcripción de audio y gestión de tareas estilo Kanban con integración a Jira. El sistema ofrece dos modos de operación:

- **Modo Nube (Gemini)**: Utiliza la API de Google Gemini para transcripción y análisis
- **Modo Local (Ollama + Whisper)**: Ejecuta modelos de IA localmente sin necesidad de conexión a internet

---

## Requisitos Previos

### Software Necesario

1. **Node.js** (versión 16 o superior)
   - Descargar desde: https://nodejs.org/
   - Verificar instalación: `node --version`

2. **Python** (versión 3.8 o superior)
   - Descargar desde: https://www.python.org/downloads/
   - Verificar instalación: `python --version`

3. **Git** (opcional, para clonar el repositorio)
   - Descargar desde: https://git-scm.com/

### Dependencias Opcionales

4. **Ollama** (solo si vas a usar el Modo Local)
   - Descargar desde: https://ollama.ai/
   - Después de instalar, ejecutar: `ollama pull llama3:8b`

---

## Instalación

### Paso 1: Obtener el Proyecto

```bash
# Si tienes el proyecto clonado o descargado, navega a la carpeta
cd MentorIA
```

### Paso 2: Configurar el Backend

```bash
# Navegar a la carpeta del backend
cd backend

# Instalar dependencias de Node.js
npm install

# Instalar dependencias de Python
pip install -r requirements.txt
```

**Dependencias del Backend:**
- **Node.js**: Express, CORS, Multer, Axios, Dotenv, Google Generative AI
- **Python**: faster-whisper (para transcripción local)

### Paso 3: Configurar el Frontend

```bash
# Desde la raíz del proyecto, navegar al frontend
cd ../frontend

# Instalar dependencias
npm install
```

**Dependencias del Frontend:**
- React 19, Vite
- @hello-pangea/dnd (drag & drop para Kanban)
- jspdf, jspdf-autotable (exportación a PDF)
- lucide-react (iconos)
- react-markdown (renderizado de texto)

### Paso 4: Configurar Variables de Entorno

El proyecto incluye un archivo `.env` en la carpeta `backend` con la siguiente estructura:

```env
# --- CONFIGURACIÓN DE IA DE MENTORIA ---

# MODO DE INTELIGENCIA: 'gemini' (Nube) o 'local' (Ollama + Whisper)
AI_PROVIDER=gemini

# --- GOOGLE GEMINI (NUBE) ---
GEMINI_API_KEY=TU_API_KEY_AQUI
GEMINI_MODEL=gemini-2.5-flash

# --- OLLAMA & WHISPER (LOCAL) ---
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3:8b

# --- JIRA (OPCIONAL) ---
JIRA_DOMAIN=tu-dominio.atlassian.net
JIRA_EMAIL=tu-email@ejemplo.com
JIRA_API_TOKEN=TU_TOKEN_DE_JIRA
```

#### Configuración según el modo:

**Para Modo Nube (Gemini):**
1. Obtener una API Key de Google Gemini: https://aistudio.google.com/app/apikey
2. Reemplazar `GEMINI_API_KEY` en el archivo `.env`
3. Mantener `AI_PROVIDER=gemini`

**Para Modo Local (Ollama + Whisper):**
1. Instalar Ollama: https://ollama.ai/
2. Ejecutar en terminal: `ollama pull llama3:8b`
3. Cambiar en `.env`: `AI_PROVIDER=local`
4. Asegurar que faster-whisper esté instalado: `pip install faster-whisper`

**Para integración con Jira (opcional):**
1. Configurar `JIRA_DOMAIN`, `JIRA_EMAIL` y `JIRA_API_TOKEN`
2. Si no se configuran, el sistema funcionará con un simulador de Jira

---

## Ejecución del Proyecto

### Opción 1: Ejecutar Manualmente (Dos Terminales)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

El servidor backend estará disponible en: `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

El frontend estará disponible en: `http://localhost:5173` (o el puerto que indique Vite)

### Opción 2: Modo Desarrollo con Ollama (Modo Local)

Si usas el modo local, necesitas **tres terminales**:

**Terminal 1 - Ollama:**
```bash
ollama serve
```

**Terminal 2 - Backend:**
```bash
cd backend
npm start
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## Verificación de la Instalación

### Backend
Una vez iniciado el backend, deberías ver un mensaje como:
```
[MentorIA] Modo AI: GEMINI
[MentorIA] Gemini Model: gemini-2.5-flash
Servidor MentorIA (gemini) corriendo en puerto 3001
```

O si usas modo local:
```
[MentorIA] Modo AI: LOCAL
[MentorIA] Ollama Model: llama3:8b
Servidor MentorIA (local) corriendo en puerto 3001
```

### Frontend
El navegador se abrirá automáticamente en `http://localhost:5173` mostrando la interfaz de MentorIA.

### Prueba de Funcionalidad
1. **Transcripción**: Graba un audio corto y verifica que se transcriba correctamente
2. **Análisis**: Prueba analizar una reunión para generar tareas
3. **Kanban**: Verifica que puedas arrastrar y soltar tareas entre columnas
4. **Mentor Virtual**: Prueba el chat con el asistente IA

---

## Solución de Problemas Comunes

### Error: "Falta API Key de Gemini"
- Verificar que `GEMINI_API_KEY` esté configurado en `backend/.env`
- Asegurar que la API Key sea válida

### Error: "Fallo al conectar con Ollama"
- Verificar que Ollama esté corriendo: `ollama serve`
- Verificar que el modelo esté descargado: `ollama pull llama3:8b`
- Comprobar que `AI_PROVIDER=local` en el `.env`

### Error: "Whisper falló"
- Verificar que Python esté instalado correctamente
- Reinstalar faster-whisper: `pip install --upgrade faster-whisper`
- Asegurar que la carpeta `backend/temp` exista o que el backend tenga permisos para crearla

### El frontend no se conecta al backend
- Verificar que el backend esté corriendo en el puerto 3001
- Revisar la configuración de CORS en `backend/server.js`
- Comprobar el firewall o antivirus que no esté bloqueando la conexión

### Problemas con dependencias de Node.js
```bash
# Limpiar caché e instalar nuevamente
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

---

## Características Principales

- **Transcripción de Audio**: Convierte voz a texto usando Gemini o Whisper
- **Análisis Inteligente**: Extrae tareas, responsables y fechas de reuniones
- **Tablero Kanban**: Gestiona tareas con drag & drop (To Do, In Progress, Done)
- **Integración Jira**: Sincroniza tareas automáticamente con Jira
- **Mentor Virtual**: Asistente IA especializado en Scrum y Jira
- **Persistencia Local**: Las tareas se guardan automáticamente
- **Exportación PDF**: Genera reportes de tareas en formato PDF
- **Modo Oscuro**: Interfaz moderna con soporte de tema oscuro

---

## Estructura del Proyecto

```
MentorIA/
├── backend/
│   ├── server.js          # Servidor Express principal
│   ├── package.json       # Dependencias Node.js
│   ├── requirements.txt   # Dependencias Python
│   ├── .env               # Variables de entorno
│   ├── utils/
│   │   └── transcribe.py  # Script de Whisper local
│   ├── data/              # Almacenamiento de tareas
│   └── temp/              # Archivos temporales de audio
│
└── frontend/
    ├── src/
    │   ├── App.jsx        # Componente principal
    │   ├── index.css      # Estilos globales
    │   └── main.jsx       # Punto de entrada
    ├── package.json       # Dependencias React
    └── vite.config.js     # Configuración Vite
```

---

## Próximos Pasos

1. Abrir el navegador en `http://localhost:5173`
2. Grabar un audio de prueba o analizar texto
3. Crear tareas manualmente en el Kanban
4. Explorar el Mentor Virtual para consultas sobre Scrum
5. Exportar tareas a PDF o sincronizar con Jira (si está configurado)


Para soporte adicional, consultar la documentación oficial de:
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- [Ollama](https://ollama.ai/docs)
- [Faster Whisper](https://github.com/guillaumekln/faster-whisper)
