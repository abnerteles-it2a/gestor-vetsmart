import React from 'react';

interface KpiCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    subtext?: string;
    subtextColor?: string;
    isPrivacyMode?: boolean;
    variant?: 'standard' | 'primary';
    color?: 'blue' | 'green' | 'rose' | 'amber' | 'indigo' | 'slate';
}

export const KpiCard: React.FC<KpiCardProps> = ({ 
    title, 
    value, 
    icon, 
    subtext, 
    subtextColor, 
    isPrivacyMode,
    variant = 'standard',
    color = 'slate'
}) => {
    const isPrimary = variant === 'primary';

    // Semantic Color Tints with Contrast Equalization
    const colorSchemes = {
        blue: {
            bg: 'bg-blue-50/70 border-blue-100 dark:bg-slate-900 dark:border-blue-500/10',
            icon: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
            text: 'text-blue-700 dark:text-blue-300'
        },
        green: {
            bg: 'bg-emerald-50/70 border-emerald-100 dark:bg-slate-900 dark:border-emerald-500/10',
            icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
            text: 'text-emerald-700 dark:text-emerald-300'
        },
        rose: {
            bg: 'bg-rose-50/70 border-rose-100 dark:bg-slate-900 dark:border-rose-500/10',
            icon: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
            text: 'text-rose-700 dark:text-rose-300'
        },
        amber: {
            bg: 'bg-amber-50/70 border-amber-100 dark:bg-slate-900 dark:border-amber-500/10',
            icon: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
            text: 'text-amber-700 dark:text-amber-300'
        },
        indigo: {
            bg: 'bg-indigo-50/70 border-indigo-100 dark:bg-slate-900 dark:border-indigo-500/10',
            icon: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
            text: 'text-indigo-700 dark:text-indigo-300'
        },
        slate: {
            bg: 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800',
            icon: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400',
            text: 'text-slate-700 dark:text-slate-300'
        }
    };

    const scheme = colorSchemes[color] || colorSchemes.slate;

    return (
        <div className={`KpiCard flex flex-col p-5 rounded-[1.5rem] transition-all duration-500 ease-out group ${
            isPrimary 
            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 border-none hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/30' 
            : `${scheme.bg} border shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-opacity-100`
        } min-h-[9.5rem]`}>
            <div className={`w-10 h-10 flex items-center justify-center rounded-xl mb-4 transition-transform duration-500 group-hover:scale-110 shadow-sm ${
                isPrimary 
                ? 'bg-white/20 text-white' 
                : scheme.icon
            }`}>
                {icon}
            </div>
            
            <div className="flex-1 space-y-1">
                <h3 className={`text-[10px] font-black uppercase tracking-[0.1em] ${
                    isPrimary ? 'text-indigo-100/90' : 'text-slate-500 dark:text-slate-400'
                }`}>
                    {title}
                </h3>
                <p className={`text-2xl font-black leading-none truncate tracking-tight ${
                    isPrimary ? 'text-white' : 'text-slate-900 dark:text-white'
                }`}>
                    {isPrivacyMode ? '••••' : value}
                </p>
            </div>

            {subtext && (
                <div className={`mt-3 pt-3 border-t ${
                    isPrimary ? 'border-white/10' : 'border-slate-200/60 dark:border-slate-800/60'
                }`}>
                    <p className={`text-[9px] font-black tracking-widest uppercase opacity-70 truncate ${
                        subtextColor || (isPrimary ? 'text-indigo-100/80' : 'text-slate-500 dark:text-slate-400')
                    }`}>
                        {subtext}
                    </p>
                </div>
            )}
        </div>
    );
};
