import React from 'react';
import { Music2 } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Music2,
  title = 'No items found',
  description = 'Your music library is waiting. Import some tracks to get started.',
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-800/80 bg-slate-900/20 max-w-lg mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4 text-purple-400 border border-slate-700/50 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-all shadow-lg shadow-purple-500/20 active:scale-95 cursor-pointer"
          >
            {actionText}
          </button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-4 py-2.5 rounded-xl font-medium text-sm text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 transition-all cursor-pointer"
          >
            {secondaryActionText}
          </button>
        )}
      </div>
    </div>
  );
}

