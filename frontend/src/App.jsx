import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Play, CheckCircle, AlertCircle, Loader, Users, Layout, List, Settings, Plus, ExternalLink, Server, Upload, FileAudio, Calendar, User, Edit2, X, MoveRight, Trash2, Moon, Sun, FileDown, Smile, Frown, Meh, Zap } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- COMPONENTES UI ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", disabled = false, className = "" }) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    success: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, type = "default" }) => {
  const colors = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-green-100 text-green-800",
    Story: "bg-purple-100 text-purple-800",
    Bug: "bg-red-50 text-red-600",
    Task: "bg-blue-50 text-blue-600"
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${colors[type] || "bg-gray-100"}`}>
      {children}
    </span>
  );
};

// --- MODAL DE EDICIÓN ---
const TaskModal = ({ task, isOpen, onClose, onSave, onDelete }) => {
  const [editedTask, setEditedTask] = useState(task || {
    summary: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    assignee: '',
    dueDate: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-0 overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200">
        <header className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Edit2 size={18} className="text-blue-600" /> {task ? 'Editar Tarea' : 'Nueva Tarea'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </header>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Título</label>
            <input
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={editedTask.summary}
              onChange={(e) => setEditedTask({ ...editedTask, summary: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Descripción</label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 h-32 text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all custom-scrollbar"
              value={editedTask.description}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Estado</label>
              <div className="relative">
                <select
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editedTask.status || 'To Do'}
                  onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                >
                  <option value="Pending Sync">Pending Sync</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                  <MoveRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Prioridad</label>
              <div className="relative">
                <select
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editedTask.priority || 'Medium'}
                  onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Asignado a</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editedTask.assignee || ''}
                  placeholder="Unassigned"
                  onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Fecha Límite</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="date"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editedTask.dueDate || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-100">
          <button
            onClick={() => task && onDelete(task.id)}
            className={`text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${!task ? 'invisible' : ''}`}
          >
            <Trash2 size={16} /> Eliminar
          </button>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="!border-slate-300">Cancelar</Button>
            <Button variant="primary" onClick={() => onSave(editedTask)} className="shadow-lg shadow-blue-200">Guardar</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- APLICACIÓN PRINCIPAL ---

export default function MentorIAApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [meetingSentiment, setMeetingSentiment] = useState(null);

  // Estados de Audio e IA
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Datos
  const [tasks, setTasks] = useState([]);
  const [jiraProjectKey, setJiraProjectKey] = useState("TESIS");

  // Chat Mentor
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  // Modal Editing
  const [editingTask, setEditingTask] = useState(null);

  // Referencia de Voz (Nueva Universal)
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Inicializar Web Speech API & Cargar Tareas
  useEffect(() => {
    // 1. Cargar Tareas Guardadas
    fetch('http://localhost:3001/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error("Error cargando tareas:", err));

    // Dark Mode LocalStorage
    /* if (localStorage.getItem('theme') === 'dark') setIsDarkMode(true); */

    // 2. Init Speech (Legacy / Fallback)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // ... (Legacy speech code kept for safety)
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    /* localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light'); */
  };

  // --- NUEVA LÓGICA DE GRABACIÓN UNIVERSAL ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error micrófono:", err);
      alert("No se pudo acceder al micrófono. Verifica permisos.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const response = await fetch('http://localhost:3001/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error("Error en transcripción");

      const data = await response.json();
      setTranscript(prev => prev + (prev ? " " : "") + data.transcript);

    } catch (error) {
      console.error(error);
      alert("Error transcribiendo el audio.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- CONEXIONES AL BACKEND ---

  const analyzeMeeting = async () => {
    if (!transcript) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      });
      const data = await response.json();
      handleAnalysisResult(data);
    } catch (error) {
      alert("Error conectando al Backend. Asegúrate de correr 'npm start' en backend.");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeAudioFile = async () => {
    if (!uploadedFile) return;
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append('audio', uploadedFile);

    try {
      const response = await fetch('http://localhost:3001/api/analyze-file', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      handleAnalysisResult(data);
    } catch (error) {
      alert(`Fallo en subida: ${error.message}`);
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalysisResult = async (data) => {
    if (data.sentiment) setMeetingSentiment(data.sentiment);

    if (data.issues) {
      const newTasks = data.issues.map(t => ({
        ...t,
        id: `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'Pending Sync',
        assignee: t.assignee || "Unassigned",
        dueDate: t.dueDate || new Date().toISOString().split('T')[0]
      }));

      try {
        await fetch('http://localhost:3001/api/tasks/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTasks)
        });
        setTasks(prev => [...prev, ...newTasks]);
        setActiveTab('board');
        addSystemMessage(`¡Guardado! He detectado ${newTasks.length} tareas nuevas.${data.sentiment ? ` El mood de la reunión fue: ${data.sentiment}.` : ''}`);
      } catch (e) {
        alert("Error guardando tareas en DB local.");
        console.error(e);
      }
    }
  };

  // Helpers
  const getMoodIcon = (mood) => {
    if (!mood) return <Smile size={20} />;
    const m = mood.toLowerCase();
    if (m.includes('tense') || m.includes('bad')) return <Frown className="text-red-500" />;
    if (m.includes('energetic') || m.includes('productive')) return <Zap className="text-yellow-500" />;
    return <Smile className="text-blue-500" />;
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("MentorIA - Resumen de Reunión", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha: ${new Date().toLocaleDateString()} | Mood: ${meetingSentiment || "N/A"}`, 14, 30);

    // Summary Text
    if (transcript) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Transcripción / Resumen:", 14, 40);
      doc.setFontSize(10);
      doc.setTextColor(60);
      const splitText = doc.splitTextToSize(transcript, 180);
      doc.text(splitText, 14, 48);
    }

    // AutoTable for Tasks
    const startY = transcript ? 80 : 40;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Tareas Generadas:", 14, startY);

    const tableData = tasks.map(t => [t.summary, t.assignee, t.priority, t.status]);

    autoTable(doc, {
      head: [['Tarea', 'Asignado', 'Prioridad', 'Estado']],
      body: tableData,
      startY: startY + 5,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`mentoria_report_${Date.now()}.pdf`);
  };

  const syncWithJira = async () => {
    setIsSyncing(true);
    const pendingTasks = tasks.filter(t => t.status === 'Pending Sync');

    if (pendingTasks.length === 0) {
      alert("No hay tareas nuevas para sincronizar.");
      setIsSyncing(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/sync-jira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issues: pendingTasks, projectKey: jiraProjectKey })
      });
      const data = await response.json();

      if (data.success) {
        setTasks(prev => prev.map(t =>
          t.status === 'Pending Sync' ? { ...t, status: 'To Do', synced: true } : t
        ));
        alert(data.simulated ? "Simulación: Tareas 'enviadas' a Jira correctamente." : "¡Éxito! Tareas creadas en Jira.");
      }
    } catch (error) {
      alert("Error al sincronizar con Jira");
    } finally {
      setIsSyncing(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', content: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatting(true);

    try {
      const response = await fetch('http://localhost:3001/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: chatHistory, message: userMsg.content })
      });
      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Error: No puedo conectar con mi cerebro (Backend)." }]);
    } finally {
      setIsChatting(false);
    }
  };

  const addSystemMessage = (text) => {
    setChatHistory(prev => [...prev, { role: 'assistant', content: text }]);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSaveTask = async (updatedTask) => {
    // If NO ID, it's a creation
    if (!updatedTask.id) {
      const newTask = {
        ...updatedTask,
        id: `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: updatedTask.status || 'To Do'
      };

      setTasks(prev => [...prev, newTask]);
      setEditingTask(null);

      try {
        await fetch('http://localhost:3001/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask)
        });
      } catch (e) { console.error("Error creando tarea:", e); }
      return;
    }

    // UPDATE logic
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setEditingTask(null);

    try {
      await fetch(`http://localhost:3001/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
    } catch (e) {
      console.error("Error actualizando tarea:", e);
    }
  };

  const handleDeleteTask = async (id) => {
    if (confirm('¿Seguro que quieres borrar esta tarea?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
      setEditingTask(null);

      try {
        await fetch(`http://localhost:3001/api/tasks/${id}`, { method: 'DELETE' });
      } catch (e) { console.error("Error eliminando:", e); }
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, status: newStatus };
    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

    try {
      await fetch(`http://localhost:3001/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
    } catch (e) {
      console.error("Error moviendo tarea:", e);
    }
  };

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-gray-900'}`}>
      <TaskModal
        key={editingTask ? editingTask.id : 'new-task'}
        isOpen={!!editingTask}
        task={editingTask?.id ? editingTask : null}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20 flex-shrink-0">
        <div className="p-6 flex items-center gap-3 text-white font-bold text-xl border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">M</div>
          MentorIA
        </div>

        {/* Theme Toggle */}
        <div className="px-6 py-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all text-sm"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            {isDarkMode ? "Modo Claro" : "Modo Oscuro"}
          </button>
        </div>

        <nav className="flex-1 px-2 space-y-2 mt-6">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800'}`}>
            <Layout size={20} /> Reunión & IA
          </button>
          <button onClick={() => setActiveTab('board')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'board' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800'}`}>
            <List size={20} /> Tablero de Tareas
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 bg-slate-950">
          <p className="font-semibold mb-1">Proyecto Jira Key:</p>
          <input
            value={jiraProjectKey}
            onChange={(e) => setJiraProjectKey(e.target.value)}
            className="bg-slate-800 text-white px-3 py-2 rounded w-full border border-slate-700 focus:border-blue-500 outline-none"
          />
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-colors duration-300 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <div className="flex-1 overflow-hidden p-8 flex flex-col">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-y-auto pb-20">
              <div className="lg:col-span-2 flex flex-col gap-6">

                <Card className="p-6 flex-1 flex flex-col shadow-md border-0">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                      <Mic className="text-blue-600" /> Fuente de la Reunión
                    </h2>
                    <div className="flex gap-2">
                      {meetingSentiment && (
                        <span className="flex items-center gap-2 text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                          {getMoodIcon(meetingSentiment)} Mood: {meetingSentiment}
                        </span>
                      )}
                      <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">Gemini 2.5 Flash</span>
                    </div>
                  </div>

                  <div className="flex gap-4 mb-6">
                    <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2"><Mic size={16} /> Grabación en vivo</h3>
                      <button
                        onClick={toggleRecording}
                        className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white transition-all shadow-sm ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'}`}
                      >
                        {isRecording ? <><MicOff /> Detener Grabación</> : <><Mic /> Iniciar Grabación</>}
                      </button>
                    </div>

                    <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2"><Upload size={16} /> Subir Audio</h3>
                      <label className="flex flex-col items-center justify-center w-full h-14 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2 text-gray-500">
                          <FileAudio size={20} />
                          <span className="text-sm font-medium">{uploadedFile ? uploadedFile.name : "Seleccionar MP3/WAV"}</span>
                        </div>
                        <input type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
                      </label>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-gray-700 mb-2">Transcripción (Editable):</h3>
                  <textarea
                    className="flex-1 bg-slate-100 border border-slate-200 rounded-xl p-4 mb-4 font-mono text-sm text-slate-700 shadow-inner resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Aquí aparecerá el texto de tu reunión. Puedes editarlo antes de generar tareas..."
                  />

                  <div className="flex gap-4 items-center border-t pt-4">
                    <button onClick={() => setTranscript("El equipo debe crear la base de datos en MongoDB para el viernes y Juan debe diseñar el login con prioridad alta.")} className="text-xs text-blue-500 font-medium hover:underline">
                      [Demo: Insertar Texto Prueba]
                    </button>

                    <div className="flex-1"></div>

                    {uploadedFile ? (
                      <Button onClick={analyzeAudioFile} disabled={isAnalyzing} variant="success" className="shadow-lg shadow-green-200">
                        {isAnalyzing ? <Loader className="animate-spin" /> : <FileAudio />}
                        {isAnalyzing ? "Analizando Audio..." : "Procesar Archivo"}
                      </Button>
                    ) : (
                      <Button onClick={analyzeMeeting} disabled={!transcript || isAnalyzing} variant="primary" className="shadow-lg shadow-blue-200">
                        {isAnalyzing ? <Loader className="animate-spin" /> : <Server />}
                        {isAnalyzing ? "Analizando Texto..." : "Generar Tareas"}
                      </Button>
                    )}
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-1 h-full flex flex-col">
                <Card className="h-full flex flex-col border-0 shadow-lg overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold flex items-center gap-2 shadow-md">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_theme('colors.green.400')]"></div>
                    Mentor Virtual
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
                    {chatHistory.length === 0 && (
                      <div className="text-center mt-10 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users size={24} />
                        </div>
                        <p className="text-slate-600 font-medium">¡Hola!</p>
                        <p className="text-slate-400 text-sm mt-1">Soy tu experto en Scrum y Jira. Pregúntame lo que necesites.</p>
                      </div>
                    )}
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none' // User: White text on Blue
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none' // Bot: Dark text on White
                          }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isChatting && <div className="text-xs text-gray-400 ml-2 italic animate-pulse">Escribiendo...</div>}
                  </div>
                  <div className="p-3 border-t bg-white flex gap-2">
                    <input
                      className="flex-1 bg-slate-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800 placeholder:text-slate-400"
                      placeholder="Escribe tu duda..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                    />
                    <button onClick={sendChatMessage} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-md">
                      <Send size={18} />
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'board' && (
            <div className="h-full flex flex-col overflow-hidden">
              <header className="flex justify-between items-center mb-6 flex-shrink-0 px-2 pt-2">
                <div className="min-w-0 flex-1 mr-4">
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-white truncate">Tablero Kanban</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm truncate">Organiza y sincroniza tus tareas generadas.</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setEditingTask({})} variant="success" className="shadow-sm">
                    <Plus size={18} /> Nueva Tarea
                  </Button>
                  <Button onClick={generatePDF} variant="secondary" className="shadow-sm">
                    <FileDown size={18} /> PDF
                  </Button>
                  <Button onClick={syncWithJira} disabled={isSyncing} variant="primary" className="shadow-lg shadow-blue-200 flex-shrink-0 whitespace-nowrap">
                    {isSyncing ? <Loader className="animate-spin" /> : <ExternalLink size={18} />}
                    {isSyncing ? "Enviando..." : `Sincronizar Jira`}
                  </Button>
                </div>
              </header>

              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-6 overflow-x-auto overflow-y-hidden pb-4 flex-1 items-start px-2 custom-scrollbar">
                  {['Pending Sync', 'To Do', 'In Progress', 'Done'].map(status => (
                    <Droppable key={status} droppableId={status}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-w-[300px] w-[320px] bg-slate-100/80 rounded-2xl p-4 border border-slate-200/60 backdrop-blur-sm flex flex-col h-full max-h-full flex-shrink-0 transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/80 border-blue-200' : ''}`}
                        >
                          <h3 className="font-bold text-slate-700 mb-4 flex justify-between items-center px-2 flex-shrink-0">{status} <span className="bg-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm border border-slate-100 text-slate-600">{tasks.filter(t => (t.status || 'To Do') === status).length}</span></h3>

                          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-0">
                            {tasks.filter(t => (t.status || 'To Do') === status).map((task, idx) => (
                              <Draggable key={task.id} draggableId={task.id} index={idx}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => setEditingTask(task)}
                                    style={{ ...provided.draggableProps.style }}
                                    className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group relative break-words ${snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105 z-50 ring-2 ring-blue-500 ring-opacity-50' : ''}`}
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <Badge type={task.priority}>{task.priority}</Badge>
                                      <Badge type={task.type}>{task.type || 'Task'}</Badge>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm mb-2 leading-snug">{task.summary}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-3 mb-4">{task.description}</p>
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-2">
                                      <div className="flex items-center gap-2 text-xs text-slate-400 max-w-[60%]">
                                        <div className="w-5 h-5 flex-shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500"><User size={12} /></div>
                                        <span className="truncate">{task.assignee || "Unassigned"}</span>
                                      </div>
                                      {task.dueDate && <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded flex-shrink-0"><Calendar size={10} /> {task.dueDate}</div>}
                                    </div>
                                    {task.synced && <div className="absolute top-2 right-8 text-green-500 bg-white rounded-full p-0.5 shadow-sm"><CheckCircle size={14} fill="currentColor" className="text-white bg-green-500 rounded-full" /></div>}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  ))}
                </div>
              </DragDropContext>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}