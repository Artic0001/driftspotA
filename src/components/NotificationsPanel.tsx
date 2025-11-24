

import React from 'react';
import { Icons } from './Icons';
import { NotificationType, Spot, AppNotification, AppView } from '../types';

interface NotificationsPanelProps {
  setView: (view: AppView) => void;
  t: (key: string) => string;
  notifications: AppNotification[];
  handleAcceptFriendRequest: (id: string) => void;
  handleDeclineFriendRequest: (id: string) => void;
  setFlyToTarget: (coords: any) => void;
  setSelectedSpot: (spot: Spot) => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  setView, t, notifications, handleAcceptFriendRequest, handleDeclineFriendRequest, setFlyToTarget, setSelectedSpot 
}) => {
   return (
     <div className="fixed inset-0 z-50 bg-black flex flex-col h-full w-full">
        <div className="p-6 pt-12 shrink-0 flex justify-between items-center bg-black/90 backdrop-blur-sm border-b border-white/10">
           <h1 className="text-3xl font-display font-bold">{t('notifications')}</h1>
           <button onClick={() => setView('map')} className="p-2 bg-white/5 rounded-full hover:bg-white/20"><Icons.Close size={24} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 pb-32">
           <div className="space-y-2">
              {notifications.length > 0 ? (
                 notifications.map((notif: AppNotification) => (
                    <div key={notif.id} className={`p-4 rounded-xl border-l-4 ${notif.isRead ? 'bg-zinc-900 border-zinc-700' : 'bg-white/10 border-neon-red'}`}>
                       <div className="flex justify-between items-start mb-1">
                          <div className="font-bold text-sm">{notif.title}</div>
                          <div className="text-[10px] text-zinc-500">{new Date(notif.timestamp).toLocaleTimeString()}</div>
                       </div>
                       <div className="text-sm text-zinc-300 mb-2">{notif.message}</div>
                       
                       {/* Action Buttons based on type */}
                       {notif.type === NotificationType.FRIEND_REQUEST && notif.relatedId && (
                          <div className="flex gap-2 mt-2">
                             <button onClick={() => handleAcceptFriendRequest(notif.relatedId!)} className="px-3 py-1 bg-green-600 rounded text-xs font-bold">{t('accept')}</button>
                             <button onClick={() => handleDeclineFriendRequest(notif.relatedId!)} className="px-3 py-1 bg-zinc-700 rounded text-xs font-bold">{t('decline')}</button>
                          </div>
                       )}
                       {notif.type === NotificationType.SPOT_NEARBY && notif.data && (
                          <button onClick={() => { setView('map'); setFlyToTarget((notif.data as Spot).points[0]); setSelectedSpot(notif.data as Spot); }} className="px-3 py-1 bg-neon-red/20 text-neon-red border border-neon-red/50 rounded text-xs font-bold mt-1">
                             {t('driveHere')}
                          </button>
                       )}
                    </div>
                 ))
              ) : (
                 <div className="text-center text-zinc-600 py-10">{t('noNotifications')}</div>
              )}
           </div>
        </div>
     </div>
   );
};