
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

// Fix Leaflet Default Icon issue in React
const iconPerson = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom Avatar Marker for User on Map
const createAvatarIcon = (url: string) => L.divIcon({
  className: 'avatar-marker',
  html: `<div style="background-image: url('${url}'); background-size: cover; background-position: center; width: 40px; height: 40px; border-radius: 50%; border: 3px solid #FF0033; box-shadow: 0 0 15px rgba(255, 0, 51, 0.6); overflow: hidden;"></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Danger Icons
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
    isLoggedIn, authMode, setAuthMode, authForm, setAuthForm, handleAuth, lang, t, toggleLanguage,
    showDisclaimer, setShowDisclaimer, currentUser, view, setView, spots, selectedSpot, setSelectedSpot,
    flyToTarget, dangerZones, isCreating, newSpotPoints, creationWaypoints, userLocation, handleMapClick,
    handleSpotClick, handleDangerClick, startCreating, finishCreating, newSpotName, setNewSpotName, isProcessingRoute,
    addingDanger, setAddingDanger, toast, setToast, setFlyToTarget, notifications,
    selectedDangerZone, setSelectedDangerZone, handleDeleteDanger, dangerCommentText, setDangerCommentText, handleCommentDanger,
    activeVideo, setActiveVideo, showChallenge, setShowChallenge, analysisResult, isRecording, isAnalyzing, handleRecordToggle, handleFileUpload,
    videoUploadInputRef, handleRunFileChange, triggerRunUpload, locationError, requestLocation, unreadCount, markAllAsRead,
    theme, toggleTheme
  } = app;

  useEffect(() => {
    if (view === 'notifications') {
      markAllAsRead();
    }
  }, [view, markAllAsRead]);

  if (!isLoggedIn) {
      return (
        <AuthView 
          authMode={authMode} setAuthMode={setAuthMode}
          authForm={authForm} setAuthForm={setAuthForm}
          handleAuth={handleAuth} lang={lang} toggleLanguage={toggleLanguage} t={t}
        />
      );
  }

  // --- Renderers (Small UI Helpers) ---
  const renderSearchButton = () => (
    <div className="absolute top-4 left-4 z-[400] flex gap-2">
      <button 
        onClick={() => setView('search')}
        className="p-3 bg-glass-black dark:bg-black/60 bg-white/80 rounded-full border dark:border-white/20 border-black/10 dark:text-white text-black shadow-lg active:scale-90 transition-transform"
      >
        <Icons.Search className="w-6 h-6" />
      </button>
      <button 
        onClick={() => {
           if (addingDanger) setAddingDanger(null);
           else setAddingDanger(DangerType.POLICE); 
        }}
        className={`p-3 rounded-full border shadow-lg active:scale-90 transition-transform ${addingDanger ? 'bg-neon-red border-neon-red text-white' : 'dark:bg-black/60 bg-white/80 dark:border-white/20 border-black/10 dark:text-white text-black'}`}
      >
        <Icons.Alert className="w-6 h-6" />
      </button>
    </div>
  );

  const renderNotificationButton = () => (
    <div className="absolute top-4 right-4 z-[400]">
      <button 
        onClick={() => {
          setView('notifications');
        }}
        className="relative p-3 dark:bg-black/60 bg-white/80 rounded-full border dark:border-white/20 border-black/10 dark:text-white text-black shadow-lg active:scale-90 transition-transform"
      >
        <Icons.Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <div className="absolute top-0 right-0 w-3 h-3 bg-neon-red rounded-full border-2 border-black flex items-center justify-center animate-pulse">
          </div>
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
            {isProcessingRoute ? <div className="text-xs text-zinc-500">{t('calculating')}</div> : <div className="text-xs text-zinc-500">{t('tapPoints')}</div>}
            <input 
              className="bg-transparent border-b dark:border-white/20 border-black/20 text-center dark:text-white text-black placeholder-zinc-500 focus:outline-none focus:border-neon-red pb-2 w-48"
              placeholder={t('spotNamePlaceholder')}
              value={newSpotName}
              onChange={(e) => setNewSpotName(e.target.value)}
            />
            <div className="flex gap-2">
               <button onClick={() => { app.setIsCreating(false); setView('map'); }} className="px-4 py-2 dark:bg-zinc-800 bg-zinc-200 rounded-lg text-xs font-bold dark:text-white text-black hover:opacity-80">{t('cancel')}</button>
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

  const renderShareModal = () => {
    if (!app.showShareModal || !selectedSpot) return null;
    return (
      <div className="absolute inset-0 z-[600] bg-black/80 flex items-center justify-center p-6 animate-fade-in" onClick={() => app.setShowShareModal(false)}>
         <GlassCard className="w-full max-w-sm" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 dark:text-white text-black">{t('shareWith')}</h3>
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
               {currentUser.friends.length > 0 ? (
                  currentUser.friends.map(fid => {
                     const friend = app.mockOtherUsers.find(u => u.id === fid);
                     if (!friend) return null;
                     return (
                        <div key={fid} onClick={() => app.handleSendSpotToFriend(fid)} className="flex items-center p-3 rounded-lg dark:bg-white/5 bg-black/5 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer">
                           <Avatar src={friend.avatarUrl} size="sm" />
                           <span className="ml-3 font-bold dark:text-white text-black">{friend.username}</span>
                           <Icons.Send className="ml-auto text-zinc-500" size={16} />
                        </div>
                     );
                  })
               ) : (
                  <div className="text-zinc-500 italic text-center p-4">No friends added yet.</div>
               )}
            </div>
            <button onClick={app.handleCopyLink} className="w-full py-3 border border-zinc-700 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 dark:text-white text-black">
               <Icons.Share size={18} /> {t('copyLink')}
            </button>
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
           {toast.type === NotificationType.DANGER_NEARBY && <Icons.Alert className="text-neon-red mr-4" size={24} />}
           {toast.type === NotificationType.SPOT_NEARBY && <Icons.Map className="text-green-400 mr-4" size={24} />}
           {toast.type === NotificationType.FRIEND_REQUEST && <Icons.UserPlus className="text-blue-400 mr-4" size={24} />}
           {toast.type === NotificationType.SYSTEM && <Icons.Check className="dark:text-white text-black mr-4" size={24} />}
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

      {/* Warning if location error */}
      {locationError && !showDisclaimer && (
          <div className="absolute top-20 left-6 right-6 z-[800] animate-slide-in pointer-events-none">
             <div className="bg-red-900/80 border border-red-500 rounded-xl p-4 text-center pointer-events-auto shadow-lg backdrop-blur-md">
                <Icons.Alert className="mx-auto mb-2 text-white" />
                <div className="text-sm font-bold text-white mb-2">{t('locationNeeded')}</div>
                <button onClick={requestLocation} className="text-xs bg-white text-red-900 px-3 py-1 rounded font-bold uppercase">{t('enableLocation')}</button>
             </div>
          </div>
      )}

      {/* Map Layer */}
      <div className={`absolute inset-0 z-0 ${view !== 'map' && view !== 'create' ? 'invisible' : 'visible'}`}>
        <MapContainer center={userLocation ? [userLocation.lat, userLocation.lng] : [40.7128, -74.0060]} zoom={14} zoomControl={false} style={{ height: '100%', width: '100%', background: theme === 'dark' ? '#000' : '#e4e4e7' }}>
          <TileLayer attribution='&copy; OpenStreetMap' url={tileLayerUrl} />
          <MapEvents onMapClick={handleMapClick} />
          <MapController target={flyToTarget} userLoc={userLocation} />
          {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} icon={createAvatarIcon(currentUser.avatarUrl)} />}
          {spots.map(spot => (
            <React.Fragment key={spot.id}>
              <Polyline positions={spot.points.map(p => [p.lat, p.lng])} pathOptions={{ color: selectedSpot?.id === spot.id ? (theme === 'dark' ? '#fff' : '#000') : '#FF0033', weight: selectedSpot?.id === spot.id ? 8 : 4, opacity: selectedSpot?.id === spot.id ? 1 : 0.6, lineCap: 'round', className: 'drop-shadow-[0_0_10px_rgba(255,0,51,0.5)] transition-all duration-300 pointer-events-none' }} />
              <Polyline positions={spot.points.map(p => [p.lat, p.lng])} pathOptions={{ color: 'transparent', weight: 40, opacity: 0, className: 'cursor-pointer' }} eventHandlers={{ click: (e) => handleSpotClick(spot, e) }} />
              <Marker position={[spot.points[0].lat, spot.points[0].lng]} icon={L.divIcon({ className: 'bg-green-500 w-3 h-3 rounded-full border border-black shadow-[0_0_10px_#00ff00]', iconSize: [12,12] })} eventHandlers={{ click: (e) => handleSpotClick(spot, e) }} />
            </React.Fragment>
          ))}
          {dangerZones.map(zone => (
            <Marker key={zone.id} position={[zone.location.lat, zone.location.lng]} icon={createDangerIcon(zone.type)} eventHandlers={{ click: () => handleDangerClick(zone) }} />
          ))}
          {isCreating && (
            <>
              {newSpotPoints.length > 1 && <Polyline positions={newSpotPoints.map(p => [p.lat, p.lng])} pathOptions={{ color: theme === 'dark' ? '#fff' : '#000', weight: 4, dashArray: '1, 10' }} />}
              {creationWaypoints.map((p, idx) => <Marker key={idx} position={[p.lat, p.lng]} icon={L.divIcon({ className: idx === 0 ? 'bg-green-500 w-4 h-4 rounded-full border-2 border-white' : 'bg-blue-500 w-3 h-3 rounded-full border border-white', iconSize: [12,12] })} />)}
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
      
      {renderShareModal()}
      {renderDangerTools()}
      
      {selectedDangerZone && (
        <div className="absolute bottom-4 left-4 right-4 z-[500] animate-slide-up">
           <GlassCard className="border-l-4 border-l-yellow-500 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-500/20 rounded-full border border-yellow-500 text-yellow-500">
                       {selectedDangerZone.type === DangerType.POLICE ? <Icons.Siren size={24}/> : selectedDangerZone.type === DangerType.CAMERA ? <Icons.Camera size={24}/> : <Icons.Pothole size={24}/>}
                    </div>
                    <div>
                       <h3 className="text-xl font-bold uppercase dark:text-white text-black">{selectedDangerZone.type === DangerType.POLICE ? t('police') : selectedDangerZone.type === DangerType.CAMERA ? t('camera') : t('pothole')}</h3>
                       <div className="text-xs text-zinc-500">Reported {new Date(selectedDangerZone.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                 </div>
                 <div className="flex gap-2">
                   {selectedDangerZone.reportedBy === currentUser.id && (
                      <button onClick={handleDeleteDanger} className="p-2 bg-zinc-800 rounded-full text-red-500 hover:bg-red-900/20"><Icons.Trash size={18} /></button>
                   )}
                   <button onClick={() => setSelectedDangerZone(null)} className="p-2 dark:bg-zinc-800 bg-zinc-200 rounded-full dark:text-zinc-400 text-zinc-600 hover:text-black dark:hover:text-white"><Icons.Close size={18} /></button>
                 </div>
              </div>
              <div className="dark:bg-black/40 bg-zinc-100 rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
                 {selectedDangerZone.comments && selectedDangerZone.comments.length > 0 ? (
                    selectedDangerZone.comments.map(c => (
                       <div key={c.id} className="text-xs">
                          <span className="font-bold dark:text-zinc-400 text-zinc-600">{c.username}:</span> <span className="dark:text-zinc-500 text-zinc-800">{c.text}</span>
                       </div>
                    ))
                 ) : (
                    <div className="text-xs text-zinc-600 italic">No updates yet.</div>
                 )}
              </div>
              <div className="flex gap-2">
                 <input className="dark:bg-black bg-white border dark:border-zinc-700 border-zinc-300 rounded-lg px-3 py-2 text-sm w-full focus:border-yellow-500 outline-none dark:text-white text-black" placeholder="Add update..." value={dangerCommentText} onChange={(e) => setDangerCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCommentDanger()} />
                 <button onClick={handleCommentDanger} className="p-2 dark:bg-zinc-800 bg-zinc-200 rounded-lg dark:hover:bg-zinc-700 hover:bg-zinc-300 text-yellow-500"><Icons.Send size={16} /></button>
              </div>
           </GlassCard>
        </div>
      )}

      {activeVideo && (
        <div className="absolute inset-0 z-[5000] bg-black flex items-center justify-center">
           <video src={activeVideo} controls autoPlay className="w-full h-full object-contain" />
           <button onClick={() => setActiveVideo(null)} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20"><Icons.Close size={32} /></button>
        </div>
      )}

      {/* Overlays - Conditional Rendering */}
      {view === 'leaderboard' && <LeaderboardPanel setView={setView} t={t} currentUser={currentUser} openProfile={app.openProfile} mockOtherUsers={app.mockOtherUsers} calculateUserRating={app.calculateUserRating} spots={spots} />}
      {view === 'profile' && <ProfilePanel setView={setView} t={t} currentUser={currentUser} viewingProfileUser={app.viewingProfileUser} setEditProfileData={app.setEditProfileData} handleUnfriend={app.handleUnfriend} handleAcceptFriendRequest={app.handleAcceptFriendRequest} handleSendFriendRequest={app.handleSendFriendRequest} spots={spots} calculateUserRating={app.calculateUserRating} handleSpotClick={handleSpotClick} setFlyToTarget={setFlyToTarget} />}
      {view === 'settings' && <SettingsPanel setView={setView} t={t} currentUser={currentUser} fileInputRef={app.fileInputRef} handleAvatarFileChange={app.handleAvatarFileChange} editProfileData={app.editProfileData} setEditProfileData={app.setEditProfileData} saveProfile={app.saveProfile} lang={lang} toggleLanguage={toggleLanguage} theme={theme} toggleTheme={toggleTheme} handleLogout={app.handleLogout} handleDeleteAccount={app.handleDeleteAccount} />}
      {view === 'search' && <SearchPanel setView={setView} t={t} spots={spots} mockOtherUsers={app.mockOtherUsers} searchQuery={app.searchQuery} setSearchQuery={app.setSearchQuery} setFlyToTarget={setFlyToTarget} handleSpotClick={handleSpotClick} openProfile={app.openProfile} />}
      {view === 'notifications' && <NotificationsPanel setView={setView} t={t} notifications={notifications} handleAcceptFriendRequest={app.handleAcceptFriendRequest} handleDeclineFriendRequest={app.handleDeclineFriendRequest} setFlyToTarget={setFlyToTarget} setSelectedSpot={setSelectedSpot} />}
      
      {view === 'chats' && <ChatsListPanel setView={setView} t={t} currentUser={currentUser} messages={app.messages} openChat={app.openChat} mockOtherUsers={app.mockOtherUsers} />}
      {view === 'chat' && <ChatDetailPanel setView={setView} activeChatUser={app.activeChatUser} messages={app.messages} currentUser={currentUser} chatInput={app.chatInput} setChatInput={app.setChatInput} handleSendMessage={app.handleSendMessage} t={t} />}
      {view === 'friends' && <ChatsListPanel setView={setView} t={t} currentUser={currentUser} messages={app.messages} openChat={app.openChat} mockOtherUsers={app.mockOtherUsers} />}

      {view === 'map' && !isCreating && renderBottomNav()}

      {showChallenge && selectedSpot && (
        <div className="absolute inset-0 z-[3000] bg-black/90 flex flex-col items-center justify-center p-6 animate-fade-in">
           {analysisResult ? (
             <div className="w-full max-w-md animate-scale-in">
                <GlassCard className="border-neon-red shadow-[0_0_50px_rgba(255,0,51,0.3)]">
                  <div className="text-center mb-6">
                    <h2 className="text-4xl font-display font-bold text-white mb-2">{analysisResult.score} PTS</h2>
                    <div className="text-neon-red font-bold text-xl uppercase tracking-widest">{analysisResult.difficulty}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl mb-6 text-center italic text-zinc-300">"{analysisResult.commentary}"</div>
                  <NeonButton onClick={() => setShowChallenge(false)} className="w-full">Done</NeonButton>
                </GlassCard>
             </div>
           ) : (
             <div className="w-full max-w-md text-center">
                <h2 className="text-2xl font-display font-bold mb-8">{selectedSpot.name}</h2>
                {isRecording ? (
                   <div className="mb-8 relative">
                      <div className="w-32 h-32 rounded-full border-4 border-neon-red flex items-center justify-center mx-auto animate-pulse">
                         <Icons.Record size={48} className="text-neon-red animate-pulse" />
                      </div>
                      <div className="mt-4 text-neon-red font-bold animate-pulse">RECORDING...</div>
                   </div>
                ) : (
                   <div className="mb-8">
                      <div className="text-6xl font-display font-bold text-white mb-2">GO!</div>
                      <p className="text-zinc-500">Drive the line to score points</p>
                   </div>
                )}
                {!isRecording && !isAnalyzing && (
                  <NeonButton onClick={handleRecordToggle} className="w-full mb-4 py-6 text-xl">START</NeonButton>
                )}
                {isRecording && (
                   <NeonButton onClick={handleRecordToggle} className="w-full mb-4 py-6 text-xl bg-zinc-800 border-zinc-600">FINISH RUN</NeonButton>
                )}
                {!isRecording && (
                  <label className="block w-full p-4 border border-dashed border-white/20 rounded-xl text-center text-zinc-400 cursor-pointer hover:bg-white/5 transition-all">
                       <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                       <div className="flex flex-col items-center gap-2">
                          <Icons.Camera size={24} />
                          <span>Select from Gallery</span>
                       </div>
                  </label>
                )}
                {isAnalyzing && (
                   <div className="mt-8 flex flex-col items-center">
                      <div className="w-8 h-8 border-4 border-neon-red border-t-transparent rounded-full animate-spin mb-4"></div>
                      <div className="text-zinc-400 animate-pulse">AI Analyzing Line...</div>
                   </div>
                )}
                <button onClick={() => setShowChallenge(false)} className="mt-8 text-zinc-500 hover:text-white">{t('cancel')}</button>
             </div>
           )}
        </div>
      )}
    </div>
  );
};
