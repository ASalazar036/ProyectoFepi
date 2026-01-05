import ReactMarkdown from 'react-markdown';

import React, { useState, useEffect, useRef } from 'react';
import { Layout, Mic, List, Calendar, User, Users, Search, Bell, Plus, MoreVertical, CheckCircle, Clock, MessageSquare, Send, X, Edit2, Trash2, MoveRight, FileDown, ExternalLink, Zap, Server, Smile, Frown, Sun, Moon, Loader, MicOff, Upload, FileAudio } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import CalendarView from './CalendarView';

// --- COMPONENTES UI (PREMIUM) ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:shadow-md ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", disabled = false }) => {
  const variants = {
    primary: "bg-[var(--color-primary)] hover:opacity-90 text-white shadow-lg shadow-indigo-300 dark:shadow-none border-0",
    secondary: "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700",
    ghost: "bg-transparent text-slate-500 hover:text-[var(--color-primary)] hover:bg-indigo-50 dark:hover:bg-slate-800 border-0"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, type = "default" }) => {
  const colors = {
    High: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200",
    Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200",
    Low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200",
    Story: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200",
    Bug: "bg-red-50 text-red-600 border-red-100",
    Task: "bg-blue-50 text-blue-600 border-blue-100"
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${colors[type] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {children}
    </span>
  );
};

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
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl p-0 overflow-hidden border border-white/20 dark:border-slate-700">
        <header className="bg-slate-50/50 dark:bg-slate-800/50 px-8 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center backdrop-blur-sm">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 font-[Outfit]">
            <Edit2 size={20} className="text-[var(--color-primary)]" /> {task ? 'Editar Tarea' : 'Nueva Tarea'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <X size={20} />
          </button>
        </header>

        <div className="p-8 space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Título</label>
            <input
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
              value={editedTask.summary}
              onChange={(e) => setEditedTask({ ...editedTask, summary: e.target.value })}
              placeholder="Ej: Diseñar Base de Datos"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Descripción</label>
            <textarea
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 h-32 text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none resize-none transition-all custom-scrollbar"
              value={editedTask.description}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              placeholder="Detalles adicionales..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Estado</label>
              <div className="relative">
                <select
                  className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                  value={editedTask.status || 'To Do'}
                  onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                >
                  <option value="Pending Sync">Pending</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
                <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                  <MoveRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Prioridad</label>
              <div className="relative">
                <select
                  className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
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

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Asignado a</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                  value={editedTask.assignee || ''}
                  placeholder="Unassigned"
                  onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Fecha Límite</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="date"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                  value={editedTask.dueDate || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50/50 dark:bg-slate-800/50 px-8 py-5 flex justify-between items-center border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={() => task && onDelete(task.id)}
            className={`text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${!task ? 'invisible' : ''}`}
          >
            <Trash2 size={16} /> Eliminar
          </button>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={onClose} className="!px-6">Cancelar</Button>
            <Button variant="primary" onClick={() => onSave(editedTask)} className="!px-8 shadow-lg shadow-indigo-200 dark:shadow-none">Guardar</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- APLICACIÓN PRINCIPAL ---

export default function MentorIAApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('default'); // default, sunset, forest, dark
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

  // Referencia de Voz (Universal)
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mimeTypeRef = useRef("audio/webm");

  // Inicializar
  useEffect(() => {
    fetch('http://localhost:3001/api/tasks').then(res => res.json()).then(data => setTasks(data));
    document.documentElement.setAttribute('data-theme', 'default');
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') setIsDarkMode(true);
    else setIsDarkMode(false);
  };




  // --- LÓGICA DE GRABACIÓN MEJORADA ---
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Tu navegador no soporta grabación de audio.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Intentar soportar multiples mimeTypes para compatibilidad cruzada
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus'; // Firefox preferido
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'; // Safari
      }

      mimeTypeRef.current = mimeType;
      console.log("Usando tipo MIME:", mimeType);

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeTypeRef.current });
        await transcribeAudio(audioBlob);

        // Limpiar tracks para apagar el icono de "Grabando" en el navegador
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error micrófono:", err);
      if (err.name === 'NotAllowedError') {
        alert("Permiso de micrófono denegado. Por favor permítelo en tu navegador.");
      } else {
        alert(`Error al iniciar grabación: ${err.message}`);
      }
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

    // Determinar extensión correcta basada en el mimeType real
    let ext = 'webm';
    if (mimeTypeRef.current.includes('mp4')) ext = 'mp4';
    if (mimeTypeRef.current.includes('ogg')) ext = 'ogg';

    formData.append('audio', audioBlob, `recording.${ext}`);

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
    if (m.includes('tense') || m.includes('bad')) return <Frown className="text-rose-500" />;
    if (m.includes('energetic') || m.includes('productive')) return <Zap className="text-amber-500" />;
    return <Smile className="text-[var(--color-primary)]" />;
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(26);
    doc.text("MentorIA", 14, 22);
    doc.setFontSize(14);
    doc.text("Resumen de Reunión", 14, 30);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleDateString()} | Mood: ${meetingSentiment || "Neutral"}`, 14, 40);
    doc.line(14, 45, 196, 45);

    // Summary Text
    let currentY = 55;
    if (transcript) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Transcripción / Resumen:", 14, currentY);
      currentY += 8;
      doc.setFontSize(10);
      doc.setTextColor(60);
      const splitText = doc.splitTextToSize(transcript, 180);
      doc.text(splitText, 14, currentY);
      currentY += splitText.length * 5 + 10;
    }

    // AutoTable for Tasks
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Tareas Generadas:", 14, currentY);

    const tableData = tasks.map(t => [t.summary, t.assignee, t.priority, t.status]);

    autoTable(doc, {
      head: [['Tarea', 'Asignado', 'Prioridad', 'Estado']],
      body: tableData,
      startY: currentY + 5,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }, // Indigo 500
      alternateRowStyles: { fillColor: [248, 250, 252] }
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

  // --- RENDER ---

  return (
    <div className={`flex h-screen font-[Inter] overflow-hidden transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-gray-900'}`}>
      <TaskModal
        key={editingTask ? editingTask.id : 'new-task'}
        isOpen={!!editingTask}
        task={editingTask?.id ? editingTask : null}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      {/* SIDEBAR - PREMIUM */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-xl transition-all">
        <div className="p-6">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[var(--color-primary)] to-purple-500 bg-clip-text text-transparent flex items-center gap-2 font-[Outfit] tracking-tight">
            <Zap size={28} className="text-[var(--color-primary)] fill-[var(--color-primary)]" />
            MentorIA
          </h1>
          <p className="text-xs text-slate-400 font-medium ml-9 tracking-widest">PREMIUM SUITE</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[var(--color-primary)]'}`}>
            <Layout size={20} className={activeTab === 'dashboard' ? 'animate-bounce-slow' : 'group-hover:scale-110 transition-transform'} />
            <span className="tracking-wide">Dashboard</span>
          </button>

          <button onClick={() => setActiveTab('board')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${activeTab === 'board' ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[var(--color-primary)]'}`}>
            <List size={20} className={activeTab === 'board' ? 'animate-bounce-slow' : 'group-hover:scale-110 transition-transform'} />
            <span className="tracking-wide">Kanban</span>
          </button>

          <button onClick={() => setActiveTab('calendar')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${activeTab === 'calendar' ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[var(--color-primary)]'}`}>
            <Calendar size={20} className={activeTab === 'calendar' ? 'animate-bounce-slow' : 'group-hover:scale-110 transition-transform'} />
            <span className="tracking-wide">Calendario</span>
            <span className="ml-auto text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">New</span>
          </button>
        </nav>

        <div className="p-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Temas</span>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              <button onClick={() => changeTheme('default')} className={`h-8 rounded-lg bg-indigo-500 border-2 ${theme === 'default' ? 'border-indigo-900 scale-110' : 'border-transparent'}`} title="Ocean"></button>
              <button onClick={() => changeTheme('sunset')} className={`h-8 rounded-lg bg-rose-500 border-2 ${theme === 'sunset' ? 'border-rose-900 scale-110' : 'border-transparent'}`} title="Sunset"></button>
              <button onClick={() => changeTheme('forest')} className={`h-8 rounded-lg bg-emerald-500 border-2 ${theme === 'forest' ? 'border-emerald-900 scale-110' : 'border-transparent'}`} title="Forest"></button>
              <button onClick={() => changeTheme('dark')} className={`h-8 rounded-lg bg-slate-800 border-2 ${theme === 'dark' ? 'border-slate-400 scale-110' : 'border-transparent'}`} title="Dark"></button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              <p className="font-semibold mb-1">Jira Project Key:</p>
              <input
                value={jiraProjectKey}
                onChange={(e) => setJiraProjectKey(e.target.value)}
                className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg w-full border border-slate-200 dark:border-slate-600 focus:border-[var(--color-primary)] outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[var(--color-bg-main)]">
        <div className="flex-1 overflow-hidden p-8 flex flex-col animate-fade-in">

          {/* VISTA 1: DASHBOARD (REUNIÓN) */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full overflow-y-auto pb-20 custom-scrollbar">
              <div className="lg:col-span-2 flex flex-col gap-8">

                <Card className="flex-1 flex flex-col border-0">
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800 dark:text-white font-[Outfit]">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[var(--color-primary)]">
                          <Mic size={20} />
                        </div>
                        Sala de Reuniones
                      </h2>
                      <div className="flex gap-2">
                        {meetingSentiment && (
                          <span className="flex items-center gap-2 text-xs font-bold bg-white dark:bg-slate-700 shadow-sm text-slate-600 dark:text-slate-200 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-600">
                            {getMoodIcon(meetingSentiment)} Mood: {meetingSentiment}
                          </span>
                        )}
                        <span className="text-xs font-mono bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-1.5 rounded border border-indigo-100 dark:border-indigo-800 flex items-center gap-1">
                          <Server size={10} /> Gemini 2.5
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200 transition-all group">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">Grabación en vivo</h3>
                        <button
                          onClick={toggleRecording}
                          className={`w-full h-16 rounded-xl font-bold text-white transition-all shadow-md flex items-center justify-center gap-3
                            ${isRecording
                              ? 'bg-rose-500 animate-pulse shadow-rose-200'
                              : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:to-indigo-600 shadow-indigo-200 dark:shadow-none'}`}
                        >
                          {isRecording ? <><MicOff /> Detener</> : <><Mic /> Iniciar Grabación</>}
                        </button>
                      </div>

                      <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200 transition-all">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                          <span className="flex items-center gap-2">Subir Archivo</span>
                          {uploadedFile && (
                            <button onClick={() => { setUploadedFile(null); setTranscript(""); }} className="text-xs text-rose-500 hover:bg-rose-50 px-2 py-1 rounded-md transition-colors flex items-center gap-1">
                              <X size={12} /> Quitar
                            </button>
                          )}
                        </h3>
                        <label className={`flex flex-col items-center justify-center w-full h-16 border-2 border-dashed rounded-xl cursor-pointer transition-colors group ${uploadedFile ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                          <div className="flex items-center gap-3 text-slate-400 group-hover:text-[var(--color-primary)] transition-colors">
                            {uploadedFile ? <CheckCircle size={20} className="text-emerald-500" /> : <Upload size={20} />}
                            <span className={`text-sm font-medium ${uploadedFile ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>{uploadedFile ? uploadedFile.name : "Seleccionar Audio"}</span>
                          </div>
                          <input type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
                        </label>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 ml-1">Transcripción</h3>
                    <div className="relative flex-1 mb-6 group">
                      <textarea
                        className="w-full h-full min-h-[200px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 font-mono text-sm text-slate-700 dark:text-slate-300 shadow-inner resize-none focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder="...esperando audio..."
                      />
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setTranscript("El equipo debe crear la base de datos en MongoDB para el viernes y Juan debe diseñar el login con prioridad alta.")} className="text-xs bg-white dark:bg-slate-800 text-[var(--color-primary)] px-3 py-1 rounded-full shadow border border-slate-200 dark:border-slate-600 hover:bg-slate-50">
                          Demo Text
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      {uploadedFile ? (
                        <Button onClick={analyzeAudioFile} disabled={isAnalyzing} variant="success" className="w-full sm:w-auto">
                          {isAnalyzing ? <Loader className="animate-spin" /> : <FileAudio />}
                          {isAnalyzing ? "Procesando..." : "Analizar Archivo"}
                        </Button>
                      ) : (
                        <Button onClick={analyzeMeeting} disabled={!transcript || isAnalyzing} variant="primary" className="w-full sm:w-auto text-lg py-4">
                          {isAnalyzing ? <Loader className="animate-spin" /> : <Zap fill="currentColor" />}
                          {isAnalyzing ? "Analizando..." : "Generar Tareas con IA"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Chat Panel - Fixed Scroll */}
              <div className="lg:col-span-1 h-[calc(100vh-140px)] lg:h-full flex flex-col min-h-0">
                <Card className="h-full flex flex-col border-0 shadow-xl overflow-hidden bg-white dark:bg-slate-800">
                  <div className="p-0 h-full flex flex-col bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
                    <div className="p-5 bg-gradient-to-r from-[var(--color-primary)] to-indigo-600 text-white font-bold flex items-center gap-3 shadow-md relative overflow-hidden">
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="relative">
                        <div className="absolute -right-0.5 -top-0.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse ring-2 ring-indigo-500"></div>
                        <Users size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-tight">Mentor Virtual</h3>
                        <p className="text-indigo-200 text-xs font-medium">Asistente Scrum & Jira</p>
                      </div>
                    </div>

                    <div className="flex-1 p-5 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 space-y-4 custom-scrollbar">
                      {chatHistory.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            <Users size={32} />
                          </div>
                          <p className="text-slate-500 text-sm max-w-[200px]">Pregúntame sobre metodologías ágiles o los tickets generados.</p>
                        </div>
                      )}
                      {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${msg.role === 'user'
                            ? 'bg-[var(--color-primary)] text-white rounded-br-none'
                            : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none overflow-hidden'
                            }`}>
                            {msg.role === 'user' ? (
                              msg.content
                            ) : (
                              <ReactMarkdown
                                components={{
                                  strong: ({ node, ...props }) => <span className="font-bold text-indigo-600 dark:text-indigo-400" {...props} />,
                                  ul: ({ node, ...props }) => <ul className="list-disc ml-4 space-y-1 my-2" {...props} />,
                                  ol: ({ node, ...props }) => <ol className="list-decimal ml-4 space-y-1 my-2" {...props} />,
                                  li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                  code: ({ node, inline, ...props }) => (
                                    inline
                                      ? <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-xs font-mono text-pink-500" {...props} />
                                      : <div className="bg-slate-900 rounded-lg p-3 my-2 text-xs font-mono text-emerald-400 overflow-x-auto"><code {...props} /></div>
                                  )
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            )}
                          </div>
                        </div>
                      ))}
                      {isChatting && <div className="text-xs text-slate-400 ml-4 animate-pulse">Escribiendo...</div>}
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                      <input
                        className="flex-1 bg-slate-100 dark:bg-slate-700 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                        placeholder="Escribe tu duda..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                      />
                      <button onClick={sendChatMessage} className="bg-[var(--color-primary)] text-white p-3 rounded-xl hover:opacity-90 transition-all shadow-md shadow-indigo-200 dark:shadow-none">
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* VISTA 2: KANBAN BOARD */}
          {activeTab === 'board' && (
            <div className="h-full flex flex-col overflow-hidden">
              <header className="flex justify-between items-center mb-8 flex-shrink-0 px-2 pt-2">
                <div className="min-w-0 flex-1 mr-4">
                  <h2 className="text-4xl font-bold text-slate-800 dark:text-white font-[Outfit]">Tablero Kanban</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gestiona el flujo de trabajo de tu equipo</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setEditingTask({})} variant="primary" className="shadow-none">
                    <Plus size={18} /> Nueva Tarea
                  </Button>
                  <Button onClick={generatePDF} variant="secondary">
                    <FileDown size={18} /> PDF
                  </Button>
                  <Button onClick={syncWithJira} disabled={isSyncing} variant="ghost" className="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30">
                    {isSyncing ? <Loader className="animate-spin" /> : <ExternalLink size={18} />}
                    {isSyncing ? "Enviando..." : `Jira Sync`}
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
                          className={`min-w-[320px] w-[340px] bg-slate-100/50 dark:bg-slate-800/50 rounded-3xl p-5 border border-white dark:border-slate-700 backdrop-blur-sm flex flex-col h-full max-h-full flex-shrink-0 transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-50/50 dark:bg-slate-700/50 border-indigo-200' : ''}`}
                        >
                          <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-6 flex justify-between items-center px-1">
                            <span className="text-sm uppercase tracking-wider">{status}</span>
                            <span className="bg-white dark:bg-slate-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm text-slate-500 dark:text-slate-400">
                              {tasks.filter(t => (t.status || 'To Do') === status).length}
                            </span>
                          </h3>

                          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-0">
                            {tasks.filter(t => (t.status || 'To Do') === status).map((task, idx) => (
                              <Draggable key={task.id} draggableId={task.id} index={idx}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => setEditingTask(task)}
                                    style={{ ...provided.draggableProps.style }}
                                    className={`bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group relative break-words 
                                      ${snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105 z-50 ring-2 ring-[var(--color-primary)]' : ''}
                                      ${task.priority === 'High' ? 'border-l-4 border-l-rose-500' : ''}
                                    `}
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <Badge type={task.priority}>{task.priority}</Badge>
                                      {task.synced && <div className="text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full p-1"><CheckCircle size={12} /></div>}
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-2 leading-snug">{task.summary}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 font-medium">{task.description}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                                          {task.assignee ? task.assignee.charAt(0).toUpperCase() : <User size={12} />}
                                        </div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[80px]">{task.assignee || "Unassigned"}</span>
                                      </div>
                                      {task.dueDate && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-600">
                                          <Calendar size={12} /> {task.dueDate}
                                        </div>
                                      )}
                                    </div>
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

          {/* VISTA 3: CALENDAR */}
          {activeTab === 'calendar' && (
            <CalendarView tasks={tasks} onEditTask={setEditingTask} />
          )}

        </div>
      </main>
    </div>
  );
}