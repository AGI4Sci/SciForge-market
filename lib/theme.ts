export const THEME_KEY = "sciforge-market-theme";
export type Theme = "system" | "light" | "dark";

export function parseTheme(value: string | null): Theme {
  return value === "light" || value === "dark" ? value : "system";
}

export function loadTheme(): Theme {
  try { return parseTheme(localStorage.getItem(THEME_KEY)); }
  catch { return "system"; }
}

export function applyTheme(theme: Theme) {
  if (theme === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
}

export const themeInit = `try{const t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch{}`;
