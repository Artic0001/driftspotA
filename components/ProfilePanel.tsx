
import React from 'react';
import { Icons } from './Icons';
import { Avatar, GlassCard } from './UIComponents';
import { User, Spot, AppView } from '../types';
import { useSwipe } from '../hooks/useSwipe';

interface ProfilePanelProps {
  setView: (view: AppView) => void;
  t: (key: string) => string;
  currentUser: User;
  viewingProfileUser: User | null;
  setEditProfileData: (data: Partial<User>) => void;
  handleUnfriend: (id: string) => void;
  handleAcceptFriendRequest: (id: string) => void;
  handleSendFriendRequest: (id: string) => void;
  spots: Spot[];
  calculateUserRating: (id: string, spots: Spot[]) => number;
  handleSpotClick: (spot: Spot) => void;
  setFlyToTarget: (coords: any) => void;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({ 
  setView, t, currentUser, viewingProfileUser, setEditProfileData, 
  handleUnfriend, handleAcceptFriendRequest, handleSendFriendRequest, 
  spots, calculateUserRating, handleSpotClick, setFlyToTarget 
}) => {
    useSwipe({ onSwipeBack: () => setView('map') });

    const profileUser = viewingProfileUser || currentUser;
    const isOwnProfile = profileUser.id === currentUser.id;
    
    const isFriend = currentUser.friends.includes(profileUser.id);
    const hasSentRequest = currentUser.outgoingFriendRequests.includes(profileUser.id);
    const hasIncomingRequest = currentUser.incomingFriendRequests.includes(profileUser.id);

    return (
      <div className="fixed inset-0 z-50 bg-zinc-100 dark:bg-black flex flex-col h-full w-full transition-colors duration-300">
        <div className="p-6 pt-12 shrink-0 flex items-center justify-between border-b dark:border-white/10 border-black/10 bg-white/80 dark:bg-black/90 backdrop-blur-sm">
          <h1 className="text-3xl font-display font-bold dark:text-white text-black">{t('garage')}</h1>
          <div className="flex gap-4 items-center">
            {isOwnProfile ? (
              <button onClick={() => { setEditProfileData(currentUser); setView('settings'); }} className="text-zinc-400 hover:text-black dark:hover:text-white p-2 dark:bg-white/5 bg-black/5 rounded-full transition-colors">
                 <Icons.Settings size={24} />
               </button>
            ) : (
                <button 
                onClick={() => {
                    if (isFriend) handleUnfriend(profileUser.id);
                    else if (hasIncomingRequest) handleAcceptFriendRequest(profileUser.id);
                    else if (!hasSentRequest) handleSendFriendRequest(profileUser.id);
                }}
                disabled={hasSentRequest}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-bold ${
                    isFriend ? 'bg-zinc-800 text-zinc-400' : 
                    hasSentRequest ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' :
                    hasIncomingRequest ? 'bg-green-600 text-white' :
                    'bg-neon-red text-white'
                }`}
              >
                {isFriend ? <><Icons.UserMinus size={16}/> {t('removeFriend')}</> : 
                 hasSentRequest ? 'Pending' :
                 hasIncomingRequest ? <><Icons.Check size={16}/> {t('accept')}</> :
                 <><Icons.UserPlus size={16}/> {t('addFriend')}</>}
              </button>
            )}
            <button onClick={() => setView('map')} className="p-2 dark:bg-white/5 bg-black/5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 dark:text-white text-black"><Icons.Close size={24} /></button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-32">
            <div className="flex flex-col items-center mb-10 animate-fade-in">
                <Avatar 
                    src={profileUser.avatarUrl} 
                    size="xl" 
                    className="border-4 border-neon-red mb-4 shadow-[0_0_30px_rgba(255,0,51,0.3)]"
                />
                <h2 className="text-2xl font-bold dark:text-white text-black">{profileUser.username}</h2>
                <p className="text-zinc-500 dark:text-zinc-400">{profileUser.carModel}</p>
                <p className="text-zinc-500 text-sm mt-2 text-center max-w-xs">{profileUser.bio || "No bio yet."}</p>
                {isOwnProfile && (
                    <button onClick={() => setView('friends')} className="mt-4 dark:bg-white/5 bg-black/5 px-4 py-2 rounded-full text-xs uppercase font-bold flex items-center gap-2 hover:bg-black/10 dark:hover:bg-white/10 transition-colors dark:text-white text-black">
                    <Icons.User size={14} /> {currentUser.friends.length} {t('friends')}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <GlassCard className="text-center">
                <div className="text-2xl font-display font-bold text-neon-red">{isOwnProfile ? calculateUserRating(currentUser.id, spots) : calculateUserRating(profileUser.id, spots)}</div>
                <div className="text-xs text-zinc-500 uppercase">{t('totalPoints')}</div>
                </GlassCard>
                <GlassCard className="text-center">
                <div className="text-2xl font-display font-bold dark:text-white text-black">#{profileUser.rank}</div>
                <div className="text-xs text-zinc-500 uppercase">{t('cityRank')}</div>
                </GlassCard>
            </div>

            <h3 className="text-lg font-bold mb-4 text-zinc-700 dark:text-zinc-300">{isOwnProfile ? t('mySpots') : t('createdSpots')}</h3>
            <div className="space-y-3">
                {spots.filter((s: Spot) => s.creatorId === profileUser.id).length > 0 ? (
                spots.filter((s: Spot) => s.creatorId === profileUser.id).map((spot: Spot) => (
                    <GlassCard key={spot.id} className="flex justify-between items-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5" onClick={() => { setView('map'); setFlyToTarget(spot.points[0]); handleSpotClick(spot); }}>
                    <div>
                        <div className="font-bold dark:text-white text-black">{spot.name}</div>
                        <div className="text-xs text-zinc-500">{spot.difficulty} • {spot.likes} Likes</div>
                    </div>
                    <div className="h-8 w-8 rounded-full dark:bg-white/10 bg-black/10 flex items-center justify-center">
                        <Icons.Map size={14} className="dark:text-white text-black" />
                    </div>
                    </GlassCard>
                ))
                ) : (
                <div className="text-zinc-600 italic">{t('noSpots')}</div>
                )}
            </div>
        </div>
      </div>
    );
};
