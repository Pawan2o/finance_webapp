interface StatusBadgeProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function StatusBadge({ active, activeLabel = 'Active', inactiveLabel = 'Inactive' }: StatusBadgeProps) {
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide"
      style={active
        ? { background: 'rgba(16,185,129,0.12)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.25)' }
        : { background: 'rgba(239,68,68,0.10)', color: 'var(--destructive)', border: '1px solid rgba(239,68,68,0.2)' }}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
