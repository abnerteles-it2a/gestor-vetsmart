
import React from 'react';

interface KpiCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    subtext?: string;
    subtextColor?: string;
    isPrivacyMode?: boolean;
    color?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ 
    title, 
    value, 
    icon, 
    subtext, 
    subtextColor, 
    isPrivacyMode,
    color = '#FF9F1C'
}) => {
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

            <div 
                className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner shrink-0"
            >
                <div className="scale-125 opacity-30 group-hover:scale-110 group-hover:opacity-100 transition-all">
                    {icon}
                </div>
            </div>
        </div>
    );
};

