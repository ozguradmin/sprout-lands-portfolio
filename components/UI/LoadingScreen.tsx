import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { AlertCircle, Cpu } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  const { loadingProgress, loadingStatus } = useApp();

  return (
    <div className="fixed inset-0 bg-[#262b44] z-[9999] flex flex-col items-center justify-center overflow-hidden font-pixel">
      
      {/* Wood Frame Container */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full p-4">
        
        {/* Main Wood Board */}
        <div className="bg-[#e4a672] p-2 rounded-xl shadow-2xl border-[4px] border-[#b86f50] w-full">
           {/* Inner Bevel */}
           <div className="bg-[#e4a672] border-2 border-[#ffce9e] rounded-lg p-1">
              {/* Paper Content */}
              <div className="bg-[#ead4aa] rounded-md p-8 flex flex-col items-center relative overflow-hidden">
                 
                 {/* Decorative Corner Screws */}
                 <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#b86f50] opacity-50"></div>
                 <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#b86f50] opacity-50"></div>
                 <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-[#b86f50] opacity-50"></div>
                 <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-[#b86f50] opacity-50"></div>

                 {/* Avatar Frame */}
                 <div className="w-24 h-24 bg-[#e4a672] border-4 border-[#b86f50] rounded-xl mb-6 flex items-center justify-center shadow-lg relative overflow-hidden">
                    <style>
                      {`
                        @keyframes cow-walk {
                          from { background-position: 0px 0px; }
                          to { background-position: -96px 0px; }
                        }
                      `}
                    </style>
                    <div
                       style={{
                         width: 32,
                         height: 32,
                         backgroundImage: 'url("/assets/sprout-lands/Characters/Free Cow Sprites.png")',
                         backgroundSize: '96px 64px',
                         imageRendering: 'pixelated',
                         animation: 'cow-walk 0.6s steps(3) infinite'
                       }}
                       className="transform scale-[2.5]"
                    />
                 </div>

                 {/* Title */}
                 <div className="text-center mb-8">
                    <h2 className="text-[#5d4037] font-extrabold text-2xl tracking-wide uppercase drop-shadow-sm mb-2">
                       Özgür'ün
                    </h2>
                    <div className="bg-[#b86f50] text-[#ead4aa] px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-block transform -rotate-2">
                       PORTFOLYOSU
                    </div>
                 </div>

                 {/* Loading Bar Container */}
                 <div className="w-full space-y-2">
                    <div className="flex justify-between text-[8px] font-bold text-[#8d5d42] uppercase tracking-wider px-1">
                       <span>KÖY YÜKLENİYOR...</span>
                       <span>{Math.round(loadingProgress)}%</span>
                    </div>
                    
                    <div className="h-6 bg-[#c59c7a] rounded-full p-1 border-2 border-[#b86f50] shadow-inner">
                       <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: `${loadingProgress}%` }}
                          className="h-full bg-[#7ec45b] rounded-full border-t border-white/30 shadow-[0_2px_0_rgba(0,0,0,0.1)] relative overflow-hidden"
                       >
                          {/* Shine effect */}
                          <div className="absolute top-0 left-0 right-0 h-[40%] bg-white/20"></div>
                       </motion.div>
                    </div>
                    
                    <p className="text-center text-[8px] text-[#8d5d42]/70 mt-2 h-4">
                       {loadingStatus}
                    </p>
                 </div>

              </div>
           </div>
        </div>
      </div>

      {/* Version Tag Removed */}
    </div>
  );
};
