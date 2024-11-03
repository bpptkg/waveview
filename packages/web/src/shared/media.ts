import { baseUrl } from '../services/api';

export function media(url?: string): string | undefined {
  if (!url) return undefined;
  return `${baseUrl}${url}`;
}
