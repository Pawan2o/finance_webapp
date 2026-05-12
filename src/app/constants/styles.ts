import type React from 'react';

export const styles = {
  card: {
    background: 'var(--card)',
    borderColor: 'var(--border)',
    boxShadow: 'var(--shadow-md)',
  } as React.CSSProperties,

  btnPrimary: {
    background: 'linear-gradient(135deg, var(--primary), #3B6AEA)',
    boxShadow: '0 4px 14px rgba(30,58,138,0.35)',
    color: '#fff',
  } as React.CSSProperties,

  btnDanger: {
    background: 'linear-gradient(135deg, #DC2626, #EF4444)',
    boxShadow: '0 4px 14px rgba(239,68,68,0.35)',
    color: '#fff',
  } as React.CSSProperties,

  input: {
    background: 'var(--input-background)',
    borderColor: 'var(--input)',
    color: 'var(--foreground)',
  } as React.CSSProperties,

  th: 'px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest',
  td: 'px-5 py-3.5 text-sm',
};
