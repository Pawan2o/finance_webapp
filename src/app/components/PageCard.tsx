import type { ReactNode } from "react";

interface PageCardProps {
  children: ReactNode;
  className?: string;
}

export function PageCard({ children, className = "" }: PageCardProps) {
  return (
    <div
      className={`rounded-[28px] border border-white/70 bg-white/88 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-7 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
