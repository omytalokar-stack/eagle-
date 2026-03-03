import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/src/components/BackButton';

export const AdminLock: React.FC = () => {
  const navigate = useNavigate();
  const [key, setKey] = React.useState('');
  const [error, setError] = React.useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key === 'omy13456') {
      navigate('/admin');
    } else {
      setError('Invalid Access Key');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <BackButton />
      <form onSubmit={submit} className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-display font-black tracking-tighter mb-2">Admin Lock</h1>
          <p className="text-white/40 text-xs uppercase tracking-widest">Enter Access Key</p>
        </div>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Access Key"
          className="w-full bg-white/5 border border-white/10 py-4 px-6 text-center text-xl outline-none focus:border-brand-accent transition-colors"
        />
        {error && <div className="text-red-500 text-xs text-center">{error}</div>}
        <button className="w-full py-4 bg-brand-accent text-black font-black uppercase tracking-widest">
          Authorize
        </button>
      </form>
    </div>
  );
};
