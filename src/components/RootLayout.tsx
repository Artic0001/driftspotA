
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../contexts/AppContext';
import { AuthView } from './AuthView';
import { Icons } from './Icons';
import { GlassCard, NeonButton, Avatar } from './UIComponents';
import { SpotDetail } from './SpotDetail';
import { ChatsListPanel, ChatDetailPanel } from './ChatPanels';
import { ProfilePanel } from './ProfilePanel';
import { LeaderboardPanel } from './LeaderboardPanel';
import { SettingsPanel } from './SettingsPanel';
import { SearchPanel } from './SearchPanel';
import { NotificationsPanel } from './NotificationsPanel';
import { DangerType, NotificationType, Spot } from '../types';

const iconPerson = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const createAvatarIcon = (url: string) => L.divIcon({
  className: 'avatar-marker',
  html: `<div style="background-image: url('${url}'); background-size: cover; background-position: center; width: 40px; height: 40px; border-radius: 50%; border: 3px solid #FF0033; box-shadow: 0 0 15px rgba(255, 0, 51, 0.6); overflow: hidden;"></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const createDangerIcon = (type: DangerType) => {
  let color = '#ff9900';
  let iconHtml = '!';
  if (type === DangerType.POLICE) { color = '#0066ff'; iconHtml = '👮'; }
  if (type === DangerType.CAMERA) { color = '#aaaaaa'; iconHtml = '📷'; }
  return L.divIcon({
    className: 'danger-icon',
    html: `<div style="background:${color}; width:30px; height:30px; display:flex; align-items:center; justify-content:center; border-radius:50%; border:2px solid white; font-size:16px; box-shadow: 0 0 10px ${color}; cursor: pointer;">${iconHtml}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const MapEvents = ({ onMapClick }: { onMapClick: (e: any) => void }) => {
  useMapEvents({ click: onMapClick });
  return null;
};

const MapController = ({ target, userLoc }: { target: any, userLoc: any }) => {
  const map = useMap();
  const [hasInitialCentered, setHasInitialCentered] = useState(false);
  useEffect(() => {
    if (userLoc && !hasInitialCentered && !target) {
      map.setView([userLoc.lat, userLoc.lng], 15);
      setHasInitialCentered(true);
    }
  }, [userLoc, hasInitialCentered, target, map]);
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 16, { animate: true, duration: 1.5 });
  }, [target, map]);
  return null;
};

const RecenterBtn = ({ coords, requestLocation }: { coords: any, requestLocation: () => void }) => {
  const map = useMap();
  return (
    <button 
      onClick={() => {
        if (coords) map.flyTo([coords.lat, coords.lng], 15, { animate: true, duration: 1.5 });
        else requestLocation();
      }} 
      className={`absolute bottom-28 right-4 z-[400] p-3 rounded-full border border-white/20 shadow-lg active:scale-90 transition-transform ${coords ? 'bg-glass-black text-white' : 'bg-red-900/80 text-white animate-pulse'}`}
    >
      <Icons.Nav className="w-6 h-6 text-neon-red" />
    </button>
  );
};

export const RootLayout = () => {
  const app = useApp();
  const { 
    // isLoggedIn is destructured but also accessed from app.isLoggedIn for logging safety
    isLoggedIn, authMode, setAuthMode, authForm, setAuthForm, handleAuth, lang, t, toggleLanguage,
    showDisclaimer, setShowDisclaimer, currentUser, view, setView, spots, selectedSpot, setSelectedSpot,
    flyToTarget, dangerZones, userLocation, handleMapClick, 
    handleSpotClick, handleDangerClick, 
    addingDanger, setAddingDanger, toast, setToast, setFlyToTarget, notifications,
    selectedDangerZone, setSelectedDangerZone, handleDeleteDanger, dangerCommentText, setDangerCommentText, handleCommentDanger,
    activeVideo, setActiveVideo, showChallenge, setShowChallenge, analysisResult, isRecording, isAnalyzing, handleRecordToggle, handleFileUpload,
    videoUploadInputRef, handleRunFileChange, triggerRunUpload, locationError, requestLocation, unreadCount, markAllAsRead,
    theme, toggleTheme, authError, usernameSuggestions,
    
    // CREATION PROPS
    isCreating, newSpotPoints, newSpotName, setNewSpotName, startCreating, cancelCreating, finishCreating
  } = app;

  console.log('ROOTLAYOUT: isLoggedIn =', app.isLoggedIn);

  useEffect(() => {
    if (view === 'notifications') markAllAsRead();
  }, [view, markAllAsRead]);

  if (!app.isLoggedIn) {
      return (
        <AuthView 
          authMode={authMode} setAuthMode={setAuthMode}
          authForm={authForm} setAuthForm={setAuthForm}
          handleAuth={handleAuth} lang={lang} toggleLanguage={toggleLanguage} t={t}
          authError={authError} usernameSuggestions={usernameSuggestions}
        />
      );
  }

  const renderSearchButton = () => (
    <div className="absolute top-4 left-4 z-[400] flex gap-2">
      <button 
        onClick={() => setView('search')}
        className="p-3 bg-glass-black dark:bg-black/60 bg-white/80 rounded-full border dark:border-white/20 border-black/10 dark:text-white text-black shadow-lg active:scale-90 transition-transform"
      >
        <Icons.Search className="w-6 h-6" />
      </button>
      <button 
        onClick={() => setAddingDanger(prev => prev ? null : DangerType.POLICE)}
        className={`p-3 rounded-full border shadow-lg active:scale-90 transition-transform ${addingDanger ? 'bg-neon-red border-neon-red text-white' : 'dark:bg-black/60 bg-white/80 dark:border-white/20 border-black/10 dark:text-white text-black'}`}
      >
        <Icons.Alert className="w-6 h-6" />
      </button>
    </div>
  );

  const renderNotificationButton = () => (
    <div className="absolute top-4 right-4 z-[400]">
      <button 
        onClick={() => setView('notifications')}
        className="relative p-3 dark:bg-black/60 bg-white/80 rounded-full border dark:border-white/20 border-black/10 dark:text-white text-black shadow-lg active:scale-90 transition-transform"
      >
        <Icons.Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <div className="absolute top-0 right-0 w-3 h-3 bg-neon-red rounded-full border-2 border-black flex items-center justify-center animate-pulse"></div>
        )}
      </button>
    </div>
  );

  const renderCreateModeOverlay = () => {
    if (!isCreating) return null;
    return (
      <div className="absolute top-20 left-0 right-0 z-[400] flex justify-center pointer-events-none">
         <GlassCard className="pointer-events-auto flex flex-col items-center gap-4 dark:bg-black/80 bg-white/90 backdrop-blur-md border-neon-red shadow-[0_0_20px_rgba(255,0,51,0.3)]">
            <div className="text-neon-red font-bold animate-pulse tracking-widest">{t('buildingTrack')}</div>
            <div className="text-xs text-zinc-500">{t('tapPoints')}</div>
            <input 
              className="bg-transparent border-b dark:border-white/20 border-black/20 text-center dark:text-white text-black placeholder-zinc-500 focus:outline-none focus:border-neon-red pb-2 w-48"
              placeholder={t('spotNamePlaceholder')}
              value={newSpotName}
              onChange={(e) => setNewSpotName(e.target.value)}
            />
            <div className="flex gap-2">
               <button onClick={cancelCreating} className="px-4 py-2 dark:bg-zinc-800 bg-zinc-200 rounded-lg text-xs font-bold dark:text-white text-black hover:opacity-80">{t('cancel')}</button>
               <button onClick={finishCreating} disabled={newSpotPoints.length < 2} className="px-4 py-2 bg-neon-red rounded-lg text-xs font-bold text-white shadow-[0_0_10px_rgba(255,0,51,0.5)] disabled:opacity-50 disabled:shadow-none">{t('finish')}</button>
            </div>
         </GlassCard>
      </div>
    );
  };

  const renderDangerTools = () => {
    if (!addingDanger) return null;
    return (
      <div className="absolute top-20 left-0 right-0 z-[400] flex justify-center pointer-events-none">
         <GlassCard className="pointer-events-auto flex gap-4 dark:bg-black/80 bg-white/90 backdrop-blur-md">
            <div className="text-center text-xs font-bold mb-2 absolute -top-8 w-full left-0 text-neon-red shadow-black drop-shadow-md">{t('dangerTap')}</div>
            <button onClick={() => setAddingDanger(DangerType.POLICE)} className={`p-3 rounded-full border-2 transition-all ${addingDanger === DangerType.POLICE ? 'border-blue-500 bg-blue-500/20 scale-110' : 'border-zinc-700 hover:border-blue-500'}`}><Icons.Siren size={24} className="text-blue-500" /></button>
            <button onClick={() => setAddingDanger(DangerType.CAMERA)} className={`p-3 rounded-full border-2 transition-all ${addingDanger === DangerType.CAMERA ? 'border-zinc-400 bg-zinc-500/20 scale-110' : 'border-zinc-700 hover:border-zinc-400'}`}><Icons.Camera size={24} className="text-zinc-400" /></button>
            <button onClick={() => setAddingDanger(DangerType.POTHOLE)} className={`p-3 rounded-full border-2 transition-all ${addingDanger === DangerType.POTHOLE ? 'border-orange-500 bg-orange-500/20 scale-110' : 'border-zinc-700 hover:border-orange-500'}`}><Icons.Pothole size={24} className="text-orange-500" /></button>
            <button onClick={() => setAddingDanger(null)} className="p-3 rounded-full dark:bg-zinc-800 bg-zinc-200 dark:text-white text-black ml-2"><Icons.Close size={24} /></button>
         </GlassCard>
      </div>
    );
  };

  const renderToast = () => {
    if (!toast) return null;
    return (
      <div 
        onClick={() => {
            if (toast.type === NotificationType.SPOT_NEARBY && toast.data) {
                setFlyToTarget((toast.data as Spot).points[0]);
                setSelectedSpot(toast.data as Spot);
            }
            if (toast.type === NotificationType.FRIEND_REQUEST) setView('notifications');
            setToast(null);
        }}
        className="fixed top-4 left-4 right-4 z-[5000] animate-slide-in cursor-pointer"
      >
        <GlassCard className="border-neon-red shadow-[0_0_20px_rgba(255,0,51,0.4)] flex items-center p-4">
           <div>
              <div className="font-bold dark:text-white text-black">{toast.title}</div>
              <div className="text-sm dark:text-zinc-300 text-zinc-700">{toast.message}</div>
           </div>
        </GlassCard>
      </div>
    );
  };

  const renderBottomNav = () => (
    <div className="absolute bottom-6 left-6 right-6 z-[400]">
      <div className="glass-panel rounded-2xl p-2 flex justify-between items-center backdrop-blur-xl bg-white/80 dark:bg-black/70 border dark:border-white/10 border-black/10 shadow-2xl transition-colors duration-300">
        <button onClick={() => setView('map')} className={`p-3 rounded-xl transition-all ${view === 'map' ? 'text-neon-red bg-black/5 dark:bg-white/10' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}><Icons.Map className="w-6 h-6" /></button>
        <button onClick={() => setView('leaderboard')} className="p-3 rounded-xl text-zinc-500 hover:text-black dark:hover:text-white transition-all"><Icons.Trophy className="w-6 h-6" /></button>
        <div className="relative -mt-10">
          <button onClick={startCreating} className="w-16 h-16 bg-neon-red rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,0,51,0.6)] border-4 dark:border-black border-white hover:scale-105 transition-transform active:scale-95"><Icons.Plus className="w-8 h-8" /></button>
        </div>
        <button onClick={() => setView('chats')} className="p-3 rounded-xl text-zinc-500 hover:text-black dark:hover:text-white transition-all relative"><Icons.Comment className="w-6 h-6" /></button>
        <button onClick={() => { app.setViewingProfileUser(null); setView('profile'); }} className="p-3 rounded-xl text-zinc-500 hover:text-black dark:hover:text-white transition-all"><Icons.User className="w-6 h-6" /></button>
      </div>
    </div>
  );

  const tileLayerUrl = theme === 'dark' 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="fixed inset-0 w-full dark:bg-black bg-zinc-100 text-black dark:text-white overflow-hidden overscroll-none transition-colors duration-300" style={{ height: 'var(--app-height, 100vh)' }}>
      {showDisclaimer && (
          <div className="absolute inset-0 z-[9999] bg-black/95 flex items-center justify-center p-6">
            <GlassCard className="max-w-md w-full border-neon-red shadow-[0_0_30px_rgba(255,0,51,0.2)]">
              <div className="text-center">
                <Icons.Alert size={48} className="mx-auto text-neon-red mb-4" />
                <h2 className="text-2xl font-display font-bold text-white mb-4">{t('disclaimerTitle')}</h2>
                <div className="bg-white/5 p-4 rounded-xl text-sm text-zinc-300 mb-6 text-left">
                  <p className="mb-4">{t('disclaimerText')}</p>
                  <p className="font-bold text-white text-center">{t('disclaimerWarning')}</p>
                </div>
                <NeonButton onClick={() => setShowDisclaimer(false)} className="w-full">{t('agree')}</NeonButton>
              </div>
            </GlassCard>
          </div>
      )}

      {/* Map Layer */}
      <div className={`absolute inset-0 z-0 ${view !== 'map' && view !== 'create' ? 'invisible' : 'visible'}`}>
        <MapContainer center={userLocation ? [userLocation.lat, userLocation.lng] : [40.7128, -74.0060]} zoom={14} zoomControl={false} style={{ height: '100%', width: '100%', background: theme === 'dark' ? '#000' : '#e4e4e7' }}>
          <TileLayer attribution='&copy; OpenStreetMap' url={tileLayerUrl} />
          <MapEvents onMapClick={handleMapClick} />
          <MapController target={flyToTarget} userLoc={userLocation} />
          {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} icon={createAvatarIcon(currentUser.avatarUrl)} />}
          
          {/* Existing Spots */}
          {spots.map(spot => (
            <React.Fragment key={spot.id}>
              <Polyline positions={spot.points.map(p => [p.lat, p.lng])} pathOptions={{ color: selectedSpot?.id === spot.id ? (theme === 'dark' ? '#fff' : '#000') : '#FF0033', weight: selectedSpot?.id === spot.id ? 8 : 4, opacity: 0.8 }} />
              <Polyline positions={spot.points.map(p => [p.lat, p.lng])} pathOptions={{ color: 'transparent', weight: 40, opacity: 0 }} eventHandlers={{ click: (e) => handleSpotClick(spot, e) }} />
              <Marker position={[spot.points[0].lat, spot.points[0].lng]} icon={L.divIcon({ className: 'bg-green-500 w-3 h-3 rounded-full border border-black shadow-[0_0_10px_#00ff00]', iconSize: [12,12] })} eventHandlers={{ click: (e) => handleSpotClick(spot, e) }} />
            </React.Fragment>
          ))}
          
          {/* Danger Zones */}
          {dangerZones.map(zone => (
            <Marker key={zone.id} position={[zone.location.lat, zone.location.lng]} icon={createDangerIcon(zone.type)} eventHandlers={{ click: () => handleDangerClick(zone) }} />
          ))}
          
          {/* SIMPLE CREATION RENDERING */}
          {isCreating && newSpotPoints.length > 0 && (
            <>
                <Polyline 
                positions={newSpotPoints.map(p => [p.lat, p.lng])} 
                pathOptions={{ color: '#FF0033', weight: 5, dashArray: '10, 10' }} 
                />
                {newSpotPoints.map((point, index) => (
                <Marker
                    key={index}
                    position={[point.lat, point.lng]}
                    icon={L.divIcon({
                    html: `<div style="background:${index === 0 ? '#10b981' : '#3b82f6'}; width:${index === 0 ? '16px' : '10px'}; height:${index === 0 ? '16px' : '10px'}; border-radius:50%; border:2px solid white; box-shadow:0 0 12px rgba(0,0,0,0.7);"></div>`,
                    iconSize: [index === 0 ? 16 : 10, index === 0 ? 16 : 10],
                    iconAnchor: [index === 0 ? 8 : 5, index === 0 ? 8 : 5],
                    })}
                />
                ))}
            </>
          )}

          <RecenterBtn coords={userLocation} requestLocation={requestLocation} />
        </MapContainer>
      </div>

      {renderToast()}
      {view === 'map' && renderSearchButton()}
      {view === 'map' && renderNotificationButton()}
      {renderCreateModeOverlay()}
      
      <SpotDetail 
        selectedSpot={selectedSpot} currentUser={currentUser} isEditingSpot={app.isEditingSpot} setIsEditingSpot={app.setIsEditingSpot}
        editSpotName={app.editSpotName} setEditSpotName={app.setEditSpotName} handleSaveSpotEdit={app.handleSaveSpotEdit}
        handleDeleteSpot={app.handleDeleteSpot} handleLikeSpot={app.handleLikeSpot} setSelectedSpot={setSelectedSpot}
        setShowShareModal={app.setShowShareModal} startChallenge={app.startChallenge} t={t}
        spotDetailTab={app.spotDetailTab} setSpotDetailTab={app.setSpotDetailTab} commentText={app.commentText} setCommentText={app.setCommentText}
        handlePostComment={app.handlePostComment} triggerRunUpload={app.triggerRunUpload} handleRunFileChange={app.handleRunFileChange}
        handleDeleteRun={app.handleDeleteRun} videoUploadInputRef={app.videoUploadInputRef} setActiveVideo={setActiveVideo}
      />
      
      {app.showShareModal && selectedSpot && (
        <div className="absolute inset-0 z-[600] bg-black/80 flex items-center justify-center p-6" onClick={() => app.setShowShareModal(false)}>
           <GlassCard className="w-full max-w-sm" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
               <button onClick={app.handleCopyLink} className="w-full py-3 border border-zinc-700 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 dark:text-white text-black">
                  <Icons.Share size={18} /> {t('copyLink')}
               </button>
           </GlassCard>
        </div>
      )}
      
      {renderDangerTools()}
      
      {view === 'leaderboard' && <LeaderboardPanel setView={setView} t={t} currentUser={currentUser} openProfile={app.openProfile} mockOtherUsers={app.mockOtherUsers} calculateUserRating={app.calculateUserRating} spots={spots} />}
      {view === 'profile' && <ProfilePanel setView={setView} t={t} currentUser={currentUser} viewingProfileUser={app.viewingProfileUser} setEditProfileData={app.setEditProfileData} handleUnfriend={app.handleUnfriend} handleAcceptFriendRequest={app.handleAcceptFriendRequest} handleSendFriendRequest={app.handleSendFriendRequest} spots={spots} calculateUserRating={app.calculateUserRating} handleSpotClick={handleSpotClick} setFlyToTarget={setFlyToTarget} />}
      {view === 'settings' && <SettingsPanel setView={setView} t={t} currentUser={currentUser} fileInputRef={app.fileInputRef} handleAvatarFileChange={app.handleAvatarFileChange} editProfileData={app.editProfileData} setEditProfileData={app.setEditProfileData} saveProfile={app.saveProfile} lang={lang} toggleLanguage={toggleLanguage} theme={theme} toggleTheme={toggleTheme} handleLogout={app.handleLogout} handleDeleteAccount={app.handleDeleteAccount} />}
      {view === 'search' && <SearchPanel setView={setView} t={t} spots={spots} mockOtherUsers={app.mockOtherUsers} searchQuery={app.searchQuery} setSearchQuery={app.setSearchQuery} setFlyToTarget={setFlyToTarget} handleSpotClick={handleSpotClick} openProfile={app.openProfile} />}
      {view === 'notifications' && <NotificationsPanel setView={setView} t={t} notifications={notifications} handleAcceptFriendRequest={app.handleAcceptFriendRequest} handleDeclineFriendRequest={app.handleDeclineFriendRequest} setFlyToTarget={setFlyToTarget} setSelectedSpot={setSelectedSpot} />}
      {view === 'chats' && <ChatsListPanel setView={setView} t={t} currentUser={currentUser} messages={app.messages} openChat={app.openChat} mockOtherUsers={app.mockOtherUsers} />}
      {view === 'chat' && <ChatDetailPanel setView={setView} activeChatUser={app.activeChatUser} messages={app.messages} currentUser={currentUser} chatInput={app.chatInput} setChatInput={app.setChatInput} handleSendMessage={app.handleSendMessage} t={t} />}

      {view === 'map' && !isCreating && renderBottomNav()}
    </div>
  );
};
