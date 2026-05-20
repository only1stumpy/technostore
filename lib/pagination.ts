import { createHash } from 'crypto';

export function encodeCursor(sortField: string, id: string): string {
  return Buffer.from(`${sortField}:${id}`).toString('base64');
}

export function decodeCursor(cursor: string): { sortField: string; id: string } | null {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const [sortField, id] = decoded.split(':');
    if (!sortField || !id) return null;
    return { sortField, id };
  } catch {
    return null;
  }
}

export function hashFilters(filters: Record<string, unknown>): string {
  const sorted = Object.keys(filters)
    .sort()
    .reduce((acc, key) => {
      acc[key] = filters[key];
      return acc;
    }, {} as Record<string, unknown>);

  return createHash('sha256')
    .update(JSON.stringify(sorted))
    .digest('hex')
    .slice(0, 16);
}
