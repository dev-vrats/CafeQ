import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Coffee, Mail, Lock, ArrowRight, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Login: React.FC = () => {
  const { user, profile, loading, ownerClaimAvailable, claimOwner } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [continuingAsStudent, setContinuingAsStudent] = useState(false);

  if (loading) return null;

  // Intercept the redirect if owner claim is available and they haven't explicitly chosen to continue as student
  if (user && profile && !continuingAsStudent) {
    if (ownerClaimAvailable && profile.role !== 'owner') {
      // Don't redirect yet! Render the claim screen below.
    } else {
      if (profile.role === 'owner') return <Navigate to="/owner" replace />;
      return <Navigate to="/home" replace />;
    }
  } else if (user && profile && continuingAsStudent) {
    return <Navigate to="/home" replace />;
  }

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      console.error("Google Login failed", e);
      setError(e.message || "Google Login failed");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (isRegistering && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setError('');
    setIsProcessing(true);
    
    try {
      if (isRegistering) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(cred.user, { displayName: name.trim() });
        const { setDoc, doc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          role: 'student',
          name: name.trim(),
          phone: '',
          photoUrl: '',
          loyalty: { coffee: 0 },
          khata: { due: 0 }
        }, { merge: true });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e: any) {
      console.error("Email Auth failed", e);
      setError(e.message || "Authentication failed. Check your credentials.");
    } finally {
      setIsProcessing(false);
    }
  };

  // If user is authenticated and owner claim is available, show the claim screen
  if (user && profile && ownerClaimAvailable && profile.role !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-bg-cream relative overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-maroon-light/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#D9A441]/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md bg-white/40 backdrop-blur-2xl border border-white/60 p-8 rounded-[32px] shadow-[0_20px_40px_-15px_rgba(144,53,61,0.15)] z-10 relative overflow-hidden text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[#D9A441] to-maroon rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-maroon/20 rotate-3">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2 text-text-dark font-heading">Claim Kiosk</h1>
          <p className="text-text-muted mb-8">It looks like this CafeQ instance doesn't have an owner yet. Are you the owner?</p>

          <div className="space-y-4">
            <Button onClick={claimOwner} className="w-full h-14 text-lg">
              Yes, I run this Kiosk
            </Button>
            <Button variant="ghost" onClick={() => setContinuingAsStudent(true)} className="w-full h-12">
              No, I'm just a student
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-cream relative overflow-hidden">
      {/* Liquid Glass Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-gradient-to-br from-maroon/10 to-transparent rounded-full blur-[100px]" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-gradient-to-tr from-[#D9A441]/10 to-transparent rounded-full blur-[100px]" 
      />
      
      <div className="w-full max-w-[1000px] grid md:grid-cols-2 gap-8 items-center z-10">
        
        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-col justify-center pr-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-maroon to-maroon-dark rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-maroon/30 -rotate-6">
              <Coffee className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-6xl font-bold mb-6 text-text-dark font-heading leading-tight">
              Liquid Glass <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-maroon to-[#D9A441]">on Latte.</span>
            </h1>
            <p className="text-xl text-text-muted leading-relaxed max-w-md">
              Skip the line, order ahead, and track your caffeine levels with the smartest kiosk on campus.
            </p>
          </motion.div>
        </div>

        {/* Right Side: Auth Form (Bento Glass Style) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-white/40 backdrop-blur-2xl border border-white/60 p-8 sm:p-10 rounded-[32px] shadow-[0_20px_40px_-15px_rgba(144,53,61,0.15)] relative overflow-hidden">
            {/* Inner highlights for liquid glass effect */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-20 pointer-events-none rounded-[32px]" />
            
            {/* Mobile Branding */}
            <div className="md:hidden flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-maroon to-maroon-dark rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-maroon/30">
                <Coffee className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold font-heading">CafeQ</h2>
            </div>

            <div className="flex gap-4 mb-8 bg-black/5 p-1.5 rounded-2xl relative z-10">
              <button 
                onClick={() => { setIsRegistering(false); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${!isRegistering ? 'bg-white text-maroon shadow-sm' : 'text-text-muted hover:text-text-dark'}`}
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
              <button 
                onClick={() => { setIsRegistering(true); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${isRegistering ? 'bg-white text-maroon shadow-sm' : 'text-text-muted hover:text-text-dark'}`}
              >
                <UserPlus className="w-4 h-4" /> Sign Up
              </button>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={isRegistering ? 'register' : 'login'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-status-jammed/10 border border-status-jammed/20 text-status-jammed text-sm p-4 rounded-2xl mb-6 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
                  {isRegistering && (
                    <div className="relative">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/50 border border-glass-border pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-maroon focus:bg-white transition-all duration-300 placeholder:text-text-muted/60"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/50 border border-glass-border pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-maroon focus:bg-white transition-all duration-300 placeholder:text-text-muted/60"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/50 border border-glass-border pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-maroon focus:bg-white transition-all duration-300 placeholder:text-text-muted/60"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full h-14 text-lg mt-2 group" disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : (
                      <span className="flex items-center justify-center gap-2">
                        {isRegistering ? 'Create Account' : 'Sign In'}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>

                <div className="flex items-center justify-between text-sm text-text-muted mb-6">
                  <span className="w-full border-t border-glass-border"></span>
                  <span className="px-4 font-medium">or continue with</span>
                  <span className="w-full border-t border-glass-border"></span>
                </div>

                <button 
                  type="button"
                  onClick={handleGoogleLogin} 
                  className="w-full bg-white border border-glass-border hover:border-maroon/30 hover:bg-white/90 text-text-dark font-medium py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    <path fill="none" d="M1 1h22v22H1z" />
                  </svg>
                  Google
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
