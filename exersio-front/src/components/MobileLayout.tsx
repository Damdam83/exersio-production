import React from "react";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Content avec padding réduit pour mobile */}
      <div className="pb-20 pt-2"> {/* pb-20 pour la nav bottom, pt-2 réduit */}
        <div className="px-3 space-y-2"> {/* px-3 et space-y-2 réduits */}
          {children}
        </div>
      </div>
    </div>
  );
}