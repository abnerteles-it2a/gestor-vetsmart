
import React from 'react';

interface ModuleTileProps {
  id: string;
  title: string;
  icon: string;
  color: string;
  onClick: (id: string) => void;
}

const ModuleTile: React.FC<ModuleTileProps> = ({ id, title, icon, color, onClick }) => {
  return (
    <button
      onClick={() => onClick(id)}
      className="group relative flex flex-col items-center justify-center gap-4 w-40 h-40 md:w-48 md:h-48 rounded-tile transition-all duration-500 hover:scale-110 hover:-translate-y-2 omie-tile-shadow overflow-hidden cursor-pointer active:scale-95"
      style={{ backgroundColor: color }}
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />
      
      {/* Icon with white glow on hover */}
      <div className="relative z-10 text-white transition-all duration-500 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
        <i className={`${icon} text-4xl md:text-5xl`}></i>
      </div>
      
      <span className="relative z-10 text-white font-bold text-sm md:text-base tracking-tight uppercase">
        {title}
      </span>

      {/* Shine Effect Animation */}
      <div className="absolute -inset-full h-[200%] w-[200%] rotate-45 translate-x-[-100%] translate-y-[-100%] bg-white/20 group-hover:animate-shine transition-all duration-700 pointer-events-none" />
    </button>
  );
};

export default ModuleTile;
