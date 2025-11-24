
import React from 'react';

export const GlassCard = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: (e?: any) => void }) => (
  <div 
    onClick={onClick}
    className={`glass-panel rounded-2xl p-4 shadow-lg border-t backdrop-blur-md
      dark:bg-glass-black dark:text-white dark:border-white/10
      bg-white/80 text-black border-black/5
      transition-colors duration-300
      ${className}`}
  >
    {children}
  </div>
);

export const NeonButton = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger'; className?: string; disabled?: boolean; type?: 'button' | 'submit' | 'reset' }) => {
  const baseStyle = "relative overflow-hidden font-display font-bold uppercase tracking-wider py-3 px-6 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-neon-red text-white shadow-[0_0_15px_rgba(255,0,51,0.5)] hover:shadow-[0_0_25px_rgba(255,0,51,0.7)] border border-neon-red",
    secondary: "bg-transparent border dark:border-white/20 dark:text-white dark:hover:bg-white/10 border-black/20 text-black hover:bg-black/5",
    danger: "dark:bg-black bg-white border border-neon-red text-neon-red hover:bg-neon-red/10"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const NeonInput = ({ value, onChange, placeholder, className = '', type = 'text' }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; className?: string; type?: string }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full rounded-xl p-3 outline-none transition-all
      dark:bg-black/50 dark:border-white/20 dark:text-white dark:placeholder-zinc-500 dark:focus:border-neon-red
      bg-white border-zinc-300 text-black placeholder-zinc-400 focus:border-neon-red border
      focus:shadow-[0_0_10px_rgba(255,0,51,0.2)]
      ${className}`}
  />
);

export const Avatar: React.FC<{ 
  src?: string; 
  url?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl'; 
  className?: string 
}> = ({ src, url, size = 'md', className = '' }) => {
  const imageSrc = src || url || 'https://picsum.photos/200';
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-32 h-32'
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden dark:bg-zinc-800 bg-zinc-200 border dark:border-white/10 border-black/10 shrink-0 ${className}`}>
      <img 
        src={imageSrc} 
        alt="avatar" 
        className="w-full h-full object-cover block"
      />
    </div>
  );
};