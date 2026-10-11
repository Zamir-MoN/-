import React from 'react';
import { Monitor } from '../../types';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  monitor: Monitor | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  monitor,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !monitor) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#0D0D0D] border border-[#242424] rounded-xl shadow-2xl p-5 select-none"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Delete Monitor</h3>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Remove <strong className="text-white">"{monitor.name}"</strong> from your status dashboard?
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-[#242424] flex items-center justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#121212] hover:bg-[#1A1A1A] border border-[#242424] text-[#A1A1AA] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3.5 py-1.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white font-medium transition-colors flex items-center gap-1.5 shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
