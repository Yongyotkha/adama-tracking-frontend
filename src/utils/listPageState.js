const STORAGE_PREFIX = "list-page-state:";
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 12;
const ACTIVE_LIST_PAGE_KEY = `${STORAGE_PREFIX}__active_list_page__`;

const canUseStorage = () => typeof window !== "undefined" && !!window.sessionStorage;
const getCurrentPathname = () =>
  typeof window !== "undefined" ? window.location.pathname || "/" : "/";
const normalizePathname = (pathname = "/") =>
  pathname.replace(/\/+$/, "") || "/";

const syncActiveListPage = (key) => {
  if (!canUseStorage()) return;

  try {
    const currentPath = normalizePathname(getCurrentPathname());
    const raw = window.sessionStorage.getItem(ACTIVE_LIST_PAGE_KEY);
    const activePage = raw ? JSON.parse(raw) : null;

    if (activePage?.key && activePage.key !== key) {
      window.sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    }

    window.sessionStorage.setItem(
      ACTIVE_LIST_PAGE_KEY,
      JSON.stringify({
        key,
        pathname: currentPath,
        updatedAt: Date.now(),
      })
    );
  } catch (_) {
    // ignore storage errors
  }
};

export const loadListPageState = (key, fallback = null) => {
  if (!canUseStorage()) return fallback;

  try {
    syncActiveListPage(key);

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

    const raw = window.sessionStorage.getItem(ACTIVE_LIST_PAGE_KEY);
    const activePage = raw ? JSON.parse(raw) : null;
    if (activePage?.key === key) {
      window.sessionStorage.removeItem(ACTIVE_LIST_PAGE_KEY);
    }
  } catch (_) {
    // ignore storage errors
  }
};
