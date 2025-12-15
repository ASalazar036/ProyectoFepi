require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
// Importamos la librería de Google en lugar de OpenAI
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuración Multer (Carga de archivos en memoria)
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de Google Gemini
// Si no hay clave, el sistema avisará pero no explotará hasta que intentes usarlo
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "NO_KEY");

// --- ENDPOINTS ---

// 1. Analizar Reunión (IA con Gemini - GRATIS)
app.post('/api/analyze', async (req, res) => {
  const { transcript } = req.body;

  // Validación básica
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "NO_KEY") {
    return res.status(503).json({ error: "Falta configurar la GEMINI_API_KEY en el archivo .env" });
  }

  try {
    // Usamos el modelo 'gemini-2.5-flash' que es rápido y gratuito para este uso
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
        Actúa como un experto Project Manager y Scrum Master. 
        Analiza la siguiente transcripción de una reunión técnica y extrae una lista de tareas concretas.
        
        INSTRUCCIONES CLAVE DE ASIGNACIÓN:
        1. Si la transcripción menciona a una persona (ej: "Juan", "Maria", "el equipo de diseño"), ASIGNA la tarea a esa persona/equipo en el campo 'assignee'.
        2. Si no se menciona a nadie explícitamente, usa "Unassigned".
        3. Intenta inferir fechas de entrega en 'dueDate' (Formato YYYY-MM-DD) si se mencionan (ej: "para el viernes").
        
        IMPORTANTE: Devuelve la respuesta ÚNICAMENTE en formato JSON puro. No uses bloques de código markdown.
        
        Estructura JSON requerida:
        {
          "sentiment": "One word describing the meeting mood (e.g., Productive, Tense, Energetic, Neutral)",
          "issues": [
            { 
              "summary": "Titulo corto de la tarea", 
              "description": "Descripción técnica detallada", 
              "type": "Task" (o Bug, Story), 
              "priority": "High" (o Medium, Low),
              "assignee": "Nombre o Unassigned",
              "dueDate": "YYYY-MM-DD o null"
            }
          ]
        }
  
        Transcripción de la reunión: "${transcript}"
      `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // LIMPIEZA DE RESPUESTA: Gemini a veces devuelve bloques de código Markdown.
    // Esto lo elimina para que JSON.parse no falle.
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(text);
    res.json(data);

  } catch (error) {
    console.error("Error Gemini:", error);
    // Respuesta de emergencia si la IA falla, para que la demo no se detenga
    res.status(500).json({
      error: "Error procesando con IA",
      details: error.message,
      fallback: "Intenta hablar más claro o verifica tu API Key."
    });
  }
});

// 1.5 Analizar Archivo de Audio (NUEVO)
app.post('/api/analyze-file', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo" });
  }

  // Validación básica
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "NO_KEY") {
    return res.status(503).json({ error: "Falta configurar la GEMINI_API_KEY en el archivo .env" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Escucha este audio de una reunión técnica. Actúa como Project Manager.
      Identifica las tareas, decisiones y asignaciones mencionadas.
      
      INSTRUCCIONES CLAVE DE ASIGNACIÓN:
      1. Extrae nombres de personas responsables (ej: "Juan lo hará") y ponlos en 'assignee'.
      2. Si hay fechas (ej: "para mañana"), ponlas en 'dueDate' (YYYY-MM-DD).
      
      IMPORTANTE:      Please output a JSON object with this structure:
      {
        "sentiment": "One word describing the meeting mood (e.g., Productive, Tense, Energetic, Neutral)",
        "issues": [
          {
            "summary": "Task title",
            "type": "Task" | "Bug" | "Story",
            "priority": "High" | "Medium" | "Low",
            "description": "Short description",
            "assignee": "Name or Unassigned",
            "dueDate": "YYYY-MM-DD"
          }
        ]
      }
    `;

    // Convertir buffer a base64 para Gemini
    const audioData = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    const result = await model.generateContent([prompt, audioData]);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(text);
    res.json(data);

  } catch (error) {
    console.error("Error analizando audio:", error);
    res.status(500).json({ error: "Error al procesar el audio", details: error.message });
  }
});

// 1.8 Transcripción Pura (Universal - Firefox/Safari)
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No se subió ningún archivo de audio.");
    }

    const audioBytes = req.file.buffer.toString('base64');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: audioBytes
        }
      },
      { text: "Genera una transcripción literal y exacta de lo que se dice en este audio. No añadidas títulos, ni formatos, ni introducciones. Solo el texto hablado puro." }
    ]);

    const transcript = result.response.text();
    res.json({ transcript });

  } catch (error) {
    console.error("Error en Transcripción:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Integración con Jira (Igual que antes, no cambia con Gemini)
app.post('/api/sync-jira', async (req, res) => {
  const { issues, projectKey } = req.body;

  // Si faltan credenciales, simulamos éxito
  if (!process.env.JIRA_EMAIL || !process.env.JIRA_API_TOKEN) {
    console.log("Modo Simulación: Jira no configurado.");
    // Fingimos que tardamos un poco
    await new Promise(resolve => setTimeout(resolve, 1000));
    return res.json({ success: true, simulated: true, count: issues.length });
  }

  const created = [];

  try {
    for (const issue of issues) {
      const bodyData = {
        fields: {
          project: { key: projectKey },
          summary: issue.summary,
          description: {
            type: "doc",
            version: 1,
            content: [{ type: "paragraph", content: [{ type: "text", text: issue.description }] }]
          },
          issuetype: { name: issue.type || "Task" },
          priority: { name: issue.priority || "Medium" }
        }
      };

      // Conexión real a Jira
      await axios.post(`https://${process.env.JIRA_DOMAIN}/rest/api/3/issue`, bodyData, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      created.push(issue.summary);
    }
    res.json({ success: true, created });
  } catch (error) {
    console.error("Error Jira:", error.response?.data || error.message);
    res.status(500).json({ error: "Fallo al conectar con Jira", details: error.response?.data });
  }
});

// 3. Mentor Virtual (Chat con Gemini - GRATIS)
app.post('/api/mentor', async (req, res) => {
  const { history, message } = req.body;

  if (!process.env.GEMINI_API_KEY) return res.json({ reply: "Error: Configura la API Key de Gemini." });

  try {
    // FIX: Usamos modelo estándar
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prompt del sistema para darle personalidad al chatbot
    const prompt = `
      Eres 'MentorIA', un asistente docente universitario experto en Metodologías Ágiles (Scrum) y Jira.
      Tu objetivo es ayudar a estudiantes a organizar sus proyectos.
      Sé breve, amigable y profesional.
      
      El estudiante pregunta: "${message}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("Error Mentor:", error);
    res.status(500).json({ error: "El mentor está desconectado temporalmente." });
  }
});

const fs = require('fs');
const path = require('path');

// --- SUPER PERSISTENCIA (Base de Datos en JSON) ---
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

// Helper: Cargar Tareas
const loadTasks = () => {
  try {
    if (!fs.existsSync(TASKS_FILE)) return [];
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error("Error leyendo DB:", e);
    return [];
  }
};

// Helper: Guardar Tareas
const saveTasks = (tasks) => {
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (e) {
    console.error("Error guardando DB:", e);
  }
};

// --- ENDPOINTS PERSISTENTES ---

// GET: Obtener todas las tareas
app.get('/api/tasks', (req, res) => {
  const tasks = loadTasks();
  res.json(tasks);
});

// POST: Guardar una NUEVA tarea
app.post('/api/tasks', (req, res) => {
  const newTask = req.body;
  const tasks = loadTasks();
  tasks.push(newTask);
  saveTasks(tasks);
  res.json({ success: true, task: newTask });
});

// POST: Batch (Guardar VARIAS tareas, ej: desde la IA)
app.post('/api/tasks/batch', (req, res) => {
  const newTasks = req.body; // Array de tareas
  const tasks = loadTasks();
  const updatedTasks = [...tasks, ...newTasks];
  saveTasks(updatedTasks);
  res.json({ success: true, count: newTasks.length });
});

// PUT: Actualizar una tarea existente
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const updatedTask = req.body;
  let tasks = loadTasks();
  tasks = tasks.map(t => t.id === id ? updatedTask : t);
  saveTasks(tasks);
  res.json({ success: true, task: updatedTask });
});

// DELETE: Eliminar tarea
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  let tasks = loadTasks();
  tasks = tasks.filter(t => t.id !== id);
  saveTasks(tasks);
  res.json({ success: true });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Servidor MentorIA (v3 Gemini 2.5 + Persistencia) corriendo en puerto ${PORT}`));