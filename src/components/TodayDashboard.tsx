import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Bell,
  Plus,
  Trash2,
  Edit2,
  Flame,
  TrendingUp,
  Target,
  Sparkles,
  Calendar,
  AlertTriangle,
  MailCheck,
  Filter,
  X,
  Search,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TodayDashboardData, ProductivityGraphData, Todo, User } from '../types.ts';
import { checkTaskTimeCompleted } from '../lib/timeUtils.ts';
import { TaskToggle } from './TaskToggle.tsx';
import {
  CalendarDoodle,
  HeartDoodle,
  SparkleDoodle,
  FlowerDoodle,
  BowDoodle,
  WashiTape,
} from './PlannerDoodles.tsx';
import {
  CricketBallDoodle,
  CricketBatDoodle,
  TrophyDoodle,
  CrownDoodle,
  Number45Sticker,
  BlueHeartDoodle,
  RisingSunDoodle,
  CricketPitchDoodle,
  StarDoodle,
} from './CricketDoodles.tsx';
import { isSpecialUser } from '../lib/userTheme.ts';

interface TodayDashboardProps {
  user: User;
  data: TodayDashboardData | null;
  graphData: ProductivityGraphData | null;
  onToggleTodo: (id: number) => Promise<void>;
  onDeleteTodo: (id: number) => Promise<void>;
  onEditTodo: (todo: Todo) => void;
  onOpenCreateModal: () => void;
  onFocusTask: (task: Todo) => void;
  onNavigateToPlanner?: () => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({
  user,
  data,
  graphData,
  onToggleTodo,
  onDeleteTodo,
  onEditTodo,
  onOpenCreateModal,
  onFocusTask,
  onNavigateToPlanner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [mobileTab, setMobileTab] = useState<'tasks' | 'reminders'>('tasks');

  const handleToggle = (id: number) => {
    onToggleTodo(id);
  };

  // Determine greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${user.name} ☀️`;
    if (hour < 17) return `Good afternoon, ${user.name} 🌤️`;
    return `Good evening, ${user.name} 🌙`;
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const percentage = data?.percentage ?? 0;
  const totalCount = data?.totalCount ?? 0;
  const completedCount = data?.completedCount ?? 0;
  const remainingCount = data?.remainingCount ?? 0;
  const streak = data?.currentStreak ?? 0;
  const motivation = data?.motivationMessage || "Let's get started. One small task is enough.";

  const filteredTasks = useMemo(() => {
    if (!data?.tasks) return [];
    return data.tasks.filter((todo) => {
      if (statusFilter === 'pending' && todo.completed) return false;
      if (statusFilter === 'completed' && !todo.completed) return false;
      if (priorityFilter !== 'all' && todo.priority !== priorityFilter) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        todo.title.toLowerCase().includes(q) ||
        (todo.description && todo.description.toLowerCase().includes(q)) ||
        (todo.category && todo.category.toLowerCase().includes(q))
      );
    });
  }, [data?.tasks, searchQuery, statusFilter, priorityFilter]);

  const isSpecial = isSpecialUser(user?.email);

  return (
    <div id="today-dashboard-view" className="space-y-6">
      {/* Welcome Banner & Motivation - Rohit Sharma Fan Scrapbook Theme OR Clean Normal UI */}
      {isSpecial ? (
        <div className="relative bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border-2 border-[#8EC5FF] shadow-[0_8px_30px_rgba(8,43,99,0.1)] space-y-6 overflow-hidden">
          {/* Decorative washi tapes */}
          <div className="absolute -top-1.5 left-10 z-10">
            <WashiTape color="blue" angle={-3} className="w-24 h-5" />
          </div>
          <div className="absolute -top-1.5 right-12 z-10 hidden sm:block">
            <WashiTape color="yellow" angle={4} className="w-20 h-4" />
          </div>

          {/* Header section with Rohit branding and hero polaroid */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pt-2">
            <div className="flex items-start gap-4">
              {/* Polaroid-framed Rohit Sharma portrait */}
              <div className="relative bg-white p-2 rounded-2xl shadow-md border border-[#8EC5FF]/80 -rotate-2 hover:rotate-0 transition-transform duration-300 shrink-0 hidden sm:block">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/9/98/Rohit_Sharma_Batting.jpg"
                  alt="Rohit Sharma Hitman"
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
                <div className="text-center mt-1">
                  <span className="font-handwriting font-bold text-[11px] text-[#082B63]">
                    Hitman 45 💙
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#1769E0] mb-1">
                  <CricketBallDoodle className="w-3.5 h-3.5" />
                  <span>{formattedDate}</span>
                  <span className="text-[#8EC5FF]">•</span>
                  <span>{user.timezone}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <CrownDoodle className="w-5 h-5 text-[#F4C95D]" />
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-handwriting font-bold text-[#082B63] tracking-tight flex items-center gap-2">
                    <span>Rohit Sharma Fans</span>
                    <Number45Sticker size="sm" />
                  </h1>
                </div>

                <p className="text-xs sm:text-sm font-handwriting text-[#1769E0] mt-1 font-semibold">
                  Plan your day like the Hitman — stay focused, stay consistent, keep winning.
                </p>

                {/* Fan badges */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-handwriting font-bold bg-[#EAF4FF] text-[#082B63] border border-[#8EC5FF]">
                    <CricketBatDoodle className="w-3.5 h-3.5" />
                    Hitman Mode ON 🔥
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-handwriting font-bold bg-[#FFF9E6] text-[#78350f] border border-[#F4C95D]">
                    <TrophyDoodle className="w-3.5 h-3.5" />
                    Small Steps. Big Innings.
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-handwriting font-bold bg-[#FFF0F5] text-[#9d174d] border border-[#F4B7C8]">
                    <BlueHeartDoodle className="w-3.5 h-3.5" color="#ec4899" />
                    45 — More than a Number
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {onNavigateToPlanner && (
                <button
                  type="button"
                  onClick={onNavigateToPlanner}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-handwriting font-bold text-[#082B63] bg-[#EAF4FF] hover:bg-[#D4E9FF] border-2 border-[#8EC5FF] rounded-2xl shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="View 7-day Weekly Grid & Task History"
                >
                  <Calendar className="w-4 h-4 text-[#1769E0]" />
                  <span>Weekly Planner →</span>
                </button>
              )}

              <button
                id="quick-add-task-header-btn"
                onClick={onOpenCreateModal}
                className="flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-handwriting font-bold text-white bg-[#1769E0] hover:bg-[#082B63] rounded-2xl shadow-md shadow-blue-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0 border border-[#082B63]"
              >
                <Plus className="w-4 h-4" /> + Add Task
              </button>
            </div>
          </div>

          {/* Special Motivational Note: SUN WILL RAISE AGAIN + Smile every body smile :) */}
          <div className="relative bg-white/90 rounded-2xl p-4 sm:p-5 border-2 border-[#8EC5FF]/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <RisingSunDoodle className="w-7 h-7" />
                  <h2 className="text-xl sm:text-2xl font-handwriting font-bold text-[#082B63] tracking-wide">
                    SUN WILL RAISE AGAIN
                  </h2>
                </div>
                <p className="text-xs sm:text-sm font-handwriting text-[#1769E0] font-semibold">
                  No matter how dark the today is, a brighter tomorrow always comes.
                </p>
              </div>

              {/* Exact quote: Smile every body smile :) */}
              <div className="bg-[#FFF9E6] border-2 border-[#F4C95D] rounded-xl px-4 py-2 rotate-1 shadow-xs shrink-0 self-start sm:self-auto">
                <p className="font-handwriting font-bold text-xs sm:text-sm text-[#78350f] flex items-center gap-1.5">
                  <span>"Smile every body smile :)"</span>
                  <BlueHeartDoodle className="w-3.5 h-3.5" color="#1769E0" />
                </p>
                <span className="text-[10px] font-mono text-[#b45309]">Hitman Rohit Sharma</span>
              </div>
            </div>
          </div>

          {/* Cricket Scoreboard Quick Stats Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
            {/* Today's completion - Runs */}
            <div className="rounded-[22px] p-4 bg-white border-2 border-[#8EC5FF] space-y-2 relative overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-handwriting font-bold text-[#082B63] tracking-wide">
                  Match Progress
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#EAF4FF] flex items-center justify-center text-[#1769E0]">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-handwriting font-bold text-[#082B63]">
                  {percentage}%
                </span>
                <span className="text-xs font-mono font-bold text-[#1769E0]">target</span>
              </div>
              <div className="w-full h-2.5 bg-[#EAF4FF] rounded-full overflow-hidden p-0.5 border border-[#8EC5FF]">
                <div
                  className="h-full bg-linear-to-r from-[#8EC5FF] to-[#1769E0] rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                />
              </div>
            </div>

            {/* Completed - Boundaries */}
            <div className="rounded-[22px] p-4 bg-[#F0FFF4] border-2 border-[#86EFAC] space-y-2 relative overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-handwriting font-bold text-[#14532d] tracking-wide">
                  Completed
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#16a34a]">
                  <TrophyDoodle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-handwriting font-bold text-[#14532d]">
                  {completedCount}
                </span>
                <span className="text-xs font-mono font-bold text-[#15803d]">of {totalCount} tasks</span>
              </div>
              <p className="text-[11px] font-handwriting text-[#16a34a] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
                Hitman Mentality 🔥
              </p>
            </div>

            {/* Remaining - Overs */}
            <div className="rounded-[22px] p-4 bg-[#FFFDF7] border-2 border-[#F4C95D] space-y-2 relative overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-handwriting font-bold text-[#78350f] tracking-wide">
                  Remaining
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] flex items-center justify-center text-[#d97706]">
                  <CricketBallDoodle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-handwriting font-bold text-[#78350f]">
                  {remainingCount}
                </span>
                <span className="text-xs font-mono font-bold text-[#b45309]">in the middle</span>
              </div>
              <p className="text-[11px] font-handwriting text-[#b45309] font-bold">
                Stay till the end 🏏
              </p>
            </div>

            {/* Streak - Match Series */}
            <div className="rounded-[22px] p-4 bg-[#FFF5F7] border-2 border-[#F4B7C8] space-y-2 relative overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-handwriting font-bold text-[#9d174d] tracking-wide">
                  Series Streak
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#FCE7F3] flex items-center justify-center text-[#db2777]">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-handwriting font-bold text-[#9d174d]">
                  {streak > 0 ? streak : 0}
                </span>
                <span className="text-xs font-mono font-bold text-[#be185d]">
                  {streak > 0 ? 'Matches 🔥' : 'Matches'}
                </span>
              </div>
              <p className="text-[11px] font-handwriting text-[#be185d] font-bold">
                Same Passion Every Match 💙
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* NORMAL / OLD UI - Clean White Card with Cyber Metric Cards */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>{formattedDate}</span>
                <span className="text-slate-300">•</span>
                <span>{user.timezone}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {getGreeting()}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full inline-flex border border-blue-100">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{motivation}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {onNavigateToPlanner && (
                <button
                  type="button"
                  onClick={onNavigateToPlanner}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
                  title="View 7-day Weekly Grid & Task History"
                >
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Weekly Planner →</span>
                </button>
              )}

              <button
                id="quick-add-task-header-btn"
                onClick={onOpenCreateModal}
                className="flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>
          </div>

          {/* Real-time Metric Cards - Cyber Glowing Rotating Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
            {/* Progress */}
            <div className="cyber-metric-card">
              <div className="card__border" />
              <div className="card__content">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Progress</span>
                  <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                    <Target className="w-4 h-4" />
                  </div>
                </div>
                <div className="my-1.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">{percentage}%</span>
                    <span className="text-xs font-semibold text-cyan-400">done</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Completed */}
            <div className="cyber-metric-card">
              <div className="card__border" />
              <div className="card__content">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Completed</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="my-1.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">{completedCount}</span>
                    <span className="text-xs font-medium text-slate-400">of {totalCount}</span>
                  </div>
                  <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 mt-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    PostgreSQL Synced
                  </p>
                </div>
              </div>
            </div>

            {/* Remaining */}
            <div className="cyber-metric-card">
              <div className="card__border" />
              <div className="card__content">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Remaining</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="my-1.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">{remainingCount}</span>
                    <span className="text-xs font-medium text-slate-400">pending</span>
                  </div>
                  <p className="text-[11px] text-amber-400 font-semibold mt-2">
                    Target today
                  </p>
                </div>
              </div>
            </div>

            {/* Streak */}
            <div className="cyber-metric-card">
              <div className="card__border" />
              <div className="card__content">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Streak</span>
                  <div className="w-7 h-7 rounded-lg bg-orange-950/60 border border-orange-800/50 flex items-center justify-center text-orange-400">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
                <div className="my-1.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">{streak > 0 ? streak : 0}</span>
                    <span className="text-xs font-semibold text-orange-400">{streak > 0 ? 'Days 🔥' : 'Days'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-2">
                    Continuous days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7-DAY PRODUCTIVITY GRAPH */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" /> Weekly Productivity
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real 7-day completion history generated directly from your database
            </p>
          </div>
          {graphData && (
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100">
                <span>Weekly Rate:</span>
                <strong className="text-sm font-bold">{graphData.weeklyCompletionRate}%</strong>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
                <span>Completed:</span>
                <strong className="text-sm font-bold">{graphData.totalCompletedWeek}</strong>
              </div>
            </div>
          )}
        </div>

        {graphData && graphData.days && graphData.days.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={graphData.days}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="shortDay"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const day = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-semibold text-slate-200">{day.dayOfWeek}</p>
                          <p className="text-blue-300 font-medium">{day.completedTasks} tasks completed</p>
                          <p className="text-emerald-400 font-bold">{day.completionPercentage}% completion</p>
                          {day.isToday && (
                            <span className="inline-block bg-blue-600/60 text-blue-200 text-[10px] px-2 py-0.5 rounded-sm">
                              Current Day
                            </span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completionPercentage"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRate)"
                  activeDot={{ r: 6, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm font-medium text-slate-600">No database task history yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Add and complete tasks to start building your real productivity line chart!
            </p>
          </div>
        )}
      </div>

      {/* Mobile Segmented Switcher (Tasks vs Reminders) */}
      <div className="lg:hidden flex items-center bg-slate-200/70 p-1 rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => setMobileTab('tasks')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mobileTab === 'tasks'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Today's Tasks</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              mobileTab === 'tasks'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-slate-300/70 text-slate-700'
            }`}
          >
            {filteredTasks.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('reminders')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mobileTab === 'reminders'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-blue-600" />
          <span>Reminders</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              mobileTab === 'reminders'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-slate-300/70 text-slate-700'
            }`}
          >
            {data?.upcomingReminders?.length || 0}
          </span>
        </button>
      </div>

      {/* TODAY'S TASKS & UPCOMING REMINDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Tasks List (2 cols) */}
        <div
          className={`rounded-3xl p-4 sm:p-6 md:p-8 space-y-4 lg:col-span-2 ${
            isSpecial
              ? 'bg-[#FFFDF7] border-2 border-[#8EC5FF] shadow-xs'
              : 'bg-white border border-slate-100 shadow-xs'
          } ${
            mobileTab === 'reminders' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-4 ${
              isSpecial ? 'border-b-2 border-[#8EC5FF]/50' : 'border-b border-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <h2
                className={`text-lg font-bold tracking-tight flex items-center gap-2 ${
                  isSpecial ? 'font-handwriting text-[#082B63] text-xl' : 'text-slate-900'
                }`}
              >
                {isSpecial ? (
                  <>
                    <CricketBatDoodle className="w-5 h-5 text-[#1769E0]" />
                    <span>Today's Hitman Tasks</span>
                  </>
                ) : (
                  "Today's Tasks"
                )}
              </h2>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  isSpecial
                    ? 'bg-[#EAF4FF] text-[#082B63] font-mono font-bold border border-[#8EC5FF]'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {filteredTasks.length}
              </span>
            </div>
            <button
              onClick={onOpenCreateModal}
              className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                isSpecial
                  ? 'bg-[#1769E0] hover:bg-[#082B63] text-white font-handwriting font-bold shadow-xs'
                  : 'text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-50'
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> {isSpecial ? '+ New Task' : 'Add Task'}
            </button>
          </div>

          {/* Mobile & Desktop Responsive Search & Filter Bar */}
          <div className="w-full space-y-2.5">
            <div className="relative flex items-center w-full">
              <div className="absolute left-3.5 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="today-task-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isSpecial ? 'What do you want to do today?' : "Search today's tasks..."
                }
                className={`w-full text-sm font-medium pl-10 pr-24 py-2.5 sm:py-3 rounded-2xl transition-all outline-none ${
                  isSpecial
                    ? 'bg-white border-2 border-[#8EC5FF] focus:border-[#1769E0] text-[#082B63] placeholder:text-[#1769E0]/50 font-handwriting text-base'
                    : 'bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                }`}
              />
              <div className="absolute right-2.5 flex items-center gap-1">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setShowFilterDropdown((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    showFilterDropdown || statusFilter !== 'all' || priorityFilter !== 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-200/70 hover:bg-slate-200 text-slate-700'
                  }`}
                  title="Toggle filters"
                >
                  <Filter className="w-3 h-3" />
                  <span className="text-[11px]">Filter</span>
                  {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              </div>
            </div>

            {/* Expandable Filter Options */}
            {showFilterDropdown && (
              <div className="p-3 sm:p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Filters</span>
                  {(statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setPriorityFilter('all');
                        setSearchQuery('');
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Reset all
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium text-[11px] w-14">Status:</span>
                    <div className="flex items-center gap-1">
                      {(['all', 'pending', 'completed'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`px-2.5 py-1 rounded-lg capitalize text-[11px] font-semibold transition-all cursor-pointer ${
                            statusFilter === s
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium text-[11px] w-14 sm:w-auto">Priority:</span>
                    <div className="flex items-center gap-1">
                      {(['all', 'high', 'medium', 'low'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPriorityFilter(p)}
                          className={`px-2.5 py-1 rounded-lg capitalize text-[11px] font-semibold transition-all cursor-pointer ${
                            priorityFilter === p
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active search tag & quick reset */}
            {(searchQuery.trim() || statusFilter !== 'all' || priorityFilter !== 'all') && (
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-0.5">
                <span>
                  Found {filteredTasks.length} matching task{filteredTasks.length === 1 ? '' : 's'}
                </span>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                  }}
                  className="text-blue-600 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Clear filters
                </button>
              </div>
            )}
          </div>

          {filteredTasks.length > 0 ? (
            <div className="space-y-2.5">
              {filteredTasks.map((todo) => {
                const dueInfo = checkTaskTimeCompleted(todo, user.timezone);
                const isAlerting = dueInfo.isDue && !todo.completed;

                return (
                  <div
                    key={todo.id}
                    className={`group flex items-start justify-between gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl border transition-all ${
                      isSpecial
                        ? todo.completed
                          ? 'bg-[#F0FFF4] border-[#86EFAC] text-[#15803d]/80 shadow-2xs'
                          : isAlerting
                          ? 'bg-[#FFF5F7] border-[#dc2626] ring-2 ring-red-200 shadow-md'
                          : 'bg-white border-2 border-[#8EC5FF] hover:border-[#1769E0] shadow-xs'
                        : todo.completed
                        ? 'bg-slate-50/70 border-slate-100 text-slate-400'
                        : isAlerting
                        ? 'bg-[#fff5f7] border-[#f43f5e] ring-2 ring-rose-200 shadow-md shadow-rose-500/15'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="mt-0.5 shrink-0 flex items-center">
                        <TaskToggle
                          id={`task-toggle-${todo.id}`}
                          checked={todo.completed}
                          onChange={() => handleToggle(todo.id)}
                          size="md"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`text-sm truncate ${
                              isSpecial
                                ? `font-handwriting font-bold text-base ${
                                    todo.completed
                                      ? 'line-through text-[#15803d]/70'
                                      : 'text-[#082B63]'
                                  }`
                                : `font-semibold text-slate-900 ${
                                    todo.completed ? 'line-through text-slate-400' : ''
                                  }`
                            }`}
                          >
                            {todo.title}
                          </p>

                          {/* Hitman Completed Badge */}
                          {isSpecial && todo.completed && (
                            <span className="inline-flex items-center gap-1 bg-[#DCFCE7] text-[#16a34a] font-handwriting font-bold text-[11px] px-2 py-0.5 rounded-md border border-[#86EFAC]">
                              <TrophyDoodle className="w-3 h-3 text-[#eab308]" />
                              Hitman mentality — DONE! 🔥💙
                            </span>
                          )}

                          {isAlerting && (
                            <span className="inline-flex items-center gap-1 bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] font-cute font-bold text-[10px] px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e] animate-ping" />
                              ⏰ Time Completed ({dueInfo.displayText})
                            </span>
                          )}
                        </div>

                        {todo.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {todo.description}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                          {todo.dueTime && (
                            <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                              <Clock className="w-3 h-3 text-slate-400" /> {todo.dueTime}
                            </span>
                          )}

                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold uppercase text-[10px] ${
                              todo.priority === 'high'
                                ? 'bg-red-50 text-red-700 border border-red-100'
                                : todo.priority === 'medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {todo.priority}
                          </span>

                          <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                            {todo.category}
                          </span>

                          {/* Compact Notification Status Badges */}
                          {todo.completionEmailSent && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-100">
                              <MailCheck className="w-3 h-3 text-emerald-600" /> Email sent
                            </span>
                          )}
                          {todo.reminderSent && (
                            <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-medium border border-blue-100">
                              <Bell className="w-3 h-3 text-blue-600" /> Reminder sent
                            </span>
                          )}
                          {!todo.reminderSent && todo.reminderMinutesBefore && !todo.completed && (
                            <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              ⏰ Reminder set
                            </span>
                          )}
                          {todo.missedTaskEmailSent && !todo.completed && (
                            <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-md font-medium border border-red-100">
                              <AlertTriangle className="w-3 h-3 text-red-600" /> Missed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        id={`focus-task-btn-${todo.id}`}
                        type="button"
                        onClick={() => onFocusTask(todo)}
                        className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 border border-blue-200/70 transition-all cursor-pointer shadow-2xs"
                        title="Activate Focus Mode with Pomodoro Timer"
                      >
                        <Target className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="hidden sm:inline">Focus</span>
                      </button>

                      {/* Action buttons: accessible on touch/mobile, hover on desktop */}
                      <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditTodo(todo)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTodo(todo.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              {searchQuery.trim() || statusFilter !== 'all' || priorityFilter !== 'all' ? (
                <>
                  <p className="text-sm font-semibold text-slate-700">No tasks match your search</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setPriorityFilter('all');
                    }}
                    className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 rounded-lg cursor-pointer"
                  >
                    Clear Search & Filters
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-700">No tasks for today</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Enjoy your free time or click "Add Task" above to plan something productive!
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Upcoming Reminders Card (1 col on desktop, tab/accordion on mobile) */}
        <div
          className={`bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-xs space-y-4 flex flex-col justify-between ${
            mobileTab === 'tasks' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Upcoming Reminders</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Scheduled email alerts</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>

            {data?.upcomingReminders && data.upcomingReminders.length > 0 ? (
              <div className="space-y-2.5">
                {data.upcomingReminders.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50/80 hover:bg-blue-50/40 border border-slate-200/70 rounded-2xl text-xs space-y-1.5 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md shrink-0">
                        {item.reminderMinutesBefore
                          ? `${item.reminderMinutesBefore}m before`
                          : 'At due time'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.dueDate} {item.dueTime || ''}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                        <MailCheck className="w-3 h-3" /> Armed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 px-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-blue-50/80 text-blue-500 flex items-center justify-center mx-auto">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">No Reminders Pending</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-[220px] mx-auto leading-relaxed">
                    Add tasks with a due time and reminder to receive automated emails.
                  </p>
                </div>
                <button
                  onClick={onOpenCreateModal}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-white px-3 py-1.5 rounded-xl border border-blue-100 shadow-2xs cursor-pointer mt-1"
                >
                  <Plus className="w-3 h-3" /> Schedule a Task
                </button>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <span>Background scheduler sends emails at the configured reminder time even if your browser is closed.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
