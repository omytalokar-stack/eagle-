import React from 'react';
import { motion } from 'framer-motion';
import { Maximize, Minimize } from 'lucide-react';
import { BackButton } from '@/src/components/BackButton';

export const PortfolioPage = () => {
  const [projects, setProjects] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Universal Toggle Function
  const toggleFullScreen = (element: HTMLElement) => {
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
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
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
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black pt-32 pb-24">
      <BackButton />
      <div className="noise-overlay" />
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent mb-6"
          >
            <div className="w-12 h-px bg-brand-accent" />
            The Armory
          </motion.div>
          <h2 className="text-6xl md:text-9xl font-display font-black uppercase tracking-tighter">
            SELECTED <br /> <span className="text-outline">WORKS</span>
          </h2>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border border-brand-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {projects.length === 0 && (
              <p className="text-white/20 font-mono text-[10px] uppercase tracking-[0.4em]">No assets deployed yet.</p>
            )}
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900 border border-white/5 mb-8">
                  {/* Reveal Overlay */}
                  <motion.div 
                    initial={{ x: "0%" }}
                    whileInView={{ x: "100%" }}
                    transition={{ duration: 1, ease: [0.77, 0, 0.175, 1] }}
                    viewport={{ once: true }}
                    className="absolute inset-0 bg-brand-accent z-20"
                  />
                  
                  <img 
                    src={project.image_url || `https://picsum.photos/seed/${project.id}/1200/750`} 
                    alt={project.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                    <motion.button 
                      onClick={(e) => {
                        const parent = (e.currentTarget.closest('.group') as HTMLElement);
                        if (parent) toggleFullScreen(parent);
                      }} 
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-14 h-14 rounded-full bg-brand-accent text-black flex items-center justify-center transition-transform"
                    >
                      <motion.div whileHover={{ rotate: 10 }}>
                        {isFullscreen ? (
                          <Minimize size={20} />
                        ) : (
                          <Maximize size={20} />
                        )}
                      </motion.div>
                    </motion.button>
                  </div>
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">{project.title}</h3>
                    <div className="flex gap-4 text-[9px] font-bold uppercase tracking-widest text-white/30">
                      <span>{project.category}</span>
                      <span className="text-white/10">/</span>
                      <span className="text-brand-accent">{project.tech_stack}</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-white/10">
                    [{String(index + 1).padStart(2, '0')}]
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
