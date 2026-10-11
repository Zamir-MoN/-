export type MonitorType = 'website' | 'discord_bot' | 'api';

export type MonitorStatus = 'online' | 'offline' | 'checking';

export type ProviderType = 'Railway' | 'VPS' | 'Vercel' | 'Render' | 'Cloudflare' | 'Other' | 'None';

export interface Monitor {
  id: string;
  name: string;
  type: MonitorType;
  url: string;
  status: MonitorStatus;
  provider?: ProviderType;
  expiryDate?: string; // YYYY-MM-DD in IST
  hostingDays?: number; // e.g. 7, 14, 30
  createdAt?: string;
  latencyMs?: number;
  lastChecked?: string;
  errorMessage?: string;
  githubRepo?: string; // Optional GitHub repository URL (e.g. https://github.com/owner/repo)
}

export type StatusFilter = 'all' | 'online' | 'offline';
export type TypeFilter = 'all' | 'website' | 'discord_bot' | 'api';
export type ProviderFilter = 'all' | ProviderType;
