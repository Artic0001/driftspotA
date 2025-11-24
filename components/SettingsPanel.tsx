
import React from 'react';
import { Icons } from './Icons';
import { NeonButton, NeonInput } from './UIComponents';
import { User, AppView } from '../types';
import { useSwipe } from '../hooks/useSwipe';

interface SettingsPanelProps {
  setView: (view: AppView) => void;
  t: (key: string) => string;
  currentUser: User;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleAvatarFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editProfileData: Partial<User>;
  setEditProfileData: React.Dispatch<React.SetStateAction<Partial<User>>>;
  saveProfile: () => void;
  lang: 'en' | 'ru';
  toggleLanguage: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  handleLogout: () => void;
  handleDeleteAccount: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  setView, t, currentUser, fileInputRef, handleAvatarFileChange, 
  editProfileData, setEditProfileData, saveProfile, lang, toggleLanguage, 
  theme, toggleTheme,
  handleLogout, handleDeleteAccount 
}) => {
    useSwipe({ onSwipeBack: () => setView('profile') });

    return (
        <div className="fixed inset-0 z-50 bg-black dark:bg-black bg-zinc-100 flex flex-col h-full w-full transition-colors duration-300" style={{ height: 'var(--app-height, 100vh)' }}>
            <div className="p-6 pt-12 shrink-0 flex items-center gap-3 border-b dark:border-white/10 border-black/10 bg-white/80 dark:bg-black/90 backdrop-blur-sm">
                 <button onClick={() => setView('profile')} className="p-2 dark:bg-white/5 bg-black/5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
                    <Icons.Nav size={20} className="-rotate-90 dark:text-white text-black" />
                 </button>
                 <h1 className="text-3xl font-display font-bold dark:text-white text-black">{t('settings')}</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pb-32">
                <div className="space-y-8">
                    <section>
                        <h3 className="text-zinc-500 uppercase text-xs font-bold mb-4 border-b dark:border-white/10 border-black/10 pb-2">{t('editProfile')}</h3>
                        
                        <div className="flex justify-center mb-6 relative">
                            <input type="file" ref={fileInputRef} onChange={handleAvatarFileChange} className="hidden" accept="image/*" />
                            <div onClick={() => fileInputRef.current?.click()} className="relative cursor-pointer group">
                                <div className="w-28 h-28 rounded-full border-2 dark:border-white/20 border-black/20 overflow-hidden bg-zinc-800">
                                    <img src={editProfileData.avatarUrl || currentUser.avatarUrl} alt="avatar" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Icons.Camera className="text-white opacity-80 group-hover:scale-110 transition-transform" size={32} />
                                </div>
                                <div className="text-center text-xs text-neon-red mt-3 font-bold">{t('changePhoto')}</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-zinc-500 uppercase ml-1 mb-1 block">{t('username')}</label>
                                <NeonInput value={editProfileData.username || ''} onChange={e => setEditProfileData(p => ({...p, username: e.target.value}))} />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 uppercase ml-1 mb-1 block">{t('carModel')}</label>
                                <NeonInput value={editProfileData.carModel || ''} onChange={e => setEditProfileData(p => ({...p, carModel: e.target.value}))} />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 uppercase ml-1 mb-1 block">{t('bio')}</label>
                                <NeonInput value={editProfileData.bio || ''} onChange={e => setEditProfileData(p => ({...p, bio: e.target.value}))} />
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <NeonButton onClick={saveProfile} className="w-full">{t('save')}</NeonButton>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-zinc-500 uppercase text-xs font-bold mb-4 border-b dark:border-white/10 border-black/10 pb-2">{t('general')}</h3>
                        
                        {/* Theme Toggle */}
                        <div className="flex justify-between items-center p-4 bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-transparent mb-3 shadow-sm">
                            <div className="flex items-center gap-3">
                                <Icons.Settings className="text-zinc-400" size={20} />
                                <span className="font-bold dark:text-white text-black">{t('theme')}</span>
                            </div>
                            <button onClick={toggleTheme} className="px-4 py-2 bg-zinc-100 dark:bg-black border dark:border-zinc-700 border-zinc-300 rounded-lg text-sm font-bold uppercase hover:border-black/20 dark:hover:border-white/40 transition-colors w-24 text-center dark:text-white text-black">
                                {theme === 'light' ? t('light') : t('dark')}
                            </button>
                        </div>

                        {/* Language Toggle */}
                        <div className="flex justify-between items-center p-4 bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-transparent shadow-sm">
                            <div className="flex items-center gap-3">
                                <Icons.Globe className="text-zinc-400" size={20} />
                                <span className="font-bold dark:text-white text-black">{t('language')}</span>
                            </div>
                            <button onClick={toggleLanguage} className="px-4 py-2 bg-zinc-100 dark:bg-black border dark:border-zinc-700 border-zinc-300 rounded-lg text-sm font-bold uppercase hover:border-black/20 dark:hover:border-white/40 transition-colors w-24 text-center dark:text-white text-black">
                                {lang === 'en' ? 'English' : 'Русский'}
                            </button>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-zinc-500 uppercase text-xs font-bold mb-4 border-b dark:border-white/10 border-black/10 pb-2">{t('account')}</h3>
                        <div className="space-y-3">
                            <button onClick={handleLogout} className="w-full p-4 bg-white dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl flex items-center gap-3 transition-colors dark:text-zinc-200 text-zinc-800 shadow-sm">
                                <Icons.Nav className="rotate-180 text-zinc-500" size={20} /> 
                                <span className="font-bold">{t('logout')}</span>
                            </button>

                            <div className="pt-4">
                                <div className="text-red-900 uppercase text-xs font-bold mb-2 ml-1">{t('dangerZone')}</div>
                                <button onClick={handleDeleteAccount} className="w-full p-4 border border-red-900/50 bg-red-500/10 hover:bg-red-500/20 rounded-xl flex items-center gap-3 transition-colors text-red-600 dark:text-red-500">
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
};
