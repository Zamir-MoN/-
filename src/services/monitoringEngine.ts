import { Monitor } from '../types';
import { StorageService } from './storage';

export class MonitoringEngine {
  public static async checkMonitor(monitor: Monitor): Promise<Monitor> {
    const url = monitor.url.trim();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const start = performance.now();

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
        cache: 'no-store',
      });
      clearTimeout(timeoutId);
      const elapsed = Math.round(performance.now() - start);

      const isOnline = response.ok || (response.status >= 200 && response.status < 400);

      return {
        ...monitor,
        status: isOnline ? 'online' : 'offline',
        latencyMs: elapsed,
        lastChecked: new Date().toISOString(),
        errorMessage: isOnline ? undefined : `HTTP ${response.status} ${response.statusText || 'Error'}`,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      const elapsed = Math.round(performance.now() - start);

      let msg = 'Offline: Connection failed';
      if (err.name === 'AbortError') {
        msg = 'Offline: Request timed out (>6s)';
      } else if (err.message) {
        msg = `Offline: ${err.message}`;
      }

      return {
        ...monitor,
        status: 'offline',
        latencyMs: elapsed > 6000 ? 0 : elapsed,
        lastChecked: new Date().toISOString(),
        errorMessage: msg,
      };
    }
  }

  public static async checkAll(
    monitors: Monitor[], 
    onUpdate: (updated: Monitor) => void
  ): Promise<Monitor[]> {
    const promises = monitors.map(async (m) => {
      // Set to checking first for manual trigger
      onUpdate({ ...m, status: 'checking' });
      const checked = await this.checkMonitor(m);
      onUpdate(checked);
      return checked;
    });

    const results = await Promise.all(promises);
    StorageService.saveMonitors(results);
    return results;
  }

  public static async silentCheckAll(
    monitors: Monitor[], 
    onUpdate: (updated: Monitor) => void
  ): Promise<Monitor[]> {
    const promises = monitors.map(async (m) => {
      // Probe silently in the background without UI flickering
      const checked = await this.checkMonitor(m);
      onUpdate(checked);
      return checked;
    });

    const results = await Promise.all(promises);
    StorageService.saveMonitors(results);
    return results;
  }
}
