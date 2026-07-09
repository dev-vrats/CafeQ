import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Check, CheckCircle2, ChefHat, Package, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, 'orders', orderId), (docSnap) => {
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      } else {
        alert("Order not found");
        navigate('/home');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [orderId, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-maroon" /></div>;
  }

  const steps = [
    { id: 'new', label: 'Placed', icon: <Check className="w-5 h-5" /> },
    { id: 'accepted', label: 'Accepted', icon: <CheckCircle2 className="w-5 h-5" /> },
    { id: 'preparing', label: 'Preparing', icon: <ChefHat className="w-5 h-5" /> },
    { id: 'ready', label: 'Ready for Pickup', icon: <Package className="w-5 h-5" /> },
    { id: 'pickedUp', label: 'Completed', icon: <CheckCircle2 className="w-5 h-5" /> }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order?.status);

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-bg-cream pt-12">
      <GlassCard className="w-full max-w-md p-6 mb-8 text-center relative overflow-hidden">
        {/* Dynamic Background Pulse based on status */}
        <AnimatePresence>
          {order?.status === 'ready' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.2, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
              className="absolute inset-0 bg-status-relaxed rounded-[24px] blur-3xl z-0"
            />
          )}
        </AnimatePresence>
        
        <div className="relative z-10">
          <p className="text-sm text-text-muted mb-1 uppercase tracking-widest font-bold">Order ID</p>
          <h1 className="text-2xl font-mono font-bold mb-6">#{order?.id.slice(-4).toUpperCase()}</h1>

          {/* Progress Tracker */}
          <div className="flex flex-col gap-4 relative">
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-glass-border" />
            
            {steps.map((step, idx) => {
              const isCompleted = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;
              
              return (
                <div key={step.id} className="flex items-center gap-4 relative z-10">
                  <motion.div 
                    initial={false}
                    animate={{
                      backgroundColor: isCompleted ? '#90353D' : 'rgba(255,255,255,0.5)',
                      color: isCompleted ? '#fff' : '#6B5B5E',
                      scale: isCurrent ? 1.1 : 1
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm`}
                  >
                    {step.icon}
                  </motion.div>
                  <div className={`font-bold text-left ${isCompleted ? 'text-text-dark' : 'text-text-muted opacity-60'}`}>
                    {step.label}
                    {isCurrent && step.id === 'preparing' && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                        className="text-xs font-normal text-maroon mt-0.5"
                      >
                        Play Bean Drop while you wait!
                      </motion.p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {order?.status === 'preparing' && (
        <Button onClick={() => navigate('/game')} className="w-full max-w-md mb-4 bg-[#D9A441] text-text-dark hover:bg-yellow-500">
          Play Bean Drop Minigame
        </Button>
      )}

      <Button variant="secondary" onClick={() => navigate('/home')} className="w-full max-w-md">
        Back to Home
      </Button>
    </div>
  );
};
