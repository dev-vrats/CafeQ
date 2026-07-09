import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth, signOut } from '../firebase';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { GlassCard } from '../components/GlassCard';
import { BentoGrid, BentoItem } from '../components/BentoGrid';
import { useNavigate } from 'react-router-dom';
import { Coffee, Flame, Droplets, ChevronRight, Zap, LogOut, Package } from 'lucide-react';
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
      case 'relaxed': return 'bg-gradient-to-br from-status-relaxed to-[#5A7A5D] text-white border-none shadow-lg shadow-status-relaxed/30';
      case 'busy': return 'bg-gradient-to-br from-status-busy to-[#B3802A] text-white border-none shadow-lg shadow-status-busy/30';
      case 'jammed': return 'bg-gradient-to-br from-status-jammed to-maroon-dark text-white border-none shadow-lg shadow-status-jammed/30';
      default: return 'bg-glass-fill text-text-dark';
    }
  };
  
  const getRushIcon = (level: string) => {
    switch (level) {
      case 'relaxed': return <Coffee className="w-10 h-10 text-white" />;
      case 'busy': return <Flame className="w-10 h-10 text-white" />;
      case 'jammed': return <Zap className="w-10 h-10 text-white" />;
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

  return (
    <div className="min-h-screen p-6 pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-maroon/5 rounded-full blur-[80px] -z-10" />
      <div className="absolute bottom-40 left-0 w-64 h-64 bg-[#D9A441]/5 rounded-full blur-[80px] -z-10" />

      <header className="flex justify-between items-center mb-10 mt-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-sm text-text-muted font-medium mb-1">Good to see you,</p>
          <h1 className="text-4xl font-bold font-heading text-maroon-dark">{profile?.name?.split(' ')[0] || 'Student'}</h1>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3">
          {profile?.photoUrl ? (
            <img src={profile.photoUrl} alt="Profile" className="w-12 h-12 rounded-2xl border-2 border-white shadow-md object-cover" />
          ) : (
            <div className="w-12 h-12 bg-white rounded-2xl border-2 border-glass-border flex items-center justify-center font-bold text-xl text-maroon shadow-sm rotate-3">
              {profile?.name?.charAt(0) || 'U'}
            </div>
          )}
          <Button onClick={() => signOut(auth)} variant="ghost" size="sm" className="!p-2 bg-white/50 backdrop-blur-sm rounded-xl">
            <LogOut className="w-5 h-5 text-text-muted hover:text-maroon transition-colors" />
          </Button>
        </motion.div>
      </header>

      <BentoGrid>
        {/* Live Rush Meter (Largest Tile) */}
        <BentoItem colSpan={4} rowSpan={1}>
          <motion.div 
            whileHover={{ scale: 0.98 }}
            className={`h-full p-6 relative overflow-hidden rounded-[32px] transition-all duration-500 ${getRushColors(rushMeter.level)}`}
          >
            {/* Liquid Background Animation */}
            <motion.div 
              className="absolute inset-0 opacity-20 bg-white mix-blend-overlay"
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
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-widest text-white/80">Live Kiosk Status</p>
                </div>
                <h2 className="text-4xl font-bold font-heading">{getRushText(rushMeter.level)}</h2>
              </div>
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/20 rotate-[-5deg]">
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
            className="h-full p-6 flex flex-col justify-between bg-gradient-to-br from-maroon to-maroon-dark border-none shadow-xl shadow-maroon/20 text-white group overflow-hidden"
          >
            <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 mb-4 z-10">
              <Coffee className="w-7 h-7 text-white" />
            </div>
            <div className="z-10">
              <h3 className="text-3xl font-bold font-heading mb-2">Menu</h3>
              <p className="text-sm text-white/80 mb-6 leading-relaxed">Order solo or start a group cart with friends</p>
              <div className="inline-flex items-center gap-2 text-sm font-bold bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md">
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
            className="h-full p-5 flex flex-col justify-center bg-white/60 hover:bg-white/80 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-xl font-heading leading-tight text-maroon-dark">Active<br/>Orders</h3>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md ${activeOrdersCount > 0 ? 'bg-[#5A7A5D] animate-pulse' : 'bg-black/20'}`}>
                {activeOrdersCount}
              </div>
            </div>
            <p className="text-sm text-text-muted font-medium mt-1">
              {activeOrdersCount > 0 ? 'Your coffee is brewing!' : 'No orders in queue.'}
            </p>
          </GlassCard>
        </BentoItem>

        {/* Loyalty Punch Card */}
        <BentoItem colSpan={2} rowSpan={1}>
          <GlassCard interactive onClick={() => navigate('/loyalty')} className="h-full p-5 flex flex-col justify-center bg-white/60 hover:bg-white/80 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-xl font-heading leading-tight text-maroon-dark">Loyalty<br/>Rewards</h3>
              <div className="bg-maroon text-white font-bold px-3 py-1.5 rounded-lg text-sm shadow-md">
                {profile?.loyalty.coffee || 0}/5
              </div>
            </div>
            <div className="flex gap-1.5 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`flex-1 h-2.5 rounded-full ${i <= (profile?.loyalty.coffee || 0) ? 'bg-maroon shadow-sm' : 'bg-black/10'}`} />
              ))}
            </div>
          </GlassCard>
        </BentoItem>

        {/* Khata / Monthly Pass */}
        <BentoItem colSpan={2} rowSpan={1}>
          <GlassCard interactive onClick={() => navigate('/pass')} className="h-full p-5 flex items-center justify-between bg-white/60 hover:bg-white/80 transition-colors">
            <div>
              <h3 className="font-bold text-xl font-heading text-maroon-dark mb-1">Pass</h3>
              <p className="text-sm font-medium text-text-muted">₹{profile?.khata.due || 0} due</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#D9A441] to-[#B3802A] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#D9A441]/20 rotate-3">
              <Droplets className="w-6 h-6" />
            </div>
          </GlassCard>
        </BentoItem>

      </BentoGrid>
    </div>
  );
};
