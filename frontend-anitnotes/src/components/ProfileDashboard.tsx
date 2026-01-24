"use client";
import React, { useEffect, useState } from 'react';
import { Activity, Brain, Target, Zap, RotateCcw, AlertTriangle } from 'lucide-react';
import { authFetch } from '@/utils/auth'; // <--- IMPORT THIS
import { LogOut } from 'lucide-react'; // Import Icon
import { logout } from '@/utils/auth'; // Import Function

// 👇 NO PROPS NEEDED
export default function ProfileDashboard() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchProfile() {
      // 👇 Use authFetch and point to /profile/me (No ID needed in URL)
      const res = await authFetch(`http://localhost:8000/profile/me`);
      if (res && res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    }
    fetchProfile();
  }, []);

  if (!profile) return <div className="p-10 text-center">Loading Profile...</div>;

  // ... (Rest of the JSX is exactly the same as before)
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800 overflow-y-auto">
      
      {/* HEADER STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Activity />} label="Skill Level" value={`Lvl ${profile.current_skill_level}`} color="bg-blue-100 text-blue-700" />
        <StatCard icon={<Brain />} label="Thinking Style" value={profile.thinking_style} color="bg-purple-100 text-purple-700" />
        <StatCard icon={<Target />} label="Mission" value={profile.mission} color="bg-green-100 text-green-700" />
        <StatCard icon={<Zap />} label="Mental Block" value={profile.mental_block} color="bg-red-100 text-red-700" />
      </div>
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-2xl font-bold text-gray-800">My Learning Profile</h1>
         
         {/* Backup Logout Button */}
         <button 
           onClick={logout}
           className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
         >
           <LogOut size={16} /> Logout
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: WEAKNESSES */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-500"/> Known Bottlenecks
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.weaknesses.length === 0 ? (
              <span className="text-gray-400 italic">No weaknesses detected yet. Keep coding!</span>
            ) : (
              profile.weaknesses.map((w: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm border border-orange-100">
                  {w}
                </span>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: REVISION DECK (The Loop) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <RotateCcw size={20} className="text-indigo-500"/> Revision Deck
            <span className="text-xs font-normal text-gray-400 ml-2">({profile.revision_list.length} cards)</span>
          </h2>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
            {profile.revision_list.map((item: any, i: number) => (
              <div key={i} className="p-4 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{item.problem_title}</h3>
                  <span className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">"{item.mistake_summary}"</p>
                <div className="flex gap-2">
                  {item.concepts.map((tag: string, t: number) => (
                    <span key={t} className="text-xs font-mono bg-white border border-gray-200 px-2 py-1 rounded text-gray-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            
            {profile.revision_list.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                You haven't failed enough yet. Go solve some problems!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      <div>
        <div className="text-xs text-gray-400 uppercase font-bold">{label}</div>
        <div className="font-bold text-gray-800 text-lg truncate w-32">{value}</div>
      </div>
    </div>
  );
}