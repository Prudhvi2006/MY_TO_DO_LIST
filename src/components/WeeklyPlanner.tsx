import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  ArrowRightLeft,
  Target,
  History,
  Search,
  Filter,
  X,
  Check,
} from 'lucide-react';
import { Todo } from '../types.ts';
import { checkTaskTimeCompleted } from '../lib/timeUtils.ts';
import { isSpecialUser } from '../lib/userTheme.ts';
import {
  CalendarDoodle,
  HeartDoodle,
  SparkleDoodle,
  FlowerDoodle,
  BowDoodle,
  PencilIllustration,
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
} from './CricketDoodles.tsx';

interface WeeklyPlannerProps {
  todos: Todo[];
  onToggleTodo: (id: number) => Promise<void>;
  onMoveTodo: (id: number, newDueDate: string) => Promise<void>;
  onOpenCreateModal: (defaultDate?: string) => void;
  userTimezone: string;
  userEmail?: string;
  onFocusTask?: (task: Todo) => void;
}

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  todos,
  onToggleTodo,
  onMoveTodo,
  onOpenCreateModal,
  userTimezone,
  userEmail,
  onFocusTask,
}) => {
  const isSpecial = isSpecialUser(userEmail);

  // Current week offset (0 = current week, 1 = next week, -1 = previous week)
  const [weekOffset, setWeekOffset] = useState(0);
  const [movingTaskId, setMovingTaskId] = useState<number | null>(null);
  const [historyQuery, setHistoryQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [activeViewMode, setActiveViewMode] = useState<'planner' | 'history'>('planner');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Filtered history tasks
  const filteredHistory = useMemo(() => {
    return todos.filter((t) => {
      if (historyFilter === 'completed' && !t.completed) return false;
      if (historyFilter === 'pending' && t.completed) return false;

      if (!historyQuery.trim()) return true;
      const q = historyQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.dueDate && t.dueDate.toLowerCase().includes(q))
      );
    });
  }, [todos, historyQuery, historyFilter]);

  // Compute Monday date for the selected week
  const getMonday = (offsetWeeks = 0): Date => {
    const now = new Date();
    const day = now.getDay();
    // Monday is day 1. If today is Sunday (0), diff is -6 days. Otherwise 1 - day.
    const diff = (day === 0 ? -6 : 1) - day + offsetWeeks * 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const mondayDate = getMonday(weekOffset);

  // Generate 7 days (Monday to Sunday)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    return {
      date: dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isToday: dateStr === todayStr,
      tasks: todos.filter((t) => t.dueDate === dateStr),
    };
  });

  const handleMove = async (taskId: number, targetDate: string) => {
    await onMoveTodo(taskId, targetDate);
    setMovingTaskId(null);
  };

  // Pastel washi tape color options for columns
  const washiColors: Array<'pink' | 'yellow' | 'blue' | 'lavender'> = [
    'pink',
    'yellow',
    'blue',
    'lavender',
    'pink',
    'yellow',
    'blue',
  ];

  // Soft pastel highlight palette for tasks
  const getHighlightClass = (index: number) => {
    const highlights = [
      'marker-highlight-pink text-rose-950',
      'marker-highlight-yellow text-amber-950',
      'marker-highlight-mint text-emerald-950',
      'marker-highlight-lavender text-purple-950',
    ];
    return highlights[index % highlights.length];
  };

  return (
    <div id="weekly-planner-view" className="space-y-6">
      {/* Header Card: Stationery vs Modern Normal */}
      {isSpecial ? (
        <div className="relative bg-[#FFFDF7] rounded-[28px] p-6 sm:p-7 border-2 border-[#8EC5FF] shadow-[0_8px_30px_rgba(8,43,99,0.1)] space-y-6 overflow-hidden">
          {/* Decorative washi tapes */}
          <div className="absolute -top-1.5 left-10 z-10">
            <WashiTape color="blue" angle={-3} className="w-24 h-5" />
          </div>
          <div className="absolute -top-1.5 right-12 z-10 hidden sm:block">
            <WashiTape color="yellow" angle={4} className="w-20 h-4" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-2">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <CrownDoodle className="w-8 h-8 text-[#F4C95D] shrink-0" />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-handwriting font-bold text-[#082B63] tracking-wide flex items-center gap-2">
                    <span>Hitman Weekly Match Schedule</span>
                    <Number45Sticker size="sm" />
                  </h1>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#1769E0] font-handwriting font-semibold pl-1">
                Hitman Mode ON — Plan your week innings by innings, hit your goals, stay consistent.
              </p>
            </div>

            {/* View Mode Toggle - Rohit Blue Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 bg-[#EAF4FF] border border-[#8EC5FF] rounded-2xl shrink-0 self-start sm:self-auto shadow-xs">
              <button
                onClick={() => {
                  setActiveViewMode('planner');
                  setHistoryQuery('');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-handwriting font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewMode === 'planner' && !historyQuery.trim()
                    ? 'bg-white text-[#082B63] shadow-xs border border-[#8EC5FF]'
                    : 'text-[#1769E0] hover:text-[#082B63] hover:bg-white/50'
                }`}
              >
                <CricketBatDoodle className="w-3.5 h-3.5" />
                <span>Weekly Grid</span>
              </button>
              <button
                onClick={() => setActiveViewMode('history')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-handwriting font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewMode === 'history' || historyQuery.trim()
                    ? 'bg-white text-[#082B63] shadow-xs border border-[#8EC5FF]'
                    : 'text-[#1769E0] hover:text-[#082B63] hover:bg-white/50'
                }`}
              >
                <History className="w-3.5 h-3.5 text-[#1769E0]" />
                <span>Innings History ({todos.length})</span>
              </button>
            </div>
          </div>

          {/* Motivational Quote Banner */}
          <div className="flex items-center justify-between gap-2 p-3 bg-white/80 border border-[#8EC5FF] rounded-xl text-xs font-handwriting">
            <div className="flex items-center gap-2 text-[#082B63] font-bold">
              <RisingSunDoodle className="w-4 h-4" />
              <span>SUN WILL RAISE AGAIN — Smile every body smile :)</span>
            </div>
            <div className="text-[11px] font-bold text-[#1769E0] hidden md:block">
              "Small Steps. Big Innings." 💙
            </div>
          </div>

          {/* Handwritten Style History Search & Filter Bar */}
          <div className="w-full space-y-2.5 pt-1">
            <div className="relative flex items-center w-full">
              <div className="absolute left-3.5 pointer-events-none text-rose-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="history-search-input"
                type="text"
                value={historyQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setHistoryQuery(val);
                  if (val.trim()) {
                    setActiveViewMode('history');
                  }
                }}
                placeholder="Find history tasks (title, date, tag)..."
                className="w-full bg-[#fffdfa] hover:bg-white focus:bg-white text-rose-950 placeholder:text-rose-300 text-sm font-medium pl-10 pr-26 py-2.5 sm:py-3 rounded-2xl border-2 border-[#fecdd3] focus:border-[#f43f5e] focus:ring-4 focus:ring-rose-200/40 transition-all outline-none shadow-2xs font-cute text-base"
              />
              <div className="absolute right-2.5 flex items-center gap-1.5">
                {historyQuery && (
                  <button
                    onClick={() => setHistoryQuery('')}
                    className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setShowFilterDropdown((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-handwriting font-bold transition-all cursor-pointer border ${
                    showFilterDropdown || historyFilter !== 'all'
                      ? 'bg-[#f43f5e] border-[#e11d48] text-white shadow-xs'
                      : 'bg-[#fff1f2] hover:bg-[#ffe4e6] border-[#fda4af] text-[#9f1239]'
                  }`}
                  title="Toggle filters"
                >
                  <Filter className="w-3 h-3" />
                  <span>Filter</span>
                  {historyFilter !== 'all' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  )}
                </button>
              </div>
            </div>

            {/* Filter Dropdown - Pastel Memo Note */}
            {showFilterDropdown && (
              <div className="p-4 bg-[#fffaf5] border-2 border-[#fed7aa] rounded-2xl space-y-3 shadow-sm relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-handwriting font-bold text-[#9a3412] uppercase tracking-wider flex items-center gap-1.5">
                    <SparkleDoodle className="w-3.5 h-3.5" color="#f97316" /> Filter History
                  </span>
                  {(historyFilter !== 'all' || historyQuery) && (
                    <button
                      onClick={() => {
                        setHistoryFilter('all');
                        setHistoryQuery('');
                      }}
                      className="text-xs font-cute font-bold text-[#ea580c] hover:underline cursor-pointer"
                    >
                      Reset all ♡
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-stone-500 font-cute text-sm w-16">Status:</span>
                  <div className="flex items-center gap-1.5">
                    {(['all', 'completed', 'pending'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setHistoryFilter(s);
                          setActiveViewMode('history');
                        }}
                        className={`px-3 py-1 rounded-xl capitalize text-xs font-handwriting font-bold transition-all cursor-pointer ${
                          historyFilter === s
                            ? 'bg-[#f97316] text-white shadow-2xs'
                            : 'bg-white border border-[#fed7aa] text-stone-700 hover:bg-[#fff7ed]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search meta & reset */}
          {(historyQuery.trim() || historyFilter !== 'all') && (
            <div className="flex items-center gap-2 mt-2 text-xs font-cute text-rose-700">
              <span>
                Found {filteredHistory.length} matching task{filteredHistory.length === 1 ? '' : 's'} across history ✨
              </span>
              <button
                onClick={() => {
                  setHistoryQuery('');
                  setHistoryFilter('all');
                }}
                className="text-rose-600 hover:text-rose-800 font-bold underline flex items-center gap-0.5 cursor-pointer ml-1"
              >
                <X className="w-3 h-3" /> Clear history search
              </button>
            </div>
          )}

          {/* Week Navigator (Planner Mode) */}
          {activeViewMode === 'planner' && !historyQuery.trim() && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t-2 border-dashed border-[#fce7f3]">
              <div className="flex items-center gap-2">
                <span className="font-handwriting font-bold text-base sm:text-lg text-[#881337] px-3 py-1 bg-gradient-to-r from-[#ffe4e6] via-[#fecdd3] to-[#ffe4e6] rounded-xl border border-[#fda4af]/60 shadow-2xs">
                  Week of {mondayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <BowDoodle className="w-5 h-4 opacity-80" color="#f43f5e" />
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setWeekOffset((prev) => prev - 1)}
                  className="p-2 bg-[#fff1f2] hover:bg-[#ffe4e6] border border-[#fecdd3] rounded-2xl text-[#be123c] transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs"
                  title="Previous week (History)"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  onClick={() => setWeekOffset(0)}
                  className="px-4 py-2 bg-[#fff1f2] hover:bg-[#ffe4e6] border border-[#fecdd3] rounded-2xl text-xs font-handwriting font-bold text-[#be123c] transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs flex items-center gap-1.5"
                >
                  <span>Current Week</span>
                  <HeartDoodle className="w-3 h-3" color="#f43f5e" />
                </button>
                <button
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                  className="p-2 bg-[#fff1f2] hover:bg-[#ffe4e6] border border-[#fecdd3] rounded-2xl text-[#be123c] transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs"
                  title="Next week"
                >
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Normal Modern Header Card */
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Weekly Planner & History
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium pl-1">
                Find historical tasks, organize upcoming workload, and rebalance schedules with real-time sync.
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200/80 rounded-xl shrink-0 self-start sm:self-auto">
              <button
                onClick={() => {
                  setActiveViewMode('planner');
                  setHistoryQuery('');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeViewMode === 'planner' && !historyQuery.trim()
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Weekly Grid
              </button>
              <button
                onClick={() => setActiveViewMode('history')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewMode === 'history' || historyQuery.trim()
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Task History ({todos.length})</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="w-full space-y-2.5">
            <div className="relative flex items-center w-full">
              <div className="absolute left-3.5 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="history-search-input"
                type="text"
                value={historyQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setHistoryQuery(val);
                  if (val.trim()) {
                    setActiveViewMode('history');
                  }
                }}
                placeholder="Find history tasks (title, date, tag)..."
                className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 placeholder:text-slate-400 text-sm font-normal pl-10 pr-26 py-2.5 sm:py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              />
              <div className="absolute right-2.5 flex items-center gap-1.5">
                {historyQuery && (
                  <button
                    onClick={() => setHistoryQuery('')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setShowFilterDropdown((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    showFilterDropdown || historyFilter !== 'all'
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                  title="Toggle filters"
                >
                  <Filter className="w-3 h-3" />
                  <span>Filter</span>
                  {historyFilter !== 'all' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  )}
                </button>
              </div>
            </div>

            {/* Filter Dropdown */}
            {showFilterDropdown && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Filter History
                  </span>
                  {(historyFilter !== 'all' || historyQuery) && (
                    <button
                      onClick={() => {
                        setHistoryFilter('all');
                        setHistoryQuery('');
                      }}
                      className="text-xs font-medium text-blue-600 hover:underline cursor-pointer"
                    >
                      Reset all
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500 font-medium w-16">Status:</span>
                  <div className="flex items-center gap-1.5">
                    {(['all', 'completed', 'pending'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setHistoryFilter(s);
                          setActiveViewMode('history');
                        }}
                        className={`px-3 py-1 rounded-lg capitalize text-xs font-medium transition-all cursor-pointer ${
                          historyFilter === s
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search meta & reset */}
          {(historyQuery.trim() || historyFilter !== 'all') && (
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
              <span>
                Found {filteredHistory.length} matching task{filteredHistory.length === 1 ? '' : 's'} across history
              </span>
              <button
                onClick={() => {
                  setHistoryQuery('');
                  setHistoryFilter('all');
                }}
                className="text-blue-600 hover:text-blue-800 font-medium underline flex items-center gap-0.5 cursor-pointer ml-1"
              >
                <X className="w-3 h-3" /> Clear history search
              </button>
            </div>
          )}

          {/* Week Navigator */}
          {activeViewMode === 'planner' && !historyQuery.trim() && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base text-slate-900">
                  Week of {mondayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setWeekOffset((prev) => prev - 1)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-all cursor-pointer"
                  title="Previous week"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setWeekOffset(0)}
                  className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                >
                  Current Week
                </button>
                <button
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-all cursor-pointer"
                  title="Next week"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER MODE: TASK HISTORY SEARCH RESULTS */}
      {(activeViewMode === 'history' || historyQuery.trim()) ? (
        isSpecial ? (
          <div className="bg-[#fffdfa] rounded-[28px] p-6 sm:p-8 border-2 border-[#e9d5ff] shadow-[0_8px_30px_rgba(216,180,254,0.18)] space-y-5 relative overflow-hidden">
            <div className="absolute -top-1.5 left-12 z-10">
              <WashiTape color="lavender" angle={-2} className="w-20 h-4" />
            </div>

            <div className="flex items-center justify-between border-b-2 border-dashed border-[#f3e8ff] pb-4 pt-1">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-[#9333ea]" />
                <h2 className="text-xl sm:text-2xl font-handwriting font-bold text-[#581c87]">
                  {historyQuery.trim() ? `Search Results for "${historyQuery}"` : 'Task History Archive'}
                </h2>
                <span className="text-xs font-handwriting font-bold px-3 py-0.5 rounded-full bg-[#f3e8ff] text-[#7e22ce] border border-[#d8b4fe]">
                  {filteredHistory.length} tasks
                </span>
              </div>
              <button
                onClick={() => onOpenCreateModal()}
                className="text-xs sm:text-sm font-handwriting font-bold text-[#7e22ce] hover:text-[#581c87] bg-[#faf5ff] hover:bg-[#f3e8ff] px-3.5 py-1.5 rounded-xl border border-[#d8b4fe] flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>

            {filteredHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHistory.map((task, idx) => {
                  const dueInfo = checkTaskTimeCompleted(task, userTimezone);
                  const isAlerting = dueInfo.isDue && !task.completed;

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-[22px] border-2 transition-all flex flex-col justify-between gap-3 relative overflow-hidden ${
                        task.completed
                          ? 'bg-[#fdfaf6]/80 border-[#f5d0fe]/60 text-stone-400'
                          : isAlerting
                          ? 'bg-[#fff5f7] border-[#f43f5e] ring-2 ring-rose-200 shadow-md shadow-rose-500/15'
                          : 'bg-white border-[#f3e8ff] hover:border-[#d8b4fe] hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() => onToggleTodo(task.id)}
                            className={`mt-0.5 w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                              task.completed
                                ? 'bg-[#a855f7] border-[#a855f7] text-white shadow-2xs'
                                : isAlerting
                                ? 'border-[#f43f5e] hover:border-[#e11d48] bg-white'
                                : 'border-[#d8b4fe] hover:border-[#a855f7] bg-white'
                            }`}
                            title={task.completed ? 'Mark incomplete' : 'Mark completed'}
                          >
                            {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          <div className="min-w-0 flex-1">
                            <h4
                              className={`text-sm font-handwriting font-bold truncate inline-block px-1.5 py-0.5 rounded-md ${
                                task.completed
                                  ? 'line-through text-stone-400 bg-stone-100/50'
                                  : 'text-stone-800 ' + getHighlightClass(idx)
                              }`}
                            >
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-xs text-stone-500 font-cute line-clamp-2 mt-1">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Time completed alert notice */}
                        {isAlerting && (
                          <div className="flex items-center justify-between gap-1 bg-[#fff1f2] border border-[#fecdd3] px-2 py-1 rounded-xl text-[10px] font-cute text-[#be123c]">
                            <span className="flex items-center gap-1 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e] animate-ping" />
                              ⏰ Time Up ({dueInfo.displayText})
                            </span>
                            <button
                              type="button"
                              onClick={() => onToggleTodo(task.id)}
                              className="font-handwriting font-bold px-1.5 py-0.5 bg-[#f43f5e] hover:bg-[#e11d48] text-white rounded-md cursor-pointer"
                            >
                              Mark Done ✓
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1 font-cute text-stone-600">
                          <span className="flex items-center gap-1 bg-[#faf5ff] border border-[#e9d5ff] px-2 py-0.5 rounded-lg">
                            📅 {task.dueDate}
                          </span>
                          {task.dueTime && (
                            <span className="flex items-center gap-1 bg-[#faf5ff] border border-[#e9d5ff] px-2 py-0.5 rounded-lg">
                              <Clock className="w-3 h-3 text-[#a855f7]" />
                              {task.dueTime}
                            </span>
                          )}
                          <span className="bg-[#fdf4ff] border border-[#f5d0fe] text-[#a21caf] px-2 py-0.5 rounded-lg font-bold uppercase text-[10px]">
                            {task.priority}
                          </span>
                          <span className="bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] px-2 py-0.5 rounded-lg">
                            {task.category}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-dashed border-[#f3e8ff] flex items-center justify-between text-xs font-cute">
                        <span className="text-[11px] text-stone-400">
                          {task.completed ? 'Completed ♡' : 'Pending ✨'}
                        </span>
                        <div className="flex items-center gap-2">
                          {onFocusTask && !task.completed && (
                            <button
                              type="button"
                              onClick={() => onFocusTask(task)}
                              className="flex items-center gap-1 text-[#7e22ce] hover:text-[#581c87] font-bold text-xs px-2 py-1 rounded-lg hover:bg-[#f3e8ff] transition-colors cursor-pointer"
                            >
                              <Target className="w-3 h-3" /> Focus
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#faf5ff]/60 rounded-2xl border-2 border-dashed border-[#e9d5ff] space-y-2">
                <PencilIllustration className="w-10 h-10 mx-auto opacity-70" />
                <p className="text-base font-handwriting font-bold text-[#581c87]">No tasks found in history</p>
                <p className="text-xs font-cute text-[#7e22ce]/70 max-w-xs mx-auto">
                  No historical tasks match your current query "{historyQuery}".
                </p>
                <button
                  onClick={() => {
                    setHistoryQuery('');
                    setHistoryFilter('all');
                  }}
                  className="mt-2 px-4 py-1.5 text-xs font-handwriting font-bold text-[#7e22ce] hover:text-[#581c87] bg-white border border-[#d8b4fe] rounded-xl cursor-pointer shadow-2xs"
                >
                  Clear Search ♡
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Normal Task History Archive */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {historyQuery.trim() ? `Search Results for "${historyQuery}"` : 'Task History Archive'}
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {filteredHistory.length} tasks
                </span>
              </div>
              <button
                onClick={() => onOpenCreateModal()}
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>

            {filteredHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHistory.map((task) => {
                  const dueInfo = checkTaskTimeCompleted(task, userTimezone);
                  const isAlerting = dueInfo.isDue && !task.completed;

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                        task.completed
                          ? 'bg-slate-50 border-slate-200/60 text-slate-400'
                          : isAlerting
                          ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() => onToggleTodo(task.id)}
                            className={`mt-0.5 w-4.5 h-4.5 rounded-md border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                              task.completed
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 hover:border-blue-500 bg-white'
                            }`}
                            title={task.completed ? 'Mark incomplete' : 'Mark completed'}
                          >
                            {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>

                          <div className="min-w-0 flex-1">
                            <h4
                              className={`text-sm font-semibold truncate ${
                                task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}
                            >
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {isAlerting && (
                          <div className="flex items-center justify-between gap-1 bg-rose-100/70 border border-rose-200 px-2 py-1 rounded-lg text-[10px] text-rose-800">
                            <span className="font-semibold">⏰ Time Up ({dueInfo.displayText})</span>
                            <button
                              type="button"
                              onClick={() => onToggleTodo(task.id)}
                              className="font-semibold px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer"
                            >
                              Done
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1 text-slate-500">
                          <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                            📅 {task.dueDate}
                          </span>
                          {task.dueTime && (
                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {task.dueTime}
                            </span>
                          )}
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold uppercase text-[10px]">
                            {task.priority}
                          </span>
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
                            {task.category}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400">
                          {task.completed ? 'Completed' : 'Pending'}
                        </span>
                        <div className="flex items-center gap-2">
                          {onFocusTask && !task.completed && (
                            <button
                              type="button"
                              onClick={() => onFocusTask(task)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-xs px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <Target className="w-3 h-3" /> Focus
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <p className="text-base font-semibold text-slate-800">No tasks found in history</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  No historical tasks match your current query "{historyQuery}".
                </p>
                <button
                  onClick={() => {
                    setHistoryQuery('');
                    setHistoryFilter('all');
                  }}
                  className="mt-2 px-4 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-slate-200 rounded-xl cursor-pointer shadow-xs"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        )
      ) : (
        /* 7 Columns Grid: Stationery vs Normal */
        isSpecial ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4.5">
            {days.map((day, dayIdx) => {
              const washiColor = washiColors[dayIdx % washiColors.length];
              const washiAngle = dayIdx % 2 === 0 ? -3 : 3;

              return (
                <div
                  key={day.date}
                  className={`flex flex-col rounded-[26px] border-2 p-3.5 sm:p-4 transition-all min-h-[410px] relative overflow-hidden bg-[#FFFDF7] shadow-[0_4px_20px_rgba(8,43,99,0.08)] ${
                    day.isToday
                      ? 'border-[#1769E0] ring-3 ring-blue-300/40'
                      : 'border-[#8EC5FF]/80 hover:border-[#1769E0]'
                  }`}
                >
                  {/* Washi tape on top edge of each planner card */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10">
                    <WashiTape color="blue" angle={washiAngle} className="w-16 h-3.5" />
                  </div>

                  {/* Card Header (MON / TUE / etc. with date and + Add button) */}
                  <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#8EC5FF]/50 mb-3 pt-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-handwriting font-bold text-base text-[#082B63] tracking-wider uppercase">
                          {day.dayName}
                        </span>
                        {day.isToday && (
                          <span className="text-[10px] font-handwriting font-bold px-2 py-0.5 bg-[#1769E0] text-white rounded-full flex items-center gap-1 shadow-xs">
                            <CricketBallDoodle className="w-2.5 h-2.5" />
                            Match Day 45
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs font-handwriting font-bold ${
                          day.isToday ? 'text-[#1769E0]' : 'text-[#082B63]/70'
                        }`}
                      >
                        {day.displayDate}
                      </p>
                    </div>

                    <button
                      onClick={() => onOpenCreateModal(day.date)}
                      className="p-1.5 hover:bg-[#EAF4FF] text-[#1769E0] border border-transparent hover:border-[#8EC5FF] rounded-xl transition-all cursor-pointer hover:scale-110 active:scale-95"
                      title={`Add task for ${day.fullDayName}`}
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Tasks in this day */}
                  <div className="flex-1 space-y-2.5 overflow-y-auto">
                    {day.tasks.map((task, taskIdx) => {
                      const dueInfo = checkTaskTimeCompleted(task, userTimezone);
                      const isAlerting = dueInfo.isDue && !task.completed;

                      return (
                        <div
                          key={task.id}
                          className={`p-3 rounded-[20px] border-2 transition-all space-y-2 relative overflow-hidden ${
                            task.completed
                              ? 'bg-[#F0FFF4] border-[#86EFAC] text-stone-400'
                              : isAlerting
                              ? 'bg-[#FFF5F7] border-[#dc2626] ring-2 ring-red-200 shadow-md'
                              : 'bg-white border-[#8EC5FF] hover:border-[#1769E0] shadow-xs'
                          }`}
                        >
                          {/* Task title and checkbox */}
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => onToggleTodo(task.id)}
                              className={`mt-0.5 w-4.5 h-4.5 rounded-md border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                                task.completed
                                  ? 'bg-[#16a34a] border-[#16a34a] text-white'
                                  : isAlerting
                                  ? 'border-[#dc2626] hover:border-[#b91c1c] bg-white'
                                  : 'border-[#8EC5FF] hover:border-[#1769E0] bg-white'
                              }`}
                              title={task.completed ? 'Mark incomplete' : 'Mark completed'}
                            >
                              {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <span
                                className={`font-handwriting font-bold text-xs sm:text-sm leading-snug block truncate px-1 rounded-sm ${
                                  task.completed
                                    ? 'line-through text-stone-400'
                                    : 'text-[#082B63]'
                                }`}
                              >
                                {task.title}
                              </span>
                            </div>

                            {/* Tiny trophy or ball doodle for active/completed tasks */}
                            <div className="shrink-0">
                              {task.completed ? (
                                <TrophyDoodle className="w-3.5 h-3.5 text-[#eab308]" />
                              ) : isAlerting ? (
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#dc2626]" />
                                </span>
                              ) : (
                                <CricketBallDoodle className="w-3 h-3" />
                              )}
                            </div>
                          </div>

                          {/* Alert chip if time completed */}
                          {isAlerting && (
                            <div className="flex items-center justify-between gap-1 bg-[#fff1f2] border border-[#fecdd3] px-2 py-0.5 rounded-lg text-[10px] font-cute text-[#be123c]">
                              <span className="font-bold truncate">⏰ {dueInfo.displayText}</span>
                              <button
                                type="button"
                                onClick={() => onToggleTodo(task.id)}
                                className="font-handwriting font-bold px-1.5 py-0.2 bg-[#f43f5e] text-white rounded hover:bg-[#e11d48] cursor-pointer shrink-0"
                              >
                                Mark Done ✓
                              </button>
                            </div>
                          )}

                          {/* Time display if present */}
                          {task.dueTime && (
                            <div className="flex items-center gap-1 text-[11px] font-cute text-[#9f1239]/80 pl-1">
                              <Clock className="w-3 h-3 text-[#f43f5e]" />
                              <span>{task.dueTime}</span>
                            </div>
                          )}

                          {/* Category Tag, Focus & Move Actions */}
                          <div className="pt-1.5 border-t border-dashed border-[#ffe4e6] flex items-center justify-between text-[11px] font-cute">
                            <span className="text-[#be123c] font-bold px-2 py-0.5 rounded-full bg-[#fff1f2] border border-[#fecdd3] truncate max-w-[68px]">
                              {task.category}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {onFocusTask && (
                                <button
                                  type="button"
                                  onClick={() => onFocusTask(task)}
                                  className="flex items-center gap-0.5 text-[#e11d48] hover:text-[#9f1239] font-bold p-1 rounded-lg hover:bg-[#fff1f2] cursor-pointer transition-colors"
                                  title="Focus Mode (Pomodoro)"
                                >
                                  <Target className="w-3 h-3" />
                                  <span className="hidden sm:inline">Focus</span>
                                </button>
                              )}

                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setMovingTaskId(movingTaskId === task.id ? null : task.id)
                                  }
                                  className="flex items-center gap-0.5 text-stone-500 hover:text-[#881337] font-bold p-1 rounded-lg hover:bg-[#fff1f2] cursor-pointer transition-colors"
                                  title="Move to another day"
                                >
                                  <ArrowRightLeft className="w-2.5 h-2.5" />
                                  <span className="hidden sm:inline">Move</span>
                                </button>

                                {movingTaskId === task.id && (
                                  <div className="absolute right-0 bottom-full mb-1.5 z-30 w-40 bg-[#fffdfa] rounded-2xl shadow-xl border-2 border-[#fbcfe8] p-1.5 text-xs space-y-1">
                                    <p className="text-[10px] font-handwriting font-bold text-[#be123c] uppercase tracking-wider px-2 py-0.5 flex items-center gap-1">
                                      <span>Move to:</span>
                                      <HeartDoodle className="w-2.5 h-2.5" color="#f43f5e" />
                                    </p>
                                    {days.map((targetDay) => (
                                      <button
                                        key={targetDay.date}
                                        disabled={targetDay.date === task.dueDate}
                                        onClick={() => handleMove(task.id, targetDay.date)}
                                        className={`w-full text-left px-2.5 py-1 rounded-xl text-[11px] font-cute font-bold transition-all ${
                                          targetDay.date === task.dueDate
                                            ? 'text-stone-300 cursor-not-allowed'
                                            : 'text-[#881337] hover:bg-[#fff1f2] hover:text-[#e11d48]'
                                        }`}
                                      >
                                        {targetDay.dayName} ({targetDay.displayDate})
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {day.tasks.length === 0 && (
                      <div
                        onClick={() => onOpenCreateModal(day.date)}
                        className="min-h-[120px] border-2 border-dashed border-[#fda4af]/70 hover:border-[#f43f5e] bg-[#fff8f8]/60 hover:bg-[#fff1f2]/80 rounded-[20px] flex flex-col items-center justify-center p-3 text-[#be123c] cursor-pointer transition-all group"
                      >
                        <div className="w-8 h-8 rounded-full bg-white border border-[#fecdd3] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-2xs">
                          <PencilIllustration className="w-5 h-5 opacity-80" />
                        </div>
                        <span className="font-handwriting font-bold text-xs text-[#be123c] group-hover:text-[#9f1239]">
                          + Add task
                        </span>
                        <span className="font-cute text-[11px] text-[#fda4af] group-hover:text-[#fb7185] mt-0.5">
                          fresh page for your plan ♡
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Normal Clean 7-Column Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3.5">
            {days.map((day) => (
              <div
                key={day.date}
                className={`flex flex-col rounded-2xl border p-3.5 transition-all min-h-[410px] bg-white ${
                  day.isToday
                    ? 'border-blue-500 shadow-xs ring-2 ring-blue-100'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                        {day.dayName}
                      </span>
                      {day.isToday && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-blue-600 text-white rounded-full">
                          Today
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${day.isToday ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
                      {day.displayDate}
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenCreateModal(day.date)}
                    className="p-1 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-all cursor-pointer"
                    title={`Add task for ${day.fullDayName}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Tasks in this day */}
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {day.tasks.map((task) => {
                    const dueInfo = checkTaskTimeCompleted(task, userTimezone);
                    const isAlerting = dueInfo.isDue && !task.completed;

                    return (
                      <div
                        key={task.id}
                        className={`p-3 rounded-xl border transition-all space-y-2 ${
                          task.completed
                            ? 'bg-slate-50 border-slate-200/60 text-slate-400'
                            : isAlerting
                            ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => onToggleTodo(task.id)}
                            className={`mt-0.5 w-4 h-4 rounded-md border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                              task.completed
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 hover:border-blue-500 bg-white'
                            }`}
                          >
                            {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <span
                              className={`text-xs sm:text-sm font-medium leading-snug block truncate ${
                                task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>
                        </div>

                        {isAlerting && (
                          <div className="flex items-center justify-between gap-1 bg-rose-100/70 border border-rose-200 px-2 py-0.5 rounded-lg text-[10px] text-rose-800">
                            <span className="font-semibold truncate">⏰ {dueInfo.displayText}</span>
                            <button
                              type="button"
                              onClick={() => onToggleTodo(task.id)}
                              className="font-semibold px-1.5 py-0.2 bg-rose-600 text-white rounded hover:bg-rose-700 cursor-pointer shrink-0"
                            >
                              Done
                            </button>
                          </div>
                        )}

                        {task.dueTime && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 pl-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{task.dueTime}</span>
                          </div>
                        )}

                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 font-medium px-2 py-0.5 rounded-md bg-slate-100 truncate max-w-[68px]">
                            {task.category}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {onFocusTask && !task.completed && (
                              <button
                                type="button"
                                onClick={() => onFocusTask(task)}
                                className="text-slate-500 hover:text-blue-600 font-medium p-1 rounded hover:bg-slate-100 cursor-pointer transition-colors"
                                title="Focus Mode"
                              >
                                <Target className="w-3 h-3" />
                              </button>
                            )}

                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setMovingTaskId(movingTaskId === task.id ? null : task.id)
                                }
                                className="text-slate-500 hover:text-slate-800 font-medium p-1 rounded hover:bg-slate-100 cursor-pointer transition-colors"
                                title="Move to another day"
                              >
                                <ArrowRightLeft className="w-2.5 h-2.5" />
                              </button>

                              {movingTaskId === task.id && (
                                <div className="absolute right-0 bottom-full mb-1.5 z-30 w-40 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 text-xs space-y-1">
                                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-0.5">
                                    Move to:
                                  </p>
                                  {days.map((targetDay) => (
                                    <button
                                      key={targetDay.date}
                                      disabled={targetDay.date === task.dueDate}
                                      onClick={() => handleMove(task.id, targetDay.date)}
                                      className={`w-full text-left px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                                        targetDay.date === task.dueDate
                                          ? 'text-slate-300 cursor-not-allowed'
                                          : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                                      }`}
                                    >
                                      {targetDay.dayName} ({targetDay.displayDate})
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {day.tasks.length === 0 && (
                    <div
                      onClick={() => onOpenCreateModal(day.date)}
                      className="min-h-[110px] border border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/40 hover:bg-blue-50/30 rounded-xl flex flex-col items-center justify-center p-3 text-slate-400 hover:text-blue-600 cursor-pointer transition-all group"
                    >
                      <Plus className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium">Add task</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Motivational Planner Footer Banner */}
      {isSpecial ? (
        <div className="bg-[#fffdfa] rounded-[24px] p-4 sm:p-5 border-2 border-[#fbcfe8]/70 shadow-xs flex flex-wrap items-center justify-around gap-4 relative overflow-hidden">
          <div className="flex items-center gap-2">
            <HeartDoodle className="w-4 h-4" color="#f43f5e" />
            <span className="font-handwriting font-bold text-xs sm:text-sm text-[#9f1239]">
              small steps every day ♡
            </span>
          </div>

          <div className="hidden sm:inline-block text-[#fecdd3]">•</div>

          <div className="flex items-center gap-2">
            <SparkleDoodle className="w-4 h-4" color="#f59e0b" />
            <span className="font-handwriting font-bold text-xs sm:text-sm text-[#9f1239]">
              plan it • do it • achieve it ✨
            </span>
          </div>

          <div className="hidden md:inline-block text-[#fecdd3]">•</div>

          <div className="flex items-center gap-2">
            <FlowerDoodle className="w-4 h-4" />
            <span className="font-handwriting font-bold text-xs sm:text-sm text-[#9f1239]">
              You got this! 🌸
            </span>
          </div>

          <div className="hidden lg:inline-block text-[#fecdd3]">•</div>

          <div className="flex items-center gap-2">
            <BowDoodle className="w-4 h-3.5" color="#f472b6" />
            <span className="font-handwriting font-bold text-xs sm:text-sm text-[#9f1239]">
              Good habits, brighter days 🌷
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium px-6">
          <span>Weekly schedule synchronized with Cloud SQL</span>
          <div className="flex items-center gap-4">
            <span>Tasks: {todos.length}</span>
            <span>•</span>
            <span>Completed: {todos.filter(t => t.completed).length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

