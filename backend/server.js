require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- CONFIGURACIÓN ---
const upload = multer({ storage: multer.memoryStorage() });
const app = express();
app.use(cors());
app.use(express.json());

// Variables de Entorno y Constantes
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini'; // 'gemini' | 'local'
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "NO_KEY";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash"; // Modelo configurable
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";

console.log(`[MentorIA] Modo AI: ${AI_PROVIDER.toUpperCase()}`);
if (AI_PROVIDER === 'gemini') console.log(`[MentorIA] Gemini Model: ${GEMINI_MODEL}`);
if (AI_PROVIDER === 'local') console.log(`[MentorIA] Ollama Model: ${OLLAMA_MODEL}`);

// Inicializar Gemini si es necesario
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// --- UTILIDADES AI (CORE) ---

// 1. Generación de Texto (Chat / Análisis)
async function generateText(prompt, systemInstruction = "") {
  if (AI_PROVIDER === 'local') {
    // --- LOCAL (OLLAMA) ---
    try {
      // Unimos system + prompt para modelos simples, o usamos parámetros si Ollama lo soporta bien
      const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;

      const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
        model: OLLAMA_MODEL,
        prompt: fullPrompt,
        stream: false
      });
      return response.data.response;
    } catch (error) {
      console.error("Error Ollama:", error.message);
      throw new Error("Fallo al conectar con Ollama. Asegúrate de que está corriendo (ollama serve).");
    }
  } else {
    // --- CLOUD (GEMINI) ---
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "NO_KEY") throw new Error("Falta API Key de Gemini");
    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const result = await model.generateContent(`${systemInstruction}\n\n${prompt}`);
      return result.response.text();
    } catch (error) {
      console.error("Error Gemini Generación:", error);
      throw error;
    }
  }
}

// 2. Transcripción de Audio
async function transcribeAudio(fileBuffer, mimeType) {
  if (AI_PROVIDER === 'local') {
    // --- LOCAL (WHISPER - PYTHON) ---
    return new Promise((resolve, reject) => {
      // 1. Guardar buffer en archivo temporal
      const tempId = Date.now();
      const tempDir = path.join(__dirname, 'temp');

      // Determinar extensión
      let ext = 'webm';
      if (mimeType && mimeType.includes('mp4')) ext = 'mp4';
      if (mimeType && mimeType.includes('ogg')) ext = 'ogg';
      if (mimeType && mimeType.includes('wav')) ext = 'wav';

      const tempPath = path.join(tempDir, `audio_${tempId}.${ext}`);

      // Asegurar directorio temp
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      fs.writeFileSync(tempPath, fileBuffer);

      // 2. Ejecutar Python Script
      const pythonProcess = spawn('python', ['utils/transcribe.py', tempPath]);

      let dataString = '';
      let errorString = '';

      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
      });

      pythonProcess.on('close', (code) => {
        // 3. Limpiar archivo
        try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch (e) { console.error("Error borrando temp:", e); }

        if (code !== 0) {
          console.error("Whisper Error Out:", errorString);
          return reject(new Error(`Whisper falló con código ${code}`));
        }

        try {
          const result = JSON.parse(dataString);
          if (result.success) {
            resolve(result.transcript);
          } else {
            console.error("Whisper Script Error:", result.error);
            reject(new Error(result.error || "Error desconocido en Whisper"));
          }
        } catch (e) {
          console.error("JSON Parse Error:", dataString);
          reject(new Error("Respuesta inválida del transcriptor local"));
        }
      });
    });

  } else {
    // --- CLOUD (GEMINI) ---
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: fileBuffer.toString("base64")
        }
      },
      { text: "Genera una transcripción literal y exacta de lo que se dice en este audio. \n\nREGLAS ESTRICTAS:\n1. NO saludes.\n2. NO digas 'Aquí está la transcripción'.\n3. NO uses introducciones como 'Sure', 'Claro'.\n4. SOLO devuelve el texto hablado." }
    ]);
    return result.response.text();
  }
}

// 3. Análisis Multimodal (Audio -> Texto -> Análisis)
async function analyzeAudioFlow(fileBuffer, mimeType, promptInstructions) {
  if (AI_PROVIDER === 'local') {
    console.log("Iniciando Pipeline Local: Whisper -> Ollama");
    const transcript = await transcribeAudio(fileBuffer, mimeType);
    console.log("Transcripción Local Completada. Analizando...");
    const analysis = await generateText(`Transcripción: "${transcript}"\n\n${promptInstructions}`);
    return analysis;
  } else {
    // Cloud
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent([
      { inlineData: { mimeType: mimeType, data: fileBuffer.toString("base64") } },
      { text: promptInstructions }
    ]);
    return result.response.text();
  }
}


// --- ENDPOINTS ---

// 1. Analizar Texto (Reunión)
app.post('/api/analyze', async (req, res) => {
  const { transcript } = req.body;

  const systemPrompt = `
    Actúa como un experto Project Manager y Scrum Master. 
    Analiza la siguiente transcripción de una reunión técnica y extrae una lista de tareas concretas.
    
    INSTRUCCIONES CLAVE DE ASIGNACIÓN:
    1. Si menciona nombres, asigna 'assignee'.
    2. Si menciona fechas, asigna 'dueDate' (YYYY-MM-DD).
    3. Si no hay responsable, 'Unassigned'.
    
    IMPORTANTE: Devuelve la respuesta ÚNICAMENTE en formato JSON puro.
    
    Estructura JSON requerida:
    {
      "sentiment": "One word (Productive, Tense, etc)",
      "issues": [
        { 
          "summary": "Titulo", 
          "description": "Detalles", 
          "type": "Task", 
          "priority": "Medium",
          "assignee": "Name",
          "dueDate": "YYYY-MM-DD"
        }
      ]
    }
  `;

  try {
    let text = await generateText(transcript, systemPrompt);

    // Limpieza JSON universal
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    // A veces Ollama pone texto antes del JSON, intentamos extraer el bloque {}
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];

    const data = JSON.parse(text);
    res.json(data);
  } catch (error) {
    console.error("Error Analysis:", error);
    res.status(500).json({ error: "Error analizando reunión", details: error.message });
  }
});

// 1.5 Analizar Archivo (Audio)
app.post('/api/analyze-file', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });

  const prompt = `
    Analiza este audio de reunión. Actúa como Project Manager.
    Identifica tareas, responsables y fechas.
    Devuelve ÚNICAMENTE JSON:
    {
      "sentiment": "Mood",
      "issues": [{ "summary": "...", "type": "Task", "priority": "Medium", "assignee": "...", "dueDate": "..." }]
    }
  `;

  try {
    let text = await analyzeAudioFlow(req.file.buffer, req.file.mimetype, prompt);

    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];

    const data = JSON.parse(text);
    res.json(data);
  } catch (error) {
    console.error("Error Audio Analysis:", error);
    res.status(500).json({ error: "Error procesando audio", details: error.message });
  }
});

// 1.8 Transcripción Pura
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).send("No audio file.");

  try {
    const transcript = await transcribeAudio(req.file.buffer, req.file.mimetype);
    res.json({ transcript });
  } catch (error) {
    console.error("Error Transcription:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Jira (Simulado - Manteniendo lógica original)
app.post('/api/sync-jira', async (req, res) => {
  const { issues, projectKey } = req.body;
  if (!process.env.JIRA_EMAIL || !process.env.JIRA_API_TOKEN) {
    await new Promise(r => setTimeout(r, 1000));
    return res.json({ success: true, simulated: true, count: issues?.length || 0 });
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
            content: [{ type: "paragraph", content: [{ type: "text", text: issue.description || "" }] }]
          },
          issuetype: { name: issue.type || "Task" },
          priority: { name: issue.priority || "Medium" }
        }
      };
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
    res.status(500).json({ error: "Fallo Jira", details: error.response?.data });
  }
});

// 2.1 Verificar Conexión Jira
app.get('/api/jira-check', async (req, res) => {
  if (!process.env.JIRA_EMAIL || !process.env.JIRA_API_TOKEN || !process.env.JIRA_DOMAIN) {
    return res.status(500).json({ error: "Credenciales de Jira faltantes en .env" });
  }

  try {
    const response = await axios.get(`https://${process.env.JIRA_DOMAIN}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
        'Accept': 'application/json'
      }
    });
    res.json({ success: true, user: response.data.displayName, email: response.data.emailAddress });
  } catch (error) {
    console.error("Jira Check Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Fallo conexión a Jira", details: error.response?.data || error.message });
  }
});

// 3. Mentor Virtual
app.post('/api/mentor', async (req, res) => {
  const { history, message } = req.body;

  const systemPrompt = `
    Eres 'MentorIA', un asistente experto en Metodologías Ágiles (Scrum) y Jira.
    Sé breve, amigable y profesional.
  `;

  const conversation = history.map(m => `${m.role}: ${m.content}`).join('\n');
  const fullPrompt = `${conversation}\nuser: ${message}\nassistant:`;

  try {
    const reply = await generateText(fullPrompt, systemPrompt);
    res.json({ reply });
  } catch (error) {
    console.error("Error Mentor:", error);
    res.status(500).json({ error: "Mentor desconectado." });
  }
});

// --- PERSISTENCIA & SERVIDOR ---
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const loadTasks = () => {
  try { return fs.existsSync(TASKS_FILE) ? JSON.parse(fs.readFileSync(TASKS_FILE)) : []; }
  catch { return []; }
};
const saveTasks = (t) => fs.writeFileSync(TASKS_FILE, JSON.stringify(t, null, 2));

app.get('/api/tasks', (req, res) => res.json(loadTasks()));
app.post('/api/tasks', (req, res) => {
  const t = loadTasks(); t.push(req.body); saveTasks(t); res.json({ success: true });
});
app.post('/api/tasks/batch', (req, res) => {
  const t = [...loadTasks(), ...req.body]; saveTasks(t); res.json({ success: true });
});
app.put('/api/tasks/:id', (req, res) => {
  let t = loadTasks(); t = t.map(x => x.id === req.params.id ? req.body : x); saveTasks(t); res.json({ success: true });
});
app.delete('/api/tasks/:id', (req, res) => {
  let t = loadTasks(); t = t.filter(x => x.id !== req.params.id); saveTasks(t); res.json({ success: true });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Servidor MentorIA (${AI_PROVIDER}) corriendo en puerto ${PORT}`));