const getStorageKey = (key) => `list-page-state:${key}`;

export const loadListPageState = (key, fallback = {}) => {
  try {
    const rawValue = window.sessionStorage.getItem(getStorageKey(key));
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
};

export const saveListPageState = (key, value) => {
  try {
    window.sessionStorage.setItem(getStorageKey(key), JSON.stringify(value));
  } catch {
    // Ignore storage errors so list pages can continue working normally.
  }
};
