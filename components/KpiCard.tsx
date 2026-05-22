
import React from 'react';

interface KpiCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    subtext?: string;
    subtextColor?: string;
    isPrivacyMode?: boolean;
    color?: string;
    /** 'standard' = border-left accent (default) | 'primary' = solid teal bg */
    variant?: 'standard' | 'primary';
}

export const KpiCard: React.FC<KpiCardProps> = ({
    title,
    value,
    icon,
    subtext,
    subtextColor,
    isPrivacyMode,
    color = '#0D9488',
    variant = 'standard',
}) => {
    if (variant === 'primary') {
        return (
            <div
                className="rounded-xl p-5 flex justify-between items-center group transition-all duration-300 hover:-translate-y-2"
                style={{
                    background: '#0D9488',
                    boxShadow: '0 20px 40px -8px rgba(13,148,136,0.35), 0 4px 12px rgba(0,0,0,0.15)',
                }}
            >
                <div className="flex flex-col gap-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                        {title}
                    </h3>
                    <p className="text-xl font-black text-white tracking-tight uppercase">
                        {isPrivacyMode ? '••••' : value}
                    </p>
                    {subtext && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
                            {subtext}
                        </span>
                    )}
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                    {icon}
                </div>
            </div>
        );
    }

    // Default: standard variant — left border accent
    return (
        <div
            className="omie-card !p-5 flex justify-between items-center bg-white hover:shadow-lg transition-all duration-300 border-l-[6px] group"
            style={{ borderLeftColor: color }}
        >
            <div className="flex flex-col gap-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {title}
                </h3>
                <p className="text-xl font-black text-[#020617] tracking-tight uppercase">
                    {isPrivacyMode ? '••••' : value}
                </p>
                {subtext && (
                    <span className={`text-[9px] font-black uppercase tracking-widest ${subtextColor || 'text-slate-400'}`}>
                        {subtext}
                    </span>
                )}
            </div>

            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner shrink-0">
                <div className="scale-125 opacity-30 group-hover:scale-110 group-hover:opacity-100 transition-all">
                    {icon}
                </div>
            </div>
        </div>
    );
};
