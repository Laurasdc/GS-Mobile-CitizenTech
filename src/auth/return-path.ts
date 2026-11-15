import type { Href } from 'expo-router';
export function returnPath(value: string | string[] | undefined): Href {
  const path = Array.isArray(value) ? value[0] : value;
  if (path === '/' || path === '/explore' || path === '/registrar' || path === '/meus' || path === '/gestao') return path;
  const match = path?.match(/^\/ocorrencias\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
  if (match) return { pathname: '/ocorrencias/[id]', params: { id: match[1] } };
  const edit = path?.match(/^\/editar\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
  if (edit) return { pathname: '/editar/[id]', params: { id: edit[1] } };
  const management = path?.match(/^\/gestao\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
  if (management) return { pathname: '/gestao/[id]', params: { id: management[1] } };
  return '/conta';
}
