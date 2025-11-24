
import React, { useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { Avatar } from './UIComponents';
import { User, Message } from '../types';
import { useSwipe } from '../hooks/useSwipe';

export const ChatsListPanel = ({ setView, t, currentUser, messages, openChat, mockOtherUsers }: any) => {
  useSwipe({ onSwipeBack: () => setView('map') });

  return (
    <div className="fixed inset-0 z-50 bg-zinc-100 dark:bg-black flex flex-col h-full w-full transition-colors duration-300" style={{ height: 'var(--app-height, 100vh)' }}>
      <div className="p-6 pt-12 shrink-0 flex justify-between items-center bg-white/80 dark:bg-black/90 backdrop-blur-sm border-b dark:border-white/10 border-black/10">
         <h1 className="text-3xl font-display font-bold dark:text-white text-black">{t('chats')}</h1>
         <button onClick={() => setView('map')} className="p-2 dark:bg-white/5 bg-black/5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 dark:text-white text-black"><Icons.Close size={24} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="space-y-2">
          {currentUser.friends.length > 0 ? (
             currentUser.friends.map((friendId: string) => {
               const friend = mockOtherUsers.find((u: User) => u.id === friendId);
               if (!friend) return null;
               const friendMessages = messages[friendId] || [];
               const lastMessage = friendMessages.length > 0 ? friendMessages[friendMessages.length - 1] : null;

               return (
                 <div key={friendId} onClick={() => openChat(friendId)} className="flex items-center p-4 bg-white dark:bg-white/5 rounded-xl cursor-pointer hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors shadow-sm">
                    <div className="relative">
                      <Avatar src={friend.avatarUrl} size="md" />
                      {/* Mock online status for demo */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 dark:border-black border-white"></div>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                       <div className="flex justify-between items-baseline">
                          <div className="font-bold truncate dark:text-white text-black">{friend.username}</div>
                          {lastMessage && <div className="text-[10px] text-zinc-500">{new Date(lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>}
                       </div>
                       <div className="text-sm text-zinc-500 truncate">
                          {lastMessage ? (
                              <span className={lastMessage.isRead ? 'text-zinc-500' : 'text-zinc-800 dark:text-zinc-300 font-bold'}>
                                  {lastMessage.senderId === 'me' && <span className="text-zinc-500 font-normal">You: </span>}
                                  {lastMessage.text}
                              </span>
                          ) : (
                              <span className="italic opacity-50">{t('noMessages')}</span>
                          )}
                       </div>
                    </div>
                 </div>
               );
             })
          ) : (
             <div className="flex flex-col items-center justify-center text-zinc-600 py-10">
                <Icons.UserPlus size={48} className="mb-4 opacity-50"/>
                <p>{t('addFriend')}</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ChatDetailPanel = ({ setView, activeChatUser, messages, currentUser, chatInput, setChatInput, handleSendMessage, t }: any) => {
    useSwipe({ onSwipeBack: () => setView('chats') });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const userMessages = activeChatUser ? (messages[activeChatUser.id] || []) : [];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [userMessages]);

    if (!activeChatUser) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center text-white" style={{ height: 'var(--app-height, 100vh)' }}>
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-4">Chat not found</h2>
                    <button onClick={() => setView('chats')} className="px-4 py-2 bg-neon-red rounded-lg">Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-zinc-100 dark:bg-black flex flex-col h-full w-full transition-colors duration-300" style={{ height: 'var(--app-height, 100vh)' }}>
            {/* Header */}
            <div className="p-4 pt-12 border-b dark:border-white/10 border-black/10 flex items-center gap-4 shrink-0 bg-white/80 dark:bg-black/90 backdrop-blur-sm">
                <button onClick={() => setView('chats')} className="p-2 dark:bg-white/5 bg-black/5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 dark:text-white text-black">
                    <Icons.Nav size={20} className="-rotate-90" />
                </button>
                <div className="flex items-center gap-3">
                    <Avatar src={activeChatUser.avatarUrl} size="sm" />
                    <div>
                        <div className="font-bold dark:text-white text-black">{activeChatUser.username}</div>
                        <div className="text-xs text-zinc-500">{activeChatUser.carModel}</div>
                    </div>
                </div>
            </div>

            {/* Messages Area - Flex Grow */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {userMessages.length > 0 ? (
                    userMessages.map((msg: Message) => (
                        <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-3 rounded-2xl ${msg.senderId === 'me' ? 'bg-neon-red text-white rounded-tr-none' : 'dark:bg-zinc-800 bg-white dark:text-zinc-200 text-black shadow-sm rounded-tl-none'}`}>
                                {msg.spotId && (
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/20">
                                        <Icons.Map size={12}/>
                                        <span className="text-xs font-bold uppercase">Shared Spot</span>
                                    </div>
                                )}
                                <div>{msg.text}</div>
                                <div className={`text-[10px] mt-1 text-right ${msg.senderId === 'me' ? 'text-white/70' : 'text-zinc-500'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                        <Icons.Comment size={48} className="mb-4 opacity-20" />
                        <p>{t('noMessages')}</p>
                        <p className="text-xs mt-2 opacity-50">Say hello!</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Shrink 0 */}
            <div className="p-4 bg-white dark:bg-black/90 border-t dark:border-white/10 border-black/10 shrink-0">
                <div className="flex gap-2">
                    <input 
                        className="dark:bg-zinc-900 bg-zinc-100 border dark:border-zinc-700 border-zinc-300 rounded-xl px-4 py-3 dark:text-white text-black w-full focus:border-neon-red outline-none placeholder-zinc-500"
                        placeholder={t('message')}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button onClick={handleSendMessage} disabled={!chatInput.trim()} className="p-3 bg-neon-red rounded-xl text-white disabled:opacity-50 disabled:bg-zinc-800 transition-all shadow-[0_0_15px_rgba(255,0,51,0.3)] hover:shadow-[0_0_25px_rgba(255,0,51,0.5)]">
                        <Icons.Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
