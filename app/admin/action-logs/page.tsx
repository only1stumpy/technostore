import { DataTable } from '@/components/admin/DataTable';
import { prisma } from '@/lib/prisma';

function formatMetadata(metadata: unknown) {
  if (!metadata) return '—';

  const value = JSON.stringify(metadata);
  return value.length > 160 ? `${value.slice(0, 160)}...` : value;
}

export default async function AdminActionLogsPage() {
  const logs = await prisma.adminActionLog.findMany({
    include: {
      admin: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Журнал действий</h1>
        <p className="mt-1 text-muted-foreground">Последние административные изменения в магазине</p>
      </div>

      <DataTable
        headers={['Дата', 'Администратор', 'Действие', 'Сущность', 'ID', 'Данные']}
        empty={logs.length === 0}
        emptyText="Действий пока нет"
        minWidth="980px"
      >
        {logs.map((log) => (
          <tr key={log.id}>
            <td className="px-6 py-4 text-sm text-muted-foreground">
              {log.createdAt.toLocaleString('ru-RU')}
            </td>
            <td className="px-6 py-4">
              <div className="font-semibold">{log.admin.name ?? 'Администратор'}</div>
              <div className="text-sm text-muted-foreground">{log.admin.phone}</div>
            </td>
            <td className="px-6 py-4 font-medium">{log.action}</td>
            <td className="px-6 py-4 text-sm">{log.entityType}</td>
            <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{log.entityId ?? '—'}</td>
            <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
              {formatMetadata(log.metadata)}
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
