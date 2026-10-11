import React from 'react';
import { MonitorType } from '../../types';
import { Bot, Globe, Server } from 'lucide-react';

interface TypeBadgeProps {
  type: MonitorType;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
  switch (type) {
    case 'discord_bot':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-[#9929EA]/15 text-[#D8B4FE] border border-[#9929EA]/30">
          <Bot className="w-3 h-3 text-[#9929EA]" />
          <span>Discord Bot</span>
        </span>
      );
    case 'website':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-[#121212] text-[#A1A1AA] border border-[#242424]">
          <Globe className="w-3 h-3 text-[#A1A1AA]" />
          <span>Website</span>
        </span>
      );
    case 'api':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-[#121212] text-[#A1A1AA] border border-[#242424]">
          <Server className="w-3 h-3 text-[#A1A1AA]" />
          <span>API / Server</span>
        </span>
      );
  }
};
