import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import type { ComparisonItem } from '@/types/api';

type ComparisonTableProps = {
  items: ComparisonItem[];
  showOnlyDifferences?: boolean;
  onRemove?: (productId: string) => void;
};

function formatSpecValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function isDifferent(values: string[]) {
  return new Set(values).size > 1;
}

export function ComparisonTable({ items, showOnlyDifferences = false, onRemove }: ComparisonTableProps) {
  const specKeys = Array.from(new Set(items.flatMap((item) => Object.keys(item.specs ?? {}))));
  const rows = [
    {
      label: 'Цена',
      values: items.map((item) => formatPrice(item.price)),
    },
    {
      label: 'Бренд',
      values: items.map((item) => item.brand.name),
    },
    {
      label: 'Категория',
      values: items.map((item) => item.category.name),
    },
    {
      label: 'Наличие',
      values: items.map((item) => item.stock > 0 ? `${item.stock} шт.` : 'Нет в наличии'),
    },
    ...specKeys.map((key) => ({
      label: key,
      values: items.map((item) => formatSpecValue(item.specs?.[key])),
    })),
  ];
  const visibleRows = showOnlyDifferences ? rows.filter((row) => isDifferent(row.values)) : rows;

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-background">
      <table className="w-full min-w-[900px] border-collapse">
        <thead>
          <tr className="border-b border-border bg-secondary/60">
            <th className="sticky left-0 z-20 w-56 bg-secondary px-4 py-4 text-left text-sm font-black uppercase tracking-tight">Характеристика</th>
            {items.map((item) => (
              <th key={item.id} className="min-w-52 px-4 py-4 text-left align-top">
                <div className="space-y-3">
                  <Link href={`/product/${item.id}`} className="group block space-y-3">
                    <div className="relative aspect-square w-28 overflow-hidden rounded-lg bg-gray-50">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="112px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Нет фото</div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">{item.brand.name}</div>
                      <div className="font-bold group-hover:text-primary">{item.name}</div>
                      <div className="mt-1 text-sm font-black text-primary">{formatPrice(item.price)}</div>
                    </div>
                  </Link>
                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-xs font-bold uppercase tracking-tight text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      Убрать
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => {
            const different = isDifferent(row.values);

            return (
              <tr key={row.label} className="border-b border-border last:border-b-0">
                <td className="sticky left-0 z-10 bg-background px-4 py-3 text-sm font-semibold text-muted-foreground">{row.label}</td>
                {row.values.map((value, index) => (
                  <td
                    key={`${row.label}-${items[index].id}`}
                    className={different ? 'px-4 py-3 text-sm font-semibold text-foreground' : 'px-4 py-3 text-sm text-muted-foreground'}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
