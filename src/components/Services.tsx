import { motion } from 'framer-motion';
import { Code2, Layout, Zap, Smartphone, Shield, Cpu } from 'lucide-react';

const services = [
  {
    icon: <Layout className="w-8 h-8 text-brand-accent" />,
    title: "Next-Gen UI",
    description: "Immersive, high-performance interfaces built with React and Framer Motion. We don't just build sites; we build experiences."
  },
  {
    icon: <Cpu className="w-8 h-8 text-brand-secondary" />,
    title: "Webapp Architecture",
    description: "Scalable, secure, and lightning-fast frontend architectures designed for complex enterprise applications."
  },
  {
    icon: <Zap className="w-8 h-8 text-brand-accent" />,
    title: "Performance Tuning",
    description: "Zero-lag, ultra-optimized code that scores 100 on Lighthouse. Speed is our obsession."
  },
  {
    icon: <Shield className="w-8 h-8 text-brand-secondary" />,
    title: "Technical Strategy",
    description: "Founder-led consulting on tech stacks, security, and digital transformation for modern brands."
  }
];

export const Services = () => {
  return (
    <section id="services" className="py-48 bg-black relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-32 gap-12">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent mb-6"
            >
              <div className="w-12 h-px bg-brand-accent" />
              Capabilities
            </motion.div>
            <h3 className="text-6xl md:text-9xl font-display font-black tracking-tighter uppercase">
              OUR <br /> <span className="text-outline">WEAPONS</span>
            </h3>
          </div>
          <p className="max-w-md text-white/30 text-xl font-light leading-relaxed">
            EAGLE specializes in the intersection of high-end design and military-grade performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="command-card p-16 group"
            >
              <div className="mb-12 text-brand-accent group-hover:scale-110 transition-transform duration-700">
                {service.icon}
              </div>
              <h4 className="text-3xl font-bold mb-8 uppercase tracking-tight">{service.title}</h4>
              <p className="text-white/30 group-hover:text-white/60 transition-colors text-lg leading-relaxed font-light">
                {service.description}
              </p>
              <div className="mt-12 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white/10 group-hover:text-brand-accent transition-colors">
                [ Protocol_Active ]
                <div className="flex-1 h-px bg-white/5 group-hover:bg-brand-accent/20 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
