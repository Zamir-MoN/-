import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Monitor, StatusFilter, TypeFilter } from './types';
import { StorageService } from './services/storage';
import { MonitoringEngine } from './services/monitoringEngine';
import { StatusBadge } from './components/common/StatusBadge';
import { TypeBadge } from './components/common/TypeBadge';
import { ProviderBadge } from './components/common/ProviderBadge';
import { MonitorModal } from './components/modals/MonitorModal';
import { DeleteModal } from './components/modals/DeleteModal';
import { UptimeOverviewCard } from './components/dashboard/UptimeOverviewCard';
import { formatRelativeTime, getExpiryCountdownIST } from './utils/metrics';
import { CustomDropdown, DropdownOption } from './components/common/CustomDropdown';
import { 
  Plus, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Zap, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Bot,
  Globe,
  Server,
  Calendar,
  Clock,
  AlertTriangle
} from 'lucide-react';
import gsap from 'gsap';

export const App: React.FC = () => {
  const [monitors, setMonitors] = useState<Monitor[]>(() => StorageService.getMonitors());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [isCheckingAll, setIsCheckingAll] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>(new Date().toISOString());

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monitorToEdit, setMonitorToEdit] = useState<Monitor | null>(null);
  const [monitorToDelete, setMonitorToDelete] = useState<Monitor | null>(null);

  // GSAP Animation Ref
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
      if (cardsRef.current && cardsRef.current.children.length > 0) {
        gsap.fromTo(
          Array.from(cardsRef.current.children),
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // Live 5s countdown & silent background sync
  const [countdown, setCountdown] = useState<number>(5);
  const [isSilentSyncing, setIsSilentSyncing] = useState<boolean>(false);
  const monitorsRef = useRef(monitors);

  useEffect(() => {
    monitorsRef.current = monitors;
  }, [monitors]);

  // Live 5s countdown timer & silent auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.hidden) return;

      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger probe if monitors exist
          if (monitorsRef.current.length > 0) {
            setIsSilentSyncing(true);
            MonitoringEngine.silentCheckAll(monitorsRef.current, (updated) => {
              setMonitors((current) => {
                const next = current.map((m) => (m.id === updated.id ? updated : m));
                StorageService.saveMonitors(next);
                return next;
              });
            }).finally(() => {
              setIsSilentSyncing(false);
              setLastCheckTime(new Date().toISOString());
            });
          }
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    const handleVisibilityChange = () => {
      if (!document.hidden && monitorsRef.current.length > 0) {
        setCountdown(5);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Manual Check all monitors (with button spinner)
  const handleCheckAll = async () => {
    setIsCheckingAll(true);
    setCountdown(5);
    await MonitoringEngine.checkAll(monitors, (updated) => {
      setMonitors((prev) => {
        const next = prev.map((m) => (m.id === updated.id ? updated : m));
        StorageService.saveMonitors(next);
        return next;
      });
    });
    setLastCheckTime(new Date().toISOString());
    setIsCheckingAll(false);
  };

  // Check single monitor
  const handleCheckSingle = async (monitor: Monitor) => {
    setMonitors((prev) => prev.map((m) => (m.id === monitor.id ? { ...m, status: 'checking' } : m)));
    const updated = await MonitoringEngine.checkMonitor(monitor);
    setMonitors((prev) => {
      const next = prev.map((m) => (m.id === updated.id ? updated : m));
      StorageService.saveMonitors(next);
      return next;
    });
  };

  // Save monitor (add/edit)
  const handleSaveMonitor = async (monitor: Monitor) => {
    let nextList: Monitor[];
    const exists = monitors.some((m) => m.id === monitor.id);
    if (exists) {
      nextList = monitors.map((m) => (m.id === monitor.id ? monitor : m));
    } else {
      nextList = [monitor, ...monitors];
    }
    setMonitors(nextList);
    StorageService.saveMonitors(nextList);

    // Run immediate check on the saved monitor
    handleCheckSingle(monitor);
  };

  // Delete monitor
  const handleConfirmDelete = () => {
    if (!monitorToDelete) return;
    const nextList = monitors.filter((m) => m.id !== monitorToDelete.id);
    setMonitors(nextList);
    StorageService.saveMonitors(nextList);
    setMonitorToDelete(null);
  };

  // Metric stats
  const totalCount = monitors.length;
  const onlineCount = monitors.filter((m) => m.status === 'online').length;
  const offlineCount = monitors.filter((m) => m.status === 'offline').length;
  const onlineWithLatency = monitors.filter((m) => m.status === 'online' && typeof m.latencyMs === 'number' && m.latencyMs > 0);
  const avgPing = onlineWithLatency.length > 0 
    ? Math.round(onlineWithLatency.reduce((acc, m) => acc + (m.latencyMs || 0), 0) / onlineWithLatency.length) 
    : 0;

  // Filtered monitors list
  const filteredMonitors = useMemo(() => {
    return monitors.filter((m) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) && 
          !m.url.toLowerCase().includes(q) &&
          !m.provider?.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (statusFilter !== 'all' && m.status !== statusFilter) {
        return false;
      }
      if (typeFilter !== 'all' && m.type !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [monitors, search, statusFilter, typeFilter]);

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col antialiased selection:bg-[#9929EA] selection:text-white">
      {/* Top Header */}
      <header className="border-b border-[#242424] bg-[#000000] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden border border-[#242424] bg-[#080808] flex items-center justify-center shadow-glow-purple flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="Pengo Stats Logo" 
                className="w-full h-full object-contain p-0.5" 
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight text-sm sm:text-base truncate">
                  Pengo<span className="text-[#9929EA]">Stats</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono">
                <span className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-[#08CB00]/10 border border-[#08CB00]/25 text-[#08CB00] flex-shrink-0">
                  <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                    <span className={`absolute inline-flex h-full w-full rounded-full bg-[#08CB00] opacity-75 ${isSilentSyncing ? 'animate-ping' : 'animate-ping-slow'}`}></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[#08CB00]"></span>
                  </span>
                  <span className="font-semibold tracking-wide">
                    {isSilentSyncing ? (
                      <span className="text-[#08CB00]">SYNCING...</span>
                    ) : (
                      <>LIVE <span className="text-white font-bold">{countdown}s</span></>
                    )}
                  </span>
                </span>
                <span className="text-[#333333] hidden sm:inline">•</span>
                <span className="text-[#66666F] hidden sm:inline">
                  Checked: <span className="text-[#A1A1AA]">{formatRelativeTime(lastCheckTime)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            <button
              onClick={handleCheckAll}
              disabled={isCheckingAll}
              className={`h-8 sm:h-auto flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border border-[#242424] bg-[#0D0D0D] hover:bg-[#121212] text-[#A1A1AA] hover:text-white transition-all flex-shrink-0 ${
                isCheckingAll ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              title="Check all websites and bots now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingAll ? 'animate-spin text-[#9929EA]' : ''}`} />
              <span className="hidden sm:inline">Check All</span>
            </button>

            <button
              onClick={() => {
                setMonitorToEdit(null);
                setIsModalOpen(true);
              }}
              className="h-8 sm:h-auto flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#9929EA] hover:bg-[#821ecc] text-white transition-all shadow-[0_0_15px_-3px_rgba(153,41,234,0.4)] active:scale-95 whitespace-nowrap flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Add Project</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main ref={containerRef} className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Animated SVG Uptime & Performance Overview */}
        <div ref={cardsRef}>
          <UptimeOverviewCard
            monitors={monitors}
            totalCount={totalCount}
            onlineCount={onlineCount}
            offlineCount={offlineCount}
            avgPing={avgPing}
          />
        </div>

        {/* Toolbar: Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#080808] p-2.5 sm:p-3 rounded-xl border border-[#242424]">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#66666F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search website or bot..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-[#242424] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#66666F] focus:outline-none focus:border-[#9929EA]"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
            {/* Status Pills */}
            <div className="flex items-center bg-[#0D0D0D] p-1 rounded-lg border border-[#242424] flex-shrink-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  statusFilter === 'all' ? 'bg-[#1A1A1A] text-white font-medium' : 'text-[#66666F] hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('online')}
                className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                  statusFilter === 'online' ? 'bg-[#08CB00]/20 text-[#08CB00] font-medium' : 'text-[#66666F] hover:text-[#08CB00]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#08CB00]" />
                <span>Online</span>
              </button>
              <button
                onClick={() => setStatusFilter('offline')}
                className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                  statusFilter === 'offline' ? 'bg-[#EF4444]/20 text-[#EF4444] font-medium' : 'text-[#66666F] hover:text-[#EF4444]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                <span>Offline</span>
              </button>
            </div>

            {/* Type Custom Dropdown */}
            <div className="flex-shrink-0 min-w-[110px]">
              <CustomDropdown
                value={typeFilter}
                options={[
                  { value: 'all', label: 'All Types', icon: Layers },
                  { value: 'website', label: 'Websites', icon: Globe },
                  { value: 'discord_bot', label: 'Discord Bots', icon: Bot },
                  { value: 'api', label: 'APIs', icon: Server },
                ]}
                onChange={setTypeFilter}
              />
            </div>
          </div>
        </div>

        {/* Monitors List / Cards */}
        {monitors.length === 0 ? (
          <div className="p-12 text-center bg-[#0D0D0D] border border-[#242424] rounded-xl">
            <div className="w-12 h-12 rounded-xl bg-[#121212] border border-[#242424] flex items-center justify-center mx-auto text-[#9929EA] mb-3 shadow-glow-purple">
              <Plus className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-white">No Projects Added Yet</h4>
            <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto mt-1 leading-relaxed">
              Start tracking your websites and Discord bots by adding your first project endpoint.
            </p>
            <button
              onClick={() => {
                setMonitorToEdit(null);
                setIsModalOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#9929EA] hover:bg-[#821ecc] text-white shadow-glow-purple transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Project</span>
            </button>
          </div>
        ) : filteredMonitors.length === 0 ? (
          <div className="p-12 text-center bg-[#0D0D0D] border border-[#242424] rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#121212] border border-[#242424] flex items-center justify-center mx-auto text-[#66666F] mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">No Matches Found</h4>
            <p className="text-xs text-[#A1A1AA] max-w-xs mx-auto mt-1">
              No websites or bots match your search or status filter.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
              className="mt-3 text-xs text-[#9929EA] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredMonitors.map((m) => {
              const isChecking = m.status === 'checking';
              const isOnline = m.status === 'online';
              const expiryInfo = getExpiryCountdownIST(m.expiryDate);

              return (
                <div
                  key={m.id}
                  className={`bg-[#0D0D0D] border transition-all rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                    expiryInfo.isExpired 
                      ? 'border-[#EF4444]/40 hover:border-[#EF4444]/70 bg-[#0D0D0D]/90'
                      : expiryInfo.isUrgent 
                      ? 'border-[#F59E0B]/30 hover:border-[#F59E0B]/60' 
                      : 'border-[#242424] hover:border-[#333333]'
                  }`}
                >
                  {/* Left: Status, Name, and URL */}
                  <div className="flex flex-col gap-2 min-w-0 flex-1">
                    {/* Top Row: StatusBadge + Project Name (+ Badges on desktop) */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <StatusBadge status={m.status} />
                      <span className="font-semibold text-white text-sm sm:text-base tracking-tight truncate">
                        {m.name}
                      </span>
                      {/* On sm screens and up, badges sit alongside the name */}
                      <div className="hidden sm:flex items-center gap-2">
                        <TypeBadge type={m.type} />
                        <ProviderBadge provider={m.provider} />
                      </div>
                    </div>

                    {/* Mobile Badges Row: Grouped together cleanly on line 2 */}
                    <div className="flex sm:hidden items-center gap-2 flex-wrap">
                      <TypeBadge type={m.type} />
                      <ProviderBadge provider={m.provider} />
                    </div>

                    {/* URL */}
                    <div className="flex items-center gap-2">
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs text-[#66666F] hover:text-[#A1A1AA] truncate flex items-center gap-1.5 transition-colors"
                        title={m.url}
                      >
                        <span className="truncate">{m.url}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-70" />
                      </a>
                    </div>

                      {/* Expiry Warning Alert Banner if expired or urgent */}
                      {expiryInfo.isExpired ? (
                        <div className="text-[11px] text-[#EF4444] font-mono mt-1 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Hosting period ended — Please re-host on a new VPS or platform!</span>
                        </div>
                      ) : expiryInfo.isUrgent ? (
                        <div className="text-[11px] text-[#F59E0B] font-mono mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Expires soon ({expiryInfo.label}) — Prepare backup/new VPS</span>
                        </div>
                      ) : null}

                      {/* Error explanation if offline */}
                      {m.status === 'offline' && m.errorMessage && (
                        <div className="text-[11px] text-[#EF4444] font-mono mt-1">
                          {m.errorMessage}
                        </div>
                      )}
                    </div>

                  {/* Right: Hosting Expiry Countdown, Latency, Last Checked, and Actions */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between md:justify-end gap-3 md:gap-5 text-xs border-t md:border-t-0 border-[#242424]/60 pt-3 md:pt-0 w-full md:w-auto">
                    {/* Metrics Panel (3-column grid on mobile, inline on desktop) */}
                    <div className="grid grid-cols-3 gap-2 bg-[#080808] p-2.5 rounded-lg border border-[#1A1A1A] md:bg-transparent md:p-0 md:border-0 md:flex md:items-center md:gap-5">
                      {/* Hosting Expiry & Re-host countdown (IST) */}
                      <div className="text-left md:text-right flex-shrink-0">
                        <span className="text-[10px] font-mono uppercase text-[#66666F] block truncate">
                          Host (IST)
                        </span>
                        <span className={`font-mono font-semibold flex items-center gap-1 justify-start md:justify-end text-[11px] whitespace-nowrap ${
                          expiryInfo.isExpired
                            ? 'text-[#EF4444]'
                            : expiryInfo.isUrgent
                            ? 'text-[#F59E0B]'
                            : 'text-[#08CB00]'
                        }`}>
                          {expiryInfo.isExpired ? (
                            <>
                              <AlertTriangle className="w-3 h-3 text-[#EF4444] animate-pulse flex-shrink-0" />
                              <span>Expired</span>
                            </>
                          ) : (
                            <>
                              <Clock className={`w-3 h-3 flex-shrink-0 ${expiryInfo.isUrgent ? 'text-[#F59E0B]' : 'text-[#9929EA]'}`} />
                              <span>{expiryInfo.label}</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Ping / Latency */}
                      <div className="text-left md:text-right flex-shrink-0">
                        <span className="text-[10px] font-mono uppercase text-[#66666F] block">Ping</span>
                        <span className={`font-mono font-medium ${isOnline ? 'text-[#08CB00]' : 'text-[#66666F]'}`}>
                          {isOnline && m.latencyMs ? `${m.latencyMs}ms` : '—'}
                        </span>
                      </div>

                      {/* Last Checked & Live 5s Countdown */}
                      <div className="text-left md:text-right flex-shrink-0">
                        <div className="flex items-center md:justify-end gap-1 mb-0.5">
                          <span className="text-[10px] font-mono uppercase text-[#66666F]">Checked</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-[#08CB00]">
                            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#08CB00] opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#08CB00]"></span>
                            </span>
                            <span>{isSilentSyncing ? 'Sync' : `${countdown}s`}</span>
                          </span>
                        </div>
                        <span className="font-mono text-[#A1A1AA] text-xs block truncate">
                          {formatRelativeTime(m.lastChecked)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons (Clean thumb-friendly buttons on mobile, compact on desktop) */}
                    <div className="flex items-center gap-2 w-full md:w-auto md:ml-1">
                      <button
                        onClick={() => handleCheckSingle(m)}
                        disabled={isChecking}
                        className="flex-1 md:flex-initial px-3 py-1.5 rounded-lg bg-[#121212] hover:bg-[#1A1A1A] border border-[#242424] text-[#A1A1AA] hover:text-white transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
                        title="Check this monitor now"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-[#9929EA]' : ''}`} />
                        <span>Check</span>
                      </button>

                      <button
                        onClick={() => {
                          setMonitorToEdit(m);
                          setIsModalOpen(true);
                        }}
                        className="flex-1 md:flex-initial py-1.5 px-3 md:px-2 rounded-lg bg-[#121212] hover:bg-[#1A1A1A] border border-[#242424] text-[#66666F] hover:text-white transition-colors flex items-center justify-center gap-1.5 text-xs"
                        title="Edit monitor"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="md:hidden">Edit</span>
                      </button>

                      <button
                        onClick={() => setMonitorToDelete(m)}
                        className="flex-1 md:flex-initial py-1.5 px-3 md:px-2 rounded-lg bg-[#121212] hover:bg-[#EF4444]/20 border border-[#242424] text-[#66666F] hover:text-[#EF4444] transition-colors flex items-center justify-center gap-1.5 text-xs"
                        title="Delete monitor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="md:hidden">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>



      {/* Add / Edit Modal */}
      <MonitorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setMonitorToEdit(null);
        }}
        onSave={handleSaveMonitor}
        initialMonitor={monitorToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(monitorToDelete)}
        monitor={monitorToDelete}
        onClose={() => setMonitorToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default App;
