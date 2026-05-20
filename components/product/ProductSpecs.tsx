interface ProductSpecsProps {
  specs: Record<string, unknown> | null;
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
    <div className="border-2 border-[#e5e5e5]">
      <div className="bg-[#f5f5f5] px-6 py-4 border-b-2 border-[#e5e5e5]">
        <h3 className="text-lg font-bold text-[#1a1a1a] uppercase tracking-tight">
          Характеристики
        </h3>
      </div>
      <div className="divide-y divide-[#e5e5e5]">
        {Object.entries(specs).map(([key, value]) => (
          <div
            key={key}
            className="grid grid-cols-2 gap-4 px-6 py-4 hover:bg-[#f5f5f5] transition-colors"
          >
            <dt className="text-sm font-medium text-[#666666]">{key}</dt>
            <dd className="text-sm text-[#1a1a1a]">
              {typeof value === 'object' && value !== null
                ? JSON.stringify(value)
                : String(value)}
            </dd>
          </div>
        ))}
      </div>
    </div>
  );
}
