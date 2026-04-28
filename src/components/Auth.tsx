import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock } from 'lucide-react';

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl text-left"
      >
        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">
          {isSignUp ? 'Create' : 'System'} <span className="text-brand">Access</span>
        </h2>
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-8">
          {isSignUp ? 'Join the archive' : 'Identify yourself to continue'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="email" 
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-brand/50 transition-all"
                value={email} onChange={e => setEmail(e.target.value)} required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="password" 
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-brand/50 transition-all"
                value={password} onChange={e => setPassword(e.target.value)} required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-brand text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] mt-4 shadow-lg shadow-brand/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (isSignUp ? 'Create Account' : 'Enter Archive')}
          </button>
        </form>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-6 text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
        >
          {isSignUp ? 'Already have an account? Login' : "Don't have an account? Register"}
        </button>
      </motion.div>
    </div>
  );
};