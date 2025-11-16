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
        transition: margin-left 0.3s ease-in-out;
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
    }
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }
    .header h1 {
        margin: 0;
        font-size: 28px;
    }
    .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
    }
    .user-switcher { display: flex; align-items: center; gap: 8px; }
    .user-switcher label { font-weight: 600; font-size: 14px; }
    .user-switcher select { padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); }

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
        transition: opacity 0.2s;
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
    .dashboard-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        align-items: start;
    }
    @media (max-width: 992px) {
        .dashboard-grid {
            grid-template-columns: 1fr;
        }
    }
    .card {
        background-color: var(--card-bg-color);
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        border: 1px solid var(--border-color);
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
        background-color: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .modal-content {
        background: white;
        padding: 32px;
        border-radius: 8px;
        width: 100%;
        max-width: 600px;
    }
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
    }
    .btn-icon:hover {
        background: var(--bg-color);
    }
    .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.2rem;
        z-index: 999;
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
    .status-overloaded { background-color: #FFF0F0; color: var(--danger-color); }
    .status-healthy { background-color: #E8F5E9; color: var(--success-color); }
    .status-underutilized { background-color: #FFFDE7; color: var(--warning-color); }
    
    .utilization-bar-container { width: 100%; max-width: 120px; height: 8px; background-color: #e0e0e0; border-radius: 4px; overflow: hidden; }
    .utilization-bar { height: 100%; border-radius: 4px; transition: width 0.3s ease-in-out; }
    
    th.sortable { cursor: pointer; position: relative; }
    th.sortable:hover { background-color: var(--bg-color); }
    .sort-icon { font-size: 16px; vertical-align: middle; position: absolute; right: 16px; top: 50%; transform: translateY(-50%); }

    .toast-container { position: fixed; top: 20px; right: 20px; z-index: 2000; display: flex; flex-direction: column; gap: 10px; }
    .toast { padding: 16px; border-radius: 8px; color: white; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 10px; animation: toast-in 0.3s ease; }
    .toast-success { background-color: var(--success-color); }
    .toast-error { background-color: var(--danger-color); }
    @keyframes toast-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

    .chart-container { display: flex; align-items: center; justify-content: center; gap: 24px; padding: 16px 0; }
    .chart-legend { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 14px; }
    .legend-color { width: 14px; height: 14px; border-radius: 4px; }

    .clickable-row { cursor: pointer; }
    .clickable-row:hover { background-color: var(--bg-color); }
    
    /* My Day View Styles */
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
    }
    .timeline-event.is-break {
        background: #E3F2FD;
        color: #1E88E5;
        border-left-color: #90CAF9;
    }
    .timeline-event strong { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .timeline-event span { font-size: 12px; opacity: 0.8; }

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
        background-color: #E8F5E9;
        border-color: var(--success-color);
        color: var(--success-color);
    }
    .timeline-gap .material-icons {
        font-size: 18px;
    }

    .activity-list ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
    .activity-item { background: var(--card-bg-color); border: 1px solid var(--border-color); padding: 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
    .activity-item-info { display: flex; flex-direction: column; gap: 4px; }
    .activity-item-info .title { font-weight: 600; }
    .activity-item-info .meta { font-size: 14px; color: var(--text-secondary); }
    .activity-item-info .notes { font-size: 14px; color: var(--text-primary); margin-top: 4px; font-style: italic; }
`;

// --- TYPES ---
type Page = 'dashboard' | 'myday' | 'timelogs' | 'tasks' | 'employees' | 'workload';
type ToastType = 'success' | 'error';
type TaskStatus = 'Not Started' | 'In Progress' | 'Completed';

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
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
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


// --- REUSABLE COMPONENTS ---

const Modal: React.FC<{ title: any, onClose: any, children: React.ReactNode }> = ({ title, children, onClose }) => {
    const mouseDownTarget = useRef(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        mouseDownTarget.current = e.target;
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (mouseDownTarget.current === e.target && e.currentTarget === e.target) {
            onClose();
        }
    };

    return (
        <div className="modal-backdrop" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button onClick={onClose} className="btn-icon" aria-label="Close modal">
                        <span className="material-icons">close</span>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

const ToastNotifications = ({ toasts, setToasts }) => {
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

const DonutChart = ({ data, colors }) => {
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
                            <circle
                                key={index}
                                r={radius}
                                cx={size/2}
                                cy={size/2}
                                fill="transparent"
                                stroke={colors[index % colors.length]}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${dasharray} ${circumference}`}
                                strokeDashoffset={dashoffset}
                            />
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

const NavItem = ({ icon, label, active, onClick }) => (
    <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
        <span className="material-icons">{icon}</span>
        <span>{label}</span>
    </div>
);


// --- VIEW COMPONENTS ---

const DashboardView = ({ employees, timeLogs, teams, filters, setFilters }) => {
    const filteredEmployees = useMemo(() => {
        return filters.team === 'all' ? employees : employees.filter(e => e.team === filters.team);
    }, [employees, filters.team]);

    const filteredTimeLogs = useMemo(() => {
        const employeeIds = new Set(filteredEmployees.map(e => e.id));
        return timeLogs.filter(log => employeeIds.has(log.employee_id));
    }, [timeLogs, filteredEmployees]);

    const kpis = useMemo(() => {
        if (filteredEmployees.length === 0) {
            return { totalEmployees: 0, avgUtilization: '0.0', overloadedCount: 0, underutilizedCount: 0, healthyCount: 0 };
        }

        const employeeHours = filteredEmployees.map(emp => {
            const loggedHours = filteredTimeLogs
                .filter(log => log.employee_id === emp.id)
                .reduce((sum, log) => sum + calculateDuration(log.start_time, log.end_time), 0);
            return {
                utilization: emp.weekly_capacity_hours > 0 ? (loggedHours / emp.weekly_capacity_hours) : 0
            };
        });
        
        const totalLoggedHours = filteredTimeLogs.reduce((sum, log) => sum + calculateDuration(log.start_time, log.end_time), 0);
        const totalCapacityHours = filteredEmployees.reduce((sum, emp) => sum + emp.weekly_capacity_hours, 0);
        const avgUtilization = totalCapacityHours > 0 ? (totalLoggedHours / totalCapacityHours * 100) : 0;

        const overloadedCount = employeeHours.filter(emp => emp.utilization > 1.2).length;
        const underutilizedCount = employeeHours.filter(emp => emp.utilization < 0.8).length;
        const healthyCount = employeeHours.length - overloadedCount - underutilizedCount;

        return {
            totalEmployees: filteredEmployees.length,
            avgUtilization: avgUtilization.toFixed(1),
            overloadedCount,
            underutilizedCount,
            healthyCount
        };
    }, [filteredEmployees, filteredTimeLogs]);

    const chartData = [
        { label: 'Overloaded', value: kpis.overloadedCount },
        { label: 'Healthy', value: kpis.healthyCount },
        { label: 'Underutilized', value: kpis.underutilizedCount },
    ];
    const chartColors = ['var(--danger-color)', 'var(--success-color)', 'var(--warning-color)'];

    return (
        <div>
            <div className="page-filters" style={{marginBottom: '24px'}}>
                 <div className="filter-group">
                    <label htmlFor="team-filter">Filter by Team</label>
                    <select id="team-filter" value={filters.team} onChange={e => setFilters(prev => ({...prev, team: e.target.value}))}>
                        <option value="all">All Teams</option>
                        {teams.map(team => <option key={team} value={team}>{team}</option>)}
                    </select>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="card">
                     <h3>Team Utilization</h3>
                     <DonutChart data={chartData} colors={chartColors} />
                </div>
                <div className="kpi-grid" style={{gridTemplateColumns: '1fr 1fr', margin: 0}}>
                    <div className="card">
                        <h3>Total Employees</h3>
                        <div className="value">{kpis.totalEmployees}</div>
                    </div>
                    <div className="card">
                        <h3>Avg. Utilization</h3>
                        <div className="value">{kpis.avgUtilization}<span className="unit">%</span></div>
                    </div>
                    <div className="card">
                        <h3>Overloaded (&gt;120%)</h3>
                        <div className="value" style={{color: 'var(--danger-color)'}}>{kpis.overloadedCount}</div>
                    </div>
                    <div className="card">
                        <h3>Underutilized (&lt;80%)</h3>
                        <div className="value" style={{color: 'var(--warning-color)'}}>{kpis.underutilizedCount}</div>
                    </div>
                </div>
            </div>
             {employees.length === 0 && (
                <div className="card" style={{marginTop: '24px'}}>
                    <h3>Welcome!</h3>
                    <p>Data is syncing from your Google Sheet. If this message persists, please check your internet connection and the sheet's sharing settings.</p>
                </div>
            )}
        </div>
    );
};

const WorkloadView = ({ employees, timeLogs }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'utilization', direction: 'descending' });
    const [filters, setFilters] = useState({ team: 'all', status: 'all', from: '', to: '' });
    
    const teams = useMemo(() => [...new Set(employees.map(e => e.team))], [employees]);

    const filteredTimeLogs = useMemo(() => {
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
    
    const workloadData = useMemo(() => {
        let filteredEmployees = employees;
        if (filters.team !== 'all') {
            filteredEmployees = filteredEmployees.filter(emp => emp.team === filters.team);
        }

        const data = filteredEmployees.map(emp => {
            const loggedHours = filteredTimeLogs
                .filter(log => log.employee_id === emp.id)
                .reduce((sum, log) => sum + calculateDuration(log.start_time, log.end_time), 0);
            
            const capacity = emp.weekly_capacity_hours;
            const utilization = capacity > 0 ? (loggedHours / capacity) * 100 : 0;
            
            let status = 'Healthy';
            let barColor = 'var(--success-color)';
            if (utilization > 120) { status = 'Overloaded'; barColor = 'var(--danger-color)'; }
            else if (utilization < 80) { status = 'Underutilized'; barColor = 'var(--warning-color)'; }
            
            return { id: emp.id, name: emp.name, team: emp.team, capacity, loggedHours: loggedHours.toFixed(1), utilization, status, barColor };
        });

        if (filters.status !== 'all') {
            return data.filter(item => item.status.toLowerCase() === filters.status);
        }
        return data;

    }, [employees, filteredTimeLogs, filters.team, filters.status]);

    const sortedData = useMemo(() => {
        let sortableItems = [...workloadData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [workloadData, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (!sortConfig || sortConfig.key !== key) return <span className="material-icons sort-icon" style={{ opacity: 0.3 }}>unfold_more</span>;
        return sortConfig.direction === 'ascending' ? <span className="material-icons sort-icon">expand_less</span> : <span className="material-icons sort-icon">expand_more</span>;
    };
    
    return (
        <div className="table-container">
             <div className="page-header">
                <div className="page-filters">
                    <div className="filter-group">
                        <label>From</label>
                        <input type="date" value={filters.from} onChange={e => setFilters(p => ({...p, from: e.target.value}))}/>
                    </div>
                    <div className="filter-group">
                        <label>To</label>
                        <input type="date" value={filters.to} onChange={e => setFilters(p => ({...p, to: e.target.value}))}/>
                    </div>
                    <div className="filter-group">
                        <label>Team</label>
                        <select value={filters.team} onChange={e => setFilters(p => ({...p, team: e.target.value}))}>
                            <option value="all">All Teams</option>
                            {teams.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Status</label>
                        <select value={filters.status} onChange={e => setFilters(p => ({...p, status: e.target.value}))}>
                            <option value="all">All Statuses</option>
                            <option value="overloaded">Overloaded</option>
                            <option value="healthy">Healthy</option>
                            <option value="underutilized">Underutilized</option>
                        </select>
                    </div>
                </div>
            </div>
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
                    {sortedData.length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: 'center' }}>No employee data matches your filters.</td></tr>
                    ) : (
                        sortedData.map(item => (
                            <tr key={item.id} className="clickable-row">
                                <td>{item.name}</td>
                                <td>{item.team}</td>
                                <td>{item.capacity}</td>
                                <td>{item.loggedHours}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div className="utilization-bar-container">
                                            <div className="utilization-bar" style={{ width: `${Math.min(item.utilization, 100)}%`, backgroundColor: item.barColor }} />
                                        </div>
                                        <span>{item.utilization.toFixed(1)}%</span>
                                    </div>
                                </td>
                                <td><span className={`status-tag status-${item.status.toLowerCase()}`}>{item.status}</span></td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

const MyDayView = ({ loggedInEmployeeId, timeLogs, tasks, onSave, onDelete }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const taskMap = useMemo(() => new Map(tasks.map(t => [t.id, t.title])), [tasks]);

    const dailyLogs = useMemo(() => {
        return timeLogs
            .filter(log => log.employee_id === loggedInEmployeeId && log.date === selectedDate)
            .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
    }, [timeLogs, loggedInEmployeeId, selectedDate]);
    
    const WORK_START_HOUR = 9; // 9 AM
    const WORK_END_HOUR = 18; // 6 PM
    const TOTAL_HOURS = WORK_END_HOUR - WORK_START_HOUR;

    const { timeGaps, summary } = useMemo(() => {
        const WORK_START_MINUTES = WORK_START_HOUR * 60;
        const WORK_END_MINUTES = WORK_END_HOUR * 60;

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

        const gaps = [];
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

        const minutesToTime = (mins) => {
            const h = Math.floor(mins / 60).toString().padStart(2, '0');
            const m = (mins % 60).toString().padStart(2, '0');
            return `${h}:${m}`;
        };

        const formattedGaps = gaps.filter(g => g.end > g.start).map(gap => ({
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
    }, [dailyLogs, taskMap]);

    const handleGapClick = (gap) => {
        setCurrentItem({ 
            task_title: '',
            start_time: gap.start_time,
            end_time: gap.end_time,
            notes: '',
            id: Date.now() // This will be used to create a new item
        });
        setIsModalOpen(true);
    };
    
    const handleEdit = (item) => {
        const taskTitle = taskMap.get(item.task_id) || '';
        setCurrentItem({ ...item, task_title: taskTitle });
        setIsModalOpen(true);
    };

    const handleSave = (itemData) => {
        onSave(itemData);
        setIsModalOpen(false);
    };

    const changeDate = (offset) => {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate() + offset);
        setSelectedDate(currentDate.toISOString().split('T')[0]);
    };
    
    return (
        <div>
            <div className="page-header">
                <div className="page-filters">
                    <button className="btn-icon" onClick={() => changeDate(-1)}><span className="material-icons">chevron_left</span></button>
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                    <button className="btn-icon" onClick={() => changeDate(1)}><span className="material-icons">chevron_right</span></button>
                </div>
            </div>

             <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
                <div className="card">
                    <h3>Logged</h3>
                    <div className="value">{summary.logged}<span className="unit">hrs</span></div>
                </div>
                <div className="card">
                    <h3>Unlogged</h3>
                    <div className="value">{summary.unlogged}<span className="unit">hrs</span></div>
                </div>
                <div className="card">
                    <h3>Productive</h3>
                    <div className="value">{summary.productive}<span className="unit">hrs</span></div>
                </div>
            </div>

            <div className="my-day-view">
                <div className="card">
                    <h3>Timeline</h3>
                    <div className="timeline-container">
                         {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => WORK_START_HOUR + i).map(hour => (
                            <div key={hour} className="timeline-hour-marker" style={{ top: `${((hour - WORK_START_HOUR) / TOTAL_HOURS) * 100}%` }}>
                                {`${hour}:00`}
                            </div>
                        ))}
                        {timeGaps.map((gap, index) => {
                            const startMinutes = timeToMinutes(gap.start_time) - (WORK_START_HOUR * 60);
                            const endMinutes = timeToMinutes(gap.end_time) - (WORK_START_HOUR * 60);
                            const top = (startMinutes / (TOTAL_HOURS * 60)) * 100;
                            const height = ((endMinutes - startMinutes) / (TOTAL_HOURS * 60)) * 100;

                            return (
                                <button key={`gap-${index}`} className="timeline-gap" style={{ top: `${top}%`, height: `${height}%` }} onClick={() => handleGapClick(gap)}>
                                    <span className="material-icons">add_circle_outline</span>
                                    <span>{calculateDuration(gap.start_time, gap.end_time).toFixed(2)} hrs</span>
                                </button>
                            );
                        })}
                        {dailyLogs.map(log => {
                            const startMinutes = timeToMinutes(log.start_time) - (WORK_START_HOUR * 60);
                            const endMinutes = timeToMinutes(log.end_time) - (WORK_START_HOUR * 60);
                            const top = (startMinutes / (TOTAL_HOURS * 60)) * 100;
                            const height = ((endMinutes - startMinutes) / (TOTAL_HOURS * 60)) * 100;
                            const isBreak = (taskMap.get(log.task_id) || '').toLowerCase().includes('break');

                            return (
                                <div key={log.id} className={`timeline-event ${isBreak ? 'is-break' : ''}`} style={{ top: `${top}%`, height: `${Math.max(height, 1)}%` }} title={`${log.start_time} - ${log.end_time}: ${taskMap.get(log.task_id)}`}>
                                    <strong>{taskMap.get(log.task_id)}</strong>
                                    <span>{log.notes}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="card">
                     <h3>Activities</h3>
                     <div className="activity-list">
                        {dailyLogs.length === 0 ? <p>No activities logged. Click a gap in the timeline to start.</p> : (
                            <ul>
                                {dailyLogs.map(log => (
                                    <li key={log.id} className="activity-item">
                                        <div className="activity-item-info">
                                            <span className="title">{taskMap.get(log.task_id) || 'Unknown Task'}</span>
                                            <span className="meta">{log.start_time} - {log.end_time} ({calculateDuration(log.start_time, log.end_time).toFixed(2)} hrs)</span>
                                            {log.notes && <p className="notes">"{log.notes}"</p>}
                                        </div>
                                        <div className="actions">
                                            <button className="btn-icon" onClick={() => handleEdit(log)}><span className="material-icons">edit</span></button>
                                            <button className="btn-icon" onClick={() => onDelete(log.id, "Time Logs")}><span className="material-icons" style={{color: 'var(--danger-color)'}}>delete</span></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                     </div>
                </div>
            </div>
             {isModalOpen && (
                <Modal title={currentItem && timeLogs.some(l => l.id === currentItem.id) ? 'Edit Activity' : 'Add Activity'} onClose={() => setIsModalOpen(false)}>
                    <ActivityForm 
                        item={currentItem} 
                        onSave={handleSave} 
                        onCancel={() => setIsModalOpen(false)}
                        tasks={tasks}
                        employeeId={loggedInEmployeeId}
                        date={selectedDate}
                    />
                </Modal>
            )}
        </div>
    )
};

const GenericCrudView = ({ title, columns, data, onAdd, onUpdate, onDelete, AddEditFormComponent, sheetName }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        return data.filter(item => 
            Object.values(item).some(val => 
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [data, searchTerm]);

    const handleAddClick = () => {
        setCurrentItem(null);
        setIsModalOpen(true);
    };
    
    const handleEditClick = (item) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };
    
    const handleSave = (itemData) => {
        if (currentItem) {
            onUpdate(itemData, sheetName);
        } else {
            onAdd(itemData, sheetName);
        }
        setIsModalOpen(false);
    };

    return (
         <div className="table-container">
            <div className="page-header">
                <div className="page-filters">
                    <input 
                        type="search" 
                        placeholder={`Search ${title}...`} 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="search-input"
                    />
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={handleAddClick}>
                        <span className="material-icons">add</span> Add {title.slice(0,-1)}
                    </button>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        {columns.map(col => <th key={col.key}>{col.header}</th>)}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.length === 0 ? (
                        <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center' }}>No {title.toLowerCase()} found.</td></tr>
                    ) : (
                        filteredData.map(item => (
                            <tr key={item.id}>
                                {columns.map(col => <td key={col.key}>{col.render ? col.render(item) : item[col.key]}</td>)}
                                <td>
                                    <div className="actions">
                                        <button className="btn-icon" aria-label={`Edit ${title}`} onClick={() => handleEditClick(item)}>
                                            <span className="material-icons">edit</span>
                                        </button>
                                        <button className="btn-icon" aria-label={`Delete ${title}`} onClick={() => onDelete(item.id, sheetName)}>
                                            <span className="material-icons" style={{color: 'var(--danger-color)'}}>delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            {isModalOpen && (
                <Modal title={currentItem ? `Edit ${title.slice(0,-1)}` : `Add New ${title.slice(0,-1)}`} onClose={() => setIsModalOpen(false)}>
                    <AddEditFormComponent item={currentItem} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};


// --- FORMS for CRUD Views ---

const EmployeeForm = ({ item, onSave, onCancel, teams, roles }) => {
    const [formData, setFormData] = useState(item || { name: '', role: '', team: '', weekly_capacity_hours: 40 });
    const handleChange = (e) => setFormData(p => ({...p, [e.target.name]: e.target.value}));
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, id: item?.id || Date.now(), weekly_capacity_hours: parseInt(formData.weekly_capacity_hours) });
    };
    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required/></div>
            <div className="form-group">
                <label>Role</label>
                <input type="text" name="role" value={formData.role} onChange={handleChange} required list="roles-list" />
                <datalist id="roles-list">
                    {roles.map(role => <option key={role} value={role} />)}
                </datalist>
            </div>
            <div className="form-group">
                <label>Team</label>
                <input type="text" name="team" value={formData.team} onChange={handleChange} required list="teams-list" />
                 <datalist id="teams-list">
                    {teams.map(team => <option key={team} value={team} />)}
                </datalist>
            </div>
            <div className="form-group"><label>Weekly Capacity (hrs)</label><input type="number" name="weekly_capacity_hours" value={formData.weekly_capacity_hours} onChange={handleChange} required/></div>
            <div className="modal-actions"><button type="button" className="btn" onClick={onCancel}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
        </form>
    );
};

const TaskForm = ({ item, onSave, onCancel, employees, taskTypes }) => {
    const [formData, setFormData] = useState(item || { title: '', type: '', complexity: 3, status: 'Not Started', assigned_employee_id: '' });
    const handleChange = (e) => setFormData(p => ({...p, [e.target.name]: e.target.value}));
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, id: item?.id || Date.now(), complexity: parseInt(formData.complexity), assigned_employee_id: formData.assigned_employee_id ? parseInt(formData.assigned_employee_id) : null });
    };
    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Title</label><input type="text" name="title" value={formData.title} onChange={handleChange} required/></div>
            <div className="form-group">
                <label>Type</label>
                <input type="text" name="type" value={formData.type} onChange={handleChange} required list="task-types-list"/>
                <datalist id="task-types-list">
                    {taskTypes.map(type => <option key={type} value={type} />)}
                </datalist>
            </div>
            <div className="form-group"><label>Complexity (1-5)</label><input type="number" name="complexity" min="1" max="5" value={formData.complexity} onChange={handleChange} required/></div>
            <div className="form-group"><label>Status</label><select name="status" value={formData.status} onChange={handleChange} required><option>Not Started</option><option>In Progress</option><option>Completed</option></select></div>
            <div className="form-group"><label>Assign to</label><select name="assigned_employee_id" value={formData.assigned_employee_id || ''} onChange={handleChange}><option value="">Unassigned</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
            <div className="modal-actions"><button type="button" className="btn" onClick={onCancel}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
        </form>
    );
};

const ActivityForm = ({ item, onSave, onCancel, tasks, employeeId, date }) => {
    const [formData, setFormData] = useState(item || { task_title: '', start_time: '09:00', end_time: '10:00', notes: '' });
    
    useEffect(() => {
        setFormData(item || { task_title: '', start_time: '09:00', end_time: '10:00', notes: '' });
    }, [item]);

    const handleChange = (e) => setFormData(p => ({...p, [e.target.name]: e.target.value}));
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (calculateDuration(formData.start_time, formData.end_time) <= 0) {
            alert("End time must be after start time.");
            return;
        }
        onSave({
            ...formData,
            employee_id: employeeId,
            date: date
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Task</label>
                <input
                    type="text"
                    name="task_title"
                    value={formData.task_title || ''}
                    onChange={handleChange}
                    required
                    list="tasks-list"
                    placeholder="Type or select a task"
                />
                <datalist id="tasks-list">
                    {tasks.map(t => <option key={t.id} value={t.title} />)}
                </datalist>
            </div>
            <div style={{display: 'flex', gap: '16px'}}>
                <div className="form-group" style={{flex: 1}}><label>Start Time</label><input type="time" name="start_time" value={formData.start_time} onChange={handleChange} required/></div>
                <div className="form-group" style={{flex: 1}}><label>End Time</label><input type="time" name="end_time" value={formData.end_time} onChange={handleChange} required/></div>
            </div>
            <div className="form-group"><label>Notes (Optional)</label><textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={3}></textarea></div>
            <div className="modal-actions"><button type="button" className="btn" onClick={onCancel}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
        </form>
    );
};


// --- MAIN APP COMPONENT ---
const App = () => {
    const [page, setPage] = useState<Page>('dashboard');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [filters, setFilters] = useState({team: 'all'});
    const [loggedInEmployeeId, setLoggedInEmployeeId] = useState<number | null>(null);

    
    const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1f5OBwtGiZi-u2Qp7PiWYlN7WsrxpAKHFJGei6w9PtaQ/edit?usp=sharing';
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby2kNJ-z3hVQOWbqqxOQi8fHEPdxFnWCRljoWrNYfzXKUhZUoJM5cQ06R-nfUhiUXI/exec';

    const showToast = useCallback((message: string, type: ToastType) => {
        setToasts(prev => [...prev, { id: Date.now(), message, type }]);
    }, []);

    // --- Data Persistence ---
    useEffect(() => {
        try {
            const storedEmployees = localStorage.getItem('employees');
            if (storedEmployees) setEmployees(JSON.parse(storedEmployees));
            const storedTasks = localStorage.getItem('tasks');
            if (storedTasks) setTasks(JSON.parse(storedTasks));
            const storedTimeLogs = localStorage.getItem('timeLogs');
            if (storedTimeLogs) setTimeLogs(JSON.parse(storedTimeLogs));
            
            if (!storedEmployees) {
                syncData();
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            syncData();
        }
    }, []);

    useEffect(() => {
        if (employees.length > 0 && !loggedInEmployeeId) {
            setLoggedInEmployeeId(employees[0].id);
        }
    }, [employees, loggedInEmployeeId]);


    const saveData = (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Failed to save ${key} to localStorage`, error);
        }
    };
    
    // --- Data Syncing ---
    const getExportUrlsFromSheetUrl = (url: string) => {
        const match = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (!match || !match[1]) throw new Error("Invalid Google Sheet URL.");
        const sheetId = match[1];
        const baseUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=`;
        return {
            employees: `${baseUrl}Employees`,
            tasks: `${baseUrl}Tasks`,
            timeLogs: `${baseUrl}${encodeURIComponent('Time Logs')}`,
        };
    };

    const parseCsv = (text: string): Record<string, string>[] => {
        const lines = text.trim().split(/\r\n|\n/);
        if (lines.length < 2) return [];
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            return headers.reduce((obj, header, i) => {
                obj[header] = values[i] || '';
                return obj;
            }, {});
        });
    };

    const findValueByKey = (obj, key) => {
        const keyToFind = key.toLowerCase();
        const actualKey = Object.keys(obj).find(k => k.toLowerCase() === keyToFind);
        return actualKey ? obj[actualKey] : undefined;
    };

    const syncData = async () => {
        setIsLoading(true);
        try {
            const urls = getExportUrlsFromSheetUrl(GOOGLE_SHEET_URL);
            const [empRes, taskRes, logRes] = await Promise.all([fetch(urls.employees), fetch(urls.tasks), fetch(urls.timeLogs)]);
            if (!empRes.ok || !taskRes.ok || !logRes.ok) throw new Error("Failed to fetch sheets. Check URL and sharing settings.");

            const [empText, taskText, logText] = await Promise.all([empRes.text(), taskRes.text(), logRes.text()]);
            
            const newEmployees = parseCsv(empText).map(row => ({ 
                id: parseInt(findValueByKey(row, 'id'), 10), 
                name: findValueByKey(row, 'name') || '', 
                role: findValueByKey(row, 'role') || '', 
                team: findValueByKey(row, 'team') || '', 
                weekly_capacity_hours: parseInt(findValueByKey(row, 'weekly_capacity_hours'), 10) || 40 
            })).filter(e => !isNaN(e.id));

            const newTasks = parseCsv(taskText).map(row => ({ 
                id: parseInt(findValueByKey(row, 'id'), 10), 
                title: findValueByKey(row, 'title') || '', 
                type: findValueByKey(row, 'type') || '', 
                complexity: parseInt(findValueByKey(row, 'complexity'), 10) || 3, 
                status: findValueByKey(row, 'status') || 'Not Started', 
                assigned_employee_id: findValueByKey(row, 'assigned_employee_id') ? parseInt(findValueByKey(row, 'assigned_employee_id'), 10) : null 
            })).filter(t => !isNaN(t.id));

            const newTimeLogs = parseCsv(logText).map((row) => ({ 
                id: parseInt(findValueByKey(row, 'id'), 10), 
                employee_id: parseInt(findValueByKey(row, 'employee_id'), 10), 
                task_id: parseInt(findValueByKey(row, 'task_id'), 10), 
                date: findValueByKey(row, 'date') || '',
                start_time: findValueByKey(row, 'start_time') || '00:00',
                end_time: findValueByKey(row, 'end_time') || '00:00',
                notes: findValueByKey(row, 'notes') || '',
            })).filter(l => !isNaN(l.id));

            setEmployees(newEmployees); saveData('employees', newEmployees);
            setTasks(newTasks); saveData('tasks', newTasks);
            setTimeLogs(newTimeLogs); saveData('timeLogs', newTimeLogs);
            showToast("Data synced successfully!", 'success');
        } catch (error) {
            console.error("Sync failed:", error);
            showToast(`Error syncing data: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const postDataToSheet = async (payload) => {
        if (!APPS_SCRIPT_URL) {
            console.error('Google Apps Script URL is not set.');
            showToast('Application is not configured to save data.', 'error');
            return false;
        }
        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                mode: 'cors', body: JSON.stringify(payload), redirect: 'follow',
            });

            const resultText = await response.text();
            let result;
            try { result = JSON.parse(resultText); } catch (e) { throw new Error('Received an invalid response from the server.'); }

            if (result.status === 'success') return true;
            else throw new Error(result.message || 'Unknown error from Apps Script.');
        } catch (error) {
            console.error('Failed to post data to Google Sheet:', error);
            showToast(`Sync to sheet failed: ${error.message}`, 'error');
            return false;
        }
    };
    
    const createCrudHandlers = (state, setState, stateKey) => ({
        onAdd: async (item, sheetName) => {
            const originalState = [...state];
            const optimisticState = [...originalState, item];
            setState(optimisticState); saveData(stateKey, optimisticState);
            const success = await postDataToSheet({ action: 'CREATE', sheetName, rowData: item });
            if (success) { showToast('Item added successfully.', 'success'); } 
            else { setState(originalState); saveData(stateKey, originalState); showToast('Failed to add item. Sync failed, change reverted.', 'error'); }
        },
        onUpdate: async (updatedItem, sheetName) => {
            const originalState = [...state];
            const optimisticState = originalState.map(i => i.id === updatedItem.id ? updatedItem : i);
            setState(optimisticState); saveData(stateKey, optimisticState);
            const success = await postDataToSheet({ action: 'UPDATE', sheetName, rowId: updatedItem.id, rowData: updatedItem });
            if (success) { showToast('Item updated successfully.', 'success'); } 
            else { setState(originalState); saveData(stateKey, originalState); showToast('Update failed to sync. Changes reverted.', 'error'); }
        },
        onDelete: async (id, sheetName) => { 
            if (window.confirm('Are you sure? This will be permanently deleted from the app and the Google Sheet.')) {
                const originalState = [...state];
                const optimisticState = originalState.filter(i => i.id !== id);
                setState(optimisticState); saveData(stateKey, optimisticState);
                const success = await postDataToSheet({ action: 'DELETE', sheetName, rowId: id });
                if (success) { showToast('Item deleted successfully.', 'success'); } 
                else { setState(originalState); saveData(stateKey, originalState); showToast('Deletion failed to sync. Change reverted.', 'error'); }
            }
        },
    });

    const handleEmployeeDelete = useCallback(async (employeeId) => {
        const employeeToDelete = employees.find(e => e.id === employeeId);
        if (!employeeToDelete) return;

        const confirmMessage = `Are you sure you want to delete ${employeeToDelete.name}? This will also delete all their time logs and unassign them from any tasks.`;
        if (!window.confirm(confirmMessage)) return;

        const originalEmployees = [...employees]; const originalTasks = [...tasks]; const originalTimeLogs = [...timeLogs];
        const newEmployees = employees.filter(e => e.id !== employeeId);
        const newTasks = tasks.map(task => task.assigned_employee_id === employeeId ? { ...task, assigned_employee_id: null } : task );
        const newTimeLogs = timeLogs.filter(log => log.employee_id !== employeeId);
        
        setEmployees(newEmployees); setTasks(newTasks); setTimeLogs(newTimeLogs);
        saveData('employees', newEmployees); saveData('tasks', newTasks); saveData('timeLogs', newTimeLogs);

        const actions = [
            { action: 'DELETE', sheetName: 'Employees', rowId: employeeId },
            ...tasks.filter(t => t.assigned_employee_id === employeeId).map(t => ({ action: 'UPDATE', sheetName: 'Tasks', rowId: t.id, rowData: { ...t, assigned_employee_id: null } })),
            ...timeLogs.filter(l => l.employee_id === employeeId).map(l => ({ action: 'DELETE', sheetName: 'Time Logs', rowId: l.id }))
        ];

        try {
            const results = await Promise.all(actions.map(action => postDataToSheet(action)));
            if (results.some(success => !success)) throw new Error("One or more sync operations failed.");
            showToast('Employee and all related data deleted successfully.', 'success');
        } catch (error) {
            setEmployees(originalEmployees); setTasks(originalTasks); setTimeLogs(originalTimeLogs);
            saveData('employees', originalEmployees); saveData('tasks', originalTasks); saveData('timeLogs', originalTimeLogs);
            showToast('Deletion failed. Changes have been reverted.', 'error');
        }
    }, [employees, tasks, timeLogs, showToast]);

    const handleTaskDelete = useCallback(async (taskId) => {
        const taskToDelete = tasks.find(t => t.id === taskId);
        if (!taskToDelete) return;
        if (!window.confirm(`Are you sure you want to delete the task "${taskToDelete.title}"? This will also delete all its associated time logs.`)) return;
        
        const originalTasks = [...tasks]; const originalTimeLogs = [...timeLogs];
        const newTasks = tasks.filter(t => t.id !== taskId);
        const newTimeLogs = timeLogs.filter(log => log.task_id !== taskId);

        setTasks(newTasks); setTimeLogs(newTimeLogs);
        saveData('tasks', newTasks); saveData('timeLogs', newTimeLogs);
        
        const actions = [
            { action: 'DELETE', sheetName: 'Tasks', rowId: taskId },
            ...timeLogs.filter(l => l.task_id === taskId).map(l => ({ action: 'DELETE', sheetName: 'Time Logs', rowId: l.id }))
        ];
        
        try {
            const results = await Promise.all(actions.map(action => postDataToSheet(action)));
            if (results.some(success => !success)) throw new Error("One or more sync operations failed.");
            showToast('Task and its time logs deleted successfully.', 'success');
        } catch (error) {
            setTasks(originalTasks); setTimeLogs(originalTimeLogs);
            saveData('tasks', originalTasks); saveData('timeLogs', originalTimeLogs);
            showToast('Deletion failed. Changes have been reverted.', 'error');
        }
    }, [tasks, timeLogs, showToast]);
    
    const timeLogHandlers = useMemo(() => createCrudHandlers(timeLogs, setTimeLogs, 'timeLogs'), [timeLogs]);

    const handleActivitySave = useCallback(async (activityData) => {
        const { task_title, ...restOfActivity } = activityData;
        if (!task_title || !task_title.trim()) {
            showToast('Task name is required.', 'error');
            return;
        }
        const trimmedTitle = task_title.trim();
    
        let task = tasks.find(t => t.title.toLowerCase() === trimmedTitle.toLowerCase());
        let taskId;
    
        if (!task) {
            const newTask = { 
                id: Date.now(), 
                title: trimmedTitle, 
                type: 'General', 
                complexity: 1, 
                status: 'In Progress' as TaskStatus, 
                assigned_employee_id: activityData.employee_id 
            };
            taskId = newTask.id;
            
            const originalTasks = [...tasks];
            const newTasks = [...originalTasks, newTask];
            setTasks(newTasks);
            saveData('tasks', newTasks);
            const taskSaveSuccess = await postDataToSheet({ action: 'CREATE', sheetName: 'Tasks', rowData: newTask });
    
            if (!taskSaveSuccess) {
                setTasks(originalTasks);
                saveData('tasks', originalTasks);
                showToast('Failed to create new task. Activity not saved.', 'error');
                return;
            }
            showToast(`New task "${trimmedTitle}" created.`, 'success');
        } else {
            taskId = task.id;
        }
    
        const finalTimeLog = { ...restOfActivity, task_id: taskId };
        delete finalTimeLog.task_title;
    
        if (finalTimeLog.id && timeLogs.some(log => log.id === finalTimeLog.id)) {
            await timeLogHandlers.onUpdate(finalTimeLog, "Time Logs");
        } else {
            finalTimeLog.id = finalTimeLog.id || Date.now();
            await timeLogHandlers.onAdd(finalTimeLog, "Time Logs");
        }
    }, [tasks, timeLogs, showToast, timeLogHandlers, setTasks]);

    const { onAdd: onEmployeeAdd, onUpdate: onEmployeeUpdate } = useMemo(() => createCrudHandlers(employees, setEmployees, 'employees'), [employees]);
    const { onAdd: onTaskAdd, onUpdate: onTaskUpdate } = useMemo(() => createCrudHandlers(tasks, setTasks, 'tasks'), [tasks]);

    const employeeCrud = { onAdd: onEmployeeAdd, onUpdate: onEmployeeUpdate, onDelete: handleEmployeeDelete };
    const taskCrud = { onAdd: onTaskAdd, onUpdate: onTaskUpdate, onDelete: handleTaskDelete };
    const timeLogCrud = { onAdd: handleActivitySave, onUpdate: handleActivitySave, onDelete: timeLogHandlers.onDelete };
    
    const employeeMap = useMemo(() => new Map(employees.map(e => [e.id, e.name])), [employees]);
    const taskMap = useMemo(() => new Map(tasks.map(t => [t.id, t.title])), [tasks]);

    const employeeColumns = useMemo(() => [ {key: 'name', header: 'Name'}, {key: 'role', header: 'Role'}, {key: 'team', header: 'Team'}, {key: 'weekly_capacity_hours', header: 'Capacity (hrs)'} ], []);
    const taskColumns = useMemo(() => [ {key: 'title', header: 'Title'}, {key: 'type', header: 'Type'}, {key: 'complexity', header: 'Complexity'}, {key: 'status', header: 'Status'}, {key: 'assigned_employee_id', header: 'Assigned To', render: (item) => employeeMap.get(item.assigned_employee_id) || 'Unassigned'} ], [employeeMap]);
    const timeLogColumns = useMemo(() => [ {key: 'employee_id', header: 'Employee', render: (item) => employeeMap.get(item.employee_id) || 'Unknown'}, {key: 'task_id', header: 'Task', render: (item) => taskMap.get(item.task_id) || 'Unknown'}, {key: 'date', header: 'Date'}, {key: 'start_time', header: 'Start'}, {key: 'end_time', header: 'End'}, {key: 'duration', header: 'Duration', render: (item) => `${calculateDuration(item.start_time, item.end_time).toFixed(2)} hrs`} ], [employeeMap, taskMap]);
    
    const timeLogsWithTaskTitles = useMemo(() => timeLogs.map(log => ({...log, task_title: taskMap.get(log.task_id) || ''})), [timeLogs, taskMap]);

    const teams = useMemo(() => [...new Set(employees.map(e => e.team).filter(Boolean))], [employees]);
    const roles = useMemo(() => [...new Set(employees.map(e => e.role).filter(Boolean))], [employees]);
    const taskTypes = useMemo(() => [...new Set(tasks.map(t => t.type).filter(Boolean))], [tasks]);

    const AddEditEmployeeForm = useCallback((props) => <EmployeeForm {...props} teams={teams} roles={roles} />, [teams, roles]);
    const AddEditTaskForm = useCallback((props) => <TaskForm {...props} employees={employees} taskTypes={taskTypes} />, [employees, taskTypes]);
    const AddEditActivityForm = useCallback((props) => <ActivityForm {...props} tasks={tasks} employeeId={loggedInEmployeeId} date={new Date().toISOString().split('T')[0]} />, [tasks, loggedInEmployeeId]);
    
    const pageTitles = { dashboard: 'Dashboard Overview', myday: 'My Day', workload: 'Workload Analysis', employees: 'Employees', timelogs: 'All Time Logs', tasks: 'Task Management' };
    
    return (
        <>
            <style>{GlobalStyles}</style>
            <ToastNotifications toasts={toasts} setToasts={setToasts} />
            <div className="app-container">
                <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!isSidebarCollapsed)} aria-label="Toggle sidebar">
                    <span className="material-icons">{isSidebarCollapsed ? 'menu' : 'close'}</span>
                </button>
                <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                    <div className="sidebar-header"><span className="material-icons">assessment</span><span>Tracker</span></div>
                    <nav className="nav" role="navigation" aria-label="Main">
                        <NavItem icon="dashboard" label="Dashboard" active={page === 'dashboard'} onClick={() => setPage('dashboard')} />
                        <NavItem icon="today" label="My Day" active={page === 'myday'} onClick={() => setPage('myday')} />
                        <NavItem icon="bar_chart" label="Workload" active={page === 'workload'} onClick={() => setPage('workload')} />
                        <NavItem icon="groups" label="Employees" active={page === 'employees'} onClick={() => setPage('employees')} />
                        <NavItem icon="list_alt" label="Tasks" active={page === 'tasks'} onClick={() => setPage('tasks')} />
                        <NavItem icon="schedule" label="All Time Logs" active={page === 'timelogs'} onClick={() => setPage('timelogs')} />
                    </nav>
                </aside>
                <main className="main-content">
                    {isLoading && <div className="loading-overlay">Syncing data...</div>}
                    <header className="header">
                        <h1 style={{marginLeft: isSidebarCollapsed ? '50px' : '0'}}>{pageTitles[page]}</h1>
                        <div className="header-actions">
                            {employees.length > 0 && (
                                <div className="user-switcher">
                                    <label htmlFor="user-select">Log In As:</label>
                                    <select id="user-select" value={loggedInEmployeeId || ''} onChange={(e) => setLoggedInEmployeeId(Number(e.target.value))}>
                                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <button className="btn" onClick={syncData} disabled={isLoading}><span className="material-icons">sync</span> Sync Data</button>
                        </div>
                    </header>
                    {page === 'dashboard' && <DashboardView employees={employees} timeLogs={timeLogs} teams={teams} filters={filters} setFilters={setFilters} />}
                    {page === 'myday' && loggedInEmployeeId && <MyDayView loggedInEmployeeId={loggedInEmployeeId} timeLogs={timeLogs} tasks={tasks} onSave={handleActivitySave} onDelete={timeLogHandlers.onDelete} />}
                    {page === 'workload' && <WorkloadView employees={employees} timeLogs={timeLogs} />}
                    {page === 'employees' && <GenericCrudView title="Employees" data={employees} {...employeeCrud} sheetName="Employees" AddEditFormComponent={AddEditEmployeeForm} columns={employeeColumns} />}
                    {page === 'tasks' && <GenericCrudView title="Tasks" data={tasks} {...taskCrud} sheetName="Tasks" AddEditFormComponent={AddEditTaskForm} columns={taskColumns} />}
                    {page === 'timelogs' && <GenericCrudView title="Time Logs" data={timeLogsWithTaskTitles} {...timeLogCrud} sheetName="Time Logs" AddEditFormComponent={AddEditActivityForm} columns={timeLogColumns} />}
                </main>
            </div>
        </>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);