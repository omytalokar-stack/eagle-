import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Inbox, MessageSquare, Plus, Trash2, LogOut, Power, Zap, ShieldAlert } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { io } from 'socket.io-client';
import { BackButton } from '@/src/components/BackButton';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = React.useState('portfolio');
  const [projects, setProjects] = React.useState<any[]>([]);
  const [inquiries, setInquiries] = React.useState<any[]>([]);
  const [settings, setSettings] = React.useState<any>({});
  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [selectedBrief, setSelectedBrief] = React.useState<string | null>(null);
  
  // Chat State
  const [chatSessions, setChatSessions] = React.useState<any[]>([]);
  const [activeSession, setActiveSession] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [chatInput, setChatInput] = React.useState('');
  const socketRef = React.useRef<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Fetch admin secret key from backend
    try {
      const response = await fetch(`${API_BASE}/api/admin/secret-key`, {
        credentials: 'include'
      });
      const data = await response.json();
      const correctKey = data.secretKey || 'omy13456'; // Fallback to default
      
      if (password === correctKey) {
        setIsAuthorized(true);
      } else {
        alert('Unauthorized Access Denied.');
        setPassword('');
      }
    } catch (error) {
      // Fallback to default key if API fails
      if (password === 'omy13456') {
        setIsAuthorized(true);
      } else {
        alert('Unauthorized Access Denied.');
        setPassword('');
      }
    }
  };

  React.useEffect(() => {
    if (isAuthorized) {
      fetch(`${API_BASE}/api/projects`).then(res => res.json()).then(setProjects);
      fetch(`${API_BASE}/api/inquiries`).then(res => res.json()).then(setInquiries);
      fetch(`${API_BASE}/api/settings`).then(res => res.json()).then(setSettings);
      fetch('/api/chat/sessions').then(res => res.json()).then(setChatSessions);

      // Socket setup
      socketRef.current = io();
      
      socketRef.current.on('new_message', (msg: any) => {
        if (msg.session_id === activeSession) {
          setMessages(prev => [...prev, msg]);
        }
      });

      socketRef.current.on('admin_notification', (notif: any) => {
        if (notif.type === 'chat') {
          fetch(`${API_BASE}/api/chat/sessions`).then(res => res.json()).then(setChatSessions);
        }
      });

      return () => socketRef.current?.disconnect();
    }
  }, [isAuthorized, activeSession]);

  const toggleStatus = async () => {
    const newStatus = settings.site_status === 'Available' ? 'Busy' : 'Available';
    const newSettings = { ...settings, site_status: newStatus };
    await fetch(`${API_BASE}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: newSettings }),
    });
    setSettings(newSettings);
  };

  const toggleManualChat = async () => {
    const newVal = settings.is_manual_chat === 'true' ? 'false' : 'true';
    const newSettings = { ...settings, is_manual_chat: newVal };
    await fetch(`${API_BASE}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: newSettings }),
    });
    setSettings(newSettings);
  };

  const selectSession = (sessionId: string) => {
    setActiveSession(sessionId);
    socketRef.current?.emit('join_session', sessionId);
    fetch(`/api/chat/${sessionId}`).then(res => res.json()).then(setMessages);
  };

  const sendManualMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeSession) return;

    const msg = {
      session_id: activeSession,
      sender: 'Om Talokar',
      text: chatInput,
      is_bot: 0
    };

    socketRef.current?.emit('send_message', msg);
    setChatInput('');
    // Trigger web-push to notify subscriber browsers that admin replied
    try {
      fetch(`${API_BASE}/api/push/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Reply from Om Talokar',
          body: chatInput.slice(0, 120),
          url: '/' 
        })
      }).catch(() => {});
    } catch (e) {}
  };

  const addProject = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const res = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (res.ok) {
      const newProj = await res.json();
      setProjects(prev => [{ ...data, id: newProj.id }, ...prev]);
      e.target.reset();
    }
  };

  const updateSettings = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const res = await fetch(`${API_BASE}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: { ...settings, ...data } }),
    });
    
    if (res.ok) {
      alert('Settings updated successfully.');
      setSettings({ ...settings, ...data });
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-display font-black tracking-tighter mb-2">EAGLE COMMAND</h1>
            <p className="text-white/40 text-xs uppercase tracking-widest">Founder Access Only</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Access Key"
            className="w-full bg-white/5 border border-white/10 py-4 px-6 text-center text-xl outline-none focus:border-brand-accent transition-colors"
          />
          <button className="w-full py-4 bg-brand-accent text-black font-black uppercase tracking-widest">
            Authorize
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex font-mono">
      <BackButton />
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 border-r border-white/5 flex flex-col bg-zinc-950/50">
        <div className="p-8 border-b border-white/5">
          <div className="text-xl font-display font-black tracking-tighter">
            EAGLE<span className="text-brand-accent">.</span>
          </div>
        </div>
        
        <nav className="flex-1 py-8">
          {[
            { id: 'portfolio', label: 'Armory', icon: <LayoutGrid size={16} /> },
            { id: 'inquiries', label: 'Briefs', icon: <Inbox size={16} /> },
            { id: 'comms', label: 'Comms', icon: <MessageSquare size={16} /> },
            { id: 'settings', label: 'Config', icon: <Plus size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-4 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-l-2",
                activeTab === tab.id ? "bg-brand-accent/5 border-brand-accent text-brand-accent" : "border-transparent text-white/20 hover:text-white"
              )}
            >
              {tab.icon}
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={() => setIsAuthorized(false)}
          className="p-8 border-t border-white/5 flex items-center gap-4 text-white/10 hover:text-red-500 transition-colors text-[10px] font-bold uppercase tracking-widest"
        >
          <LogOut size={16} />
          <span className="hidden lg:inline">Disconnect</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-16 overflow-y-auto">
        <header className="mb-16 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 mb-4">
              <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              System Online // Founder: Om Talokar
            </div>
            <h3 className="text-4xl lg:text-7xl font-display font-black uppercase tracking-tighter">
              {activeTab === 'portfolio' ? 'ASSET_MANAGER' : activeTab === 'inquiries' ? 'INCOMING_BRIEFS' : 'SYSTEM_CORE'}
            </h3>
          </div>
          
          <div className="hidden lg:flex gap-8">
            <button 
              onClick={toggleStatus}
              className={cn(
                "px-6 py-3 border text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 transition-all",
                settings.site_status === 'Available' ? "border-brand-accent text-brand-accent bg-brand-accent/5" : "border-red-500 text-red-500 bg-red-500/5"
              )}
            >
              <Power size={14} />
              {settings.site_status || 'Available'}
            </button>
            <button 
              onClick={toggleManualChat}
              className={cn(
                "px-6 py-3 border text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 transition-all",
                settings.is_manual_chat === 'true' ? "border-brand-secondary text-brand-secondary bg-brand-secondary/5" : "border-white/10 text-white/20"
              )}
            >
              <Zap size={14} />
              {settings.is_manual_chat === 'true' ? 'Manual_Comms_ON' : 'AI_Comms_ON'}
            </button>
          </div>
        </header>

        {activeTab === 'portfolio' && (
          <div className="space-y-12">
            <form onSubmit={addProject} className="command-card p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/20">Title</label>
                  <input name="title" className="w-full bg-black border border-white/10 p-4 text-xs outline-none focus:border-brand-accent" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/20">Category</label>
                  <input name="category" className="w-full bg-black border border-white/10 p-4 text-xs outline-none focus:border-brand-accent" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/20">Tech_Stack</label>
                  <input name="tech_stack" className="w-full bg-black border border-white/10 p-4 text-xs outline-none focus:border-brand-accent" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-white/20">Asset_URL</label>
                <div className="relative group">
                  <input name="image_url" className="w-full bg-black border border-white/10 p-4 text-xs outline-none focus:border-brand-accent" placeholder="https://..." />
                  <div className="absolute inset-0 border-2 border-dashed border-white/5 pointer-events-none group-focus-within:border-brand-accent/20 transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-white/20">Brief_Description</label>
                <textarea name="description" className="w-full bg-black border border-white/10 p-4 text-xs outline-none focus:border-brand-accent resize-none" rows={3} />
              </div>
              <button className="w-full py-5 bg-brand-accent text-black font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white transition-colors">
                Deploy Asset
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map(p => (
                <div key={p.id} className="command-card p-6 group">
                  <div className="aspect-video bg-black overflow-hidden mb-6 border border-white/5">
                    <img src={p.image_url || `https://picsum.photos/seed/${p.id}/400/225`} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-tight mb-2">{p.title}</h4>
                  <p className="text-brand-accent text-[8px] font-black uppercase tracking-widest mb-4">{p.tech_stack}</p>
                  <button className="text-red-500/50 hover:text-red-500 text-[8px] font-black uppercase tracking-widest transition-colors">
                    [ Delete_Asset ]
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'comms' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
            <div className="command-card overflow-y-auto">
              <div className="p-6 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/20">Active_Channels</div>
              <div className="p-4 space-y-2">
                {chatSessions.map(session => (
                  <button
                    key={session.session_id}
                    onClick={() => selectSession(session.session_id)}
                    className={cn(
                      "w-full p-4 border text-left text-[10px] font-bold uppercase tracking-widest transition-all",
                      activeSession === session.session_id ? "bg-brand-accent/10 border-brand-accent text-brand-accent" : "bg-black border-white/5 text-white/40 hover:border-white/20"
                    )}
                  >
                    SESSION_{session.session_id.substring(0, 4)} // {session.session_id.substring(4, 8)}
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 command-card flex flex-col">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/20">Signal_Stream</div>
                {activeSession && (
                  <div className="text-[8px] font-mono text-brand-accent animate-pulse">CONNECTED_TO_{activeSession}</div>
                )}
              </div>
              <div className="flex-1 p-8 space-y-4 overflow-y-auto font-mono text-[11px]">
                {!activeSession ? (
                  <div className="text-white/40">[SYSTEM] Select a channel to begin monitoring...</div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={cn(
                      "flex flex-col gap-1",
                      msg.sender === 'Om Talokar' ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "p-3 border",
                        msg.sender === 'Om Talokar' ? "bg-brand-accent/5 border-brand-accent/20 text-brand-accent" : "bg-white/5 border-white/10 text-white/60"
                      )}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] uppercase tracking-widest text-white/10">{msg.sender}</span>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={sendManualMessage} className="p-6 border-t border-white/5">
                <div className="flex gap-4">
                  <input 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Transmit manual response..." 
                    className="flex-1 bg-black border border-white/10 p-4 text-xs outline-none focus:border-brand-accent"
                    disabled={!activeSession}
                  />
                  <button 
                    type="submit"
                    disabled={!activeSession}
                    className="w-12 h-12 flex items-center justify-center bg-brand-accent text-black hover:bg-white transition-colors disabled:opacity-50"
                  >
                    <Zap size={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <form onSubmit={updateSettings} className="command-card p-10 max-w-2xl space-y-10">
            <div className="space-y-4">
              <label className="text-[9px] uppercase tracking-[0.4em] text-white/20">Core_Headline</label>
              <input 
                name="hero_headline" 
                defaultValue={settings.hero_headline} 
                className="w-full bg-black border border-white/10 p-5 text-xs outline-none focus:border-brand-accent" 
              />
            </div>
            <div className="space-y-4">
              <label className="text-[9px] uppercase tracking-[0.4em] text-white/20">Core_Subtext</label>
              <textarea 
                name="hero_subtext" 
                defaultValue={settings.hero_subtext} 
                rows={5}
                className="w-full bg-black border border-white/10 p-5 text-xs outline-none focus:border-brand-accent resize-none" 
              />
            </div>
            <button className="w-full py-5 bg-brand-accent text-black font-black uppercase tracking-[0.3em] text-[10px]">
              Update_System_Core
            </button>
          </form>
        )}

        {activeTab === 'inquiries' && (
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-900">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Date</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Client</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Stack</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Pages</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Total</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map(i => (
                    <React.Fragment key={i.id}>
                      <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="p-6 text-xs font-mono text-white/40">{new Date(i.created_at).toLocaleDateString()}</td>
                        <td className="p-6">
                          <p className="text-xs font-bold uppercase">{i.name}</p>
                          <p className="text-[10px] text-white/40">{i.email}</p>
                          <p className="text-[10px] text-white/20 font-mono">{i.phone}</p>
                        </td>
                        <td className="p-6 text-xs uppercase font-medium text-white/60">{i.tech_stack || i.project_type}</td>
                        <td className="p-6 text-xs font-mono">{i.num_pages || '-'}</td>
                        <td className="p-6 text-xs font-mono text-brand-accent">${i.estimated_total}</td>
                        <td className="p-6">
                          <button 
                            onClick={() => setSelectedBrief(prev => prev === i.id ? null : i.id)}
                            className="px-4 py-2 bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest hover:bg-brand-accent hover:text-black transition-all"
                          >
                            [ View_Brief ]
                          </button>
                        </td>
                      </tr>
                      {/* Detailed View for selected brief */}
                      {selectedBrief === i.id && (
                      <tr className="bg-zinc-950/50">
                        <td colSpan={6} className="p-0">
                          <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-white/5">
                            <div className="space-y-8">
                              <div>
                                <h5 className="text-[9px] font-bold uppercase tracking-[0.4em] text-brand-accent mb-4">Website_Copy</h5>
                                <p className="text-xs text-white/60 leading-relaxed font-mono whitespace-pre-wrap bg-black/40 p-6 border border-white/5">
                                  {i.website_copy || 'No content provided.'}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-[9px] font-bold uppercase tracking-[0.4em] text-brand-accent mb-4">Special_Instructions</h5>
                                <p className="text-xs text-white/60 leading-relaxed font-mono bg-black/40 p-6 border border-white/5">
                                  {i.extra_features || 'None.'}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-[9px] font-bold uppercase tracking-[0.4em] text-brand-accent mb-4">Your Vision</h5>
                                <p className="text-xs text-white/60 leading-relaxed font-mono whitespace-pre-wrap bg-black/40 p-6 border border-white/5">
                                  {i.vision || 'None provided.'}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-[9px] font-bold uppercase tracking-[0.4em] text-brand-accent mb-4">Target Audience</h5>
                                <p className="text-xs font-mono">{i.target_audience || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="space-y-8">
                              <div className="grid grid-cols-2 gap-8">
                                <div>
                                  <h5 className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 mb-2">GitHub</h5>
                                  <p className="text-xs font-bold uppercase">{i.github_option === 'have' ? 'Existing Account' : 'Needs Creation'}</p>
                                </div>
                                <div>
                                  <h5 className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 mb-2">Vercel</h5>
                                  <p className="text-xs font-bold uppercase">{i.vercel_option === 'have' ? 'Existing Account' : 'Needs Deployment'}</p>
                                </div>
                                {/* Domain removed per UI update */}
                              </div>
                              <div>
                                <h5 className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 mb-4">Design Assets</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {(() => {
                                    // merge legacy refs and new assets
                                    const list: string[] = [];
                                    try { if (i.design_refs) list.push(...JSON.parse(i.design_refs)); } catch {}
                                    try { if (i.design_assets) list.push(...JSON.parse(i.design_assets)); } catch {}
                                    return list;
                                  })().length > 0 ? (
                                    (() => {
                                      const list: string[] = [];
                                      try { if (i.design_refs) list.push(...JSON.parse(i.design_refs)); } catch {}
                                      try { if (i.design_assets) list.push(...JSON.parse(i.design_assets)); } catch {}
                                      return list.map((ref: string, idx: number) => (
                                        <a key={idx} href={ref} target="_blank" rel="noopener noreferrer">
                                          <img src={ref} alt={`asset-${idx}`} className="w-full h-auto object-cover hover:scale-105 transition-transform" />
                                        </a>
                                      ));
                                    })()
                                  ) : (
                                    <p className="text-xs text-white/40">No assets provided.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>)}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
