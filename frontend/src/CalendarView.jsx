import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';

export default function CalendarView({ tasks, onEditTask }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Helpers
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month); // 0 = Sunday

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToday = () => setCurrentDate(new Date());

    const getTasksForDay = (day) => {
        const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return tasks.filter(t => t.dueDate === dayStr);
    };

    const renderCalendarDays = () => {
        const days = [];
        const blankDays = Array(firstDay).fill(null);
        const actualDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        return [...blankDays, ...actualDays].map((day, index) => {
            if (!day) return <div key={`blank-${index}`} className="bg-transparent"></div>;

            const dayTasks = getTasksForDay(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            return (
                <div key={day} className={`min-h-[120px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-750 flex flex-col gap-1 ${isToday ? 'bg-blue-50/30' : ''}`}>
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>
                            {day}
                        </span>
                    </div>

                    <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar max-h-[100px]">
                        {dayTasks.map(task => (
                            <button
                                key={task.id}
                                onClick={() => onEditTask(task)}
                                className={`text-left text-[10px] px-2 py-1.5 rounded border transition-all truncate hover:opacity-80 shadow-sm
                  ${task.status === 'Done' ? 'bg-green-50 text-green-700 border-green-200 decoration-green-500' : 'bg-white text-slate-700 border-slate-200'}
                  ${task.priority === 'High' ? 'border-l-4 border-l-red-500' : ''}
                `}
                            >
                                <span className={task.status === 'Done' ? 'line-through opacity-70' : ''}>{task.summary}</span>
                            </button>
                        ))}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
            <header className="flex justify-between items-center mb-6 px-2 pt-2 flex-shrink-0">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        Calendario
                    </h2>
                    <p className="text-slate-500 text-sm">Organiza tus entregas visualmente</p>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="w-32 text-center font-bold text-slate-800 dark:text-slate-200">
                        {monthNames[month]} {year}
                    </div>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                        <ChevronRight size={20} />
                    </button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <button onClick={goToday} className="px-3 py-1.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                        Hoy
                    </button>
                </div>
            </header>

            <div className="flex-1 flex flex-col shadow-lg rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                {/* Days Header */}
                <div className="grid grid-cols-7 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                        <div key={d} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wide">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="flex-1 grid grid-cols-7 bg-slate-200 dark:bg-slate-800 gap-px overflow-y-auto">
                    {renderCalendarDays()}
                </div>
            </div>
        </div>
    );
}
