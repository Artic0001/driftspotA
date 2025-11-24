

import React from 'react';
import { Icons } from './Icons';
import { Avatar } from './UIComponents';
import { User, Spot, AppView } from '../types';

interface LeaderboardPanelProps {
  setView: (view: AppView) => void;
  t: (key: string) => string;
  currentUser: User;
  openProfile: (user: User) => void;
  mockOtherUsers: User[];
  calculateUserRating: (id: string, spots: Spot[]) => number;
  spots: Spot[];
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({ 
  setView, t, currentUser, openProfile, mockOtherUsers, calculateUserRating, spots 
}) => (
  <div className="fixed inset-0 z-50 bg-black flex flex-col h-full w-full">
    {/* Header */}
    <div className="p-6 pt-12 pb-4 shrink-0 flex justify-between items-center bg-black/90 backdrop-blur-sm border-b border-white/10">
       <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">{t('cityRank')}</h1>
       <button onClick={() => setView('map')} className="p-2 bg-white/5 rounded-full hover:bg-white/20"><Icons.Close size={24} /></button>
    </div>

    {/* Scrollable List */}
    <div className="flex-1 overflow-y-auto p-6 pb-32">
      <div className="space-y-2">
        {/* Current User Rank */}
        <div onClick={() => openProfile(currentUser)} className="flex items-center p-4 rounded-xl border bg-neon-red/10 border-neon-red mb-6 cursor-pointer">
            <div className="text-xl font-bold w-10 text-neon-red">#{currentUser.rank}</div>
            <Avatar url={currentUser.avatarUrl} size="sm" />
            <div className="ml-4 flex-1">
              <div className="font-bold">{currentUser.username} (You)</div>
              <div className="text-xs text-zinc-500">{currentUser.carModel}</div>
            </div>
            <div className="font-display font-bold">{calculateUserRating(currentUser.id, spots)}</div>
        </div>

        {/* Mock Others */}
        {mockOtherUsers.map((user: User) => (
          <div key={user.id} onClick={() => openProfile(user)} className="flex items-center p-4 rounded-xl border bg-white/5 border-transparent cursor-pointer hover:bg-white/10 active:scale-95 transition-all">
            <div className="text-xl font-bold w-10 text-zinc-500">#{user.rank}</div>
            <Avatar url={user.avatarUrl} size="sm" />
            <div className="ml-4 flex-1">
              <div className="font-bold">{user.username}</div>
              <div className="text-xs text-zinc-500">{user.carModel}</div>
            </div>
            <div className="font-display font-bold">{calculateUserRating(user.id, spots)}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);