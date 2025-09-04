import React, { useState } from "react";
import { useNavigation } from "../contexts/NavigationContext";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Home, List, Dumbbell, History, User, Menu, X, LogOut } from "lucide-react";
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
        {/* Header mobile avec logo + user + hamburger */}
        <nav className="flex items-center justify-between p-4 bg-gray-900 text-white relative z-50">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg">
              {currentClub ? currentClub.name : "Exersio"}
            </span>
          </div>
          
          {/* User info + Notifications + Hamburger */}
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center font-bold text-sm">
                  {currentUser?.firstName?.[0] || currentUser?.name?.[0] || "C"}
                  {currentUser?.lastName?.[0] || "M"}
                </div>
              </div>
            )}
            <NotificationBadge
              onClick={() => setNotificationCenterOpen(true)}
              className="text-white hover:bg-gray-800"
            />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-800"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Menu hamburger overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-gray-900 bg-opacity-95">
            <div className="flex flex-col h-full pt-20 px-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-lg mb-2 text-lg ${
                    currentPage === item.id
                      ? "bg-[#00d4aa] text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
              
              <div className="mt-auto mb-8 p-4 border-t border-gray-700">
                {currentUser && (
                  <p className="text-gray-300 mb-4">Connecté en tant que {currentUser.name}</p>
                )}
                <button
                  onClick={onLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg"
                >
                  <LogOut size={18} />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation bottom bar mobile - ALWAYS visible */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50">
          <div className="flex justify-around items-center py-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg min-w-0 flex-1 ${
                  currentPage === item.id
                    ? "text-[#00d4aa]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="text-xs truncate">{item.label}</span>
              </button>
            ))}
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

  // Navigation desktop (inchangée)
  return (
    <nav className="flex items-center justify-between p-4 bg-gray-900 text-white">
      <div className="flex items-center gap-3">
        <span className="font-bold text-lg">
          {currentClub ? currentClub.name : "Exersio"}
        </span>
      </div>

      <div className="flex gap-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id as any)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              currentPage === item.id
                ? "bg-[#00d4aa] text-white"
                : "hover:bg-gray-800 text-gray-300"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <NotificationBadge
          onClick={() => setNotificationCenterOpen(true)}
        />
        {currentUser && (
          <span className="text-sm text-gray-300">{currentUser.name}</span>
        )}
        <Button variant="outline" size="sm" onClick={onLogout}>
          Déconnexion
        </Button>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
      />
    </nav>
  );
}
