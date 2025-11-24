
import React from 'react';
import { Icons } from './Icons';
import { Avatar, GlassCard, NeonButton, NeonInput } from './UIComponents';
import { User, Spot, NotificationType } from '../types';

// --- Leaderboard ---
export const LeaderboardPanel = ({ setView, t, currentUser, openProfile, mockOtherUsers, calculateUserRating, spots }: any) => (
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
            <Avatar src={currentUser.avatarUrl} size="sm" />
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
            <Avatar src={user.avatarUrl} size="sm" />
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

// --- Profile ---
export const ProfilePanel = ({ setView, t, currentUser, viewingProfileUser, setEditProfileData, handleUnfriend, handleAcceptFriendRequest, handleSendFriendRequest, spots, calculateUserRating, handleSpotClick, setFlyToTarget }: any) => {
    const profileUser = viewingProfileUser || currentUser;
    const isOwnProfile = profileUser.id === currentUser.id;
    
    const isFriend = currentUser.friends.includes(profileUser.id);
    const hasSentRequest = currentUser.outgoingFriendRequests.includes(profileUser.id);
    const hasIncomingRequest = currentUser.incomingFriendRequests.includes(profileUser.id);

    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col h-full w-full">
        <div className="p-6 pt-12 shrink-0 flex items-center justify-between border-b border-white/10 bg-black/90 backdrop-blur-sm">
          <h1 className="text-3xl font-display font-bold">{t('garage')}</h1>
          <div className="flex gap-4 items-center">
            {isOwnProfile ? (
              <button onClick={() => { setEditProfileData(currentUser); setView('settings'); }} className="text-zinc-400 hover:text-white p-2 bg-white/5 rounded-full transition-colors">
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
            <button onClick={() => setView('map')} className="p-2 bg-white/5 rounded-full hover:bg-white/20"><Icons.Close size={24} /></button>
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
                <h2 className="text-2xl font-bold text-white">{profileUser.username}</h2>
                <p className="text-zinc-400">{profileUser.carModel}</p>
                <p className="text-zinc-500 text-sm mt-2 text-center max-w-xs">{profileUser.bio || "No bio yet."}</p>
                {isOwnProfile && (
                    <button onClick={() => setView('friends')} className="mt-4 bg-white/5 px-4 py-2 rounded-full text-xs uppercase font-bold flex items-center gap-2 hover:bg-white/10 transition-colors">
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
                <div className="text-2xl font-display font-bold text-white">#{profileUser.rank}</div>
                <div className="text-xs text-zinc-500 uppercase">{t('cityRank')}</div>
                </GlassCard>
            </div>

            <h3 className="text-lg font-bold mb-4 text-zinc-300">{isOwnProfile ? t('mySpots') : t('createdSpots')}</h3>
            <div className="space-y-3">
                {spots.filter((s: Spot) => s.creatorId === profileUser.id).length > 0 ? (
                spots.filter((s: Spot) => s.creatorId === profileUser.id).map((spot: Spot) => (
                    <GlassCard key={spot.id} className="flex justify-between items-center" onClick={() => { setView('map'); setFlyToTarget(spot.points[0]); handleSpotClick(spot); }}>
                    <div>
                        <div className="font-bold">{spot.name}</div>
                        <div className="text-xs text-zinc-500">{spot.difficulty} • {spot.likes} Likes</div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Icons.Map size={14} className="text-white" />
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

// --- Settings ---
export const SettingsPanel = ({ setView, t, currentUser, fileInputRef, handleAvatarFileChange, editProfileData, setEditProfileData, saveProfile, lang, toggleLanguage, handleLogout, handleDeleteAccount }: any) => (
    <div className="fixed inset-0 z-50 bg-black flex flex-col h-full w-full" style={{ height: 'var(--app-height, 100vh)' }}>
        <div className="p-6 pt-12 shrink-0 flex items-center gap-3 border-b border-white/10 bg-black/90 backdrop-blur-sm">
             <button onClick={() => setView('profile')} className="p-2 bg-white/5 rounded-full hover:bg-white/20">
                <Icons.Nav size={20} className="-rotate-90 text-white" />
             </button>
             <h1 className="text-3xl font-display font-bold">{t('settings')}</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pb-32">
            <div className="space-y-8">
                <section>
                    <h3 className="text-zinc-500 uppercase text-xs font-bold mb-4 border-b border-white/10 pb-2">{t('editProfile')}</h3>
                    
                    <div className="flex justify-center mb-6 relative">
                        <input type="file" ref={fileInputRef} onChange={handleAvatarFileChange} className="hidden" accept="image/*" />
                        <div onClick={() => fileInputRef.current?.click()} className="relative cursor-pointer group">
                             <Avatar 
                                src={editProfileData.avatarUrl || currentUser.avatarUrl} 
                                size="xl"
                                className="border-2 border-white/20 opacity-60 group-hover:opacity-100 transition-opacity"
                             />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Icons.Camera className="text-white opacity-80 group-hover:scale-110 transition-transform" size={32} />
                            </div>
                            <div className="text-center text-xs text-neon-red mt-3 font-bold">{t('changePhoto')}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-zinc-500 uppercase ml-1 mb-1 block">{t('username')}</label>
                            <NeonInput value={editProfileData.username || ''} onChange={e => setEditProfileData((p: any) => ({...p, username: e.target.value}))} />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 uppercase ml-1 mb-1 block">{t('carModel')}</label>
                            <NeonInput value={editProfileData.carModel || ''} onChange={e => setEditProfileData((p: any) => ({...p, carModel: e.target.value}))} />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 uppercase ml-1 mb-1 block">{t('bio')}</label>
                            <NeonInput value={editProfileData.bio || ''} onChange={e => setEditProfileData((p: any) => ({...p, bio: e.target.value}))} />
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <NeonButton onClick={saveProfile} className="w-full">{t('save')}</NeonButton>
                    </div>
                </section>

                <section>
                    <h3 className="text-zinc-500 uppercase text-xs font-bold mb-4 border-b border-white/10 pb-2">{t('general')}</h3>
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Icons.Globe className="text-zinc-400" size={20} />
                            <span className="font-bold">{t('language')}</span>
                        </div>
                        <button onClick={toggleLanguage} className="px-4 py-2 bg-black border border-zinc-700 rounded-lg text-sm font-bold uppercase hover:border-white/40 transition-colors w-24 text-center">
                            {lang === 'en' ? 'English' : 'Русский'}
                        </button>
                    </div>
                </section>

                <section>
                    <h3 className="text-zinc-500 uppercase text-xs font-bold mb-4 border-b border-white/10 pb-2">{t('account')}</h3>
                    <div className="space-y-3">
                        <button onClick={handleLogout} className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-3 transition-colors text-zinc-200">
                            <Icons.Nav className="rotate-180 text-zinc-500" size={20} /> 
                            <span className="font-bold">{t('logout')}</span>
                        </button>

                        <div className="pt-4">
                            <div className="text-red-900 uppercase text-xs font-bold mb-2 ml-1">{t('dangerZone')}</div>
                            <button onClick={handleDeleteAccount} className="w-full p-4 border border-red-900/50 bg-red-900/10 hover:bg-red-900/20 rounded-xl flex items-center gap-3 transition-colors text-red-500">
                                <Icons.Trash size={20} />
                                <span className="font-bold">{t('deleteAccount')}</span>
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>
);

// --- Search ---
export const SearchPanel = ({ setView, t, spots, mockOtherUsers, searchQuery, setSearchQuery, setFlyToTarget, handleSpotClick, openProfile }: any) => {
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
                               <Avatar src={user.avatarUrl} size="sm" />
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
