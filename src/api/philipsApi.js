// Philips JointSpace API Client for Philips 46PFL8606H/12 and similar models

export class PhilipsApi {
  constructor(ip = '192.168.1.100', port = 1925, apiVersion = 1) {
    this.ip = ip;
    this.port = port;
    this.apiVersion = apiVersion;
  }

  getBaseUrl() {
    return `http://${this.ip}:${this.port}/${this.apiVersion}`;
  }

  async request(path, options = {}, timeoutMs = 2000) {
    const url = `${this.getBaseUrl()}/${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options.headers || {}),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      try {
        return text ? JSON.parse(text) : {};
      } catch {
        return text;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Таймаут соединения (${timeoutMs}мс) к ${url}`);
      }
      throw error;
    }
  }

  // Ping TV and check system info
  async testConnection() {
    const start = Date.now();
    try {
      const system = await this.request('system', { method: 'GET' }, 2500);
      const latency = Date.now() - start;
      return { success: true, latency, system };
    } catch (err) {
      // Fallback: try checking powerstate or audio/volume
      try {
        await this.request('powerstate', { method: 'GET' }, 2000);
        return { success: true, latency: Date.now() - start, system: { name: 'Philips TV' } };
      } catch (fallbackErr) {
        return { success: false, error: err.message };
      }
    }
  }

  // Send Remote Key Press
  async sendKey(keyName) {
    return this.request('input/key', {
      method: 'POST',
      body: JSON.stringify({ key: keyName }),
    }, 1500);
  }

  // Volume
  async getVolume() {
    try {
      return await this.request('audio/volume', { method: 'GET' }, 2000);
    } catch {
      return null;
    }
  }

  async setVolume(current, muted = false) {
    const body = {};
    if (typeof current === 'number') body.current = current;
    if (typeof muted === 'boolean') body.muted = muted;
    return this.request('audio/volume', {
      method: 'POST',
      body: JSON.stringify(body),
    }, 1500);
  }

  // Power
  async getPowerState() {
    try {
      return await this.request('powerstate', { method: 'GET' }, 2000);
    } catch {
      return null;
    }
  }

  async setPowerState(state = 'Standby') {
    return this.request('powerstate', {
      method: 'POST',
      body: JSON.stringify({ powerstate: state }),
    }, 2000);
  }

  // Sources
  async getSources() {
    try {
      return await this.request('sources', { method: 'GET' }, 2000);
    } catch {
      return null;
    }
  }

  async getCurrentSource() {
    try {
      return await this.request('sources/current', { method: 'GET' }, 2000);
    } catch {
      return null;
    }
  }

  async setSource(sourceId) {
    return this.request('sources/current', {
      method: 'POST',
      body: JSON.stringify({ id: sourceId }),
    }, 1500);
  }

  // Channels
  async getChannels() {
    try {
      return await this.request('channels', { method: 'GET' }, 2500);
    } catch {
      return null;
    }
  }

  async setChannel(channelId) {
    return this.request('channels/current', {
      method: 'POST',
      body: JSON.stringify({ id: channelId }),
    }, 1500);
  }

  // Ambilight Spectra
  async getAmbilightMode() {
    try {
      return await this.request('ambilight/mode', { method: 'GET' }, 2000);
    } catch {
      return null;
    }
  }

  async setAmbilightMode(mode = 'internal') {
    // 'internal' (follows TV screen) or 'manual' (user static color)
    return this.request('ambilight/mode', {
      method: 'POST',
      body: JSON.stringify({ current: mode }),
    }, 1500);
  }

  async setAmbilightColor(r, g, b) {
    // Switch to manual mode first or set cached color
    try {
      await this.setAmbilightMode('manual');
    } catch {}
    return this.request('ambilight/cached', {
      method: 'POST',
      body: JSON.stringify({ r, g, b }),
    }, 1500);
  }

  async setAmbilightPower(turnOn) {
    if (turnOn) {
      return this.setAmbilightMode('internal');
    } else {
      // Turn off ambilight by switching to manual and setting black
      await this.setAmbilightMode('manual');
      return this.request('ambilight/cached', {
        method: 'POST',
        body: JSON.stringify({ r: 0, g: 0, b: 0 }),
      }, 1500);
    }
  }
}
