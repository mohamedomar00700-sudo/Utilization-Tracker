
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

// --- STYLES ---
const GlobalStyles = `
    :root {
        --sidebar-width: 240px;
    }
    .app-container {
        display: flex;
        width: 100%;
        height: 100vh;
    }
    .sidebar {
        width: var(--sidebar-width);
        background-color: var(--card-bg-color);
        border-right: 1px solid var(--border-color);
        padding: 24px;
        display: flex;
        flex-direction: column;
        transition: margin-left var(--animation-speed) ease-in-out, background-color var(--animation-speed) ease;
        z-index: 1000;
    }
    .sidebar.collapsed {
        margin-left: calc(-1 * var(--sidebar-width));
    }
    .sidebar-header {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--primary-color);
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 32px;
    }
    .nav {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex-grow: 1;
    }
    .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        color: var(--text-secondary);
        transition: background-color 0.2s, color 0.2s;
    }
    .nav-item:hover {
        background-color: var(--bg-color);
    }
    .nav-item.active {
        background-color: var(--primary-color);
        color: white;
    }
    .main-content {
        flex: 1;
        padding: 32px;
        overflow-y: auto;
        position: relative;
        transition: padding-left var(--animation-speed) ease-in-out;
    }
     .sidebar-toggle {
        position: fixed;
        left: 10px;
        top: 18px;
        z-index: 1100;
        background: var(--card-bg-color);
        border: 1px solid var(--border-color);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: background-color var(--animation-speed) ease, border-color var(--animation-speed) ease;
    }
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 16px;
    }
    .header h1 {
        margin: 0;
        font-size: 28px;
        transition: margin-left var(--animation-speed) ease-in-out;
    }
    .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
    }
    .user-switcher { display: flex; align-items: center; gap: 8px; }
    .user-switcher label { font-weight: 600; font-size: 14px; }
    .user-switcher select { padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background-color: var(--card-bg-color); color: var(--text-primary); }

    .btn {
        padding: 10px 18px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: opacity 0.2s, background-color 0.2s;
    }
    .btn:hover {
        opacity: 0.9;
    }
    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .btn-primary {
        background-color: var(--accent-color);
        color: white;
    }
    .btn-danger {
        background-color: var(--danger-color);
        color: white;
    }
    .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 24px;
        margin-bottom: 32px;
    }
    .insights-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 24px;
        align-items: start;
    }
    .card {
        background-color: var(--card-bg-color);
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        border: 1px solid var(--border-color);
        transition: background-color var(--animation-speed) ease, border-color var(--animation-speed) ease;
    }
    .card h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        color: var(--text-secondary);
    }
    .card .value {
        font-size: 32px;
        font-weight: 700;
        color: var(--primary-color);
    }
    .card .value .unit {
        font-size: 20px;
        color: var(--text-secondary);
        margin-left: 4px;
    }
    .table-container {
        margin-top: 24px;
    }
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 16px;
    }
    .page-filters {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
    }
    .filter-group {
        display: flex;
        flex-direction: column;
    }
    .filter-group label {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
        margin-bottom: 4px;
    }
    .filter-group input, .filter-group select {
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid var(--border-color);
        min-width: 150px;
        background-color: var(--card-bg-color);
        color: var(--text-primary);
    }
    .page-actions {
        display: flex;
        gap: 12px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        background: var(--card-bg-color);
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    th, td {
        padding: 16px;
        text-align: left;
        border-bottom: 1px solid var(--border-color);
        transition: background-color var(--animation-speed) ease, border-color var(--animation-speed) ease;
    }
    th {
        font-size: 12px;
        text-transform: uppercase;
        color: var(--text-secondary);
        font-weight: 600;
    }
    td .actions {
        display: flex;
        gap: 8px;
    }
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fade-in var(--animation-speed) ease;
    }
    .modal-content {
        background: var(--card-bg-color);
        padding: 32px;
        border-radius: 8px;
        width: 100%;
        max-width: 600px;
        animation: slide-up var(--animation-speed) ease;
    }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }
    .form-group {
        margin-bottom: 16px;
    }
    .form-group label {
        display: block;
        font-weight: 600;
        margin-bottom: 8px;
    }
    .form-group input, .form-group select, .form-group textarea {
        width: 100%;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        font-size: 14px;
        font-family: inherit;
        background-color: var(--bg-color);
        color: var(--text-primary);
    }
    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 24px;
    }
    .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        transition: background-color 0.2s, color 0.2s;
    }
    .btn-icon:hover {
        background: var(--bg-color);
        color: var(--text-primary);
    }
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(var(--card-bg-color-rgb), 0.8);
        backdrop-filter: blur(4px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        color: var(--text-primary);
        font-size: 1.2rem;
        font-weight: 600;
    }
    .status-tag {
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        display: inline-block;
        text-align: center;
        min-width: 100px;
    }
    .status-overloaded { background-color: var(--danger-color); color: white; }
    .status-healthy { background-color: var(--success-color); color: white; }
    .status-underutilized { background-color: var(--warning-color); color: white; }
    
    .utilization-bar-container { width: 100%; max-width: 120px; height: 8px; background-color: var(--border-color); border-radius: 4px; overflow: hidden; }
    .utilization-bar { height: 100%; border-radius: 4px; transition: width 0.3s ease-in-out; }
    
    th.sortable { cursor: pointer; position: relative; }
    th.sortable:hover { background-color: var(--bg-color); }
    .sort-icon { font-size: 16px; vertical-align: middle; position: absolute; right: 16px; top: 50%; transform: translateY(-50%); }

    .toast-container { position: fixed; top: 20px; right: 20px; z-index: 2000; display: flex; flex-direction: column; gap: 10px; }
    .toast { padding: 16px; border-radius: 8px; color: white; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 10px; animation: toast-in 0.3s ease; }
    .toast-success { background-color: var(--success-color); }
    .toast-error { background-color: var(--danger-color); }
    @keyframes toast-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

    .chart-container { display: flex; align-items: center; justify-content: center; gap: 24px; padding: 16px 0; flex-wrap: wrap; }
    .chart-legend { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 14px; }
    .legend-color { width: 14px; height: 14px; border-radius: 4px; }

    .clickable-row { cursor: pointer; }
    .clickable-row:hover { background-color: var(--bg-color); }

    .empty-state, .setup-view {
        text-align: center;
        padding: 48px;
        color: var(--text-secondary);
        max-width: 600px;
        margin: 40px auto;
        background: var(--card-bg-color);
        border-radius: 12px;
        border: 1px solid var(--border-color);
    }
    .empty-state .material-icons, .setup-view .material-icons {
        font-size: 64px;
        margin-bottom: 16px;
        color: var(--primary-color);
    }
    .empty-state h3, .setup-view h3 {
        font-size: 24px;
        color: var(--text-primary);
        margin: 0 0 8px 0;
    }
    .empty-state p, .setup-view p { margin: 0 0 24px 0; line-height: 1.6; }
    
    /* My Day View Styles */
    .my-day-controls { display: flex; gap: 8px; align-items: center; margin-bottom: 16px; }
    .my-day-view { display: grid; grid-template-columns: 1fr; gap: 24px; align-items: start; }
    @media (min-width: 992px) {
        .my-day-view { grid-template-columns: 3fr 2fr; }
    }
    .timeline-container { 
        position: relative; 
        padding-left: 60px; /* Space for hour labels */
        height: 540px; /* 9 hours * 60px/hr */ 
        border-left: 2px solid var(--border-color);
        margin-left: 10px; /* Align border */
        user-select: none;
    }
    .timeline-hour-marker { 
        position: absolute; 
        left: -70px; /* Position to the left of the container */
        width: 60px; 
        text-align: right; 
        padding-right: 8px; 
        font-size: 12px; 
        color: var(--text-secondary); 
        transform: translateY(-50%); /* Center align with the line */
        pointer-events: none;
    }
    .timeline-event { 
        position: absolute; 
        left: 10px; 
        width: calc(100% - 20px); 
        background: var(--primary-color); 
        color: white; 
        padding: 8px; 
        border-radius: 4px; 
        border-left: 4px solid var(--accent-color); 
        overflow: hidden; 
        z-index: 10;
        cursor: grab;
        transition: background-color 0.2s, border-color 0.2s;
    }
    .timeline-event.is-dragging {
        opacity: 0.7;
        z-index: 20;
        cursor: grabbing;
    }
    .timeline-event.is-break {
        background: #607D8B;
        color: white;
        border-left-color: #90A4AE;
    }
    .timeline-event strong { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 14px; }
    .timeline-event span { font-size: 12px; opacity: 0.8; }

    .resize-handle {
        position: absolute;
        left: 0;
        width: 100%;
        height: 8px;
        cursor: ns-resize;
        z-index: 15;
    }
    .resize-handle.top { top: -4px; }
    .resize-handle.bottom { bottom: -4px; }

    .timeline-gap {
        all: unset; /* Reset button styles */
        box-sizing: border-box;
        position: absolute;
        left: 10px;
        width: calc(100% - 20px);
        background: rgba(0,0,0,0.02);
        border: 1px dashed var(--border-color);
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 4px;
        color: var(--text-secondary);
        transition: all 0.2s;
        font-size: 12px;
        font-weight: 600;
        z-index: 5;
        font-family: inherit;
    }
    .timeline-gap:hover {
        background-color: var(--success-color);
        opacity: 0.2;
        border-color: var(--success-color);
        color: var(--success-color);
    }
    .timeline-gap .material-icons { font-size: 18px; }
    .timeline-gap-timer { font-size: 14px; font-weight: 700; color: var(--accent-color); }
    .timeline-gap button { margin-top: 4px; }

    .activity-list ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
    .activity-item { background: var(--bg-color); border: 1px solid var(--border-color); padding: 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
    .activity-item-info { display: flex; flex-direction: column; gap: 4px; }
    .activity-item-info .title { font-weight: 600; }
    .activity-item-info .meta { font-size: 14px; color: var(--text-secondary); }
    .activity-item-info .notes { font-size: 14px; color: var(--text-primary); margin-top: 4px; font-style: italic; }
    .my-tasks-list .activity-item:hover { background-color: var(--border-color); cursor: pointer; }


    /* Week View */
    .week-view-container { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
    .week-day-column { background-color: var(--bg-color); border-radius: 8px; padding: 8px; }
    .week-day-header { text-align: center; font-weight: 600; margin-bottom: 8px; font-size: 14px; }
    .week-day-timeline { position: relative; height: 400px; }
    .week-event { position: absolute; width: 100%; background-color: var(--primary-color); border-radius: 3px; font-size: 10px; color: white; padding: 2px 4px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

    /* Bottom Nav for Mobile */
    .bottom-nav {
        display: none; /* Hidden by default */
    }
    @media (max-width: 768px) {
        .sidebar, .sidebar-toggle { display: none; }
        .main-content { padding: 16px; padding-bottom: calc(var(--bottom-nav-height) + 16px); }
        .header h1 { margin-left: 0 !important; font-size: 24px; }
        .insights-grid { grid-template-columns: 1fr; }
        .bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: var(--bottom-nav-height);
            background-color: var(--card-bg-color);
            border-top: 1px solid var(--border-color);
            justify-content: space-around;
            align-items: center;
            z-index: 1200;
        }
        .bottom-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            color: var(--text-secondary);
            font-size: 10px;
            font-weight: 600;
            cursor: pointer;
        }
        .bottom-nav-item.active { color: var(--primary-color); }
    }

    /* Theme settings */
    .theme-settings-popover {
        position: absolute;
        background-color: var(--card-bg-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        padding: 16px;
        z-index: 1200;
        right: 0;
    }
    .theme-colors { display: flex; gap: 10px; margin-top: 8px; }
    .theme-color-swatch {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid transparent;
    }
    .theme-color-swatch.active {
        border-color: var(--text-primary);
    }

    /* Project Detail View */
    .project-detail-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
        gap: 16px;
    }
    .project-detail-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .project-detail-info h2 {
        margin: 0;
        font-size: 24px;
    }
    .project-detail-meta {
        display: flex;
        gap: 16px;
        color: var(--text-secondary);
        font-size: 14px;
    }
`;

// --- TYPES ---
type Page = 'myday' | 'projects' | 'insights' | 'employees';
type ToastType = 'success' | 'error';
type TaskStatus = 'Not Started' | 'In Progress' | 'Completed';
type Theme = 'light' | 'dark';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}
interface Employee {
    id: number;
    name: string;
    role: string;
    team: string;
    weekly_capacity_hours: number;
}
interface Task {
    id: number;
    title: string;
    type: string;
    complexity: 1 | 2 | 3 | 4 | 5;
    status: TaskStatus;
    assigned_employee_id: number | null;
}
interface TimeLog {
    id: number;
    employee_id: number;
    task_id: number;
    date: string; // YYYY-MM-DD
    start_time: string; // HH:MM
    end_time: string; // HH:MM
    notes?: string;
}

// --- UTILS ---
const calculateDuration = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    try {
        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);
        if (isNaN(startMinutes) || isNaN(endMinutes) || endMinutes < startMinutes) return 0;
        return (endMinutes - startMinutes) / 60;
    } catch {
        return 0;
    }
};

const timeToMinutes = (time: string) => {
    if (!time || !time.includes(':')) return 0;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

const minutesToTime = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error: any) {
            console.log(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error: any) {
            console.log(error);
        }
    };
    return [storedValue, setValue];
}

// --- REUSABLE COMPONENTS ---

interface ModalProps {
    title: React.ReactNode;
    onClose: () => void;
    children?: React.ReactNode;
}
function Modal({ title, children, onClose }: ModalProps) {
    const mouseDownTarget = useRef(null);
    const handleMouseDown = (e: React.MouseEvent) => { mouseDownTarget.current = e.target as any; };
    const handleMouseUp = (e: React.MouseEvent) => {
        if (mouseDownTarget.current === e.target && e.currentTarget === e.target) { onClose(); }
    };
    return (
        <div className="modal-backdrop" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button onClick={onClose} className="btn-icon" aria-label="Close modal"><span className="material-icons">close</span></button>
                </div>
                {children}
            </div>
        </div>
    );
}

interface ToastNotificationsProps {
    toasts: Toast[];
    setToasts: React.Dispatch<React.SetStateAction<Toast[]>>;
}
const ToastNotifications = ({ toasts, setToasts }: ToastNotificationsProps) => {
    useEffect(() => {
        if (toasts.length > 0) {
            const timer = setTimeout(() => setToasts(prev => prev.slice(1)), 3000);
            return () => clearTimeout(timer);
        }
    }, [toasts, setToasts]);

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast toast-${toast.type}`}>
                    <span className="material-icons">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
                    {toast.message}
                </div>
            ))}
        </div>
    );
};

interface ChartDataItem {
    label: string;
    value: number;
}
interface DonutChartProps {
    data: ChartDataItem[];
    colors: string[];
}
const DonutChart = ({ data, colors }: DonutChartProps) => {
    const size = 180;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return <p>No data to display in chart.</p>;

    let accumulated = 0;

    return (
        <div className="chart-container">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <g transform={`rotate(-90 ${size/2} ${size/2})`}>
                    {data.map((item, index) => {
                        const dashoffset = circumference - (accumulated / total * circumference);
                        const dasharray = (item.value / total) * circumference;
                        accumulated += item.value;
                        return (
                            <circle key={index} r={radius} cx={size/2} cy={size/2} fill="transparent" stroke={colors[index % colors.length]} strokeWidth={strokeWidth} strokeDasharray={`${dasharray} ${circumference}`} strokeDashoffset={dashoffset} />
                        );
                    })}
                </g>
            </svg>
            <ul className="chart-legend">
                {data.map((item, index) => (
                    <li key={index} className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: colors[index % colors.length] }}></span>
                        <span>{item.label} ({item.value})</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

interface BarChartProps {
    data: ChartDataItem[];
    colors: string[];
}
const BarChart = ({ data, colors }: BarChartProps) => {
    const chartHeight = 220;
    const chartWidth = 350;
    const barGap = 10;
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const barWidth = (chartWidth - (data.length - 1) * barGap) / data.length;

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                <g>
                    {data.map((item, index) => {
                        const barHeight = (item.value / maxValue) * (chartHeight - 30);
                        const x = index * (barWidth + barGap);
                        const y = chartHeight - barHeight - 20;
                        return (
                            <g key={index}>
                                <rect x={x} y={y} width={barWidth} height={barHeight} fill={colors[index % colors.length]} rx="4" />
                                <text x={x + barWidth / 2} y={chartHeight - 5} textAnchor="middle" fontSize="12" fill="var(--text-secondary)">{item.label}</text>
                                <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize="12" fill="var(--text-primary)" fontWeight="bold">{item.value}h</text>
                            </g>
                        );
                    })}
                </g>
            </svg>
        </div>
    );
};

interface EmptyStateProps {
    icon: string;
    title: string;
    message: string;
    action: React.ReactNode;
}
const EmptyState = ({ icon, title, message, action }: EmptyStateProps) => (
    <div className="empty-state">
        <span className="material-icons">{icon}</span>
        <h3>{title}</h3>
        <p>{message}</p>
        {action}
    </div>
);

interface NavItemProps {
    key?: React.Key;
    icon: string;
    label: string;
    active: boolean;
    onClick: () => void;
}
function NavItem({ icon, label, active, onClick }: NavItemProps) {
    return (
        <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
            <span className="material-icons">{icon}</span>
            <span>{label}</span>
        </div>
    );
}

interface BottomNavItemProps {
    key?: React.Key;
    icon: string;
    label: string;
    active: boolean;
    onClick: () => void;
}
function BottomNavItem({ icon, label, active, onClick }: BottomNavItemProps) {
    return (
        <div className={`bottom-nav-item ${active ? 'active' : ''}`} onClick={onClick}>
            <span className="material-icons">{icon}</span>
            <span>{label}</span>
        </div>
    );
}

// --- VIEW COMPONENTS ---
interface WorkloadDataItem {
    id: number;
    name: string;
    team: string;
    capacity: number;
    loggedHours: string;
    utilization: number;
    status: string;
    barColor: string;
}
interface InsightsViewProps {
    employees: Employee[];
    timeLogs: TimeLog[];
    tasks: Task[];
    teams: string[];
    onEmployeeSelect: (id: number) => void;
}
const InsightsView = ({ employees, timeLogs, tasks, teams, onEmployeeSelect }: InsightsViewProps) => {
    const [filters, setFilters] = useState({ team: 'all', status: 'all', from: '', to: '' });
    const [sortConfig, setSortConfig] = useState<{key: keyof WorkloadDataItem, direction: string}>({ key: 'utilization', direction: 'descending' });

    const filteredTimeLogsForDates = useMemo(() => {
        if (!filters.from && !filters.to) return timeLogs;
        return timeLogs.filter(log => {
            const logDate = new Date(log.date);
            const fromDate = filters.from ? new Date(filters.from) : null;
            const toDate = filters.to ? new Date(filters.to) : null;
            if (fromDate && logDate < fromDate) return false;
            if (toDate && logDate > toDate) return false;
            return true;
        });
    }, [timeLogs, filters.from, filters.to]);

    const filteredEmployees = useMemo(() => {
        return filters.team === 'all' ? employees : employees.filter(e => e.team === filters.team);
    }, [employees, filters.team]);

    const kpis = useMemo(() => {
        if (filteredEmployees.length === 0) {
            return { totalEmployees: 0, avgUtilization: '0.0', overloadedCount: 0, underutilizedCount: 0, healthyCount: 0 };
        }
        const employeeIds = new Set(filteredEmployees.map(e => e.id));
        const relevantTimeLogs = filteredTimeLogsForDates.filter(log => employeeIds.has(log.employee_id));

        const employeeHours = filteredEmployees.map(emp => {
            const loggedHours = relevantTimeLogs.filter(log => log.employee_id === emp.id).reduce((sum, log) => sum + calculateDuration(log.start_time, log.end_time), 0);
            return { utilization: emp.weekly_capacity_hours > 0 ? (loggedHours / emp.weekly_capacity_hours) : 0 };
        });
        
        const totalLoggedHours = relevantTimeLogs.reduce((sum, log) => sum + calculateDuration(log.start_time, log.end_time), 0);
        const totalCapacityHours = filteredEmployees.reduce((sum, emp) => sum + emp.weekly_capacity_hours, 0);
        const avgUtilization = totalCapacityHours > 0 ? (totalLoggedHours / totalCapacityHours * 100) : 0;

        const overloadedCount = employeeHours.filter(emp => emp.utilization > 1.2).length;
        const underutilizedCount = employeeHours.filter(emp => emp.utilization < 0.8).length;
        const healthyCount = employeeHours.length - overloadedCount - underutilizedCount;

        return { totalEmployees: filteredEmployees.length, avgUtilization: avgUtilization.toFixed(1), overloadedCount, underutilizedCount, healthyCount };
    }, [filteredEmployees, filteredTimeLogsForDates]);
    
    const donutChartData = [{ label: 'Overloaded', value: kpis.overloadedCount }, { label: 'Healthy', value: kpis.healthyCount }, { label: 'Underutilized', value: kpis.underutilizedCount }];
    
    const taskTypeHoursData = useMemo(() => {
        const taskTypeMap = new Map(tasks.map(t => [t.id, t.type]));
        const hoursByType = new Map<string, number>();

        filteredTimeLogsForDates.forEach(log => {
            const type = taskTypeMap.get(log.task_id) || 'Uncategorized';
            const currentHours = hoursByType.get(type) || 0;
            hoursByType.set(type, currentHours + calculateDuration(log.start_time, log.end_time));
        });

        return Array.from(hoursByType.entries())
            .map(([label, value]) => ({ label, value: Math.round(value) }))
            .sort((a,b) => b.value - a.value);
    }, [tasks, filteredTimeLogsForDates]);

    const workloadData: WorkloadDataItem[] = useMemo(() => {
        let currentEmployees = employees;
        if (filters.team !== 'all') currentEmployees = currentEmployees.filter(emp => emp.team === filters.team);

        const data = currentEmployees.map(emp => {
            const loggedHours = filteredTimeLogsForDates.filter(log => log.employee_id === emp.id).reduce((sum, log) => sum + calculateDuration(log.start_time, log.end_time), 0);
            const capacity = emp.weekly_capacity_hours;
            const utilization = capacity > 0 ? (loggedHours / capacity) * 100 : 0;
            let status = 'Healthy';
            let barColor = 'var(--success-color)';
            if (utilization > 120) { status = 'Overloaded'; barColor = 'var(--danger-color)'; }
            else if (utilization < 80) { status = 'Underutilized'; barColor = 'var(--warning-color)'; }
            return { id: emp.id, name: emp.name, team: emp.team, capacity, loggedHours: loggedHours.toFixed(1), utilization, status, barColor };
        });

        return filters.status !== 'all' ? data.filter(item => item.status.toLowerCase() === filters.status) : data;
    }, [employees, filteredTimeLogsForDates, filters.team, filters.status]);

    const sortedData = useMemo(() => {
        let sortableItems = [...workloadData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [workloadData, sortConfig]);

    const requestSort = (key: keyof WorkloadDataItem) => {
        let direction = 'ascending';
        if (sortConfig?.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; }
        setSortConfig({ key, direction });
    };
    const getSortIcon = (key: keyof WorkloadDataItem) => {
        if (!sortConfig || sortConfig.key !== key) return <span className="material-icons sort-icon" style={{ opacity: 0.3 }}>unfold_more</span>;
        return sortConfig.direction === 'ascending' ? <span className="material-icons sort-icon">expand_less</span> : <span className="material-icons sort-icon">expand_more</span>;
    };

    const chartColors = ['var(--danger-color)', 'var(--success-color)', 'var(--warning-color)'];
    const barChartColors = ['var(--primary-color)', '#7986CB', '#C5CAE9', '#E8EAF6'];

    return (
        <div>
            <div className="page-filters" style={{marginBottom: '24px'}}>
                 <div className="filter-group"><label>From</label><input type="date" value={filters.from} onChange={e => setFilters(p => ({...p, from: e.target.value}))}/></div>
                 <div className="filter-group"><label>To</label><input type="date" value={filters.to} onChange={e => setFilters(p => ({...p, to: e.target.value}))}/></div>
                 <div className="filter-group"><label>Team</label><select value={filters.team} onChange={e => setFilters(p => ({...p, team: e.target.value}))}><option value="all">All Teams</option>{teams.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                 <div className="filter-group"><label>Status</label><select value={filters.status} onChange={e => setFilters(p => ({...p, status: e.target.value}))}><option value="all">All Statuses</option><option value="overloaded">Overloaded</option><option value="healthy">Healthy</option><option value="underutilized">Underutilized</option></select></div>
            </div>
            
            <div className="kpi-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))'}}>
                <div className="card"><h3>Total Employees</h3><div className="value">{kpis.totalEmployees}</div></div>
                <div className="card"><h3>Avg. Utilization</h3><div className="value">{kpis.avgUtilization}<span className="unit">%</span></div></div>
                <div className="card"><h3>Overloaded</h3><div className="value" style={{color: 'var(--danger-color)'}}>{kpis.overloadedCount}</div></div>
                <div className="card"><h3>Underutilized</h3><div className="value" style={{color: 'var(--warning-color)'}}>{kpis.underutilizedCount}</div></div>
            </div>

            <div className="insights-grid">
                <div className="card"><h3>Utilization Status</h3><DonutChart data={donutChartData} colors={chartColors} /></div>
                <div className="card"><h3>Hours by Task Type</h3>{taskTypeHoursData.length > 0 ? <BarChart data={taskTypeHoursData} colors={barChartColors} /> : <p>No hours logged for any task type yet.</p>}</div>
            </div>

            <div className="table-container">
                <h3>Workload Details</h3>
                <table>
                    <thead>
                        <tr>
                            <th className="sortable" onClick={() => requestSort('name')}>Name{getSortIcon('name')}</th>
                            <th className="sortable" onClick={() => requestSort('team')}>Team{getSortIcon('team')}</th>
                            <th className="sortable" onClick={() => requestSort('capacity')}>Capacity (hrs){getSortIcon('capacity')}</th>
                            <th className="sortable" onClick={() => requestSort('loggedHours')}>Logged (hrs){getSortIcon('loggedHours')}</th>
                            <th className="sortable" onClick={() => requestSort('utilization')}>Utilization{getSortIcon('utilization')}</th>
                            <th className="sortable" onClick={() => requestSort('status')}>Status{getSortIcon('status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map(item => (
                            <tr key={item.id} className="clickable-row" onClick={() => onEmployeeSelect(item.id)}>
                                <td>{item.name}</td>
                                <td>{item.team}</td>
                                <td>{item.capacity}</td>
                                <td>{item.loggedHours}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div className="utilization-bar-container"><div className="utilization-bar" style={{ width: `${Math.min(item.utilization, 100)}%`, backgroundColor: item.barColor }} /></div>
                                        <span>{item.utilization.toFixed(1)}%</span>
                                    </div>
                                </td>
                                <td><span className={`status-tag status-${item.status.toLowerCase().replace(/\s/g, '')}`}>{item.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

interface DraggingState {
    log: TimeLog;
    actionType: 'drag' | 'resize-top' | 'resize-bottom';
    startY: number;
    timelineRect: DOMRect;
}
interface MyDayViewProps {
    loggedInEmployeeId: number;
    timeLogs: TimeLog[];
    tasks: Task[];
    onSave: (item: Partial<TimeLog>) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}
const MyDayView = ({ loggedInEmployeeId, timeLogs, tasks, onSave, onDelete }: MyDayViewProps) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<TimeLog> & { task_title?: string } | null>(null);
    const [viewMode, setViewMode] = useState('day');
    const [activeTimer, setActiveTimer] = useState<{ gap: any; startTime: number } | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [draggingEvent, setDraggingEvent] = useState<DraggingState | null>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    const taskMap = useMemo(() => new Map(tasks.map(t => [t.id, t.title])), [tasks]);

    const myTasks = useMemo(() => {
        return tasks.filter(t => t.assigned_employee_id === loggedInEmployeeId && t.status !== 'Completed');
    }, [tasks, loggedInEmployeeId]);

    const WORK_START_HOUR = 9;
    const WORK_END_HOUR = 18;
    const TOTAL_HOURS = WORK_END_HOUR - WORK_START_HOUR;
    const TOTAL_MINUTES = TOTAL_HOURS * 60;
    const WORK_START_MINUTES = WORK_START_HOUR * 60;
    const WORK_END_MINUTES = WORK_END_HOUR * 60;

    useEffect(() => {
        let interval: any;
        if (activeTimer) {
            interval = setInterval(() => {
                setElapsedTime(Date.now() - activeTimer.startTime);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeTimer]);

    const handleStartTimer = (gap: any) => {
        setActiveTimer({ gap, startTime: Date.now() });
    };

    const handleStopTimer = () => {
        if (!activeTimer) return;
        const startMinutes = timeToMinutes(activeTimer.gap.start_time);
        const endMinutes = startMinutes + Math.round(elapsedTime / 60000);
        
        setCurrentItem({
            task_title: '',
            start_time: activeTimer.gap.start_time,
            end_time: minutesToTime(endMinutes),
            notes: '',
        });
        setIsModalOpen(true);
        setActiveTimer(null);
        setElapsedTime(0);
    };

    const formatElapsedTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const dailyLogs = useMemo(() => {
        return timeLogs
            .filter(log => log.employee_id === loggedInEmployeeId && log.date === selectedDate)
            .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
    }, [timeLogs, loggedInEmployeeId, selectedDate]);

    const { timeGaps, summary } = useMemo(() => {
        let loggedMinutes = 0;
        let productiveMinutes = 0;

        dailyLogs.forEach(log => {
            const duration = timeToMinutes(log.end_time) - timeToMinutes(log.start_time);
            if (duration > 0) {
                loggedMinutes += duration;
                const taskTitle = taskMap.get(log.task_id)?.toLowerCase() || '';
                if (!taskTitle.includes('break')) {
                    productiveMinutes += duration;
                }
            }
        });

        const gaps: { start: number, end: number }[] = [];
        let lastLogEndTime = WORK_START_MINUTES;

        dailyLogs.forEach(log => {
            const logStartTime = timeToMinutes(log.start_time);
            if (logStartTime > lastLogEndTime) {
                gaps.push({ start: lastLogEndTime, end: logStartTime });
            }
            lastLogEndTime = Math.max(lastLogEndTime, timeToMinutes(log.end_time));
        });

        if (lastLogEndTime < WORK_END_MINUTES) {
            gaps.push({ start: lastLogEndTime, end: WORK_END_MINUTES });
        }

        const formattedGaps = gaps.filter(g => g.end > g.start).map((gap, index) => ({
            id: `gap-${index}`,
            start_time: minutesToTime(gap.start),
            end_time: minutesToTime(gap.end)
        }));
        
        const unloggedMinutes = (WORK_END_MINUTES - WORK_START_MINUTES) - loggedMinutes;

        return {
            timeGaps: formattedGaps,
            summary: {
                logged: (loggedMinutes / 60).toFixed(2),
                unlogged: (Math.max(0, unloggedMinutes) / 60).toFixed(2),
                productive: (productiveMinutes / 60).toFixed(2),
            }
        };
    }, [dailyLogs, taskMap, WORK_START_MINUTES, WORK_END_MINUTES]);

    const handleGapClick = (gap: { start_time: string, end_time: string }) => {
        setCurrentItem({ 
            task_title: '',
            start_time: gap.start_time,
            end_time: gap.end_time,
            notes: '',
        });
        setIsModalOpen(true);
    };
    
    const handleEdit = (item: TimeLog) => {
        const taskTitle = taskMap.get(item.task_id) || '';
        setCurrentItem({ ...item, task_title: taskTitle });
        setIsModalOpen(true);
    };

    const handleTaskClick = (task: Task) => {
        setCurrentItem({ 
            task_title: task.title,
            start_time: '',
            end_time: '',
            notes: '',
        });
        setIsModalOpen(true);
    };

    const handleSave = async (itemData: Partial<TimeLog>) => {
        await onSave(itemData);
        setIsModalOpen(false);
        setDraggingEvent(null);
    };

    const changeDate = (offset: number) => {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate() + offset);
        setSelectedDate(currentDate.toISOString().split('T')[0]);
    };
    
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, log: TimeLog, actionType = 'drag') => {
        if (activeTimer || !timelineRef.current) return;
        e.preventDefault();
        e.stopPropagation();

        const timelineRect = timelineRef.current.getBoundingClientRect();
        setDraggingEvent({
            log,
            actionType: actionType as 'drag' | 'resize-top' | 'resize-bottom',
            startY: e.clientY,
            timelineRect,
        });
    };
    
    const onSaveRef = useRef(onSave);
    useEffect(() => { onSaveRef.current = onSave; }, [onSave]);
    
    useEffect(() => {
        if (!draggingEvent) return;
        const handleMouseMove = (e: MouseEvent) => {
            const dy = e.clientY - draggingEvent.startY;
            const minutesPerPixel = TOTAL_MINUTES / draggingEvent.timelineRect.height;
            const minuteChange = Math.round((dy * minutesPerPixel) / 15) * 15;
            let newStartTime: string | undefined, newEndTime: string | undefined;
    
            if (draggingEvent.actionType === 'drag') {
                const newStartMinutes = timeToMinutes(draggingEvent.log.start_time) + minuteChange;
                const durationMinutes = calculateDuration(draggingEvent.log.start_time, draggingEvent.log.end_time) * 60;
                newStartTime = minutesToTime(Math.max(WORK_START_MINUTES, Math.min(WORK_END_MINUTES - durationMinutes, newStartMinutes)));
                newEndTime = minutesToTime(timeToMinutes(newStartTime) + durationMinutes);
            } else if (draggingEvent.actionType === 'resize-bottom') {
                newStartTime = draggingEvent.log.start_time;
                const originalEndMinutes = timeToMinutes(draggingEvent.log.end_time);
                const newEndMinutes = originalEndMinutes + minuteChange;
                newEndTime = minutesToTime(Math.min(WORK_END_MINUTES, Math.max(timeToMinutes(newStartTime) + 15, newEndMinutes)));
            } else if (draggingEvent.actionType === 'resize-top') {
                newEndTime = draggingEvent.log.end_time;
                const originalStartMinutes = timeToMinutes(draggingEvent.log.start_time);
                const newStartMinutes = originalStartMinutes + minuteChange;
                newStartTime = minutesToTime(Math.max(WORK_START_MINUTES, Math.min(timeToMinutes(newEndTime) - 15, newStartMinutes)));
            }
    
            const draggedElement = document.getElementById(`event-${draggingEvent.log.id}`);
            if (draggedElement && newStartTime && newEndTime) {
                const newTop = (timeToMinutes(newStartTime) - WORK_START_MINUTES) * (draggingEvent.timelineRect.height / TOTAL_MINUTES);
                const newHeight = calculateDuration(newStartTime, newEndTime) * 60 * (draggingEvent.timelineRect.height / TOTAL_MINUTES);
                draggedElement.style.top = `${newTop}px`;
                draggedElement.style.height = `${newHeight}px`;
            }
        };
    
        const handleMouseUp = () => {
            const draggedElement = document.getElementById(`event-${draggingEvent.log.id}`);
            if (draggedElement) {
                const topOffset = parseFloat(draggedElement.style.top);
                const height = parseFloat(draggedElement.style.height);
                const minutesPerPixel = TOTAL_MINUTES / draggingEvent.timelineRect.height;
                const newStartMinutes = Math.round(topOffset * minutesPerPixel) + WORK_START_MINUTES;
                const newDurationMinutes = Math.round(height * minutesPerPixel);
                const newStartTime = minutesToTime(newStartMinutes);
                const newEndTime = minutesToTime(newStartMinutes + newDurationMinutes);
    
                if (timeToMinutes(newStartTime) < timeToMinutes(newEndTime)) {
                    onSaveRef.current({ ...draggingEvent.log, start_time: newStartTime, end_time: newEndTime });
                }
            }
            setDraggingEvent(null);
        };
    
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingEvent, TOTAL_MINUTES, WORK_START_MINUTES, WORK_END_MINUTES]);

    interface TimeLogModalProps {
        item: Partial<TimeLog> & { task_title?: string } | null;
        onClose: () => void;
        onSave: (item: Partial<TimeLog>) => void;
        onDelete: (id: number) => void;
        tasks: Task[];
        employeeId: number;
    }
    const TimeLogModal = ({ item, onClose, onSave, onDelete, tasks, employeeId }: TimeLogModalProps) => {
        const [formData, setFormData] = useState({
            task_id: item?.task_id || '',
            start_time: item?.start_time || '',
            end_time: item?.end_time || '',
            notes: item?.notes || '',
        });
        const [selectedTaskTitle, setSelectedTaskTitle] = useState(item?.task_title || '');

        useEffect(() => {
            if (selectedTaskTitle && !formData.task_id) {
                const foundTask = tasks.find(t => t.title === selectedTaskTitle);
                if (foundTask) setFormData(prev => ({ ...prev, task_id: foundTask.id as any }));
            }
        }, [selectedTaskTitle, formData.task_id, tasks]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };
        
        const handleTaskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
             const taskId = e.target.value;
             handleChange(e);
             const task = tasks.find(t => t.id === parseInt(taskId));
             if (task) setSelectedTaskTitle(task.title);
        }

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!formData.task_id || !formData.start_time || !formData.end_time) return;
            onSave({ ...item, employee_id: employeeId, date: selectedDate, ...formData, task_id: parseInt(formData.task_id as string) });
        };

        const availableTasks = tasks.filter(t => t.status !== 'Completed');

        return (
            <Modal title={item?.id ? 'Edit Time Log' : 'Add Time Log'} onClose={onClose}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="task_id">Task</label>
                        <select id="task_id" name="task_id" value={formData.task_id} onChange={handleTaskChange} required>
                            <option value="" disabled>Select a task</option>
                            {availableTasks.map(task => <option key={task.id} value={task.id}>{task.title}</option>)}
                        </select>
                    </div>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group"><label htmlFor="start_time">Start Time</label><input type="time" id="start_time" name="start_time" value={formData.start_time} onChange={handleChange} required step="900" /></div>
                        <div className="form-group"><label htmlFor="end_time">End Time</label><input type="time" id="end_time" name="end_time" value={formData.end_time} onChange={handleChange} required step="900" /></div>
                    </div>
                    <div className="form-group"><label htmlFor="notes">Notes (Optional)</label><textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3}></textarea></div>
                    <div className="modal-actions">
                        {item?.id && <button type="button" className="btn btn-danger" onClick={() => onDelete(item.id!)}>Delete</button>}
                        <button type="button" className="btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save</button>
                    </div>
                </form>
            </Modal>
        );
    };

    const DayView = () => (
        <div className="my-day-view">
            <div className="card">
                <h3>Today's Timeline ({new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })})</h3>
                 <div className="timeline-container" ref={timelineRef}>
                    {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => {
                        const hour = WORK_START_HOUR + i;
                        const top = (i * 60) * (540 / TOTAL_MINUTES);
                        return (
                            <div key={hour} style={{ position: 'absolute', top: `${top}px`, width: '100%' }}>
                                <div className="timeline-hour-marker">{`${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 || hour === 24 ? 'AM' : 'PM'}`}</div>
                                <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: 0 }} />
                            </div>
                        );
                    })}
                    {dailyLogs.map(log => {
                        const top = (timeToMinutes(log.start_time) - WORK_START_MINUTES) * (540 / TOTAL_MINUTES);
                        const height = calculateDuration(log.start_time, log.end_time) * 60 * (540 / TOTAL_MINUTES);
                        const isBreak = taskMap.get(log.task_id)?.toLowerCase().includes('break');
                        if (height <= 0) return null;
                        return (
                            <div id={`event-${log.id}`} key={log.id} className={`timeline-event ${isBreak ? 'is-break' : ''} ${draggingEvent?.log.id === log.id ? 'is-dragging' : ''}`} style={{ top: `${top}px`, height: `${height}px` }} onMouseDown={(e) => handleMouseDown(e, log, 'drag')} onClick={() => handleEdit(log)}>
                                <strong>{taskMap.get(log.task_id) || 'Untitled Task'}</strong>
                                <span>{log.start_time} - {log.end_time}</span>
                                {log.notes && <span style={{ fontStyle: 'italic', opacity: 0.7, marginTop: '4px', display: 'block' }}>{log.notes}</span>}
                                {height > 20 && <>
                                    <div className="resize-handle top" onMouseDown={(e) => handleMouseDown(e, log, 'resize-top')}></div>
                                    <div className="resize-handle bottom" onMouseDown={(e) => handleMouseDown(e, log, 'resize-bottom')}></div>
                                </>}
                            </div>
                        );
                    })}
                     {timeGaps.map(gap => {
                        const top = (timeToMinutes(gap.start_time) - WORK_START_MINUTES) * (540 / TOTAL_MINUTES);
                        const height = (timeToMinutes(gap.end_time) - timeToMinutes(gap.start_time)) * (540 / TOTAL_MINUTES);
                        const isTimerActiveForThisGap = activeTimer && activeTimer.gap.start_time === gap.start_time;
                        if (height <= 0) return null;
                        return (
                            <button key={gap.id} className="timeline-gap" style={{ top: `${top}px`, height: `${height}px` }} onClick={() => !activeTimer && handleGapClick(gap)}>
                                {isTimerActiveForThisGap ? (
                                    <>
                                        <div className="timeline-gap-timer">{formatElapsedTime(elapsedTime)}</div>
                                        <button className="btn btn-danger" onClick={(e) => { e.stopPropagation(); handleStopTimer(); }}>Stop & Log</button>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-icons">add_circle</span>
                                        <span>Add Log</span>
                                        {height > 50 && <button className="btn" onClick={(e) => { e.stopPropagation(); handleStartTimer(gap); }}>Start Timer</button>}
                                    </>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                 <div className="card">
                    <h3>My Tasks ({myTasks.length})</h3>
                     {myTasks.length > 0 ? (
                        <div className="activity-list my-tasks-list" style={{ maxHeight: '200px', overflowY: 'auto'}}>
                            <ul>{myTasks.map(task => (
                                <li key={task.id} className="activity-item" onClick={() => handleTaskClick(task)}>
                                    <div className="activity-item-info">
                                        <span className="title">{task.title}</span>
                                        <span className="meta">{task.type} - Complexity: {task.complexity}</span>
                                    </div>
                                    <button className="btn-icon" aria-label={`Log time for ${task.title}`}><span className="material-icons">add_alarm</span></button>
                                </li>
                            ))}</ul>
                        </div>
                    ) : (
                        <p>No pending tasks assigned. Great job!</p>
                    )}
                </div>
                <div className="card">
                    <h3>Day Summary</h3>
                    <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                        <div><h3>Logged</h3><div className="value">{summary.logged}<span className="unit">h</span></div></div>
                        <div><h3>Productive</h3><div className="value">{summary.productive}<span className="unit">h</span></div></div>
                        <div><h3>Unlogged</h3><div className="value">{summary.unlogged}<span className="unit">h</span></div></div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <div className="my-day-controls">
                <button className="btn-icon" onClick={() => changeDate(-1)}><span className="material-icons">chevron_left</span></button>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px' }}/>
                <button className="btn-icon" onClick={() => changeDate(1)}><span className="material-icons">chevron_right</span></button>
                <button className="btn" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>Today</button>
            </div>
            {viewMode === 'day' && <DayView />}
            {isModalOpen && <TimeLogModal item={currentItem} onClose={() => setIsModalOpen(false)} onSave={handleSave} onDelete={onDelete} tasks={tasks} employeeId={loggedInEmployeeId} />}
        </div>
    );
};

interface ProjectDetailViewProps {
    project: Task;
    timeLogs: TimeLog[];
    employees: Employee[];
    onBack: () => void;
    onDelete: (id: number) => Promise<void>;
}
const ProjectDetailView = ({ project, timeLogs, employees, onBack, onDelete }: ProjectDetailViewProps) => {
    const projectLogs = useMemo(() => {
        return timeLogs
            .filter(log => log.task_id === project.id)
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() || timeToMinutes(b.start_time) - timeToMinutes(a.start_time));
    }, [timeLogs, project.id]);
    
    const employeeMap = useMemo(() => new Map(employees.map(e => [e.id, e.name])), [employees]);

    const totalHours = useMemo(() => {
        return projectLogs.reduce((sum, log) => sum + calculateDuration(log.start_time, log.end_time), 0);
    }, [projectLogs]);

    const assignedEmployee = employeeMap.get(project.assigned_employee_id) || 'Unassigned';

    return (
        <div className="card">
             <div className="project-detail-header">
                <div className="project-detail-info">
                    <button onClick={onBack} className="btn-icon" style={{marginBottom: '8px'}}><span className="material-icons">arrow_back</span></button>
                    <h2>{project.title}</h2>
                    <div className="project-detail-meta">
                        <span><strong>Status:</strong> {project.status}</span>
                        <span><strong>Type:</strong> {project.type}</span>
                        <span><strong>Complexity:</strong> {project.complexity}/5</span>
                        <span><strong>Assigned to:</strong> {assignedEmployee}</span>
                    </div>
                </div>
                <div className="page-actions">
                     <button className="btn btn-danger" onClick={() => onDelete(project.id)}>Delete Project</button>
                </div>
            </div>

            <h3>Time Logs ({totalHours.toFixed(2)} hrs)</h3>
            <div className="table-container">
                 <table>
                    <thead>
                        <tr><th>Date</th><th>Employee</th><th>Start</th><th>End</th><th>Duration</th><th>Notes</th></tr>
                    </thead>
                    <tbody>
                         {projectLogs.length > 0 ? projectLogs.map(log => (
                            <tr key={log.id}>
                                <td>{new Date(log.date).toLocaleDateString()}</td>
                                <td>{employeeMap.get(log.employee_id) || 'Unknown'}</td>
                                <td>{log.start_time}</td>
                                <td>{log.end_time}</td>
                                <td>{calculateDuration(log.start_time, log.end_time).toFixed(2)}h</td>
                                <td>{log.notes}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} style={{textAlign: 'center'}}>No time has been logged for this project yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

interface ProjectsViewProps {
    tasks: Task[];
    employees: Employee[];
    timeLogs: TimeLog[];
    onSave: (task: Partial<Task>) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}
const ProjectsView = ({ tasks, employees, timeLogs, onSave, onDelete }: ProjectsViewProps) => {
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [filters, setFilters] = useState({ employee: 'all', status: 'all' });
    const [sortConfig, setSortConfig] = useState<{key: keyof Task, direction: string}>({ key: 'title', direction: 'ascending' });

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            if (filters.employee !== 'all' && task.assigned_employee_id !== parseInt(filters.employee)) return false;
            if (filters.status !== 'all' && task.status !== filters.status) return false;
            return true;
        });
    }, [tasks, filters]);

    const sortedTasks = useMemo(() => {
        return [...filteredTasks].sort((a, b) => {
            const valA = a[sortConfig.key];
            const valB = b[sortConfig.key];
            if (valA === null || valA === undefined) return 1;
            if (valB === null || valB === undefined) return -1;
            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }, [filteredTasks, sortConfig]);

    const requestSort = (key: keyof Task) => {
        let direction = 'ascending';
        if (sortConfig?.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Task) => {
        if (!sortConfig || sortConfig.key !== key) return <span className="material-icons sort-icon" style={{ opacity: 0.3 }}>unfold_more</span>;
        return sortConfig.direction === 'ascending' ? <span className="material-icons sort-icon">expand_less</span> : <span className="material-icons sort-icon">expand_more</span>;
    };

    const employeeMap = useMemo(() => new Map(employees.map(e => [e.id, e.name])), [employees]);
    
    const projectHours = useMemo(() => {
        const hoursMap = new Map<number, number>();
        timeLogs.forEach(log => {
            const currentHours = hoursMap.get(log.task_id) || 0;
            hoursMap.set(log.task_id, currentHours + calculateDuration(log.start_time, log.end_time));
        });
        return hoursMap;
    }, [timeLogs]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<Task> | null>(null);

    const handleAdd = () => {
        setCurrentItem({ title: '', type: '', complexity: 1, status: 'Not Started', assigned_employee_id: null });
        setIsModalOpen(true);
    };

    const handleEdit = (task: Task) => {
        setCurrentItem(task);
        setIsModalOpen(true);
    };

    const handleSave = async (itemData: Partial<Task>) => {
        await onSave(itemData);
        setIsModalOpen(false);
    };

    const selectedProject = tasks.find(t => t.id === selectedProjectId);

    if (selectedProject) {
        return <ProjectDetailView project={selectedProject} timeLogs={timeLogs} employees={employees} onBack={() => setSelectedProjectId(null)} onDelete={onDelete}/>
    }

    return (
        <div>
            <div className="page-header">
                <div className="page-filters">
                    <div className="filter-group">
                        <label>Assigned To</label>
                        <select value={filters.employee} onChange={e => setFilters(p => ({...p, employee: e.target.value}))}>
                            <option value="all">All Employees</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Status</label>
                        <select value={filters.status} onChange={e => setFilters(p => ({...p, status: e.target.value}))}>
                            <option value="all">All Statuses</option>
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={handleAdd}><span className="material-icons">add</span> Add Project</button>
                </div>
            </div>
            {sortedTasks.length > 0 ? (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th className="sortable" onClick={() => requestSort('title')}>Title {getSortIcon('title')}</th>
                                <th className="sortable" onClick={() => requestSort('status')}>Status {getSortIcon('status')}</th>
                                <th className="sortable" onClick={() => requestSort('assigned_employee_id')}>Assigned To {getSortIcon('assigned_employee_id')}</th>
                                <th>Hours Logged</th>
                                <th className="sortable" onClick={() => requestSort('complexity')}>Complexity {getSortIcon('complexity')}</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTasks.map(task => (
                                <tr key={task.id} className="clickable-row" onClick={() => setSelectedProjectId(task.id)}>
                                    <td>{task.title}</td>
                                    <td>{task.status}</td>
                                    <td>{employeeMap.get(task.assigned_employee_id) || 'Unassigned'}</td>
                                    <td>{(projectHours.get(task.id) || 0).toFixed(2)}h</td>
                                    <td>{task.complexity}</td>
                                    <td onClick={e => e.stopPropagation()}>
                                        <div className="actions">
                                            <button className="btn-icon" onClick={() => handleEdit(task)}><span className="material-icons">edit</span></button>
                                            <button className="btn-icon" onClick={() => onDelete(task.id)}><span className="material-icons">delete</span></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmptyState
                    icon="folder_off"
                    title="No Projects Found"
                    message="There are no projects matching your current filters. Try adjusting them or add a new project."
                    action={<button className="btn btn-primary" onClick={handleAdd}><span className="material-icons">add</span> Add Project</button>}
                />
            )}
            {isModalOpen && <ItemForm fields={[
                { name: 'title', label: 'Title', type: 'text', required: true },
                { name: 'type', label: 'Type', type: 'text' },
                { name: 'status', label: 'Status', type: 'select', options: ['Not Started', 'In Progress', 'Completed'], required: true },
                { name: 'complexity', label: 'Complexity', type: 'select', options: [1,2,3,4,5], required: true },
                { name: 'assigned_employee_id', label: 'Assign To', type: 'select', options: employees.map(e => ({ value: e.id, label: e.name })), isObjectOptions: true, required: false },
            ]} item={currentItem} onSave={handleSave} onClose={() => setIsModalOpen(false)} title={currentItem?.id ? 'Edit Project' : 'Add Project'} />}
        </div>
    );
};

// --- GENERIC CRUD VIEW ---
type FormField = {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'textarea';
    options?: (string | number)[] | { value: string | number; label: string }[];
    isObjectOptions?: boolean;
    required?: boolean;
};

interface ItemFormProps<T> {
    fields: FormField[];
    item: Partial<T> | null;
    onSave: (item: Partial<T>) => void;
    onClose: () => void;
    title: string;
}
function ItemForm<T extends object>({ fields, item, onSave, onClose, title }: ItemFormProps<T>) {
    const [formData, setFormData] = useState<Partial<T>>(item || {});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const fieldDef = fields.find(f => f.name === name);
        const isNumeric = fieldDef?.type === 'number' || (e.target as HTMLInputElement).type === 'number';
        const finalValue = isNumeric && value !== '' ? Number(value) : (value === '' && fieldDef?.required === false ? null : value);
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...item, ...formData });
    };

    return (
        <Modal title={title} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                {fields.map(field => (
                    <div className="form-group" key={field.name}>
                        <label htmlFor={field.name}>{field.label}</label>
                        {field.type === 'select' ? (
                            <select id={field.name} name={field.name} value={(formData as any)[field.name] ?? ''} onChange={handleChange} required={field.required}>
                                <option value="" disabled>{field.required === false ? 'None' : `Select ${field.label.toLowerCase()}`}</option>
                                {field.required === false && <option value="">None</option>}
                                {field.isObjectOptions ? 
                                    (field.options as { value: string | number; label: string }[])?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>) :
                                    (field.options as (string|number)[])?.map(opt => <option key={opt} value={opt}>{opt}</option>)
                                }
                            </select>
                        ) : (
                            <input type={field.type} id={field.name} name={field.name} value={(formData as any)[field.name] ?? ''} onChange={handleChange} required={field.required} />
                        )}
                    </div>
                ))}
                <div className="modal-actions">
                    <button type="button" className="btn" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save</button>
                </div>
            </form>
        </Modal>
    );
};

interface GenericCrudViewProps<T extends { id: number; }> {
    items: T[];
    title: string;
    itemFields: FormField[];
    onSave: (item: Partial<T>) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    renderHeader: () => React.ReactNode;
    renderRow: (item: T, actions: React.ReactNode) => React.ReactNode;
}
function GenericCrudView<T extends { id: number; }>({ items, title, itemFields, onSave, onDelete, renderHeader, renderRow }: GenericCrudViewProps<T>) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<T> | null>(null);

    const handleAdd = () => {
        setCurrentItem({});
        setIsModalOpen(true);
    };

    const handleEdit = (item: T) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleSave = async (itemData: Partial<T>) => {
        await onSave(itemData);
        setIsModalOpen(false);
    };
    
    const singleItemTitle = title.endsWith('s') ? title.slice(0, -1) : title;

    return (
        <div>
            <div className="page-header">
                <h2>{title} ({items.length})</h2>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <span className="material-icons">add</span> Add {singleItemTitle}
                </button>
            </div>
            {items.length > 0 ? (
                <div className="table-container">
                    <table>
                        <thead>{renderHeader()}</thead>
                        <tbody>
                            {items.map(item => renderRow(item, (
                                <div className="actions">
                                    <button className="btn-icon" onClick={() => handleEdit(item)}><span className="material-icons">edit</span></button>
                                    <button className="btn-icon" onClick={() => onDelete(item.id)}><span className="material-icons">delete</span></button>
                                </div>
                            )))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmptyState
                    icon="group_off"
                    title={`No ${title} Found`}
                    message={`Get started by adding the first ${singleItemTitle.toLowerCase()}.`}
                    action={<button className="btn btn-primary" onClick={handleAdd}><span className="material-icons">add</span> Add {singleItemTitle}</button>}
                />
            )}
            {isModalOpen && <ItemForm fields={itemFields} item={currentItem} onSave={handleSave} onClose={() => setIsModalOpen(false)} title={currentItem?.id ? `Edit ${singleItemTitle}` : `Add ${singleItemTitle}`} />}
        </div>
    );
};

// --- LAYOUT COMPONENTS ---
interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    isCollapsed: boolean;
}
const Sidebar = ({ currentPage, setCurrentPage, isCollapsed }: SidebarProps) => {
    const pages = {
        myday: { label: 'My Day', icon: 'today' },
        projects: { label: 'Projects', icon: 'folder' },
        insights: { label: 'Insights', icon: 'bar_chart' },
        employees: { label: 'Employees', icon: 'people' },
    };
    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <span className="material-icons">query_stats</span>
                <span>TeamFlow</span>
            </div>
            <nav className="nav">
                {Object.entries(pages).map(([key, { label, icon }]) => (
                    <NavItem
                        key={key}
                        icon={icon}
                        label={label}
                        active={currentPage === key}
                        onClick={() => setCurrentPage(key as Page)}
                    />
                ))}
            </nav>
        </aside>
    );
};

interface BottomNavProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}
const BottomNav = ({ currentPage, setCurrentPage }: BottomNavProps) => {
    const pages = {
        myday: { label: 'My Day', icon: 'today' },
        projects: { label: 'Projects', icon: 'folder' },
        insights: { label: 'Insights', icon: 'bar_chart' },
        employees: { label: 'Employees', icon: 'people' },
    };
    return (
        <nav className="bottom-nav">
             {Object.entries(pages).map(([key, { label, icon }]) => (
                <BottomNavItem
                    key={key}
                    icon={icon}
                    label={label}
                    active={currentPage === key}
                    onClick={() => setCurrentPage(key as Page)}
                />
            ))}
        </nav>
    );
};

// --- MAIN APP COMPONENT ---
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyiPCP6UcfF_6p8YO3DetDdgRZF9QLnMzViCVTu2ZZX3urQhQhKTt2yRnv1hWpuINGN/exec";

const App = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useLocalStorage<Page>('currentPage', 'myday');
    const [loggedInEmployeeId, setLoggedInEmployeeId] = useLocalStorage<number>('loggedInEmployeeId', 1);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    
    const addToast = useCallback((message: string, toastType: ToastType) => {
        setToasts(prev => [...prev, { id: Date.now(), message, type: toastType }]);
    }, []);

    const apiCall = useCallback(async (body: object) => {
        setIsLoading(true);
        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(body),
                redirect: 'follow'
            });
            
            const textContent = await response.text();
            let data;
            try {
                 data = JSON.parse(textContent);
            } catch (parseError) {
                console.error("Failed to parse server response:", textContent);
                throw new Error("The server returned an invalid response. Check the Apps Script logs for errors.");
            }

            if (data.status === 'error') {
                throw new Error(data.message);
            }
            return data;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchAllData = useCallback(async () => {
        setError(null);
        try {
            const data = await apiCall({ action: 'readAll' });
            setEmployees(data.employees || []);
            setTasks(data.tasks || []);
            setTimeLogs(data.timeLogs || []);
            addToast('Data successfully synced from Google Sheet!', 'success');
        } catch (err: any) {
            setError(`Failed to load data: ${err.message}. Please check the Google Apps Script configuration and your internet connection.`);
            addToast('Failed to sync data', 'error');
            console.error(err);
        }
    }, [apiCall, addToast]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleSave = useCallback(async (sheetName: string, item: Partial<Employee | Task | TimeLog>) => {
        const action = item.id ? 'update' : 'create';
        try {
            await apiCall({ action, sheetName, payload: item });
            addToast(`${sheetName.slice(0, -1)} ${action}d successfully`, 'success');
            await fetchAllData();
        } catch (err: any) {
            addToast(`Failed to save ${sheetName.slice(0, -1)}: ${err.message}`, 'error');
        }
    }, [apiCall, fetchAllData, addToast]);

    const handleDelete = useCallback(async (sheetName: string, id: number) => {
        try {
            await apiCall({ action: 'delete', sheetName, payload: { id } });
            addToast(`${sheetName.slice(0, -1)} deleted`, 'success');
            await fetchAllData();
        } catch (err: any) {
            addToast(`Failed to delete ${sheetName.slice(0, -1)}: ${err.message}`, 'error');
        }
    }, [apiCall, fetchAllData, addToast]);

    const teams = useMemo(() => Array.from(new Set(employees.map(e => e.team).filter(Boolean))), [employees]);
    const loggedInUser = employees.find(e => e.id === loggedInEmployeeId);

    const pages: Record<Page, { title: string, component: React.ReactNode }> = {
        myday: { title: `My Day${loggedInUser ? ` - ${loggedInUser.name}` : ''}`, component: <MyDayView loggedInEmployeeId={loggedInEmployeeId} timeLogs={timeLogs} tasks={tasks} onSave={(item) => handleSave('TimeLogs', item)} onDelete={(id) => handleDelete('TimeLogs', id)} /> },
        projects: { title: 'Projects', component: <ProjectsView tasks={tasks} employees={employees} timeLogs={timeLogs} onSave={(item) => handleSave('Tasks', item)} onDelete={(id) => handleDelete('Tasks', id)} /> },
        insights: { title: 'Team Insights', component: <InsightsView employees={employees} timeLogs={timeLogs} tasks={tasks} teams={teams} onEmployeeSelect={id => {setLoggedInEmployeeId(id); setCurrentPage('myday');}} /> },
        employees: { title: 'Employees', component: <GenericCrudView<Employee>
            items={employees}
            title="Employees"
            itemFields={[
                { name: 'name', label: 'Name', type: 'text', required: true },
                { name: 'role', label: 'Role', type: 'text', required: true },
                { name: 'team', label: 'Team', type: 'text', required: true },
                { name: 'weekly_capacity_hours', label: 'Weekly Capacity (hrs)', type: 'number', required: true },
            ]}
            onSave={(item) => handleSave('Employees', item)}
            onDelete={(id) => handleDelete('Employees', id)}
            renderHeader={() => (
                 <tr><th>Name</th><th>Role</th><th>Team</th><th>Capacity (hrs)</th><th>Actions</th></tr>
            )}
            renderRow={(item, actions) => (
                <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.role}</td>
                    <td>{item.team}</td>
                    <td>{item.weekly_capacity_hours}</td>
                    <td>{actions}</td>
                </tr>
            )}
        /> },
    };

    const currentPageData = pages[currentPage];
    
    return (
        <div className="app-container">
            <style>{GlobalStyles}</style>
            {isLoading && <div className="loading-overlay">Syncing with Google Sheets...</div>}
            <ToastNotifications toasts={toasts} setToasts={setToasts} />
            
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} isCollapsed={sidebarCollapsed} />
            <main className="main-content" style={{ paddingLeft: sidebarCollapsed ? '32px' : 'calc(var(--sidebar-width) + 32px)' }}>
                <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ left: sidebarCollapsed ? '10px' : 'calc(var(--sidebar-width) - 50px)' }}>
                    <span className="material-icons">{sidebarCollapsed ? 'menu' : 'close'}</span>
                </button>
                <div className="header">
                    <h1 style={{ marginLeft: sidebarCollapsed ? '40px' : '0' }}>{currentPageData.title}</h1>
                    <div className="header-actions">
                         <button className="btn" onClick={fetchAllData}>
                            <span className="material-icons">refresh</span> Refresh Data
                        </button>
                        <div className="user-switcher">
                            <label>Viewing As:</label>
                            <select value={loggedInEmployeeId} onChange={e => setLoggedInEmployeeId(parseInt(e.target.value))}>
                                {employees.length > 0 ? employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>) : <option>Loading...</option>}
                            </select>
                        </div>
                    </div>
                </div>
                {error && <div className="toast toast-error" style={{marginBottom: '16px'}}>{error}</div>}
                {currentPageData.component}
            </main>
            <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<React.StrictMode><App /></React.StrictMode>);
