import { Dumbbell, History, Home, List, LogOut, Menu, User, X } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "../contexts/NavigationContext";
import { NotificationBadge, NotificationCenter } from "./NotificationCenter";

interface NavigationProps {
  isMobile: boolean;
  onLogout: () => void;
}

export function Navigation({ isMobile, onLogout }: NavigationProps) {
  const { currentPage, setCurrentPage } = useNavigation();
  const { state: auth } = useAuth();
  const currentUser = auth.user;
  const currentClub = auth.club;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  const menuItems = [
    { id: "home", label: "Accueil", icon: <Home size={18} /> },
    { id: "sessions", label: "Séances", icon: <List size={18} /> },
    { id: "exercises", label: "Exercices", icon: <Dumbbell size={18} /> },
    { id: "history", label: "Historique", icon: <History size={18} /> },
    { id: "profile", label: "Profil", icon: <User size={18} /> },
  ];

  const handleNavigate = (pageId: string) => {
    setCurrentPage(pageId as any);
    setMobileMenuOpen(false);
  };

  if (isMobile) {
    return (
      <>
        {/* Header mobile avec logo + notifications + hamburger - Modern style */}
        <nav className="flex items-center justify-between p-4 bg-slate-900/90 backdrop-blur-xl border-b border-white/20 text-white relative z-50">
          {/* Logo + Nom Exersio */}
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo_exersio_mobile.png"
              alt="Exersio"
              className="w-8 h-8 object-contain flex-shrink-0"
            />
            <span className="font-bold text-lg">
              {currentClub ? currentClub.name : "Exersio"}
            </span>
          </div>

          {/* Notifications + Hamburger */}
          <div className="flex items-center gap-2">
            <NotificationBadge
              onClick={() => setNotificationCenterOpen(true)}
              className="text-white hover:bg-white/10"
            />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Menu hamburger overlay - Modern glassmorphism style */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col h-full pt-20 px-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-2xl mb-3 text-lg transition-all duration-200 ${
                    currentPage === item.id
                      ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg"
                      : "text-gray-300 hover:bg-white/10 bg-white/5 backdrop-blur-xl border border-white/10"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}

              <div className="mt-auto mb-8 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                {currentUser && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center font-bold text-sm">
                      {currentUser?.firstName?.[0] || currentUser?.name?.[0] || "C"}
                      {currentUser?.lastName?.[0] || "M"}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-300 text-sm">Connecté en tant que</p>
                      <p className="text-white font-medium">{currentUser.name}</p>
                    </div>
                    <button
                      onClick={onLogout}
                      className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-200"
                      title="Déconnexion"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation bottom bar mobile - Modern glassmorphism style */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          {/* Backdrop blur container */}
          <div className="bg-white/10 backdrop-blur-xl border-t border-white/20">
            <div className="flex justify-around items-center py-3 px-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`relative flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-200 min-w-0 flex-1 ${
                    currentPage === item.id
                      ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg transform -translate-y-1"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className={`transition-all duration-200 ${
                    currentPage === item.id ? "scale-110" : ""
                  }`}>
                    {React.cloneElement(item.icon, { size: currentPage === item.id ? 20 : 18 })}
                  </div>
                  <span className={`text-xs truncate font-medium transition-all duration-200 ${
                    currentPage === item.id ? "text-white" : ""
                  }`}>
                    {item.label}
                  </span>
                  {/* Active indicator dot */}
                  {currentPage === item.id && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notification Center */}
        <NotificationCenter
          isOpen={notificationCenterOpen}
          onClose={() => setNotificationCenterOpen(false)}
        />
      </>
    );
  }

  // Navigation desktop
  // return (
  //   <>
  //     <nav className="flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-700">
  //       <div className="flex items-center gap-3">
  //         <img
  //           src="/assets/logo_exersio_mobile.png"
  //           alt="Exersio"
  //           className="w-8 h-8 object-contain flex-shrink-0"
  //         />
  //         <span className="font-bold text-lg">
  //           {currentClub ? currentClub.name : "Exersio"}
  //         </span>
  //       </div>

  //       <div className="flex gap-2">
  //         {menuItems.map((item) => (
  //           <button
  //             key={item.id}
  //             onClick={() => setCurrentPage(item.id as any)}
  //             className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
  //               currentPage === item.id
  //                 ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white"
  //                 : "hover:bg-slate-800 text-gray-300"
  //             }`}
  //           >
  //             {item.icon}
  //             <span>{item.label}</span>
  //           </button>
  //         ))}
  //       </div>

  //       <div className="flex items-center gap-3">
  //         <NotificationBadge
  //           onClick={() => setNotificationCenterOpen(true)}
  //           className="text-white hover:bg-slate-800"
  //         />
  //         {currentUser && (
  //           <div className="flex items-center gap-2">
  //             <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center font-bold text-sm">
  //               {currentUser?.firstName?.[0] || currentUser?.name?.[0] || "C"}
  //               {currentUser?.lastName?.[0] || "M"}
  //             </div>
  //             <span className="text-sm text-gray-300">{currentUser.name}</span>
  //           </div>
  //         )}
  //         <button
  //           onClick={onLogout}
  //           className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
  //         >
  //           <LogOut size={16} />
  //           <span>Déconnexion</span>
  //         </button>
  //       </div>
  //     </nav>

  //     {/* Notification Center */}
  //     <NotificationCenter
  //       isOpen={notificationCenterOpen}
  //       onClose={() => setNotificationCenterOpen(false)}
  //     />
  //   </>
  // );
}
