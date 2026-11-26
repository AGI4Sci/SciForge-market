import type { Locale } from "./locale";

export function sitePath(route: string, locale: Locale = "zh"): string {
  const basePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? "";
  const prefix = locale === "en" ? "/en" : "";
  return `${basePath}${prefix}${route.endsWith("/") ? route : `${route}/`}`;
}

export function catalogRoute(pathname: string, locale: Locale): string {
  const basePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? "";
  const route = basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))
    ? pathname.slice(basePath.length) || "/"
    : pathname;
  const localRoute = locale === "en" ? route.replace(/^\/en(?=\/|$)/, "") || "/" : route;
  return localRoute.replace(/^\/plugins\//, "/catalog/");
}
