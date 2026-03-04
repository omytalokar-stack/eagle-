import React from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, Minimize, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero = () => {
  const [settings, setSettings] = React.useState<any>({});
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const { scrollYProgress } = useScroll();
  
  // Title fill effect based on scroll
  const fillWidth = useTransform(scrollYProgress, [0, 0.2], ["0%", "100%"]);
  
  // Variable Font Weight Animation
  const fontWeight = useTransform(scrollYProgress, [0, 0.5], [900, 100]);
  
  // Magnetic Button Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.4);
    y.set((e.clientY - centerY) * 0.4);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Universal Toggle Function
  const toggleFullscreen = () => {
    const doc: any = document;
    const isCurrentlyFullscreen = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;
    
    if (isCurrentlyFullscreen) {
      // Exit fullscreen
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    } else {
      // Enter fullscreen
      const elem: any = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    }
  };

  // Sync fullscreen state
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const doc: any = document;
      const isFS = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
      setIsFullscreen(isFS);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(setSettings);
  }, []);

  // Generate stars for starfield
  const stars = React.useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      duration: `${Math.random() * 3 + 2}s`,
    }));
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-black">
      {/* Floating Chat Button Portal */}
      <Link to="/chat-live" className="fixed bottom-12 right-12 z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          whileHover={{ scale: 1.15, boxShadow: "0 0 40px rgba(204, 255, 0, 1)" }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <motion.div
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(204, 255, 0, 0.4)",
                "0 0 40px rgba(204, 255, 0, 0.8)",
                "0 0 20px rgba(204, 255, 0, 0.4)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 rounded-full bg-[#CCFF00] flex items-center justify-center cursor-pointer shadow-2xl"
          >
            <MessageCircle size={28} className="text-black" strokeWidth={2.5} />
          </motion.div>
          
          {/* Pulsing ring effect */}
          <motion.div
            animate={{ 
              scale: [1, 1.4],
              opacity: [1, 0]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 border-2 border-[#CCFF00] rounded-full"
          />
        </motion.div>
      </Link>
      {/* Starfield Background */}
      <div className="starfield z-0">
        {stars.map(star => (
          <div 
            key={star.id} 
            className="star" 
            style={{ 
              top: star.top, 
              left: star.left, 
              width: star.size, 
              height: star.size,
              '--duration': star.duration 
            } as any} 
          />
        ))}
      </div>

      {/* Kinetic Text Marquee */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full overflow-hidden pointer-events-none opacity-[0.03] z-0">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap text-[20vw] font-display font-black uppercase text-outline"
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="mr-20">OM TALOKAR x EAGLE</span>
          ))}
        </motion.div>
      </div>

      {/* Texture & Grid */}
      <div className="noise-overlay" />
      <div className="absolute inset-0 grid-bg z-0" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center md:text-left"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-[9px] font-bold uppercase tracking-[0.4em] mb-12"
          >
            EST. 2026 <span className="text-white/10">|</span> FOUNDER OM TALOKAR
          </motion.div>

          <div className="relative mb-16">
            {/* Outline Title */}
            <motion.h1 
              style={{ fontWeight }}
              className="text-7xl md:text-[14rem] lg:text-[18rem] font-display tracking-tighter leading-[0.8] uppercase text-outline"
            >
              EAGLE
            </motion.h1>
            {/* Fill Title (Animated on scroll) */}
            <motion.h1 
              style={{ width: fillWidth, fontWeight }}
              className="absolute top-0 left-0 text-7xl md:text-[14rem] lg:text-[18rem] font-display tracking-tighter leading-[0.8] uppercase text-brand-accent overflow-hidden whitespace-nowrap"
            >
              EAGLE
            </motion.h1>
          </div>
          
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-x-6 md:gap-y-0">
            <p className="max-w-xl text-lg md:text-2xl text-white/50 font-light leading-relaxed">
              {settings.hero_headline || 'WE BUILD HIGH-END DIGITAL WEAPONS'}
            </p>
            
            <div className="flex items-center gap-6 flex-shrink-0">
              {/* Apply Now Button */}
              <Link to="/apply">
                <motion.button
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{ x: springX, y: springY }}
                  className="group relative px-16 py-8 bg-transparent border border-brand-accent text-brand-accent font-black uppercase tracking-[0.3em] text-xs flex items-center gap-4 overflow-hidden transition-all duration-500 hover:bg-brand-accent hover:text-black"
                >
                  <span className="relative z-10">APPLY NOW</span>
                  <ArrowRight size={18} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                </motion.button>
              </Link>

              {/* High-Energy Fullscreen Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                whileHover={{ 
                  backgroundColor: "rgb(200, 255, 0)",
                  color: "rgb(0, 0, 0)",
                  scale: 1.1,
                  boxShadow: "0 0 30px rgba(200, 255, 0, 0.8)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleFullscreen}
                className="px-8 py-8 bg-transparent border-2 border-brand-accent text-brand-accent font-bold uppercase tracking-widest text-xs z-20 transition-all duration-300"
              >
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ 
                    delay: 1.8,
                    duration: 0.6,
                    ease: "easeInOut"
                  }}
                >
                  <motion.div
                    animate={{ 
                      boxShadow: [
                        "0 0 0 0 rgba(200, 255, 0, 0.8)",
                        "0 0 0 20px rgba(200, 255, 0, 0)"
                      ]
                    }}
                    transition={{ 
                      delay: 1.8,
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 1.5
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {isFullscreen ? (
                        <>
                          <Minimize size={16} />
                          EXIT
                        </>
                      ) : (
                        <>
                          <span>⛶</span>
                          FULLSCREEN
                        </>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Founder Badge */}
      <div className="absolute bottom-12 right-12 hidden lg:block">
        <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-white/20">
          <div className="w-12 h-px bg-white/10" />
          Vision by Om Talokar
        </div>
      </div>
    </section>
  );
};
