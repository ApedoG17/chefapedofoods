import React from "react";

export interface WarningBoxProps {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function WarningBox({
  children,
  action,
  className = "",
}: WarningBoxProps) {
  return (
    <div
      role="alert"
      className={`border border-warn text-warn bg-warn/10 rounded-[12px] p-3 text-[12px] leading-relaxed mb-3.5 ${className}`.trim()}
    >
      <div>{children}</div>
      {action && <div className="mt-2.5 pt-2 border-t border-warn/20">{action}</div>}
    </div>
  );
}
