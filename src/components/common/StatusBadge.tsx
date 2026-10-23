import React from 'react';
import { cn } from '@/lib/utils';
import { ShieldCheck, WifiOff, Clock, Lock, KeyRound, Ban } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className,
  showIcon = true,
}) => {
  const norm = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let icon = <ShieldCheck className="w-3.5 h-3.5 mr-1 text-slate-600" />;
  let dotColor = 'bg-slate-400';

  if (norm === 'protected' || norm === 'connected' || norm === 'allowed' || norm === 'active') {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
    icon = <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />;
    dotColor = 'bg-emerald-500';
  } else if (norm === 'pending verification' || norm === 'pending' || norm === 'degraded' || norm === 'warning') {
    styles = 'bg-amber-50 text-amber-800 border-amber-200/80';
    icon = <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />;
    dotColor = 'bg-amber-500 animate-pulse';
  } else if (norm === 'tunnel disconnected' || norm === 'disconnected' || norm === 'denied' || norm === 'error') {
    styles = 'bg-rose-50 text-rose-800 border-rose-200/80';
    icon = <WifiOff className="w-3.5 h-3.5 mr-1 text-rose-600" />;
    dotColor = 'bg-rose-500';
  } else if (norm === 'mfa required') {
    styles = 'bg-indigo-50 text-indigo-800 border-indigo-200/80';
    icon = <KeyRound className="w-3.5 h-3.5 mr-1 text-indigo-600" />;
    dotColor = 'bg-indigo-500';
  } else if (norm === 'demo mode' || norm === 'demo') {
    styles = 'bg-sky-50 text-sky-800 border-sky-200/80';
    icon = <Lock className="w-3.5 h-3.5 mr-1 text-sky-600" />;
    dotColor = 'bg-sky-500';
  } else if (norm === 'disabled' || norm === 'suspended') {
    styles = 'bg-slate-100 text-slate-600 border-slate-200';
    icon = <Ban className="w-3.5 h-3.5 mr-1 text-slate-500" />;
    dotColor = 'bg-slate-400';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-full transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        styles,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5 shrink-0', dotColor)} />
      {showIcon && icon}
      <span>{status}</span>
    </span>
  );
};
