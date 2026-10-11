import React, { useState, useEffect } from 'react';
import { Monitor, MonitorType, ProviderType } from '../../types';
import { MonitoringEngine } from '../../services/monitoringEngine';
import { addDaysIST, getExpiryCountdownIST } from '../../utils/metrics';
import { X, Check, Loader2, Sparkles, Globe, Bot, Server, Clock, AlertTriangle } from 'lucide-react';

interface MonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (monitor: Monitor) => void;
  initialMonitor?: Monitor | null;
}

export const MonitorModal: React.FC<MonitorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMonitor,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<MonitorType>('website');
  const [provider, setProvider] = useState<ProviderType>('VPS');
  const [hostingDays, setHostingDays] = useState<number>(7);
  const [expiryDate, setExpiryDate] = useState<string>(addDaysIST(7));
  const [url, setUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'online' | 'offline'; latencyMs?: number; error?: string } | null>(null);

  useEffect(() => {
    if (initialMonitor) {
      setName(initialMonitor.name);
      setType(initialMonitor.type);
      setProvider(initialMonitor.provider || 'VPS');
      setExpiryDate(initialMonitor.expiryDate ? initialMonitor.expiryDate.split('T')[0] : addDaysIST(7));
      setHostingDays(initialMonitor.hostingDays || 7);
      setUrl(initialMonitor.url);
    } else {
      setName('');
      setType('website');
      setProvider('VPS');
      setHostingDays(7);
      setExpiryDate(addDaysIST(7));
      setUrl('https://');
    }
    setTestResult(null);
  }, [initialMonitor, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSetPresetDays = (days: number) => {
    setHostingDays(days);
    setExpiryDate(addDaysIST(days));
  };

  const handleTest = async () => {
    if (!url.trim() || !url.startsWith('http')) return;
    setTesting(true);
    setTestResult(null);

    const temp: Monitor = {
      id: 'temp',
      name: name || 'Test',
      type,
      url: url.trim(),
      status: 'checking',
    };

    const res = await MonitoringEngine.checkMonitor(temp);
    setTesting(false);
    setTestResult({
      status: res.status === 'online' ? 'online' : 'offline',
      latencyMs: res.latencyMs,
      error: res.errorMessage,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    const monitor: Monitor = {
      id: initialMonitor ? initialMonitor.id : `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      type,
      provider,
      expiryDate: expiryDate || addDaysIST(hostingDays || 7),
      hostingDays,
      url: url.trim(),
      status: initialMonitor ? initialMonitor.status : 'checking',
      latencyMs: initialMonitor?.latencyMs,
      lastChecked: initialMonitor?.lastChecked,
      createdAt: initialMonitor?.createdAt || new Date().toISOString(),
    };

    onSave(monitor);
    onClose();
  };

  const providersList: ProviderType[] = ['VPS', 'Railway', 'Vercel', 'Render', 'Cloudflare', 'Other'];
  const countdown = getExpiryCountdownIST(expiryDate);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0D0D0D] border border-[#242424] rounded-xl shadow-2xl p-5 select-none max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
          <h3 className="text-sm font-bold text-white">
            {initialMonitor ? 'Edit Project' : 'Add Project'}
          </h3>
          <button onClick={onClose} className="p-1 rounded text-[#66666F] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Project Name */}
          <div>
            <label className="block text-[#A1A1AA] font-mono uppercase text-[11px] mb-1">
              Project Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. My Telegram Bot, Railway Backend, or Portfolio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#080808] border border-[#242424] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#9929EA]"
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-[#A1A1AA] font-mono uppercase text-[11px] mb-1">
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('website')}
                className={`py-2 px-2 rounded-lg border flex flex-col items-center gap-1.5 transition-colors ${
                  type === 'website' ? 'bg-[#9929EA]/15 border-[#9929EA] text-white' : 'bg-[#080808] border-[#242424] text-[#A1A1AA]'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span className="text-[11px]">Website</span>
              </button>

              <button
                type="button"
                onClick={() => setType('discord_bot')}
                className={`py-2 px-2 rounded-lg border flex flex-col items-center gap-1.5 transition-colors ${
                  type === 'discord_bot' ? 'bg-[#9929EA]/15 border-[#9929EA] text-white' : 'bg-[#080808] border-[#242424] text-[#A1A1AA]'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span className="text-[11px]">Discord Bot</span>
              </button>

              <button
                type="button"
                onClick={() => setType('api')}
                className={`py-2 px-2 rounded-lg border flex flex-col items-center gap-1.5 transition-colors ${
                  type === 'api' ? 'bg-[#9929EA]/15 border-[#9929EA] text-white' : 'bg-[#080808] border-[#242424] text-[#A1A1AA]'
                }`}
              >
                <Server className="w-4 h-4" />
                <span className="text-[11px]">API / Server</span>
              </button>
            </div>
          </div>

          {/* Hosting Provider Option */}
          <div>
            <label className="block text-[#A1A1AA] font-mono uppercase text-[11px] mb-1.5">
              Hosting Platform / Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              {providersList.map((p) => {
                const isSelected = provider === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProvider(p)}
                    className={`py-2 px-3 rounded-lg border text-center font-mono text-xs transition-all ${
                      isSelected
                        ? 'bg-[#9929EA]/20 border-[#9929EA] text-white font-semibold shadow-[0_0_12px_rgba(153,41,234,0.25)]'
                        : 'bg-[#080808] border-[#242424] text-[#A1A1AA] hover:text-white hover:border-[#3A3A3A] hover:bg-[#121212]'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hosting Duration / Re-host Countdown (IST) */}
          <div className="p-3.5 rounded-xl bg-[#080808] border border-[#242424] space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-[#A1A1AA] font-mono uppercase text-[11px] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#9929EA]" />
                <span>Hosting Period / Expiry (IST)</span>
              </label>

              {/* Status Badge Preview */}
              {countdown.isExpired ? (
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Expired — Re-host Now</span>
                </span>
              ) : countdown.isUrgent ? (
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B] font-bold">
                  {countdown.daysLeft === 0 ? 'Expires Today' : `${countdown.daysLeft}d left (Re-host soon)`}
                </span>
              ) : (
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#08CB00]/10 border border-[#08CB00]/30 text-[#08CB00] font-semibold">
                  {countdown.daysLeft} days can run
                </span>
              )}
            </div>

            {/* Quick Duration Buttons */}
            <div>
              <div className="text-[10px] text-[#66666F] font-mono uppercase mb-1">
                How many days can it run on this host?
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: '3 Days', days: 3 },
                  { label: '7 Days', days: 7 },
                  { label: '14 Days', days: 14 },
                  { label: '30 Days', days: 30 },
                ].map((item) => {
                  const isActive = hostingDays === item.days;
                  return (
                    <button
                      key={item.days}
                      type="button"
                      onClick={() => handleSetPresetDays(item.days)}
                      className={`py-1.5 rounded-lg border text-center font-mono text-xs transition-colors ${
                        isActive
                          ? 'bg-[#9929EA]/20 border-[#9929EA] text-white font-semibold'
                          : 'bg-[#0D0D0D] border-[#242424] text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Days Input & Expiry Date Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[#242424]/60">
              <div>
                <label className="block text-[#66666F] text-[10px] font-mono uppercase mb-1">
                  Or Enter Custom Days:
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={hostingDays}
                  onChange={(e) => {
                    const d = Math.max(1, Number(e.target.value) || 1);
                    setHostingDays(d);
                    setExpiryDate(addDaysIST(d));
                  }}
                  className="w-full bg-[#0D0D0D] border border-[#242424] rounded-lg px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-[#9929EA]"
                />
              </div>

              <div>
                <label className="block text-[#66666F] text-[10px] font-mono uppercase mb-1">
                  Auto-shutoff Date (IST):
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => {
                    setExpiryDate(e.target.value);
                  }}
                  className="w-full bg-[#0D0D0D] border border-[#242424] rounded-lg px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-[#9929EA]"
                />
              </div>
            </div>

            <div className="text-[10px] text-[#66666F] font-mono leading-tight">
              After this period ends, it alerts you so you know to re-host the backend on a new VPS or platform.
            </div>
          </div>

          {/* URL / Endpoint */}
          <div>
            <label className="block text-[#A1A1AA] font-mono uppercase text-[11px] mb-1">
              URL to Check
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-[#080808] border border-[#242424] rounded-lg px-3 py-2 font-mono text-white text-xs focus:outline-none focus:border-[#9929EA]"
              />
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="px-3 py-2 rounded-lg bg-[#121212] hover:bg-[#1A1A1A] border border-[#242424] text-white font-medium flex items-center gap-1 transition-colors"
                title="Test if URL is online right now"
              >
                {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9929EA]" /> : <Sparkles className="w-3.5 h-3.5 text-[#9929EA]" />}
                <span>Test</span>
              </button>
            </div>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
              testResult.status === 'online' ? 'bg-[#08CB00]/10 border-[#08CB00]/30 text-[#08CB00]' : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
            }`}>
              <span className="font-semibold font-mono uppercase">
                {testResult.status === 'online' ? 'Status: Online' : 'Status: Offline'}
              </span>
              <span className="font-mono text-[11px]">
                {testResult.status === 'online' ? `${testResult.latencyMs}ms ping` : (testResult.error || 'Connection failed')}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-[#242424] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#121212] hover:bg-[#1A1A1A] border border-[#242424] text-[#A1A1AA] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#9929EA] hover:bg-[#821ecc] text-white font-medium shadow-glow-purple transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialMonitor ? 'Save Changes' : 'Add Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
