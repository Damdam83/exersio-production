import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "../contexts/NavigationContext";
import { ExersioLogo } from "./ExersioLogo";

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const { state: authState } = useAuth();
  const { currentPage, setCurrentPage, menuEntries } = useNavigation();

  const currentUser = authState.user;
  const currentClub = authState.club;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-20"
             style={{ transform: "translate(-50%, -50%)" }}></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl opacity-20"
             style={{ transform: "translate(50%, 50%)" }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-2 shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-6">
          <ExersioLogo size={100} showText className="ml-2" />
          <div className="flex bg-white/10 rounded-2xl p-2 gap-1">
              {menuEntries.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setCurrentPage(tab.key as any)}
                  className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    currentPage === tab.key
                      ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <h3 className="font-semibold">Coach {currentUser?.firstName || currentUser?.name || "Martin"}</h3>
              <p className="text-sm text-gray-400">{currentClub?.name || "Volley Club Paris"}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center font-bold text-lg shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200">
              {currentUser?.firstName?.[0] || currentUser?.name?.[0] || "C"}
              {currentUser?.lastName?.[0] || "M"}
            </div>
          </div>
        </div>

        {/* Page Title
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-emerald-200 bg-clip-text text-transparent mb-2">
            {(() => {
              const entry = menuEntries.find(m => m.key === currentPage);
              if (entry) return entry.label;
              
              // Pages spéciales
              switch (currentPage) {
                case 'session-create': return 'Créer une séance';
                case 'exercise-create':
                case 'exercise-edit': return 'Créer un exercice';
                default: return 'Dashboard';
              }
            })()}
          </h1>
        </div> */}

        {/* Page Content */}
        <div className="space-y-8">{children}</div>
      </div>
    </div>
  );
}
