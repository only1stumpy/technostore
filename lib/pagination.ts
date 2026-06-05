import { createHash } from 'crypto';

export function encodeCursor(sortField: string, id: string): string {
  return Buffer.from(JSON.stringify({ sortField, id })).toString('base64url');
}

export function decodeCursor(cursor: string): { sortField: string; id: string } | null {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');

    if (decoded.startsWith('{')) {
      const value = JSON.parse(decoded) as unknown;
      if (
        value &&
        typeof value === 'object' &&
        'sortField' in value &&
        typeof value.sortField === 'string' &&
        value.sortField &&
        'id' in value &&
        typeof value.id === 'string' &&
        value.id
      ) {
        return { sortField: value.sortField, id: value.id };
      }
      return null;
    }

    const separatorIndex = decoded.lastIndexOf(':');
    if (separatorIndex < 1 || separatorIndex === decoded.length - 1) return null;

    return {
      sortField: decoded.slice(0, separatorIndex),
      id: decoded.slice(separatorIndex + 1),
    };
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
