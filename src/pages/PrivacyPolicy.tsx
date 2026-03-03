import { motion } from 'framer-motion';
import { BackButton } from '@/src/components/BackButton';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-black pt-32 pb-24">
      <BackButton />
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-invert max-w-none"
        >
          <h1 className="text-5xl md:text-8xl font-display font-black tracking-tighter mb-16">
            ELITE <span className="text-brand-accent">PROTOCOLS</span>
          </h1>
          
          <div className="space-y-20 text-white/40 leading-relaxed font-light">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent">01 // VISION</div>
              <div className="md:col-span-2">
                <h2 className="text-white text-3xl font-bold uppercase tracking-tight mb-6">The Eagle Philosophy</h2>
                <p className="text-xl">
                  EAGLE, founded by visionary Om Talokar, is an exclusive frontend laboratory. We do not build websites; we engineer digital weapons designed to dominate markets and redefine user expectations. Our approach is surgical, our performance is absolute.
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent">02 // SECURITY</div>
              <div className="md:col-span-2">
                <h2 className="text-white text-3xl font-bold uppercase tracking-tight mb-6">Data Sovereignty</h2>
                <p className="text-xl">
                  We operate with a commitment to high-end security. Your data is your sovereignty. We collect information solely to facilitate project collaboration and elite communication. We do not compromise, we do not trade, we only protect.
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent">03 // ACCESS</div>
              <div className="md:col-span-2">
                <h2 className="text-white text-3xl font-bold uppercase tracking-tight mb-6">Elite Communication</h2>
                <p className="text-xl">
                  All inquiries are handled directly by Om Talokar. This ensures the highest level of confidentiality and technical precision from the very first interaction. Access to EAGLE is a privilege reserved for those who value excellence.
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent">04 // PROTOCOL</div>
              <div className="md:col-span-2">
                <h2 className="text-white text-3xl font-bold uppercase tracking-tight mb-6">Security Protocols</h2>
                <p className="text-xl">
                  We implement military-grade encryption and security protocols to ensure that your project mission briefs remain confidential and secure within the Eagle nest. Your vision is safe with us.
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent">05 // CONTACT</div>
              <div className="md:col-span-2">
                <h2 className="text-white text-3xl font-bold uppercase tracking-tight mb-6">Direct Line</h2>
                <p className="text-xl">
                  For secure communications or project mission briefs, contact Om Talokar directly at <span className="text-brand-accent">hello@eagle.digital</span>.
                </p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
