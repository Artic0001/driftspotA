

import React, { useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { Avatar } from './UIComponents';
import { User, Message } from '../types';

export const ChatsListPanel = ({ setView, t, currentUser, messages, openChat, mockOtherUsers }: any) => {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col h-full w-full" style={{ height: 'var(--app-height, 100vh)' }}>
      <div className="p-6 pt-12 shrink-0 flex justify-between items-center bg-black/90 backdrop-blur-sm border-b border-white/10">
         <h1 className="text-3xl font-display font-bold">{t('chats')}</h1>
         <button onClick={() => setView('map')} className="p-2 bg-white/5 rounded-full hover:bg-white/20"><Icons.Close size={24} /></button>
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
                 <div key={friendId} onClick={() => openChat(friendId)} className="flex items-center p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                    <div className="relative">
                      <Avatar src={friend.avatarUrl} size="md" />
                      {/* Mock online status for demo */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                       <div className="flex justify-between items-baseline">
                          <div className="font-bold truncate text-white">{friend.username}</div>
                          {lastMessage && <div className="text-[10px] text-zinc-500">{new Date(lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>}
                       </div>
                       <div className="text-sm text-zinc-500 truncate">
                          {lastMessage ? (
                              <span className={lastMessage.isRead ? 'text-zinc-600' : 'text-zinc-400'}>
                                  {lastMessage.senderId === 'me' && <span className="text-zinc-600">You: </span>}
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
        <div className="fixed inset-0 z-50 bg-black flex flex-col h-full w-full" style={{ height: 'var(--app-height, 100vh)' }}>
            {/* Header */}
            <div className="p-4 pt-12 border-b border-white/10 flex items-center gap-4 shrink-0 bg-black/90 backdrop-blur-sm">
                <button onClick={() => setView('chats')} className="p-2 bg-white/5 rounded-full hover:bg-white/20 text-white">
                    <Icons.Nav size={20} className="-rotate-90" />
                </button>
                <div className="flex items-center gap-3">
                    <Avatar src={activeChatUser.avatarUrl} size="sm" />
                    <div>
                        <div className="font-bold text-white">{activeChatUser.username}</div>
                        <div className="text-xs text-zinc-500">{activeChatUser.carModel}</div>
                    </div>
                </div>
            </div>

            {/* Messages Area - Flex Grow */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {userMessages.length > 0 ? (
                    userMessages.map((msg: Message) => (
                        <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-3 rounded-2xl ${msg.senderId === 'me' ? 'bg-neon-red text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none'}`}>
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
            <div className="p-4 bg-black/90 border-t border-white/10 shrink-0">
                <div className="flex gap-2">
                    <input 
                        className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white w-full focus:border-neon-red outline-none placeholder-zinc-600"
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