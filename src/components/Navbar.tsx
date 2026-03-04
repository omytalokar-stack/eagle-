import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Shield, LogIn, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/contexts/AuthContext';
import axios from 'axios';

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userLocal, setUserLocal] = React.useState<any>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const location = useLocation();
  const { user, loading, login, logout } = useAuth();

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/status`, { withCredentials: true });
        setIsLoggedIn(Boolean(data?.isLoggedIn));
        setUserLocal(data?.user || null);
        setIsAdmin(Boolean(data?.isAdmin));
      } catch {
        setIsLoggedIn(false);
        setUserLocal(null);
        setIsAdmin(false);
      }
    };
    
    checkStatus();
    
    const onFocus = () => checkStatus();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/logout`, { withCredentials: true });
      setIsLoggedIn(false);
      setUserLocal(null);
      setIsAdmin(false);
      setIsOpen(false);
      // Redirect after clearing state
      setTimeout(() => window.location.href = '/', 100);
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API fails, clear local state
      setIsLoggedIn(false);
      setUserLocal(null);
      setIsAdmin(false);
      setIsOpen(false);
      setTimeout(() => window.location.href = '/', 100);
    }
  };

  const navLinks = [
    { name: 'Works', href: '/portfolio' },
    { name: 'Services', href: '/#services' },
  ];

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-700 px-6 md:px-12",
        scrolled ? "bg-black/90 backdrop-blur-3xl py-4 border-b border-white/5" : "bg-transparent py-10"
      )}
    >
      <div className="max-w-[1800px] mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-display font-black tracking-tighter group">
          EAGLE<span className="text-brand-accent">.</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-12">
          <div className="flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.3em] transition-all hover:text-brand-accent",
                  location.pathname === link.href ? "text-brand-accent" : "text-white/40"
                )}
              >
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <Link 
                to="/admin-lock"
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.3em] transition-all hover:text-brand-accent flex items-center gap-2",
                  location.pathname === '/admin-lock' ? "text-brand-accent" : "text-white/40"
                )}
              >
                <Shield size={12} />
                Admin
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link 
                  to="/apply" 
                  className="px-8 py-3 border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-500"
                >
                  Apply
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-500 flex items-center gap-2"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={login}
                className="px-6 py-3 border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-500 flex items-center gap-2"
              >
                <LogIn size={14} />
                Login
              </button>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="absolute top-full left-0 w-full bg-black border-b border-white/10 p-8 flex flex-col gap-6 md:hidden"
        >
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href}
              onClick={() => setIsOpen(false)}
              className="text-2xl font-display font-bold uppercase tracking-tighter"
            >
              {link.name}
            </Link>
          ))}
          {isAdmin && (
            <Link 
              to="/admin-lock"
              onClick={() => setIsOpen(false)}
              className="text-2xl font-display font-bold uppercase tracking-tighter flex items-center gap-3"
            >
              <Shield size={20} />
              Admin
            </Link>
          )}
          {isLoggedIn ? (
            <>
              <Link 
                to="/apply"
                onClick={() => setIsOpen(false)}
                className="w-full py-4 bg-brand-accent text-black text-center font-black uppercase tracking-widest"
              >
                Apply Now
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-4 border border-white/20 text-white text-center font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsOpen(false);
                login();
              }}
              className="w-full py-4 border border-white/20 text-white text-center font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              Login
            </button>
          )}
        </motion.div>
      )}
    </nav>
  );
};
