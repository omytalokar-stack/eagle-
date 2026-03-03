import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="py-32 bg-black text-white border-t border-white/5 relative overflow-hidden">
      <div className="noise-overlay" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-32">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-6xl font-display font-black tracking-tighter mb-12 block">
              EAGLE<span className="text-brand-accent">.</span>
            </Link>
            <p className="text-white/30 text-xl max-w-sm font-light leading-relaxed">
              High-end digital solutions for brands that refuse to be average. Vision by Om Talokar.
            </p>
          </div>
          
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 mb-10">Navigation</h4>
            <ul className="space-y-6 text-[10px] font-bold uppercase tracking-[0.2em]">
              <li><Link to="/portfolio" className="text-white/40 hover:text-brand-accent transition-colors">Armory</Link></li>
              <li><Link to="/apply" className="text-white/40 hover:text-brand-accent transition-colors">Initiate</Link></li>
              <li><Link to="/privacy" className="text-white/40 hover:text-brand-accent transition-colors">Protocols</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 mb-10">Connect</h4>
            <ul className="space-y-6 text-[10px] font-bold uppercase tracking-[0.2em]">
              <li><a href="#" className="text-white/40 hover:text-brand-accent transition-colors">X_Signal</a></li>
              <li><a href="#" className="text-white/40 hover:text-brand-accent transition-colors">Git_Hub</a></li>
              <li><a href="#" className="text-white/40 hover:text-brand-accent transition-colors">In_Link</a></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-16 border-t border-white/5 gap-8">
          <div className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/10">
            © 2026 EAGLE DIGITAL // ALL_RIGHTS_RESERVED
          </div>
          <div className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/10">
            DESIGNED_AND_ENGINEERED_BY_OM_TALOKAR
          </div>
        </div>
      </div>
    </footer>
  );
};
