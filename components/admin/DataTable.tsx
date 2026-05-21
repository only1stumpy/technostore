import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface DataTableProps {
  headers: string[];
  children: ReactNode;
  empty?: boolean;
  emptyText?: string;
  minWidth?: string;
}

export function DataTable({ headers, children, empty, emptyText = 'Нет данных', minWidth = '720px' }: DataTableProps) {
  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-left" style={{ minWidth }}>
          <thead className="border-b border-border bg-secondary/50 text-sm uppercase text-muted-foreground">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-6 py-4 font-bold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {empty ? (
              <tr>
                <td className="px-6 py-12 text-center text-muted-foreground" colSpan={headers.length}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
