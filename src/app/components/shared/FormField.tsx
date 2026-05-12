import type { ReactNode } from 'react';
import { styles } from '../../constants/styles';

interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, hint, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5"
        style={{ color: 'var(--muted-foreground)' }}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[10px] mt-1 font-medium" style={{ color: 'var(--muted-foreground)' }}>{hint}</p>
      )}
      {error && (
        <p className="text-[10px] mt-1 font-semibold" style={{ color: 'var(--destructive)' }}>{error}</p>
      )}
    </div>
  );
}

/** Reusable styled input */
interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function StyledInput({ className = '', ...props }: StyledInputProps) {
  return (
    <input
      className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium outline-none transition-colors ${className}`}
      style={styles.input}
      {...props}
    />
  );
}

/** Reusable styled select */
interface StyledSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function StyledSelect({ className = '', children, ...props }: StyledSelectProps) {
  return (
    <select
      className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium outline-none ${className}`}
      style={styles.input}
      {...props}
    >
      {children}
    </select>
  );
}

/** Reusable error alert */
export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="mb-4 p-3 rounded-xl text-xs font-semibold border"
      style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--destructive)' }}>
      {message}
    </div>
  );
}

/** Reusable modal action buttons row */
interface ModalActionsProps {
  onCancel: () => void;
  submitLabel?: string;
  disabled?: boolean;
}

export function ModalActions({ onCancel, submitLabel = 'Save', disabled }: ModalActionsProps) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="submit"
        disabled={disabled}
        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
        style={styles.btnPrimary}
      >
        {submitLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors"
        style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--muted)' }}
      >
        Cancel
      </button>
    </div>
  );
}
