// Subnet scanner to discover Philips JointSpace TVs on port 1925

export async function scanSubnet(subnetBase = '192.168.1', onProgress = () => {}, cancelRef = { cancelled: false }) {
  const foundDevices = [];
  const start = 1;
  const end = 254;
  const batchSize = 15;

  for (let i = start; i <= end; i += batchSize) {
    if (cancelRef.cancelled) break;

    const batch = [];
    for (let j = i; j < i + batchSize && j <= end; j++) {
      const ip = `${subnetBase}.${j}`;
      batch.push(checkDevice(ip));
    }

    const results = await Promise.all(batch);
    for (const res of results) {
      if (res && res.isPhilips) {
        foundDevices.push(res);
      }
    }

    onProgress(Math.min(100, Math.round(((i + batchSize) / end) * 100)), foundDevices);
  }

  return foundDevices;
}

async function checkDevice(ip, port = 1925) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 600);

  try {
    const res = await fetch(`http://${ip}:${port}/1/system`, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        ip,
        port,
        isPhilips: true,
        model: data.model || 'Philips Smart TV',
        name: data.name || 'Philips TV',
        software: data.softwareversion || '',
      };
    }
  } catch {
    clearTimeout(timeoutId);
    // Try fallback check on powerstate
    try {
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 400);
      const res2 = await fetch(`http://${ip}:${port}/1/powerstate`, {
        method: 'GET',
        signal: controller2.signal,
      });
      clearTimeout(timeout2);
      if (res2.ok) {
        return {
          ip,
          port,
          isPhilips: true,
          model: 'Philips 46PFL8606H',
          name: 'Philips TV',
        };
      }
    } catch {}
  }

  return null;
}
