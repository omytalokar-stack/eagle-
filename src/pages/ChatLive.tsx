import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { io } from 'socket.io-client';

export const ChatLive = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = React.useState<any[]>([]);
  const [input, setInput] = React.useState('');
  const [sessionId] = React.useState(() => Math.random().toString(36).substring(7));
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const socketRef = React.useRef<any>(null);
  const swRegRef = React.useRef<ServiceWorkerRegistration | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Socket.io connection
  React.useEffect(() => {
    try {
      socketRef.current = io('http://localhost:5000', { withCredentials: true });
      socketRef.current.emit('join_session', sessionId);

      socketRef.current.on('new_message', (msg: any) => {
        setMessages(prev => {
          // Avoid duplicate messages
          if (prev.some(m => m.text === msg.text && m.sender === msg.sender && 
              Math.abs(new Date(m.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 1000)) {
            return prev;
          }
          return [...prev, msg];
        });
        // Play notification sound when message arrives
        playPop();
      });

      socketRef.current.on('connect_error', (err: any) => {
        console.warn('WebSocket connect error', err);
      });

      socketRef.current.on('disconnect', (reason: any) => {
        console.warn('WebSocket disconnected', reason);
      });

      return () => {
        try { socketRef.current?.disconnect(); } catch {}
      };
    } catch (err) {
      console.error('Socket initialization failed', err);
    }
  }, [sessionId]);

  // Load chat history on mount
  React.useEffect(() => {
    fetch(`http://localhost:5000/api/chat/${sessionId}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(() => {});
  }, [sessionId]);

  // Register service worker and subscribe for push notifications
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        swRegRef.current = reg;
        if (Notification.permission === 'default') {
          Notification.requestPermission().then(() => subscribeForPush(reg)).catch(() => {});
        } else if (Notification.permission === 'granted') {
          subscribeForPush(reg).catch(() => {});
        }
      }).catch(() => {});
    }
  }, []);

  // Cute pop sound using WebAudio
  const playPop = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = 900;
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(ctx.destination);
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      o.start(now);
      o.stop(now + 0.2);
    } catch (e) {
      // ignore
    }
  };

  // Utility to convert VAPID public key (for push subscription)
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeForPush = async (reg: ServiceWorkerRegistration) => {
    try {
      const r = await fetch('/api/vapid-public-key');
      const { publicKey } = await r.json();
      if (!publicKey) return;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      });
    } catch (e) {
      console.warn('Push subscription failed', e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      session_id: sessionId,
      sender: 'User',
      text: input,
      is_bot: 0,
      timestamp: new Date().toISOString()
    };

    // Send message via Socket.io
    socketRef.current?.emit('send_message', userMsg);

    // Also send to backend for storage
    try {
      await fetch('http://localhost:5000/api/manual-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId: sessionId,
          senderName: 'User'
        })
      });
    } catch (err) {
      console.error('Error sending message:', err);
    }

    setInput('');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="border-b border-white/5 bg-zinc-950/50 p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-white/40 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-display font-black uppercase tracking-tighter">
                DIRECT_CHAT
              </h1>
              <p className="text-[9px] uppercase tracking-widest text-white/40 mt-1">
                Session: {sessionId.substring(0, 8)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">LIVE</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 overflow-y-auto p-6 lg:p-16"
      >
        <div className="max-w-4xl mx-auto space-y-6 font-mono text-[11px]">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/20 text-[10px] uppercase tracking-[0.4em]">
                Start a conversation with Om Talokar...
              </p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn('flex flex-col gap-2', msg.sender === 'Om Talokar' ? 'items-start' : 'items-end')}
              >
                <div
                  className={cn(
                    'p-4 border max-w-md break-words',
                    msg.sender === 'Om Talokar'
                      ? 'bg-white/5 border-white/10 text-white/60'
                      : 'bg-brand-accent/10 border-brand-accent/30 text-brand-accent'
                  )}
                >
                  {msg.text}
                </div>
                <span className="text-[8px] uppercase tracking-widest text-white/20">
                  {msg.sender === 'Om Talokar' ? 'FOUNDER' : 'YOU'}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <div className="text-brand-accent animate-pulse text-[10px]">[ Om is typing... ]</div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </motion.div>

      {/* Input Area */}
      <div className="border-t border-white/5 bg-zinc-950/50 p-6">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto">
          <div className="flex gap-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message to Om Talokar..."
              className="flex-1 bg-black border border-white/10 p-4 text-xs outline-none focus:border-brand-accent transition-all"
            />
            <button
              type="submit"
              className="w-12 h-12 flex items-center justify-center bg-brand-accent text-black hover:bg-white transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
