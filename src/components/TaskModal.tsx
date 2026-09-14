import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Bell, AlertCircle, Tag, Flag, Sparkles, CheckCircle2, RefreshCw, Check } from 'lucide-react';
import { Todo } from '../types.ts';
import { isSpecialUser } from '../lib/userTheme.ts';
import { WashiTape, HeartDoodle, SparkleDoodle } from './PlannerDoodles.tsx';
import { CricketBallDoodle, CricketBatDoodle, Number45Sticker } from './CricketDoodles.tsx';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    description: string;
    dueDate: string;
    dueTime: string | null;
    reminderMinutesBefore: number | null;
    priority: 'low' | 'medium' | 'high';
    category: string;
  }) => Promise<void>;
  initialData?: Todo | null;
  defaultDate?: string;
  userEmail?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultDate,
  userEmail,
}) => {
  const isSpecial = isSpecialUser(userEmail);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number | null>(30);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('Work');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setDueDate(initialData.dueDate);
      setDueTime(initialData.dueTime || '');
      setReminderMinutesBefore(initialData.reminderMinutesBefore ?? 30);
      setPriority(initialData.priority || 'medium');
      setCategory(initialData.category || 'General');
    } else {
      const todayStr = defaultDate || new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setDueDate(todayStr);
      setDueTime('18:00');
      setReminderMinutesBefore(30);
      setPriority('medium');
      setCategory('Work');
    }
    setError(null);
  }, [initialData, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title.');
      return;
    }
    if (!dueDate) {
      setError('Please select a due date.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        title: title.trim(),
        description: description.trim(),
        dueDate,
        dueTime: dueTime || null,
        reminderMinutesBefore,
        priority,
        category,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* SPECIAL ROHIT SHARMA FAN SCRAPBOOK THEME */
  if (isSpecial) {
    return (
      <div
        id="task-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
      >
        <div
          id="task-modal-container"
          className="relative w-full max-w-lg bg-[#FFFDF7] rounded-[28px] p-6 sm:p-7 text-[#082B63] shadow-2xl border-2 border-[#8EC5FF] z-10 my-8 overflow-hidden space-y-4"
        >
          {/* Decorative Washi Tape */}
          <div className="absolute -top-1.5 left-10 z-10">
            <WashiTape color="blue" angle={-1} className="w-24 h-4.5" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-dashed border-[#8EC5FF]/60 pb-3.5 mb-2 pt-1">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-handwriting font-bold text-[#082B63] flex items-center gap-2">
                  <CricketBatDoodle className="w-5 h-5 text-[#1769E0]" />
                  <span>{initialData ? 'Edit Hitman Task' : 'New Hitman Task'}</span>
                  <Number45Sticker size="sm" />
                </h2>
              </div>
              <p className="text-xs font-handwriting font-semibold text-[#1769E0] mt-0.5">
                Plan like the Hitman — stay focused, execute, and win 💙
              </p>
            </div>
            <button
              id="close-task-modal-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#1769E0] hover:text-[#082B63] hover:bg-[#EAF4FF] rounded-xl transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-xs font-handwriting font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Task Title */}
            <div className="space-y-1">
              <label className="block text-xs font-handwriting font-bold uppercase tracking-wider text-[#082B63]">
                Task Title *
              </label>
              <input
                id="task-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master innings plan: complete morning focus session"
                className="w-full px-4 py-2.5 bg-white border-2 border-[#8EC5FF] rounded-2xl text-[#082B63] placeholder:text-[#1769E0]/40 focus:outline-none focus:border-[#1769E0] text-sm font-handwriting font-bold transition-all"
                autoFocus
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-handwriting font-bold uppercase tracking-wider text-[#082B63]">
                Notes / Match Plan (Optional)
              </label>
              <textarea
                id="task-desc-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add sub-points, strategy, or reminder details..."
                rows={2}
                className="w-full px-4 py-2 bg-white border-2 border-[#8EC5FF] rounded-2xl text-[#082B63] placeholder:text-[#1769E0]/40 focus:outline-none focus:border-[#1769E0] text-sm font-handwriting font-semibold resize-none transition-all"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-handwriting font-bold uppercase tracking-wider text-[#082B63] mb-1">
                  <Calendar className="w-3.5 h-3.5 text-[#1769E0]" /> Match Date *
                </label>
                <input
                  id="task-duedate-input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#8EC5FF] rounded-2xl text-[#082B63] text-sm font-handwriting font-bold focus:outline-none focus:border-[#1769E0]"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-handwriting font-bold uppercase tracking-wider text-[#082B63] mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#1769E0]" /> Match Time
                </label>
                <input
                  id="task-duetime-input"
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#8EC5FF] rounded-2xl text-[#082B63] text-sm font-handwriting font-bold focus:outline-none focus:border-[#1769E0]"
                />
              </div>
            </div>

            {/* Reminder & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-handwriting font-bold uppercase tracking-wider text-[#082B63] mb-1">
                  <Bell className="w-3.5 h-3.5 text-[#1769E0]" /> Hitman Email Reminder
                </label>
                <select
                  id="task-reminder-select"
                  value={reminderMinutesBefore === null ? 'none' : reminderMinutesBefore}
                  onChange={(e) =>
                    setReminderMinutesBefore(e.target.value === 'none' ? null : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 bg-white border-2 border-[#8EC5FF] rounded-2xl text-[#082B63] text-sm font-handwriting font-bold focus:outline-none focus:border-[#1769E0] cursor-pointer"
                >
                  <option value="none">No reminder</option>
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="120">2 hours before</option>
                  <option value="1440">1 day before</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-handwriting font-bold uppercase tracking-wider text-[#082B63] mb-1">
                  <Flag className="w-3.5 h-3.5 text-[#1769E0]" /> Match Priority
                </label>
                <select
                  id="task-priority-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-3 py-2 bg-white border-2 border-[#8EC5FF] rounded-2xl text-[#082B63] text-sm font-handwriting font-bold focus:outline-none focus:border-[#1769E0] cursor-pointer"
                >
                  <option value="low">Standard Innings 🏏</option>
                  <option value="medium">Important Match ⭐</option>
                  <option value="high">Finals / Crucial 🔥</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-handwriting font-bold uppercase tracking-wider text-[#082B63] mb-2">
                <Tag className="w-3.5 h-3.5 text-[#1769E0]" /> Category
              </label>
              <div className="flex gap-2 flex-wrap">
                {['Work', 'Personal', 'Study', 'Health', 'Finance', 'General'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-handwriting font-bold rounded-2xl border-2 transition-all cursor-pointer ${
                      category === cat
                        ? 'bg-[#1769E0] border-[#082B63] text-white shadow-xs scale-105'
                        : 'bg-white border-[#8EC5FF] text-[#082B63] hover:bg-[#EAF4FF]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t-2 border-dashed border-[#8EC5FF]/60 mt-4">
              <button
                id="cancel-task-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-handwriting font-bold text-[#082B63] hover:bg-[#EAF4FF] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="submit-task-btn"
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-handwriting font-bold text-white bg-linear-to-r from-[#1769E0] to-[#082B63] hover:from-[#082B63] hover:to-[#051c42] disabled:opacity-50 rounded-2xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    {initialData ? 'Save Changes 🏏' : 'Add Hitman Task 🏏'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* NORMAL CLEAN MODERN THEME */
  return (
    <div
      id="task-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        id="task-modal-container"
        className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-7 text-slate-900 shadow-2xl border border-white/80 z-10 my-8"
      >
        {/* Clean Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {initialData ? 'Edit Task' : 'Create New Task'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Add actionable deadlines and optional email reminders
            </p>
          </div>
          <button
            id="close-task-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* TASK TITLE */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Task Title *
            </label>
            <input
              id="task-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete project proposal"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-sm font-medium transition-all"
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              id="task-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add relevant notes or details..."
              rows={2}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-sm resize-none transition-all"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Due Date *
              </label>
              <input
                id="task-duedate-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Due Time
              </label>
              <input
                id="task-duetime-input"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Reminder & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                <Bell className="w-3.5 h-3.5 text-blue-600" /> Email Reminder
              </label>
              <select
                id="task-reminder-select"
                value={reminderMinutesBefore === null ? 'none' : reminderMinutesBefore}
                onChange={(e) =>
                  setReminderMinutesBefore(e.target.value === 'none' ? null : Number(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="none">No reminder</option>
                <option value="15">15 minutes before</option>
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
                <option value="120">2 hours before</option>
                <option value="1440">1 day before</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                <Flag className="w-3.5 h-3.5 text-blue-600" /> Priority
              </label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              <Tag className="w-3.5 h-3.5 text-blue-600" /> Category
            </label>
            <div className="flex gap-2 flex-wrap">
              {['Work', 'Personal', 'Study', 'Health', 'Finance', 'General'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-5">
            <button
              id="cancel-task-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-task-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  {initialData ? 'Save Changes' : 'Create Task'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
