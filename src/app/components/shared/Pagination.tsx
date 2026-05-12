import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, totalCount, pageSize, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = Math.min((currentPage - 1) * pageSize + 1, totalCount);
  const to   = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-5 pt-4 border-t gap-3"
      style={{ borderColor: 'var(--border)' }}>
      <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
        {from}–{to} of {totalCount}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border transition-colors disabled:opacity-40"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-3 py-1.5 rounded-xl text-xs font-bold border"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-xl border transition-colors disabled:opacity-40"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
