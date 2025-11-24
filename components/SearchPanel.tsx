

import React from 'react';
import { Icons } from './Icons';
import { NeonInput, Avatar } from './UIComponents';
import { User, Spot, AppView } from '../types';

interface SearchPanelProps {
  setView: (view: AppView) => void;
  t: (key: string) => string;
  spots: Spot[];
  mockOtherUsers: User[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setFlyToTarget: (coords: any) => void;
  handleSpotClick: (spot: Spot) => void;
  openProfile: (user: User) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ 
  setView, t, spots, mockOtherUsers, searchQuery, setSearchQuery, 
  setFlyToTarget, handleSpotClick, openProfile 
}) => {
    const filteredSpots = spots.filter((s: Spot) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredUsers = mockOtherUsers.filter((u: User) => u.username.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col h-full w-full">
         <div className="p-6 pt-12 shrink-0 flex justify-between items-center bg-black/90 backdrop-blur-sm border-b border-white/10">
            <h1 className="text-3xl font-display font-bold">{t('search')}</h1>
            <button onClick={() => setView('map')} className="p-2 bg-white/5 rounded-full hover:bg-white/20"><Icons.Close size={24} /></button>
         </div>

         <div className="flex-1 overflow-y-auto p-6 pb-32">
             <div className="mb-6 sticky top-0 bg-black pt-2 z-10">
                <NeonInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Find spots or racers..." />
             </div>

             <div className="space-y-6">
                <div>
                   <h3 className="text-sm font-bold text-zinc-500 uppercase mb-3">Spots</h3>
                   {filteredSpots.length > 0 ? (
                      <div className="space-y-2">
                         {filteredSpots.map((spot: Spot) => (
                            <div key={spot.id} onClick={() => { setView('map'); setFlyToTarget(spot.points[0]); handleSpotClick(spot); }} className="flex justify-between items-center p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10">
                               <div>
                                  <div className="font-bold">{spot.name}</div>
                                  <div className="text-xs text-zinc-500">{spot.difficulty} • {spot.creatorName}</div>
                               </div>
                               <Icons.Nav className="text-neon-red -rotate-45" size={16} />
                            </div>
                         ))}
                      </div>
                   ) : (
                      <div className="text-zinc-600 italic">{t('noSpots')}</div>
                   )}
                </div>

                <div>
                   <h3 className="text-sm font-bold text-zinc-500 uppercase mb-3">Racers</h3>
                   {filteredUsers.length > 0 ? (
                      <div className="space-y-2">
                         {filteredUsers.map((user: User) => (
                            <div key={user.id} onClick={() => openProfile(user)} className="flex items-center p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10">
                               <Avatar url={user.avatarUrl} size="sm" />
                               <div className="ml-3">
                                  <div className="font-bold">{user.username}</div>
                                  <div className="text-xs text-zinc-500">{user.carModel}</div>
                               </div>
                            </div>
                         ))}
                      </div>
                   ) : (
                      <div className="text-zinc-600 italic">{t('noRacers')}</div>
                   )}
                </div>
             </div>
         </div>
      </div>
    );
};