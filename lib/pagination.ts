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

function stableSort(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableSort).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = stableSort((value as Record<string, unknown>)[key]);
        return acc;
      }, {} as Record<string, unknown>);
  }

  return value;
}

export function hashFilters(filters: Record<string, unknown>): string {
  return createHash('sha256')
    .update(JSON.stringify(stableSort(filters)))
    .digest('hex')
    .slice(0, 16);
}
