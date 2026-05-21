interface ProductSpecsProps {
  specs: Record<string, unknown> | null;
}

const specLabels: Record<string, string> = {
  features: 'Особенности',
};

function formatSpecValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(formatSpecValue).join(', ');
  }

  if (typeof value === 'object' && value !== null) {
    return Object.entries(value)
      .map(([key, nestedValue]) => `${specLabels[key] || key}: ${formatSpecValue(nestedValue)}`)
      .join(', ');
  }

  return String(value);
}

export function ProductSpecs({ specs }: ProductSpecsProps) {
  if (!specs || Object.keys(specs).length === 0) {
    return (
      <div className="text-[#666666] text-center py-8">
        Характеристики не указаны
      </div>
    );
  }

  return (
    <section className="border-2 border-[#e5e5e5]">
      <div className="bg-[#f5f5f5] px-6 py-4 border-b-2 border-[#e5e5e5]">
        <h3 className="text-lg font-bold text-[#1a1a1a] uppercase tracking-tight">
          Характеристики
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody className="divide-y divide-[#e5e5e5]">
            {Object.entries(specs).map(([key, value]) => (
              <tr key={key} className="hover:bg-[#f5f5f5] transition-colors">
                <th scope="row" className="w-1/3 min-w-40 px-6 py-4 text-left text-sm font-medium text-[#666666]">
                  {specLabels[key] || key}
                </th>
                <td className="px-6 py-4 text-sm text-[#1a1a1a]">{formatSpecValue(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
