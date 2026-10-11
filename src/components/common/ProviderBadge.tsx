import React from 'react';
import { ProviderType } from '../../types';
import { Server, Cloud, Triangle, Cpu, HardDrive } from 'lucide-react';

interface ProviderBadgeProps {
  provider?: ProviderType;
}

export const ProviderBadge: React.FC<ProviderBadgeProps> = ({ provider }) => {
  if (!provider || provider === 'None') return null;

  const getIcon = () => {
    switch (provider) {
      case 'Railway':
        return <Cpu className="w-3 h-3 text-[#D8B4FE]" />;
      case 'Vercel':
        return <Triangle className="w-2.5 h-2.5 fill-white text-white rotate-0" />;
      case 'VPS':
        return <HardDrive className="w-3 h-3 text-[#A1A1AA]" />;
      case 'Render':
        return <Cloud className="w-3 h-3 text-[#60A5FA]" />;
      case 'Cloudflare':
        return <Cloud className="w-3 h-3 text-[#FB923C]" />;
      default:
        return <Server className="w-3 h-3 text-[#A1A1AA]" />;
    }
  };

  const getColors = () => {
    switch (provider) {
      case 'Railway':
        return 'bg-[#9929EA]/10 border-[#9929EA]/30 text-[#D8B4FE]';
      case 'Vercel':
        return 'bg-[#161616] border-[#333333] text-white';
      case 'VPS':
        return 'bg-[#121212] border-[#242424] text-[#A1A1AA]';
      case 'Render':
        return 'bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#93C5FD]';
      case 'Cloudflare':
        return 'bg-[#F97316]/10 border-[#F97316]/30 text-[#FDBA74]';
      default:
        return 'bg-[#121212] border-[#242424] text-[#A1A1AA]';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border ${getColors()}`}>
      {getIcon()}
      <span>{provider}</span>
    </span>
  );
};
