import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ElementType;
}

interface CustomDropdownProps<T extends string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

export function CustomDropdown<T extends string>({
  value,
  options,
  onChange,
  className = '',
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const SelectedIcon = selectedOption?.icon;

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center justify-between gap-2 bg-[#0D0D0D] border rounded-lg px-3 py-1.5 text-xs text-white transition-all cursor-pointer min-w-[130px] focus:outline-none ${
          isOpen
            ? 'border-[#9929EA] shadow-[0_0_15px_-3px_rgba(153,41,234,0.35)]'
            : 'border-[#242424] hover:border-[#3A3A3A] hover:bg-[#121212]'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {SelectedIcon && <SelectedIcon className="w-3.5 h-3.5 text-[#9929EA] flex-shrink-0" />}
          <span className="font-medium truncate">{selectedOption?.label}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#A1A1AA] transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-[#9929EA]' : ''
          }`}
        />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-1.5 w-44 bg-[#0D0D0D] border border-[#242424] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_20px_-5px_rgba(153,41,234,0.25)] p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
          <ul role="listbox" className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              const OptionIcon = opt.icon;

              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#9929EA]/15 text-[#D8B4FE] font-medium'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#161616]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {OptionIcon && (
                      <OptionIcon
                        className={`w-3.5 h-3.5 flex-shrink-0 ${
                          isSelected ? 'text-[#9929EA]' : 'text-[#66666F]'
                        }`}
                      />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-[#9929EA] flex-shrink-0 ml-2" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
