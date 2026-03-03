import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ChatWidget = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleChatClick = () => {
    navigate('/chat-live');
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <div style={{ position: 'relative' }}>
        {/* Rotating glow effect */}
        <div className="chat-glow" aria-hidden />
        
        {/* Main chat button */}
        <motion.button
          onClick={handleChatClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.12 }}
          className="chat-button z-50 relative flex items-center justify-center shadow-lg"
          title="Open direct chat with Om Talokar"
        >
          {/* Hover label */}
          {isHovered && (
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-full mr-4 text-black font-bold uppercase text-[12px] bg-brand-accent px-3 py-2 rounded-lg tracking-wider whitespace-nowrap"
            >
              CHAT WITH US
            </motion.span>
          )}
          
          {/* Icon */}
          <MessageSquare size={24} />
        </motion.button>
      </div>
    </div>
  );
};

