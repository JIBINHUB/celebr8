import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const BentoHero = ({ events, onEventClick }) => {
    // Use first 5 events for the grid
    const featuredEvents = events.slice(0, 5);

    if (featuredEvents.length === 0) return null;

    return (
        <div className="w-full max-w-[1400px] mx-auto p-4 md:p-6 mb-8 relative z-10">
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2 drop-shadow-lg">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F54768] to-[#FF9C7D]">Trending</span> near you
            </h2>

            {/* Bento Grid with Liquid Glass Styles */}
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[600px]">

                {/* Large Feature - Takes 2x2 on Desktop */}
                <div
                    onClick={() => onEventClick(featuredEvents[0].id)}
                    className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden cursor-pointer group border border-white/20 backdrop-blur-2xl bg-white/5 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
                >
                    <img src={featuredEvents[0].image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" alt={featuredEvents[0].title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    {/* Liquid Overlay on Hover */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"></div>

                    <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                        <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-4 inline-block shadow-lg">
                            {featuredEvents[0].category}
                        </span>
                        <h3 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight drop-shadow-md">{featuredEvents[0].title}</h3>
                        <p className="text-gray-200 text-sm md:text-base line-clamp-2">{featuredEvents[0].date} • {featuredEvents[0].venue}</p>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20">
                        <ArrowUpRight className="text-white w-6 h-6" />
                    </div>
                </div>

                {/* Secondary Feature 1 - Top Right */}
                <div
                    onClick={() => onEventClick(featuredEvents[1].id)}
                    className="md:col-span-2 md:row-span-1 relative rounded-3xl overflow-hidden cursor-pointer group border border-white/20 backdrop-blur-2xl bg-white/5 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
                >
                    <img src={featuredEvents[1].image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" alt={featuredEvents[1].title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    {/* Liquid Overlay on Hover */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"></div>

                    <div className="absolute bottom-0 left-0 p-6 w-full">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1 drop-shadow-md">{featuredEvents[1].title}</h3>
                        <p className="text-gray-300 text-xs">{featuredEvents[1].date}</p>
                    </div>
                </div>

                {/* Tertiary Feature 2 - Bottom Middle */}
                <div
                    onClick={() => onEventClick(featuredEvents[2].id)}
                    className="relative rounded-3xl overflow-hidden cursor-pointer group border border-white/20 backdrop-blur-2xl bg-white/5 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
                >
                    <img src={featuredEvents[2].image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" alt={featuredEvents[2].title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                    {/* Liquid Overlay on Hover */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"></div>

                    <div className="absolute bottom-0 left-0 p-4 w-full">
                        <span className="text-[#60a5fa] text-[10px] font-bold uppercase tracking-wider block mb-1 drop-shadow">{featuredEvents[2].category}</span>
                        <h3 className="text-lg font-bold text-white truncate drop-shadow-md">{featuredEvents[2].title}</h3>
                    </div>
                </div>

                {/* Tertiary Feature 3 - Bottom Right */}
                <div
                    onClick={() => onEventClick(featuredEvents[3].id)}
                    className="relative rounded-3xl overflow-hidden cursor-pointer group border border-white/20 backdrop-blur-2xl bg-white/5 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
                >
                    <img src={featuredEvents[3].image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" alt={featuredEvents[3].title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                    {/* Liquid Overlay on Hover */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"></div>

                    <div className="absolute bottom-0 left-0 p-4 w-full">
                        <span className="text-[#c084fc] text-[10px] font-bold uppercase tracking-wider block mb-1 drop-shadow">{featuredEvents[3].category}</span>
                        <h3 className="text-lg font-bold text-white truncate drop-shadow-md">{featuredEvents[3].title}</h3>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BentoHero;
