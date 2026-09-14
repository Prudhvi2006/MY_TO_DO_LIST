import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare,
  Calendar,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Radio,
  Plus,
  ShieldCheck,
  BellRing,
} from 'lucide-react';
import { api, getAuthToken } from './lib/api.ts';
import { getClientSocket, disconnectClientSocket } from './lib/socket.ts';
import {
  User,
  Todo,
  TodayDashboardData,
  ProductivityGraphData,
  AnalyticsData,
  NotificationLog,
} from './types.ts';
import { AuthModal } from './components/AuthModal.tsx';
import { TodayDashboard } from './components/TodayDashboard.tsx';
import { WeeklyPlanner } from './components/WeeklyPlanner.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { TaskModal } from './components/TaskModal.tsx';
import { FocusModeView } from './components/FocusModeView.tsx';
import { NeonSpinner } from './components/NeonSpinner.tsx';
import { AstronautCelebrationModal } from './components/AstronautCelebrationModal.tsx';
import { CalendarDoodle, HeartDoodle, SparkleDoodle } from './components/PlannerDoodles.tsx';
import {
  CricketBallDoodle,
  CricketBatDoodle,
  TrophyDoodle,
  CrownDoodle,
  Number45Sticker,
  BlueHeartDoodle,
} from './components/CricketDoodles.tsx';
import { DueTaskNotificationBanner } from './components/DueTaskNotificationBanner.tsx';
import { isSpecialUser, isSpecialAstronautUser } from './lib/userTheme.ts';
import { AppLogo } from './components/AppLogo.tsx';
import {
  syncUserProfileToFirestore,
  saveTodoToFirestore,
  deleteTodoFromFirestore,
  batchSyncTodosToFirestore,
  subscribeToUserTodos,
} from './lib/firestoreService.ts';
import { logoutFirebase } from './lib/firebase.ts';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner' | 'analytics' | 'settings'>(() => {
    try {
      const saved = localStorage.getItem('active_tab');
      if (saved && ['dashboard', 'planner', 'analytics', 'settings'].includes(saved)) {
        return saved as any;
      }
    } catch (e) {
      // ignore
    }
    return 'planner'; // Default to Weekly Planner so redesigned stationery page is immediately visible
  });

  const handleTabChange = (tab: 'dashboard' | 'planner' | 'analytics' | 'settings') => {
    setActiveTab(tab);
    try {
      localStorage.setItem('active_tab', tab);
    } catch (e) {
      // ignore
    }
  };

  // Real-time server state
  const [todayData, setTodayData] = useState<TodayDashboardData | null>(null);
  const [graphData, setGraphData] = useState<ProductivityGraphData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Astronaut Celebration Popup state (15s duration on task completion)
  const [celebrationTask, setCelebrationTask] = useState<Todo | null>(null);

  // Focus Mode state (minimizes UI to show only task details, description, and Pomodoro timer)
  const [focusedTask, setFocusedTask] = useState<Todo | null>(null);

  // Modal controls
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Todo | null>(null);
  const [defaultTaskDate, setDefaultTaskDate] = useState<string | undefined>(undefined);

  // Real-time toast alert
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Check existing session
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setIsInitializing(false);
      return;
    }

    api
      .getMe()
      .then((res) => {
        if (res.user) {
          setCurrentUser(res.user);
        }
      })
      .catch(() => {
        // Token expired or invalid
        api.logout();
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  // Fetch all application data & sync to Firestore
  const refreshAllData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [today, graph, analytics, todos] = await Promise.all([
        api.getTodayDashboard(),
        api.getProductivityGraph(),
        api.getAnalytics(),
        api.getTodos('all'),
      ]);
      setTodayData(today);
      setGraphData(graph);
      setAnalyticsData(analytics);
      setAllTodos(todos);

      // Persist to Firestore database
      syncUserProfileToFirestore(currentUser);
      if (todos && todos.length > 0) {
        batchSyncTodosToFirestore(currentUser.id, todos);
      }
    } catch (err) {
      console.error('Error syncing real-time data:', err);
    }
  }, [currentUser]);

  // Debounced refresh to batch socket broadcasts and eliminate UI lag
  const refreshTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedRefreshAllData = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = setTimeout(() => {
      refreshAllData();
    }, 150);
  }, [refreshAllData]);

  // Connect socket, Firestore listeners, and register real-time event listeners
  useEffect(() => {
    if (!currentUser) {
      disconnectClientSocket();
      setIsSocketConnected(false);
      return;
    }

    // Subscribe to real-time Firestore updates
    const unsubscribeFirestore = subscribeToUserTodos(currentUser.id, (firestoreTodos) => {
      if (firestoreTodos && firestoreTodos.length > 0) {
        setAllTodos(firestoreTodos);
      }
    });

    const token = getAuthToken();
    const socket = getClientSocket(token || undefined);

    socket.on('connect', () => {
      setIsSocketConnected(true);
      socket.emit('join_user_room', currentUser.id);
    });

    socket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    // Real-time event broadcasts with debounced refresh to eliminate multi-socket lag
    socket.on('todo:created', (newTodo: Todo) => {
      setAllTodos((prev) => [newTodo, ...prev.filter((t) => t.id !== newTodo.id)]);
      saveTodoToFirestore(currentUser.id, newTodo);
      debouncedRefreshAllData();
      showToast(`New task added: "${newTodo.title}"`, 'info');
    });

    socket.on('todo:updated', (updatedTodo: Todo) => {
      setAllTodos((prev) => prev.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)));
      saveTodoToFirestore(currentUser.id, updatedTodo);
      debouncedRefreshAllData();
    });

    socket.on('todo:completed', (completedTodo: Todo) => {
      setAllTodos((prev) => prev.map((t) => (t.id === completedTodo.id ? completedTodo : t)));
      saveTodoToFirestore(currentUser.id, completedTodo);
      debouncedRefreshAllData();
      // Show astronaut completion modal only for eligible emails
      if (isSpecialAstronautUser(currentUser?.email)) {
        setCelebrationTask(completedTodo);
      }
      showToast(`Task completed: "${completedTodo.title}" 🎉`, 'success');
    });

    socket.on('todo:deleted', ({ id }: { id: number }) => {
      setAllTodos((prev) => prev.filter((t) => t.id !== id));
      deleteTodoFromFirestore(currentUser.id, id);
      debouncedRefreshAllData();
    });

    socket.on('progress:updated', () => {
      debouncedRefreshAllData();
    });

    socket.on('streak:updated', () => {
      debouncedRefreshAllData();
    });

    socket.on('notification:sent', (log: NotificationLog) => {
      showToast(`Email dispatched: ${log.title}`, 'success');
    });

    socket.on('task:time_completed_alert', () => {
      debouncedRefreshAllData();
    });

    socket.on('welcome_email_seen_confirmed', (payload: { seen: boolean; seenAt?: string }) => {
      setCurrentUser((prev) => (prev ? { ...prev, welcomeEmailSeen: true, welcomeEmailSeenAt: payload.seenAt } : null));
      showToast('Welcome email confirmed! Welcome to your dashboard.', 'success');
    });

    // Initial load
    refreshAllData();

    return () => {
      unsubscribeFirestore();
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('todo:created');
      socket.off('todo:updated');
      socket.off('todo:completed');
      socket.off('todo:deleted');
      socket.off('progress:updated');
      socket.off('streak:updated');
      socket.off('notification:sent');
      socket.off('welcome_email_seen_confirmed');
    };
  }, [currentUser, refreshAllData, debouncedRefreshAllData]);

  const handleToggleTodo = async (id: number) => {
    // 1. Instant optimistic UI update for super smooth 60fps interaction
    let willComplete = false;
    let targetTask: Todo | undefined;

    setTodayData((prev) => {
      if (!prev) return prev;
      const found = prev.tasks.find((t) => t.id === id);
      if (found) {
        willComplete = !found.completed;
        targetTask = { ...found, completed: willComplete };
      }
      const updatedTasks = prev.tasks.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
          : t
      );
      const newCompleted = updatedTasks.filter((t) => t.completed).length;
      const newTotal = updatedTasks.length;
      const newPct = newTotal > 0 ? Math.round((newCompleted / newTotal) * 100) : 0;
      return {
        ...prev,
        tasks: updatedTasks,
        completedCount: newCompleted,
        remainingCount: newTotal - newCompleted,
        percentage: newPct,
      };
    });

    setAllTodos((prev) => {
      const found = prev.find((t) => t.id === id);
      if (found && !targetTask) {
        willComplete = !found.completed;
        targetTask = { ...found, completed: willComplete };
      }
      return prev.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
          : t
      );
    });

    if (currentUser && targetTask) {
      saveTodoToFirestore(currentUser.id, {
        ...targetTask,
        completed: willComplete,
        completedAt: willComplete ? new Date().toISOString() : null,
      });
    }

    // If marked completed, trigger the Astronaut Celebration Popup only for eligible emails
    if (willComplete && targetTask && isSpecialAstronautUser(currentUser?.email)) {
      setCelebrationTask(targetTask);
    }

    try {
      const updated: any = await api.toggleTodo(id);
      if (currentUser && updated) {
        saveTodoToFirestore(currentUser.id, updated);
      }
      // Background sync with debouncing to eliminate lag
      debouncedRefreshAllData();
      if (updated?.completed) {
        if (isSpecialAstronautUser(currentUser?.email)) {
          setCelebrationTask(updated);
        }
        showToast(`🎉 "${updated.title}" completed! Congratulatory email dispatched to ${currentUser?.email}.`, 'success');
      } else {
        showToast(`Task "${updated?.title || 'item'}" marked as active.`, 'info');
      }
    } catch (err: any) {
      debouncedRefreshAllData();
      showToast(err.message || 'Failed to update task', 'error');
    }
  };

  const handleDeleteTodo = async (id: number) => {
    // Instant optimistic removal from UI
    setTodayData((prev) => {
      if (!prev) return prev;
      const updatedTasks = prev.tasks.filter((t) => t.id !== id);
      const newCompleted = updatedTasks.filter((t) => t.completed).length;
      const newTotal = updatedTasks.length;
      const newPct = newTotal > 0 ? Math.round((newCompleted / newTotal) * 100) : 0;
      return {
        ...prev,
        tasks: updatedTasks,
        totalCount: newTotal,
        completedCount: newCompleted,
        remainingCount: newTotal - newCompleted,
        percentage: newPct,
      };
    });

    setAllTodos((prev) => prev.filter((t) => t.id !== id));
    if (currentUser) {
      deleteTodoFromFirestore(currentUser.id, id);
    }

    try {
      await api.deleteTodo(id);
      refreshAllData();
      showToast('Task removed', 'info');
    } catch (err: any) {
      refreshAllData();
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  const handleMoveTodo = async (id: number, newDueDate: string) => {
    try {
      const updated = await api.updateTodo(id, { dueDate: newDueDate });
      if (currentUser && updated) {
        saveTodoToFirestore(currentUser.id, updated);
      }
      await refreshAllData();
      showToast(`Task rescheduled to ${newDueDate}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to move task', 'error');
    }
  };

  const handleSaveTaskModal = async (taskData: {
    title: string;
    description: string;
    dueDate: string;
    dueTime: string | null;
    reminderMinutesBefore: number | null;
    priority: 'low' | 'medium' | 'high';
    category: string;
  }) => {
    if (editingTask) {
      const updated = await api.updateTodo(editingTask.id, taskData);
      if (currentUser && updated) {
        saveTodoToFirestore(currentUser.id, updated);
      }
      showToast('Task updated successfully', 'success');
    } else {
      const created = await api.createTodo(taskData);
      if (currentUser && created) {
        saveTodoToFirestore(currentUser.id, created);
      }
      showToast('Task created and reminder scheduled', 'success');
    }
    await refreshAllData();
  };

  const handleLogout = async () => {
    await api.logout();
    await logoutFirebase();
    disconnectClientSocket();
    setCurrentUser(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <NeonSpinner text="Connecting to PostgreSQL Database • Super Fast Load..." size="lg" />
      </div>
    );
  }

  // If not logged in, display real OTP Auth Flow modal
  if (!currentUser) {
    return (
      <AuthModal
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  const isSpecial = isSpecialUser(currentUser?.email);

  return (
    <div
      id="production-app-root"
      className={`min-h-screen text-slate-900 flex flex-col md:flex-row ${
        isSpecial ? 'bg-rohit-paper' : 'bg-slate-50/70'
      }`}
    >
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 text-xs animate-slide-up">
          <BellRing className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* LEFT SIDEBAR - Fixed to Viewport per user specification */}
      <aside
        className={`sidebar sidebar-fixed w-full md:w-[317px] md:fixed md:top-0 md:left-0 md:h-screen md:overflow-y-auto md:z-[1000] flex flex-col shrink-0 ${
          isSpecial
            ? 'bg-[#FFFDF7] border-r-2 border-[#8EC5FF] shadow-[4px_0_24px_rgba(8,43,99,0.08)]'
            : 'bg-white border-r border-slate-200/80'
        }`}
      >
        {/* Brand Header */}
        <div
          className={`p-5 flex items-center justify-between ${
            isSpecial
              ? 'border-b-2 border-[#8EC5FF]/60 bg-[#FFFDF7]'
              : 'border-b border-slate-100 bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            {isSpecial ? (
              <>
                <div className="relative flex items-center justify-center">
                  <Number45Sticker size="md" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <CrownDoodle className="w-4 h-4 text-[#F4C95D]" />
                    <h2 className="text-base font-handwriting font-bold text-[#082B63] tracking-wide leading-none">
                      HITMAN LIST
                    </h2>
                    <BlueHeartDoodle className="w-3.5 h-3.5" color="#1769E0" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CricketBallDoodle className="w-3 h-3 text-[#dc2626]" />
                    <span className="text-[11px] font-mono font-bold text-[#1769E0] tracking-wide">
                      Plan • Do • Win
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <AppLogo size="md" showWordmark={true} subtitle="real-time workspace" />
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className={`p-3.5 space-y-2 flex-1 ${isSpecial ? 'font-handwriting' : ''}`}>
          <button
            id="nav-planner-btn"
            onClick={() => handleTabChange('planner')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'planner'
                ? isSpecial
                  ? 'bg-[#1769E0] text-white shadow-md shadow-blue-600/30 font-bold border border-[#082B63]'
                  : 'bg-blue-600 text-white shadow-xs font-semibold'
                : isSpecial
                ? 'text-[#082B63] hover:bg-[#EAF4FF] hover:text-[#1769E0]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4" />
              <span>Weekly Planner</span>
            </div>
            {isSpecial && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold bg-[#F4C95D] text-[#082B63]">
                45
              </span>
            )}
          </button>

          <button
            id="nav-today-btn"
            onClick={() => handleTabChange('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? isSpecial
                  ? 'bg-[#1769E0] text-white shadow-md shadow-blue-600/30 font-bold border border-[#082B63]'
                  : 'bg-blue-600 text-white shadow-xs font-semibold'
                : isSpecial
                ? 'text-[#082B63] hover:bg-[#EAF4FF] hover:text-[#1769E0]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckSquare className="w-4 h-4" />
              <span>Today's Dashboard</span>
            </div>
            {isSpecial && <CricketBallDoodle className="w-3.5 h-3.5" />}
          </button>

          <button
            id="nav-analytics-btn"
            onClick={() => handleTabChange('analytics')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? isSpecial
                  ? 'bg-[#1769E0] text-white shadow-md shadow-blue-600/30 font-bold border border-[#082B63]'
                  : 'bg-blue-600 text-white shadow-xs font-semibold'
                : isSpecial
                ? 'text-[#082B63] hover:bg-[#EAF4FF] hover:text-[#1769E0]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4" />
              <span>Scoreboard & Stats</span>
            </div>
            {isSpecial && <TrophyDoodle className="w-3.5 h-3.5" />}
          </button>

          <button
            id="nav-settings-btn"
            onClick={() => handleTabChange('settings')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? isSpecial
                  ? 'bg-[#1769E0] text-white shadow-md shadow-blue-600/30 font-bold border border-[#082B63]'
                  : 'bg-blue-600 text-white shadow-xs font-semibold'
                : isSpecial
                ? 'text-[#082B63] hover:bg-[#EAF4FF] hover:text-[#1769E0]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <SettingsIcon className="w-4 h-4" />
              <span>Settings & Notifications</span>
            </div>
          </button>
        </nav>

        {/* Quick Add Button in Sidebar */}
        <div className="p-3.5 pt-0">
          <button
            id="sidebar-add-task-btn"
            onClick={() => {
              setEditingTask(null);
              setDefaultTaskDate(undefined);
              setIsTaskModalOpen(true);
            }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              isSpecial
                ? 'bg-[#1769E0] hover:bg-[#082B63] text-white font-handwriting font-bold shadow-md shadow-blue-600/20 border border-[#082B63]'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{isSpecial ? '+ New Hitman Task' : 'Add Task'}</span>
          </button>
        </div>

        {/* Current User & Logout Footer */}
        <div
          className={`p-4 ${
            isSpecial
              ? 'border-t-2 border-[#8EC5FF]/60 bg-[#FFFDF7]'
              : 'border-t border-slate-100 bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p
                className={`text-xs truncate ${
                  isSpecial
                    ? 'font-handwriting font-bold text-[#082B63]'
                    : 'font-semibold text-slate-800'
                }`}
              >
                {currentUser.name}
              </p>
              <p
                className={`text-[11px] truncate ${
                  isSpecial ? 'font-mono text-[#1769E0] font-medium' : 'text-slate-500'
                }`}
              >
                {currentUser.email}
              </p>
            </div>
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA - with offset to respect fixed sidebar */}
      <main className="main-content main-content-offset flex-1 flex flex-col min-w-0 md:ml-[317px] overflow-y-auto">
        {/* Top Header with Real-Time Socket Connection Indicator */}
        <header
          className={`h-14 px-4 sm:px-6 flex items-center justify-between shrink-0 ${
            isSpecial
              ? 'bg-[#FFFDF7]/90 backdrop-blur-md border-b-2 border-[#8EC5FF]/60'
              : 'bg-white/80 backdrop-blur-md border-b border-slate-200/80'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Real-Time Socket Status Badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
                isSocketConnected
                  ? isSpecial
                    ? 'bg-blue-50/90 border-blue-200 text-[#082B63]'
                    : 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50/90 border-amber-200 text-amber-800'
              }`}
            >
              <Radio
                className={`w-3.5 h-3.5 ${
                  isSocketConnected
                    ? isSpecial
                      ? 'text-[#1769E0] animate-pulse'
                      : 'text-emerald-600 animate-pulse'
                    : 'text-amber-600'
                }`}
              />
              <span>
                {isSocketConnected
                  ? isSpecial
                    ? 'Hitman 45 • Live Real-Time Synchronized'
                    : 'Live Real-Time Synchronized'
                  : 'Reconnecting...'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs hidden sm:inline ${
                isSpecial
                  ? 'font-handwriting text-[#082B63] font-bold'
                  : 'font-semibold text-slate-500'
              }`}
            >
              {isSpecial
                ? 'Rohit Sharma Fan Edition • PostgreSQL Cloud SQL 💙'
                : 'PostgreSQL Cloud SQL • SMTP Active'}
            </span>
          </div>
        </header>

        {/* Content Views */}
        <div className="p-3.5 sm:p-6 md:p-8 flex-1">
          {activeTab === 'dashboard' && (
            <TodayDashboard
              user={currentUser}
              data={todayData}
              graphData={graphData}
              onToggleTodo={handleToggleTodo}
              onDeleteTodo={handleDeleteTodo}
              onEditTodo={(todo) => {
                setEditingTask(todo);
                setIsTaskModalOpen(true);
              }}
              onOpenCreateModal={() => {
                setEditingTask(null);
                setDefaultTaskDate(undefined);
                setIsTaskModalOpen(true);
              }}
              onFocusTask={(task) => setFocusedTask(task)}
              onNavigateToPlanner={() => handleTabChange('planner')}
            />
          )}

          {activeTab === 'planner' && (
            <WeeklyPlanner
              todos={allTodos}
              onToggleTodo={handleToggleTodo}
              onMoveTodo={handleMoveTodo}
              onOpenCreateModal={(date) => {
                setEditingTask(null);
                setDefaultTaskDate(date);
                setIsTaskModalOpen(true);
              }}
              userTimezone={currentUser.timezone}
              userEmail={currentUser.email}
              onFocusTask={(task) => setFocusedTask(task)}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              analytics={analyticsData}
              graphData={graphData}
              userEmail={currentUser.email}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              user={currentUser}
              onUserUpdated={(updated) => setCurrentUser(updated)}
            />
          )}
        </div>
      </main>

      {/* Focus Mode (Minimizes UI to show only the selected task's details, description, and Pomodoro timer) */}
      {focusedTask && (
        <FocusModeView
          task={focusedTask}
          onExit={() => setFocusedTask(null)}
          onToggleComplete={async (id: number) => {
            await handleToggleTodo(id);
            // Update local focusedTask state
            setFocusedTask((prev) =>
              prev && prev.id === id ? { ...prev, completed: !prev.completed } : prev
            );
          }}
        />
      )}

      {/* Task Add / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
          setDefaultTaskDate(undefined);
        }}
        onSave={handleSaveTaskModal}
        initialData={editingTask}
        defaultDate={defaultTaskDate}
        userEmail={currentUser?.email}
      />

      {/* Astronaut Task Completion Celebration Modal (Pops up for 15s with best wishes & quote for eligible astronaut users) */}
      {celebrationTask && isSpecialAstronautUser(currentUser?.email) && (
        <AstronautCelebrationModal
          task={celebrationTask}
          onClose={() => setCelebrationTask(null)}
        />
      )}

      {/* Persistent Notification Banner for time-completed tasks until marked */}
      {currentUser && (
        <DueTaskNotificationBanner
          todos={allTodos}
          userTimezone={currentUser.timezone}
          userEmail={currentUser.email}
          onToggleTodo={handleToggleTodo}
          onFocusTask={(task) => setFocusedTask(task)}
        />
      )}
    </div>
  );
}
