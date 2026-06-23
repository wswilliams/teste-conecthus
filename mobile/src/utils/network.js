import Constants from 'expo-constants';

function getDevMachineHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;

  if (!hostUri) {
    return '';
  }

  return String(hostUri).split(':')[0] || '';
}

export function resolveLocalhostUrl(rawUrl) {
  if (!rawUrl) {
    return rawUrl;
  }

  try {
    const parsed = new URL(rawUrl);

    if (parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
      return rawUrl;
    }

    const host = getDevMachineHost();
    if (!host) {
      return rawUrl;
    }

    parsed.hostname = host;
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}
