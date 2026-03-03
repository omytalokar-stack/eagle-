import { motion } from 'motion/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const projects = [
  {
    title: "Luxe E-commerce",
    category: "Web App / React",
    image: "https://picsum.photos/seed/luxe/800/1000",
    color: "#E5E7EB"
  },
  {
    title: "Crypto Dashboard",
    category: "Fintech / D3.js",
    image: "https://picsum.photos/seed/crypto/800/1000",
    color: "#D1D5DB"
  },
  {
    title: "Architect Portfolio",
    category: "Creative / Motion",
    image: "https://picsum.photos/seed/arch/800/1000",
    color: "#F3F4F6"
  },
  {
    title: "SaaS Platform",
    category: "B2B / Dashboard",
    image: "https://picsum.photos/seed/saas/800/1000",
    color: "#E5E7EB"
  }
];

export const Portfolio = () => {
  const navigate = useNavigate();
  // toggleFullScreen now targets a contained video element if present
  const toggleFullScreen = (element: HTMLElement) => {
    if (!element) return;

    // prefer video child if available
    const videoEl = element.querySelector('video') as HTMLElement | null;
    const target = videoEl || element;

    // Check current fullscreen status
    const isCurrentlyFullScreen = 
      document.fullscreenElement || 
      (document as any).webkitFullscreenElement || 
      (document as any).mozFullScreenElement || 
      (document as any).msFullscreenElement;

    if (isCurrentlyFullScreen) {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    } else {
      // Enter fullscreen on target element (video preferred)
      if (target.requestFullscreen) {
        target.requestFullscreen();
      } else if ((target as any).webkitRequestFullscreen) {
        (target as any).webkitRequestFullscreen();
      } else if ((target as any).mozRequestFullScreen) {
        (target as any).mozRequestFullScreen();
      } else if ((target as any).msRequestFullscreen) {
        (target as any).msRequestFullscreen();
      }
    }
  };
  return (
    <section id="portfolio" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-xs uppercase tracking-widest text-blue-400 hover:text-blue-600"
          >
            ← Back
          </button>
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">02. Portfolio</h2>
          <h3 className="text-4xl md:text-6xl font-display font-bold tracking-tighter">
            SELECTED <span className="italic">WORKS</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {projects.map((project, index) => {
            const ref = React.useRef<HTMLDivElement>(null);
            
            return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div ref={ref} className="relative aspect-[4/5] overflow-hidden bg-zinc-100 mb-6">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => ref.current && toggleFullScreen(ref.current)}
                    className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-zinc-200 transition-colors"
                  >
                    View Project
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-2xl font-bold uppercase tracking-tighter">{project.title}</h4>
                  <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">{project.category}</p>
                </div>
                <span className="text-4xl font-display font-black opacity-10 group-hover:opacity-100 transition-opacity">
                  0{index + 1}
                </span>
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
