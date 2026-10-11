import React from 'react';
import { MonitorStatus } from '../../types';
import { Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  status: MonitorStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1.5' : 'text-xs px-2.5 py-1 gap-2';

  if (status === 'checking') {
    return (
      <span className={`inline-flex items-center font-mono font-medium rounded-full bg-[#9929EA]/15 text-[#C084FC] border border-[#9929EA]/40 ${sizeClasses}`}>
        <Loader2 className="w-3 h-3 animate-spin text-[#9929EA]" />
        <span>CHECKING</span>
      </span>
    );
  }

  if (status === 'online') {
    return (
      <span className={`inline-flex items-center font-mono font-semibold rounded-full bg-[#08CB00]/10 text-[#08CB00] border border-[#08CB00]/30 ${sizeClasses}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-[#08CB00] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#08CB00]"></span>
        </span>
        <span>ONLINE</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-mono font-semibold rounded-full bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 ${sizeClasses}`}>
      <span className="relative flex h-2 w-2">
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]"></span>
      </span>
      <span>OFFLINE</span>
    </span>
  );
};
