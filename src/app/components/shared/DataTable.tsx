import type { ReactNode } from 'react';
import { styles } from '../../constants/styles';

interface Column {
  key: string;
  label: string;
  className?: string;
}

interface DataTableProps {
  columns: Column[];
  rows: ReactNode[];         // each row is a full <tr> element
  emptyMessage?: string;
  prefixHeader?: ReactNode;  // e.g. checkbox column header
}

export function DataTable({ columns, rows, emptyMessage = 'No data found', prefixHeader }: DataTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
      <table className="w-full">
        <thead style={{ background: 'var(--muted)' }}>
          <tr>
            {prefixHeader && <th className="px-5 py-3 text-left">{prefixHeader}</th>}
            {columns.map(col => (
              <th key={col.key} className={`${styles.th} ${col.className ?? ''}`}
                style={{ color: 'var(--muted-foreground)' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? rows : (
            <tr>
              <td
                colSpan={columns.length + (prefixHeader ? 1 : 0)}
                className="px-5 py-10 text-center text-sm"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Zebra row background helper */
export function rowBg(index: number): React.CSSProperties {
  return {
    borderTop: '1px solid var(--border)',
    background: index % 2 === 0 ? 'transparent' : 'var(--muted)',
  };
}
