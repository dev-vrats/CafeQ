import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coffee, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const Loyalty: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [coffeeCount, setCoffeeCount] = useState(profile?.loyalty.coffee || 0);

  useEffect(() => {
    if (!profile) return;
    const unsub = onSnapshot(doc(db, 'users', profile.uid), (doc) => {
      if (doc.exists()) {
        setCoffeeCount(doc.data().loyalty?.coffee || 0);
      }
    });
    return () => unsub();
  }, [profile]);

  const maxPunches = 5;
  const progress = Math.min(coffeeCount, maxPunches);
  const unlocked = coffeeCount >= maxPunches;

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-bg-cream pt-12 relative overflow-hidden">
      
      {unlocked && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
        >
          <div className="w-[150vw] h-[150vw] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-400/40 via-maroon-light/10 to-transparent blur-3xl opacity-50" />
        </motion.div>
      )}

      <div className="w-full max-w-md flex items-center gap-4 mb-8 relative z-10">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="!p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Loyalty Rewards</h1>
      </div>

      <GlassCard className="w-full max-w-md p-6 relative z-10 overflow-hidden">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-maroon/10 rounded-full flex items-center justify-center mx-auto mb-4 text-maroon">
            <Gift className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Buy 5, Get 1 Free</h2>
          <p className="text-text-muted">Earn a punch for every coffee ordered. Complete the card for a free Maggi!</p>
        </div>

        <div className="bg-white/50 border border-glass-border rounded-2xl p-6 relative">
          <div className="grid grid-cols-5 gap-3 relative z-10">
            {[...Array(maxPunches)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`aspect-square rounded-full flex items-center justify-center transition-colors duration-500
                  ${i < progress 
                    ? 'bg-maroon text-white shadow-lg shadow-maroon/30' 
                    : 'bg-black/5 text-black/20 border-2 border-black/5 border-dashed'
                  }
                `}
              >
                <Coffee className={`w-6 h-6 ${i < progress ? 'fill-current' : ''}`} />
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            {unlocked ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-status-relaxed text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Gift className="w-5 h-5" />
                Reward Unlocked!
              </motion.div>
            ) : (
              <p className="font-bold text-maroon">
                {maxPunches - progress} more to go!
              </p>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
