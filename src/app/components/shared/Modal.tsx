import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { styles } from '../../constants/styles';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ title, onClose, children, maxWidth = 'max-w-md' }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`rounded-2xl p-6 ${maxWidth} w-full mx-4 border max-h-[90vh] overflow-y-auto`}
        style={styles.card}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-extrabold" style={{ color: 'var(--foreground)' }}>{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
