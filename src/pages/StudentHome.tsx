import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth, signOut } from '../firebase';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { GlassCard } from '../components/GlassCard';
import { BentoGrid, BentoItem } from '../components/BentoGrid';
import { useNavigate } from 'react-router-dom';
import { Coffee, Flame, Droplets, ChevronRight, Zap, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';

interface RushMeterData {
  level: 'relaxed' | 'busy' | 'jammed';
  mode: 'auto' | 'manual';
  updatedAt: number;
}

export const StudentHome: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [rushMeter, setRushMeter] = useState<RushMeterData>({ level: 'relaxed', mode: 'auto', updatedAt: Date.now() });
  const [activeOrdersCount, setActiveOrdersCount] = useState<number>(0);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  useEffect(() => {
    const unsubRush = onSnapshot(doc(db, 'rushMeter', 'current'), (docSnap) => {
      if (docSnap.exists()) {
        setRushMeter(docSnap.data() as RushMeterData);
      }
    });

    if (profile?.uid) {
      const unsubOrders = onSnapshot(query(collection(db, 'orders'), where('studentUid', '==', profile.uid)), (snap) => {
        const activeDocs = snap.docs.filter(doc => ['new', 'accepted', 'preparing', 'ready'].includes(doc.data().status));
        setActiveOrdersCount(activeDocs.length);
        if (activeDocs.length > 0) {
          setActiveOrderId(activeDocs[0].id);
        } else {
          setActiveOrderId(null);
        }
      });
      return () => { unsubRush(); unsubOrders(); };
    }

    return () => unsubRush();
  }, [profile]);

  const getRushColors = (level: string) => {
    switch (level) {
      case 'relaxed': return 'bg-gradient-to-br from-status-relaxed/90 to-status-relaxed/70 text-white backdrop-blur-xl border border-white/40 shadow-[0_20px_40px_-10px_rgba(74,222,128,0.4)]';
      case 'busy': return 'bg-gradient-to-br from-status-busy/90 to-status-busy/70 text-white backdrop-blur-xl border border-white/40 shadow-[0_20px_40px_-10px_rgba(251,191,36,0.4)]';
      case 'jammed': return 'bg-gradient-to-br from-status-jammed/90 to-status-jammed/70 text-white backdrop-blur-xl border border-white/40 shadow-[0_20px_40px_-10px_rgba(248,113,113,0.4)]';
      default: return 'bg-glass-fill text-text-dark';
    }
  };
  
  const getRushIcon = (level: string) => {
    switch (level) {
      case 'relaxed': return <Coffee className="w-10 h-10 text-white drop-shadow-md" />;
      case 'busy': return <Flame className="w-10 h-10 text-white drop-shadow-md" />;
      case 'jammed': return <Zap className="w-10 h-10 text-white drop-shadow-md" />;
      default: return null;
    }
  };

  const getRushText = (level: string) => {
    switch (level) {
      case 'relaxed': return 'Quick Service';
      case 'busy': return 'Moderate Wait';
      case 'jammed': return 'Heavy Rush';
      default: return 'Unknown Status';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    return 'Good evening,';
  };

  return (
    <div className="min-h-screen p-6 pb-24 relative overflow-hidden">
      {/* Background Ambience Spatial Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-maroon-light/30 rounded-full blur-[100px] -z-10" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-20 left-[-10%] w-96 h-96 bg-maroon/20 rounded-full blur-[100px] -z-10" 
      />

      <header className="flex justify-between items-center mb-10 mt-4 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-sm text-text-muted font-medium mb-1 drop-shadow-sm">{getGreeting()}</p>
          <h1 className="text-4xl font-bold font-heading text-text-dark drop-shadow-md">{profile?.name?.split(' ')[0] || 'Student'}</h1>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3">
          {profile?.photoUrl ? (
            <img src={profile.photoUrl} alt="Profile" className="w-12 h-12 rounded-2xl border-2 border-white shadow-lg object-cover" />
          ) : (
            <div className="w-12 h-12 bg-white rounded-2xl border border-glass-border flex items-center justify-center font-bold text-xl text-maroon shadow-lg rotate-3 backdrop-blur-md">
              {profile?.name?.charAt(0) || 'U'}
            </div>
          )}
          <Button onClick={() => signOut(auth)} variant="secondary" size="sm" className="!p-2">
            <LogOut className="w-5 h-5 text-text-muted hover:text-maroon transition-colors" />
          </Button>
        </motion.div>
      </header>

      <BentoGrid className="relative z-10">
        {/* Live Rush Meter (Largest Tile) */}
        <BentoItem colSpan={4} rowSpan={1}>
          <motion.div 
            whileHover={{ scale: 0.98 }}
            className={`h-full p-6 relative overflow-hidden rounded-[32px] transition-all duration-500 ${getRushColors(rushMeter.level)}`}
          >
            {/* Liquid Background Animation */}
            <motion.div 
              className="absolute inset-0 opacity-30 bg-white mix-blend-overlay"
              animate={{ 
                y: ["0%", "-10%", "0%"],
                x: ["0%", "5%", "0%"],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', scale: 1.5 }}
            />
            
            <div className="relative z-10 flex justify-between items-center h-full">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  <p className="text-xs font-bold uppercase tracking-widest text-white/90 drop-shadow-sm">Live Status</p>
                </div>
                <h2 className="text-4xl font-bold font-heading drop-shadow-md">{getRushText(rushMeter.level)}</h2>
              </div>
              <div className="bg-white/30 p-4 rounded-3xl backdrop-blur-lg border border-white/40 shadow-xl rotate-[-5deg] hover:rotate-0 transition-transform duration-500">
                {getRushIcon(rushMeter.level)}
              </div>
            </div>
          </motion.div>
        </BentoItem>

        {/* Order Now Tile */}
        <BentoItem colSpan={2} rowSpan={2}>
          <GlassCard 
            interactive 
            onClick={() => navigate('/menu')}
            className="h-full p-6 flex flex-col justify-between bg-gradient-to-br from-maroon to-maroon-dark border-none shadow-[0_20px_40px_-10px_rgba(204,72,60,0.5)] text-white group overflow-hidden"
          >
            <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="w-14 h-14 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-lg border border-white/30 mb-4 z-10 shadow-lg">
              <Coffee className="w-7 h-7 text-white drop-shadow-md" />
            </div>
            <div className="z-10">
              <h3 className="text-3xl font-bold font-heading mb-2 drop-shadow-md">Menu</h3>
              <p className="text-sm text-white/90 mb-6 leading-relaxed">Order your favorites with just a few taps.</p>
              <div className="inline-flex items-center gap-2 text-sm font-bold bg-white/30 px-4 py-2 rounded-2xl backdrop-blur-md shadow-lg border border-white/20">
                Browse
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </GlassCard>
        </BentoItem>

        {/* Active Orders Status */}
        <BentoItem colSpan={2} rowSpan={1}>
          <GlassCard 
            interactive={activeOrdersCount > 0}
            onClick={() => { if (activeOrderId) navigate(`/order/${activeOrderId}`); }}
            className="h-full p-5 flex flex-col justify-center"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-xl font-heading leading-tight text-text-dark">Active<br/>Orders</h3>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg ${activeOrdersCount > 0 ? 'bg-status-relaxed animate-[pulse_2s_ease-in-out_infinite]' : 'bg-text-muted/30'}`}>
                {activeOrdersCount}
              </div>
            </div>
            <p className="text-sm text-text-muted font-medium mt-1">
              {activeOrdersCount > 0 ? 'Your order is in the works!' : 'No orders in queue.'}
            </p>
          </GlassCard>
        </BentoItem>

        {/* Loyalty Punch Card */}
        <BentoItem colSpan={2} rowSpan={1}>
          <GlassCard interactive onClick={() => navigate('/loyalty')} className="h-full p-5 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-xl font-heading leading-tight text-text-dark">Loyalty<br/>Rewards</h3>
              <div className="bg-maroon-light/30 text-maroon font-bold px-3 py-1.5 rounded-xl text-sm border border-maroon-light/50">
                {profile?.loyalty.coffee || 0}/5
              </div>
            </div>
            <div className="flex gap-1.5 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`flex-1 h-2.5 rounded-full ${i <= (profile?.loyalty.coffee || 0) ? 'bg-maroon shadow-[0_0_10px_rgba(204,72,60,0.5)]' : 'bg-black/5 inset-shadow-sm'}`} />
              ))}
            </div>
          </GlassCard>
        </BentoItem>

        {/* Khata / Monthly Pass */}
        <BentoItem colSpan={4} rowSpan={1}>
          <GlassCard interactive onClick={() => navigate('/pass')} className="h-full p-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-2xl font-heading text-text-dark mb-1">Store Pass</h3>
              <p className="text-sm font-medium text-text-muted">₹{profile?.khata.due || 0} due balance</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-status-busy to-orange-400 rounded-3xl flex items-center justify-center text-white shadow-[0_10px_20px_-10px_rgba(251,191,36,0.6)] rotate-3 hover:rotate-6 transition-transform">
              <Droplets className="w-7 h-7 drop-shadow-md" />
            </div>
          </GlassCard>
        </BentoItem>

      </BentoGrid>
    </div>
  );
};
