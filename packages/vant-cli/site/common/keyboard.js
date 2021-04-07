const CACHE_KEY = 'vant-cli-use-keyboard';

export function getUseKeyboard() {
  return localStorage.getItem(CACHE_KEY) === 'true';
}

export function setUseKeyboard(useKeyboard) {
  localStorage.setItem(CACHE_KEY, useKeyboard);
}
