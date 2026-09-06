/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { OnboardingModal } from './components/OnboardingModal';
import { StudentDiscovery } from './components/StudentDiscovery';
import { TeacherDashboard } from './components/TeacherDashboard';
import { InteractiveLiveRoom } from './components/InteractiveLiveRoom';
import { PostLiveRatingModal } from './components/PostLiveRatingModal';
import { GooglePlayBillingModal } from './components/GooglePlayBillingModal';
import { AgoraSettingsModal } from './components/AgoraSettingsModal';
import { TeacherProfileModal } from './components/TeacherProfileModal';
import { ExpandGroupsModal } from './components/ExpandGroupsModal';
import { BottomNavigationBar } from './components/BottomNavigationBar';
import { ChatHub } from './components/ChatHub';
import { GroupsView } from './components/GroupsView';
import { ProfileView } from './components/ProfileView';
import { IncomingLiveToast } from './components/IncomingLiveToast';
import { NotificationsCenter } from './components/NotificationsCenter';
import { FloatingMiniPlayer } from './components/FloatingMiniPlayer';
import { MicTesterModal } from './components/MicTesterModal';
import { SplashIntro } from './components/SplashIntro';
import { Radio, Video } from 'lucide-react';

function AppContent() {
  const { currentRole, activeRoom, currentNavTab, isLiveMinimized } = useApp();
  const [teacherLivesMode, setTeacherLivesMode] = useState<'public' | 'studio'>('public');

  const renderTabContent = () => {
    if (activeRoom && !isLiveMinimized) {
      return <InteractiveLiveRoom />;
    }

    switch (currentNavTab) {
      case 'public_lives':
        if (currentRole === 'teacher') {
          return (
            <div className="space-y-4">
              {/* Teacher switch between Public feed and Teacher Studio */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl flex items-center gap-1 shadow-md">
                  <button
                    onClick={() => setTeacherLivesMode('public')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      teacherLivesMode === 'public'
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>اللايفات العامة لجميع المعلمين</span>
                  </button>
                  <button
                    onClick={() => setTeacherLivesMode('studio')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      teacherLivesMode === 'studio'
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>استوديو المعلم وبدء لايف جديد</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  {teacherLivesMode === 'public' 
                    ? 'أنت تستعرض الآن الغرف واللايفات المفتوحة كزائر' 
                    : 'لوحة تحكم إطلاق اللايفات وحساب التكلفة'}
                </p>
              </div>

              {teacherLivesMode === 'public' ? (
                <div className="pb-28">
                  <StudentDiscovery />
                </div>
              ) : (
                <div className="pb-28">
                  <TeacherDashboard />
                </div>
              )}
            </div>
          );
        }
        return (
          <div className="pb-28">
            <StudentDiscovery />
          </div>
        );

      case 'chats':
        return <ChatHub />;

      case 'my_groups':
        return <GroupsView />;

      case 'profile':
        return <ProfileView />;

      default:
        return (
          <div className="pb-28">
            <StudentDiscovery />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif] relative">
      {/* Main Content Area */}
      <main className="flex-1">
        {renderTabContent()}
      </main>

      {/* Stunning Floating Bottom Navigation Bar */}
      <BottomNavigationBar />

      {/* Floating Mini Player (PiP) for active live streams */}
      <FloatingMiniPlayer />

      {/* Real-time Incoming Live Notification Toast */}
      <IncomingLiveToast />

      {/* Modals & Popovers */}
      <NotificationsCenter />
      <MicTesterModal />
      <OnboardingModal />
      <PostLiveRatingModal />
      <GooglePlayBillingModal />
      <AgoraSettingsModal />
      <TeacherProfileModal />
      <ExpandGroupsModal />

      {/* Futuristic Electric Entrance Splash with xLive Vibration */}
      <SplashIntro />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}


