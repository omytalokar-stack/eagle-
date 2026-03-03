import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate(-1)}
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ x: -8, scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed top-8 left-8 z-50 w-12 h-12 rounded-full border border-brand-accent text-brand-accent flex items-center justify-center hover:text-black transition-all duration-300"
      style={{
        backdropFilter: "blur(8px)",
        backgroundColor: "rgba(200, 255, 0, 0.08)",
        boxShadow: "inset 0 1px 1px rgba(200, 255, 0, 0.2), 0 8px 32px rgba(200, 255, 0, 0.15)"
      }}
      title="Go back"
    >
      <motion.div whileHover={{ x: -2 }} transition={{ duration: 0.2 }}>
        <ChevronLeft size={20} />
      </motion.div>
    </motion.button>
  );
};
