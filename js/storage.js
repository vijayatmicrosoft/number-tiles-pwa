const SAVE_KEY = 'numtiles_save';
const SETTINGS_KEY = 'numtiles_settings';

export function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) { /* storage full or unavailable */ }
}

export function loadGame() {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) { /* ignore */ }
}

export function loadSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : { sound: true, vibration: true };
  } catch (e) {
    return { sound: true, vibration: true };
  }
}

export function resetProgress() {
  localStorage.removeItem(SAVE_KEY);
}
