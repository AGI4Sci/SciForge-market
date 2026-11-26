export function sitePath(route: string): string {
  const basePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? "";
  return `${basePath}${route.endsWith("/") ? route : `${route}/`}`;
}
