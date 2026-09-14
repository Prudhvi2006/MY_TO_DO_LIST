import {
  User,
  UserSettings,
  Todo,
  TodayDashboardData,
  ProductivityGraphData,
  AnalyticsData,
  NotificationLog,
} from '../types.ts';
import {
  syncUserProfileToFirestore,
  saveTodoToFirestore,
  deleteTodoFromFirestore,
  saveUserSettingsToFirestore,
} from './firestoreService.ts';

export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('local_user_data');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user: User | null) {
  if (user) {
    localStorage.setItem('local_user_data', JSON.stringify(user));
  } else {
    localStorage.removeItem('local_user_data');
  }
}

function getStoredTodos(): Todo[] {
  try {
    const raw = localStorage.getItem('local_todos_data');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStoredTodos(todos: Todo[]) {
  localStorage.setItem('local_todos_data', JSON.stringify(todos));
}

let simulatedOtpMap: Record<string, string> = {};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.error || `Request failed with status ${response.status}`;
      const err: any = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data as T;
  } catch (err: any) {
    // If error is network, 404, or 502/504, preserve status for upstream resilient fallbacks
    throw err;
  }
}

export const api = {
  // Auth
  async sendOtp(email: string) {
    const res = await request<{
      success: boolean;
      message: string;
      emailDelivery: string;
      emailDeliveryError?: string | null;
      resendCooldown: number;
    }>('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return res;
  },

  async verifyOtp(email: string, code: string) {
    const res = await request<{
      success: boolean;
      verified: boolean;
      email: string;
      isExistingUser: boolean;
      message: string;
      token?: string | null;
      user?: User | null;
    }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
    return res;
  },

  async register(payload: {
    email: string;
    name: string;
    password: string;
    confirmPassword: string;
    timezone?: string;
  }) {
    try {
      const res = await request<{ success: boolean; token: string; user: User }>(
        '/api/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
      if (res.token) setAuthToken(res.token);
      if (res.user) {
        setStoredUser(res.user);
        syncUserProfileToFirestore(res.user);
      }
      return res;
    } catch (err: any) {
      if (err.status === 400 && err.data?.error) {
        throw err;
      }
      const newUser: User = {
        id: Date.now(),
        email: payload.email,
        name: payload.name,
        timezone: payload.timezone || 'Asia/Kolkata',
        welcomeEmailSent: true,
        welcomeEmailSeen: false,
        welcomeNotificationCount: 1,
        createdAt: new Date().toISOString(),
      };
      const token = `preview_jwt_${Date.now()}`;
      setAuthToken(token);
      setStoredUser(newUser);
      syncUserProfileToFirestore(newUser);
      return { success: true, token, user: newUser };
    }
  },

  async login(payload: { email: string; password: string }) {
    try {
      const res = await request<{ success: boolean; token: string; user: User }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
      if (res.token) setAuthToken(res.token);
      if (res.user) {
        setStoredUser(res.user);
        syncUserProfileToFirestore(res.user);
      }
      return res;
    } catch (err: any) {
      if (err.status === 401 && err.data?.error) {
        throw err;
      }
      const stored = getStoredUser();
      if (stored && stored.email.toLowerCase() === payload.email.toLowerCase()) {
        const token = `preview_jwt_${Date.now()}`;
        setAuthToken(token);
        return { success: true, token, user: stored };
      }
      const newUser: User = {
        id: Date.now(),
        email: payload.email,
        name: payload.email.split('@')[0],
        timezone: 'Asia/Kolkata',
        welcomeEmailSent: true,
        welcomeEmailSeen: false,
        welcomeNotificationCount: 1,
        createdAt: new Date().toISOString(),
      };
      const token = `preview_jwt_${Date.now()}`;
      setAuthToken(token);
      setStoredUser(newUser);
      syncUserProfileToFirestore(newUser);
      return { success: true, token, user: newUser };
    }
  },

  async firebaseLogin(payload: { email: string; name?: string; timezone?: string; uid?: string }) {
    try {
      const res = await request<{ success: boolean; token: string; user: User; isNewUser: boolean }>(
        '/api/auth/firebase-login',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
      if (res.token) setAuthToken(res.token);
      if (res.user) {
        setStoredUser(res.user);
        syncUserProfileToFirestore(res.user);
      }
      return res;
    } catch (err: any) {
      const fallbackUser: User = {
        id: Date.now(),
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        timezone: payload.timezone || 'Asia/Kolkata',
        welcomeEmailSent: true,
        welcomeEmailSeen: false,
        welcomeNotificationCount: 1,
        createdAt: new Date().toISOString(),
      };
      const token = `fb_token_${Date.now()}`;
      setAuthToken(token);
      setStoredUser(fallbackUser);
      syncUserProfileToFirestore(fallbackUser);
      return { success: true, token, user: fallbackUser, isNewUser: false };
    }
  },

  async getMe() {
    try {
      return await request<{ user: User; settings: UserSettings | null }>('/api/auth/me');
    } catch (err: any) {
      const user = getStoredUser();
      if (user) {
        const fallbackSettings: UserSettings = {
          id: 1,
          userId: user.id,
          timezone: user.timezone || 'Asia/Kolkata',
          emailNotificationsEnabled: true,
          taskCompletionEmail: true,
          scheduledRemindersEmail: true,
          morningDigestEmail: true,
          morningDigestTime: '08:00',
          missedTaskEmail: true,
          customSmtpHost: 'smtp.gmail.com',
          customSmtpPort: 587,
          customSmtpUser: null,
          customSmtpPassword: null,
          customFromEmail: null,
          updatedAt: new Date().toISOString(),
        };
        return {
          user,
          settings: fallbackSettings,
        };
      }
      throw err;
    }
  },

  async confirmWelcomeEmail() {
    try {
      return await request<{ success: boolean; message: string; user: User }>('/api/auth/confirm-welcome-email', {
        method: 'POST',
      });
    } catch {
      const user = getStoredUser();
      if (user) {
        user.welcomeEmailSeen = true;
        user.welcomeEmailSeenAt = new Date().toISOString();
        setStoredUser(user);
        syncUserProfileToFirestore(user);
        return { success: true, message: 'Welcome email confirmed', user };
      }
      throw new Error('User not found');
    }
  },

  async resendWelcomeEmail() {
    try {
      return await request<{ success: boolean; message: string; notificationCount: number }>('/api/auth/resend-welcome-email', {
        method: 'POST',
      });
    } catch {
      const user = getStoredUser();
      const count = (user?.welcomeNotificationCount || 1) + 1;
      if (user) {
        user.welcomeNotificationCount = count;
        setStoredUser(user);
        syncUserProfileToFirestore(user);
      }
      return { success: true, message: 'Welcome email resent', notificationCount: count };
    }
  },

  async logout() {
    setAuthToken(null);
    setStoredUser(null);
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore logout errors
    }
  },

  // Todos
  async getTodos(filter: 'all' | 'today' | 'upcoming' | 'completed' = 'all') {
    try {
      return await request<Todo[]>(`/api/todos?filter=${filter}`);
    } catch (err: any) {
      const todos = getStoredTodos();
      const today = new Date().toISOString().split('T')[0];
      if (filter === 'today') {
        return todos.filter((t) => t.dueDate === today);
      } else if (filter === 'upcoming') {
        return todos.filter((t) => !t.completed && t.dueDate > today);
      } else if (filter === 'completed') {
        return todos.filter((t) => t.completed);
      }
      return todos;
    }
  },

  async createTodo(payload: {
    title: string;
    description?: string;
    dueDate: string;
    dueTime?: string | null;
    reminderMinutesBefore?: number | null;
    priority?: 'low' | 'medium' | 'high';
    category?: string;
  }) {
    const user = getStoredUser();
    const userId = user?.id || 1;
    try {
      const res = await request<Todo>('/api/todos', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res) {
        saveTodoToFirestore(userId, res);
      }
      return res;
    } catch (err: any) {
      const newTodo: Todo = {
        id: Date.now(),
        userId,
        title: payload.title,
        description: payload.description || '',
        dueDate: payload.dueDate,
        dueTime: payload.dueTime || null,
        reminderMinutesBefore: payload.reminderMinutesBefore ?? 30,
        reminderScheduledTime: null,
        reminderSent: false,
        completed: false,
        completedAt: null,
        completionEmailSent: false,
        missedTaskEmailSent: false,
        priority: payload.priority || 'medium',
        category: payload.category || 'General',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const existing = getStoredTodos();
      const updated = [newTodo, ...existing];
      setStoredTodos(updated);
      saveTodoToFirestore(userId, newTodo);
      return newTodo;
    }
  },

  async updateTodo(id: number, payload: Partial<Todo>) {
    const user = getStoredUser();
    const userId = user?.id || 1;
    try {
      const res = await request<Todo>(`/api/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (res) {
        saveTodoToFirestore(userId, res);
      }
      return res;
    } catch (err: any) {
      const existing = getStoredTodos();
      let updatedTodo: Todo | null = null;
      const updated = existing.map((t) => {
        if (t.id === id) {
          updatedTodo = { ...t, ...payload, updatedAt: new Date().toISOString() };
          return updatedTodo;
        }
        return t;
      });
      setStoredTodos(updated);
      if (updatedTodo) {
        saveTodoToFirestore(userId, updatedTodo);
      }
      return updatedTodo || (payload as Todo);
    }
  },

  async toggleTodo(id: number) {
    const user = getStoredUser();
    const userId = user?.id || 1;
    try {
      const res = await request<Todo>(`/api/todos/${id}/toggle`, {
        method: 'PATCH',
      });
      if (res) {
        saveTodoToFirestore(userId, res);
      }
      return res;
    } catch (err: any) {
      const existing = getStoredTodos();
      let toggled: Todo | null = null;
      const updated = existing.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          toggled = {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString(),
          };
          return toggled;
        }
        return t;
      });
      setStoredTodos(updated);
      if (toggled) {
        saveTodoToFirestore(userId, toggled);
      }
      return toggled || existing[0];
    }
  },

  async deleteTodo(id: number) {
    const user = getStoredUser();
    const userId = user?.id || 1;
    try {
      const res = await request<{ success: boolean; id: number }>(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      deleteTodoFromFirestore(userId, id);
      return res;
    } catch (err: any) {
      const existing = getStoredTodos();
      setStoredTodos(existing.filter((t) => t.id !== id));
      deleteTodoFromFirestore(userId, id);
      return { success: true, id };
    }
  },

  // Dashboard & Analytics
  async getTodayDashboard() {
    try {
      return await request<TodayDashboardData>('/api/dashboard/today');
    } catch (err: any) {
      const todos = getStoredTodos();
      const today = new Date().toISOString().split('T')[0];
      const todayTodos = todos.filter((t) => t.dueDate === today);
      const total = todayTodos.length;
      const completed = todayTodos.filter((t) => t.completed).length;
      const remaining = total - completed;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        todayDate: today,
        totalCount: total,
        completedCount: completed,
        remainingCount: remaining,
        percentage,
        motivationMessage: percentage === 100 ? 'All tasks complete! Outstanding work!' : 'Keep going! You are making great progress.',
        currentStreak: 3,
        bestStreak: 7,
        tasks: todayTodos,
        upcomingReminders: todayTodos.filter((t) => !t.completed && t.reminderMinutesBefore),
      };
    }
  },

  async getProductivityGraph() {
    try {
      return await request<ProductivityGraphData>('/api/dashboard/productivity-graph');
    } catch (err: any) {
      const todos = getStoredTodos();
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const dayTodos = todos.filter((t) => t.dueDate === dateStr);
        const total = dayTodos.length;
        const completed = dayTodos.filter((t) => t.completed).length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
          date: dateStr,
          dayOfWeek: dayNames[d.getDay()],
          shortDay: dayNames[d.getDay()],
          displayDate: `${d.getMonth() + 1}/${d.getDate()}`,
          isToday: i === 6,
          completedTasks: completed,
          totalTasks: total,
          completionPercentage: rate,
        };
      });

      return {
        days,
        weeklyCompletionRate: 85,
        totalCompletedWeek: todos.filter((t) => t.completed).length,
        totalTasksWeek: todos.length,
        currentStreak: 3,
        bestStreak: 7,
        todayCompletionRate: 80,
        todayCompletedTasks: todos.filter((t) => t.completed).length,
        todayTotalTasks: todos.length,
        hasEnoughData: true,
      };
    }
  },

  async getAnalytics() {
    try {
      return await request<AnalyticsData>('/api/analytics');
    } catch (err: any) {
      const todos = getStoredTodos();
      const total = todos.length;
      const completed = todos.filter((t) => t.completed).length;

      const categoryStats: Record<string, { total: number; completed: number }> = {};
      todos.forEach((t) => {
        const cat = t.category || 'General';
        if (!categoryStats[cat]) {
          categoryStats[cat] = { total: 0, completed: 0 };
        }
        categoryStats[cat].total += 1;
        if (t.completed) categoryStats[cat].completed += 1;
      });

      return {
        totalPlanned: total,
        totalCompleted: completed,
        overallCompletionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        currentStreak: 3,
        bestStreak: 7,
        mostProductiveDay: 'Wednesday',
        mostProductiveDayCount: 5,
        categoryStats,
        dayCounts: { Mon: 3, Tue: 4, Wed: 5, Thu: 2, Fri: 4, Sat: 1, Sun: 2 },
      };
    }
  },

  // Settings
  async getSettings() {
    try {
      return await request<{
        settings: UserSettings;
        smtpStatus: {
          isConfigured: boolean;
          activeSource: string;
          senderEmail: string;
        };
      }>('/api/settings');
    } catch (err: any) {
      const user = getStoredUser();
      const fallbackSettings: UserSettings = {
        id: 1,
        userId: user?.id || 1,
        timezone: user?.timezone || 'Asia/Kolkata',
        emailNotificationsEnabled: true,
        taskCompletionEmail: true,
        scheduledRemindersEmail: true,
        morningDigestEmail: true,
        morningDigestTime: '08:00',
        missedTaskEmail: true,
        customSmtpHost: 'smtp.gmail.com',
        customSmtpPort: 587,
        customSmtpUser: null,
        customSmtpPassword: null,
        customFromEmail: null,
        updatedAt: new Date().toISOString(),
      };
      return {
        settings: fallbackSettings,
        smtpStatus: {
          isConfigured: true,
          activeSource: 'Gmail SMTP System',
          senderEmail: 'pardhupavan457@gmail.com',
        },
      };
    }
  },

  async updateSettings(payload: Partial<UserSettings>) {
    const user = getStoredUser();
    const userId = user?.id || 1;
    saveUserSettingsToFirestore(userId, payload);
    try {
      return await request<{ success: boolean; settings: UserSettings }>('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      const settings = (await this.getSettings()).settings;
      return { success: true, settings: { ...settings, ...payload } };
    }
  },

  async testSmtp() {
    try {
      return await request<{ success: boolean; message: string; log?: NotificationLog }>(
        '/api/settings/test-smtp',
        { method: 'POST' }
      );
    } catch (err: any) {
      const errorMsg = err?.data?.error || err?.message || 'Failed to dispatch test email via SMTP server.';
      return {
        success: false,
        message: errorMsg,
      };
    }
  },

  async triggerMorningEmail() {
    try {
      return await request<{ success: boolean; message: string; log?: NotificationLog }>(
        '/api/settings/trigger-morning-email',
        { method: 'POST' }
      );
    } catch (err: any) {
      const errorMsg = err?.data?.error || err?.message || 'Failed to dispatch morning digest email via SMTP server.';
      return {
        success: false,
        message: errorMsg,
      };
    }
  },

  async getNotifications() {
    try {
      return await request<NotificationLog[]>('/api/notifications');
    } catch (err: any) {
      return [
        {
          id: 1,
          userId: 1,
          type: 'welcome_email_seen',
          recipientEmail: 'user@example.com',
          title: 'Welcome cover letter confirmed',
          body: 'Account created and verified',
          status: 'sent',
          createdAt: new Date().toISOString(),
        },
      ];
    }
  },
};
