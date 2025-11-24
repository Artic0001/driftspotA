import React from 'react';
import { GlassCard, NeonButton, NeonInput } from './UIComponents';
import { Icons } from './Icons';

interface AuthViewProps {
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  authForm: any;
  setAuthForm: React.Dispatch<React.SetStateAction<any>>;
  handleAuth: () => void;
  lang: 'en' | 'ru';
  toggleLanguage: () => void;
  t: (key: any) => string;
}

export const AuthView: React.FC<AuthViewProps> = ({
  authMode, setAuthMode, authForm, setAuthForm, handleAuth, lang, toggleLanguage, t
}) => {
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black opacity-80"></div>
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-neon-red blur-[150px] opacity-20"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
            <h1 className="text-5xl font-display font-black text-center mb-2 text-white tracking-tighter">DRIFT<span className="text-neon-red">SPOTS</span></h1>
            <p className="text-center text-zinc-400 mb-8 uppercase tracking-widest text-sm">The Streets Are Calling</p>

            <GlassCard className="border-t border-white/10 shadow-2xl">
                <div className="flex justify-center gap-8 mb-8 border-b border-white/10 pb-2">
                    <button onClick={() => setAuthMode('login')} className={`text-lg font-bold uppercase transition-colors ${authMode === 'login' ? 'text-neon-red' : 'text-zinc-500'}`}>{t('login')}</button>
                    <button onClick={() => setAuthMode('register')} className={`text-lg font-bold uppercase transition-colors ${authMode === 'register' ? 'text-neon-red' : 'text-zinc-500'}`}>{t('register')}</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-zinc-500 uppercase font-bold ml-1">Username</label>
                        <NeonInput value={authForm.username} onChange={e => setAuthForm((p: any) => ({...p, username: e.target.value}))} placeholder="Racer Name" />
                    </div>
                    <div>
                        <label className="text-xs text-zinc-500 uppercase font-bold ml-1">Password</label>
                        <NeonInput value={authForm.password} onChange={e => setAuthForm((p: any) => ({...p, password: e.target.value}))} placeholder="••••••••" />
                    </div>
                    
                    {authMode === 'register' && (
                        <div className="animate-slide-in">
                            <label className="text-xs text-zinc-500 uppercase font-bold ml-1">Car</label>
                            <NeonInput value={authForm.carModel} onChange={e => setAuthForm((p: any) => ({...p, carModel: e.target.value}))} placeholder="e.g. Nissan S13" />
                        </div>
                    )}

                    <NeonButton onClick={handleAuth} className="w-full mt-6" disabled={!authForm.username || !authForm.password}>
                        {authMode === 'login' ? t('loginBtn') : t('registerBtn')}
                    </NeonButton>
                </div>
            </GlassCard>
            
            <div className="text-center mt-8">
                <button onClick={toggleLanguage} className="text-zinc-600 hover:text-white text-xs uppercase font-bold flex items-center justify-center gap-2 mx-auto">
                    <Icons.Globe size={14} /> {lang === 'en' ? 'English' : 'Русский'}
                </button>
            </div>
        </div>
    </div>
  );
};
