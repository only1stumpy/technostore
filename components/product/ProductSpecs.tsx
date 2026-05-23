interface ProductSpecsProps {
  specs: Record<string, unknown> | null;
}

const specLabels: Record<string, string> = {
  battery: 'Емкость батареи',
  bluetooth: 'Bluetooth',
  color: 'Цвет',
  display: 'Экран',
  features: 'Особенности',
  memory: 'Память',
  processor: 'Процессор',
  ram: 'ОЗУ',
  refreshRate: 'Частота обновления',
  screenSize: 'Диагональ',
  storage: 'Накопитель',
  weight: 'Вес',
};

function getSpecLabel(key: string): string {
  return specLabels[key] || key;
}

function isEmptySpecValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.every(isEmptySpecValue);
  return false;
}

function formatSpecValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.filter((item) => !isEmptySpecValue(item)).map(formatSpecValue).join(', ');
  }

  if (typeof value === 'object' && value !== null) {
    return Object.entries(value)
      .filter(([, nestedValue]) => !isEmptySpecValue(nestedValue))
      .map(([key, nestedValue]) => `${getSpecLabel(key)}: ${formatSpecValue(nestedValue)}`)
      .join(', ');
  }

  return String(value);
}

export function ProductSpecs({ specs }: ProductSpecsProps) {
  const entries = Object.entries(specs ?? {}).filter(([, value]) => !isEmptySpecValue(value));

  if (entries.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Характеристики не указаны
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border bg-muted/40 px-6 py-4">
        <h3 className="text-lg font-bold uppercase tracking-tight text-foreground">
          Характеристики
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody className="divide-y divide-border">
            {entries.map(([key, value]) => (
              <tr key={key} className="transition-colors hover:bg-muted/40">
                <th scope="row" className="w-1/3 min-w-40 px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  {getSpecLabel(key)}
                </th>
                <td className="px-6 py-4 text-sm font-medium text-foreground">{formatSpecValue(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
