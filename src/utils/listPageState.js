const STORAGE_PREFIX = "list-page-state:";
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 12;

const canUseStorage = () => typeof window !== "undefined" && !!window.sessionStorage;

export const loadListPageState = (key, fallback = null) => {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    const expiresAt = Number(parsed?.expiresAt || 0);

    if (expiresAt && Date.now() > expiresAt) {
      window.sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      return fallback;
    }

    return parsed?.value ?? fallback;
  } catch (_) {
    return fallback;
  }
};

export const saveListPageState = (key, value, ttlMs = DEFAULT_TTL_MS) => {
  if (!canUseStorage()) return;

  try {
    window.sessionStorage.setItem(
      `${STORAGE_PREFIX}${key}`,
      JSON.stringify({
        value,
        expiresAt: Date.now() + ttlMs,
      })
    );
  } catch (_) {
    // ignore storage errors
  }
};

export const clearListPageState = (key) => {
  if (!canUseStorage()) return;

  try {
    window.sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (_) {
    // ignore storage errors
  }
};
