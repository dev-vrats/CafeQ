import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { ArrowLeft, Clock, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const generateSlots = () => {
  const slots = [];
  let current = new Date();
  
  // Start from next 10 minute interval
  const remainder = 10 - (current.getMinutes() % 10);
  current.setMinutes(current.getMinutes() + remainder, 0, 0);

  for (let i = 0; i < 12; i++) { // 2 hours of 10 min slots
    const start = new Date(current);
    const end = new Date(current.getTime() + 10 * 60000);
    slots.push({
      id: `slot_${start.getTime()}`,
      label: `${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
      time: start.getTime(),
      capacity: 6 // Mock capacity, ideally fetched from Firestore
    });
    current = end;
  }
  return slots;
};

export const Checkout: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [slots] = useState(generateSlots());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Monthly pass logic mockup
  const passesRemaining = 0; // Would be fetched from passes/{uid}

  const handleCheckout = async () => {
    if (!selectedSlot || !profile) return;
    setLoading(true);
    
    try {
      const orderRef = await addDoc(collection(db, 'orders'), {
        type: 'solo',
        items: items.map(i => ({ itemId: i.id, qty: i.quantity, price: i.price, name: i.name })),
        slotId: selectedSlot,
        status: 'new',
        studentUid: profile.uid,
        paymentStatus: 'pending',
        isCredit: false,
        total,
        createdAt: Date.now()
      });

      clearCart();
      navigate(`/order/${orderRef.id}`);
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        <GlassCard className="p-8 text-center max-w-sm">
          <h2 className="text-xl font-bold mb-4">Cart is empty</h2>
          <Button onClick={() => navigate('/menu')}>Back to Menu</Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pb-32">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="!p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-maroon" /> Select Pickup Time
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {slots.map((slot) => (
              <motion.button
                key={slot.id}
                whileTap={{ scale: 0.95 }}
                disabled={slot.capacity <= 0}
                onClick={() => setSelectedSlot(slot.id)}
                className={`p-3 rounded-[16px] text-sm font-medium border text-center transition-colors
                  ${selectedSlot === slot.id 
                    ? 'bg-maroon text-white border-maroon shadow-lg shadow-maroon/20' 
                    : slot.capacity > 0
                      ? 'bg-white/50 border-glass-border text-text-dark hover:bg-white'
                      : 'bg-black/5 border-black/5 text-text-muted opacity-50 cursor-not-allowed'
                  }
                `}
              >
                {slot.label}
                <div className={`text-xs mt-1 ${selectedSlot === slot.id ? 'text-white/80' : 'text-text-muted'}`}>
                  {slot.capacity > 0 ? `${slot.capacity} spots left` : 'Full'}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm border-b border-black/5 pb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-maroon">{item.quantity}x</span>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {passesRemaining > 0 && (
              <div className="bg-status-relaxed/10 border border-status-relaxed text-status-relaxed rounded-xl p-3 flex gap-2 text-sm items-start mb-6">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Monthly Pass Available</p>
                  <p>You have {passesRemaining} coffees left. A credit will be applied if eligible.</p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-xl font-bold mb-6 pt-4 border-t border-glass-border">
              <span>Total to Pay</span>
              <span>₹{total}</span>
            </div>

            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleCheckout} 
              disabled={!selectedSlot || loading}
            >
              {loading ? 'Processing...' : (selectedSlot ? 'Confirm & Pay at Counter' : 'Select a time slot')}
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
