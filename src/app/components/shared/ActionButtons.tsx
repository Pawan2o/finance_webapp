import { Edit, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete: () => void;
  extra?: { icon: LucideIcon; onClick: () => void; title: string }[];
}

export function ActionButtons({ onEdit, onDelete, extra = [] }: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      {onEdit && (
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg transition-colors"
          title="Edit"
          style={{ color: 'var(--primary)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Edit className="w-4 h-4" />
        </button>
      )}
      {extra.map(({ icon: Icon, onClick, title }) => (
        <button
          key={title}
          onClick={onClick}
          className="p-1.5 rounded-lg transition-colors"
          title={title}
          style={{ color: 'var(--destructive)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
      <button
        onClick={onDelete}
        className="p-1.5 rounded-lg transition-colors"
        title="Delete"
        style={{ color: 'var(--destructive)' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
