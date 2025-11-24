
import React from 'react';
import { Icons } from './Icons';
import { Difficulty } from '../types';

interface SpotDetailProps {
  selectedSpot: any;
  currentUser: any;
  isEditingSpot: boolean;
  setIsEditingSpot: (val: boolean) => void;
  editSpotName: string;
  setEditSpotName: (val: string) => void;
  handleSaveSpotEdit: () => void;
  handleDeleteSpot: () => void;
  handleLikeSpot: () => void;
  setSelectedSpot: (spot: any) => void;
  setShowShareModal: (val: boolean) => void;
  startChallenge: () => void;
  t: (key: string) => string;
  spotDetailTab: 'info' | 'runs';
  setSpotDetailTab: (val: 'info' | 'runs') => void;
  commentText: string;
  setCommentText: (val: string) => void;
  handlePostComment: () => void;
  triggerRunUpload: () => void;
  handleRunFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteRun: (id: string) => void;
  videoUploadInputRef: React.RefObject<HTMLInputElement | null>;
  setActiveVideo: (url: string) => void;
}

export const SpotDetail: React.FC<SpotDetailProps> = ({
  selectedSpot, currentUser, isEditingSpot, setIsEditingSpot, editSpotName, setEditSpotName,
  handleSaveSpotEdit, handleDeleteSpot, handleLikeSpot, setSelectedSpot, setShowShareModal,
  startChallenge, t, spotDetailTab, setSpotDetailTab, commentText, setCommentText, handlePostComment,
  triggerRunUpload, handleRunFileChange, handleDeleteRun, videoUploadInputRef, setActiveVideo
}) => {
  if (!selectedSpot) return null;

  const isCreator = selectedSpot.creatorId === currentUser.id;
  const isLiked = selectedSpot.likedBy.includes(currentUser.id);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[500] max-h-[85vh] flex flex-col justify-end pointer-events-none">
      <div className="w-full bg-black/95 backdrop-blur-xl border-t border-neon-red rounded-t-3xl p-6 pointer-events-auto animate-slide-up overflow-hidden flex flex-col max-h-[80vh]">
         {/* Handle Bar */}
         <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-4 shrink-0"></div>

         {/* Header */}
         <div className="flex justify-between items-start mb-6 shrink-0">
            <div>
               {isEditingSpot ? (
                  <div className="flex items-center gap-2">
                     <input className="bg-transparent border-b border-white text-2xl font-bold font-display w-full" value={editSpotName} onChange={(e) => setEditSpotName(e.target.value)} />
                     <button onClick={handleSaveSpotEdit} className="p-2 bg-green-600 rounded-full"><Icons.Check size={16}/></button>
                  </div>
               ) : (
                  <h2 className="text-3xl font-display font-bold text-white flex items-center gap-2">
                     {selectedSpot.name}
                     {isCreator && <button onClick={() => setIsEditingSpot(true)} className="text-zinc-500 hover:text-white"><Icons.Edit size={16} /></button>}
                  </h2>
               )}
               <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                  <span>By {selectedSpot.creatorName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${selectedSpot.difficulty === Difficulty.EASY ? 'border-green-500 text-green-500' : selectedSpot.difficulty === Difficulty.MEDIUM ? 'border-yellow-500 text-yellow-500' : selectedSpot.difficulty === Difficulty.HARD ? 'border-orange-500 text-orange-500' : 'border-red-600 text-red-600 bg-red-600/10'}`}>
                    {selectedSpot.difficulty}
                  </span>
               </div>
            </div>
            <div className="flex flex-col gap-2">
               <button onClick={() => setSelectedSpot(null)} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white self-end">
                  <Icons.Close size={20} />
               </button>
               {isCreator && (
                   <button onClick={handleDeleteSpot} className="p-2 bg-zinc-900 rounded-full text-red-500 hover:bg-red-900/20 self-end border border-red-900/30">
                      <Icons.Trash size={16} />
                   </button>
               )}
            </div>
         </div>

         {/* Stats Row */}
         <div className="flex gap-4 mb-6 shrink-0">
            <button onClick={handleLikeSpot} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${isLiked ? 'bg-neon-red text-white shadow-[0_0_15px_rgba(255,0,51,0.4)]' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
               <Icons.Heart size={20} fill={isLiked ? "currentColor" : "none"} /> {selectedSpot.likes}
            </button>
            <button onClick={() => setShowShareModal(true)} className="flex-1 py-3 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 rounded-xl flex items-center justify-center gap-2 font-bold">
               <Icons.Share size={20} /> {t('share')}
            </button>
            <button onClick={startChallenge} className="flex-[2] py-3 bg-white text-black hover:bg-gray-200 rounded-xl flex items-center justify-center gap-2 font-display font-black uppercase tracking-wider">
               <Icons.Car size={20} /> {t('startRun')}
            </button>
         </div>

         {/* Tabs */}
         <div className="flex border-b border-white/10 mb-4 shrink-0">
            <button onClick={() => setSpotDetailTab('info')} className={`flex-1 pb-3 text-sm font-bold uppercase tracking-widest ${spotDetailTab === 'info' ? 'text-neon-red border-b-2 border-neon-red' : 'text-zinc-500'}`}>{t('info')}</button>
            <button onClick={() => setSpotDetailTab('runs')} className={`flex-1 pb-3 text-sm font-bold uppercase tracking-widest ${spotDetailTab === 'runs' ? 'text-neon-red border-b-2 border-neon-red' : 'text-zinc-500'}`}>{t('runs')}</button>
         </div>

         {/* Scrollable Content */}
         <div className="overflow-y-auto flex-1 pb-10">
            {spotDetailTab === 'info' ? (
               <div className="space-y-4">
                  {/* Comments */}
                  <div className="bg-zinc-900/50 rounded-xl p-4">
                     <h3 className="font-bold text-zinc-400 mb-3 text-sm uppercase">{t('comments')} ({selectedSpot.comments})</h3>
                     <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                        {selectedSpot.commentsList && selectedSpot.commentsList.length > 0 ? (
                           selectedSpot.commentsList.map((c: any) => (
                              <div key={c.id} className="text-sm">
                                 <span className="font-bold text-zinc-300">{c.username}: </span>
                                 <span className="text-zinc-400">{c.text}</span>
                              </div>
                           ))
                        ) : (
                           <div className="text-zinc-600 text-sm italic">{t('noChat')}</div>
                        )}
                     </div>
                     <div className="flex gap-2">
                        <input 
                          className="bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm w-full focus:border-neon-red outline-none" 
                          placeholder={t('writeComment')}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                        />
                        <button onClick={handlePostComment} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700">
                           <Icons.Send size={16} />
                        </button>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="space-y-4">
                  <button onClick={triggerRunUpload} className="w-full py-4 border-2 border-dashed border-zinc-700 hover:border-white/50 rounded-xl flex items-center justify-center gap-2 text-zinc-500 hover:text-white transition-all group">
                     <Icons.Plus size={20} className="group-hover:scale-110 transition-transform"/> {t('uploadRun')}
                  </button>
                  <input type="file" ref={videoUploadInputRef} className="hidden" accept="video/*" onChange={handleRunFileChange} />
                  
                  {selectedSpot.runs.length > 0 ? (
                     selectedSpot.runs.map((run: any) => (
                        <div key={run.id} className="flex items-center gap-4 bg-zinc-900/50 p-3 rounded-xl">
                           <div className="relative cursor-pointer" onClick={() => run.videoUrl && setActiveVideo(run.videoUrl)}>
                              <div className="w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
                                 {run.thumbnailUrl ? <img src={run.thumbnailUrl} className="w-full h-full object-cover" /> : <Icons.Car size={24} className="text-zinc-600"/>}
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30"><Icons.Check size={16} className="text-white"/></div>
                           </div>
                           <div className="flex-1">
                              <div className="flex justify-between">
                                 <div className="font-bold text-white">{run.score} PTS</div>
                                 {run.userId === currentUser.id && (
                                     <button onClick={() => handleDeleteRun(run.id)} className="text-zinc-600 hover:text-red-500"><Icons.Trash size={14}/></button>
                                 )}
                              </div>
                              <div className="text-xs text-zinc-400">{run.username} • {run.carModel}</div>
                              <div className="text-xs text-zinc-500 mt-1">{new Date(run.timestamp).toLocaleDateString()}</div>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="text-center py-8 text-zinc-600 italic">{t('noRuns')}</div>
                  )}
               </div>
            )}
         </div>
      </div>
    </div>
  );
};
