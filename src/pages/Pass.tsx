import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Calendar, CheckCircle } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const Pass: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [passData, setPassData] = useState(profile?.pass);

  useEffect(() => {
    if (!profile) return;
    const unsub = onSnapshot(doc(db, 'users', profile.uid), (doc) => {
      if (doc.exists()) {
        setPassData(doc.data().pass);
      }
    });
    return () => unsub();
  }, [profile]);

  const hasPass = passData && passData.validUntil > Date.now();

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-bg-cream pt-12 relative">
      <div className="w-full max-w-md flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="!p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Monthly Pass</h1>
      </div>

      {hasPass ? (
        <GlassCard className="w-full max-w-md p-6 bg-gradient-to-br from-maroon/90 to-maroon text-white border-none shadow-xl shadow-maroon/20">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-sm opacity-80 uppercase tracking-widest font-bold mb-1">CafeQ Pass</p>
              <h2 className="text-2xl font-bold">{profile?.name}</h2>
            </div>
            <CreditCard className="w-8 h-8 opacity-50" />
          </div>

          <div className="flex items-center gap-2 mb-6 bg-white/10 w-max px-3 py-1.5 rounded-lg backdrop-blur-sm">
            <CheckCircle className="w-4 h-4 text-status-relaxed" />
            <span className="font-medium text-sm">Active Subscription</span>
          </div>

          <div className="flex justify-between items-end border-t border-white/20 pt-4">
            <div>
              <p className="text-xs opacity-70 mb-1">Valid Until</p>
              <p className="font-mono">{new Date(passData.validUntil).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-70 mb-1">Remaining Balance</p>
              <p className="font-mono text-xl font-bold">₹{passData.balance}</p>
            </div>
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="w-full max-w-md p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-4 text-text-muted">
            <Calendar className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">No Active Pass</h2>
          <p className="text-text-muted mb-6">
            Get a monthly pass to prepay for your meals and skip the payment flow at checkout. Show this to the owner to purchase one!
          </p>
          <Button disabled className="w-full">Available at Kiosk</Button>
        </GlassCard>
      )}
    </div>
  );
};
