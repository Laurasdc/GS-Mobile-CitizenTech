import type { Href } from 'expo-router';
export function returnPath(value: string | string[] | undefined): Href {
  const path = Array.isArray(value) ? value[0] : value;
  if (path === '/' || path === '/explore') return path;
  const match = path?.match(/^\/ocorrencias\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
  if (match) return { pathname: '/ocorrencias/[id]', params: { id: match[1] } };
  return '/conta';
}
