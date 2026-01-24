"use client";
import React, { useState, useEffect } from 'react';
import { getToken, logout, authFetch } from '@/utils/auth'; 
import LoginPage from '@/components/LoginPage';
import CodingWorkspace from '@/components/CodingWorkspace';
import ProfileDashboard from '@/components/ProfileDashboard';
import OnboardingWizard from '@/components/OnboardingWizard'; 
import { LayoutDashboard, Code2, LogOut } from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentView, setCurrentView] = useState<'workspace' | 'profile'>('workspace');

  // --- CHECK AUTH & ONBOARDING STATUS ---
  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    const token = getToken();
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    setIsAuthenticated(true);

    // Fetch Profile to see if they are new
    try {
      const res = await authFetch('http://localhost:8000/profile/me');
      if (res && res.ok) {
        const profile = await res.json();
        // If mission is the default "Just Starting", they need onboarding!
        if (profile.mission === "Just Starting" || profile.mission === "To start learning") {
          setShowOnboarding(true);
        } else {
          setShowOnboarding(false);
        }
      }
    } catch (e) {
      console.error("Profile check failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center animate-pulse text-indigo-600 font-bold">Loading AntiNotes...</div>;

  if (!isAuthenticated) return <LoginPage onLoginSuccess={checkUserStatus} />;

  // 👇 SHOW WIZARD IF FLAG IS TRUE
  if (showOnboarding) {
    return <OnboardingWizard onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-800">
      
      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 z-20 shadow-sm h-full">
        
        {/* Logo Icon */}
        <div className="mb-8 p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-200">
          <Code2 size={24} />
        </div>

        {/* Nav Buttons (Middle) */}
        {/* flex-1 pushes the logout button down */}
        <nav className="flex-1 flex flex-col gap-6 w-full px-2">
          <NavButton 
            active={currentView === 'workspace'} 
            onClick={() => setCurrentView('workspace')}
            icon={<Code2 size={20} />}
            label="Code"
          />
          <NavButton 
            active={currentView === 'profile'} 
            onClick={() => setCurrentView('profile')}
            icon={<LayoutDashboard size={20} />}
            label="Profile"
          />
        </nav>

        {/* 👇 LOGOUT BUTTON (Fixed: Pushed to bottom) */}
        <button 
          onClick={logout}
          className="mt-auto p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          title="Logout"
        >
          <LogOut size={20} />
          <span className="sr-only">Logout</span>
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-hidden relative">
        {currentView === 'workspace' ? (
          <CodingWorkspace />
        ) : (
          <ProfileDashboard />
        )}
      </main>
    </div>
  );
}

// Helper for Sidebar
function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all w-full
        ${active 
          ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100' 
          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
        }`}
    >
      {icon}
      <span className="text-[10px] font-bold mt-1">{label}</span>
    </button>
  );
}