import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Share2, Copy } from 'lucide-react';

export const GroupOrders: React.FC = () => {
  const { items } = useCart();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const total = items.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0);
  const splitAmount = (people: number) => (total / people).toFixed(2);
  const [peopleCount, setPeopleCount] = useState(2);

  const shareText = `Hey! I'm ordering from CafeQ. Total is ₹${total}. Your share is ₹${splitAmount(peopleCount)}. Pay me via UPI!`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-bg-cream pt-12">
      <div className="w-full max-w-md flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="!p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Group Order</h1>
      </div>

      <GlassCard className="w-full max-w-md p-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-maroon/10 rounded-full flex items-center justify-center mx-auto mb-4 text-maroon">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-1">Split the Bill</h2>
          <p className="text-text-muted">Easily divide your ₹{total} order among friends.</p>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-bold mb-2 text-text-muted uppercase tracking-wider">Number of People</label>
          <div className="flex items-center justify-between bg-white/50 border border-glass-border rounded-xl p-2">
            <button 
              onClick={() => setPeopleCount(Math.max(2, peopleCount - 1))}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-glass-border font-bold text-xl hover:bg-black/5"
            >-</button>
            <span className="text-2xl font-bold">{peopleCount}</span>
            <button 
              onClick={() => setPeopleCount(peopleCount + 1)}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-glass-border font-bold text-xl hover:bg-black/5"
            >+</button>
          </div>
        </div>

        <div className="bg-maroon text-white rounded-2xl p-6 text-center mb-6">
          <p className="text-sm opacity-80 mb-1">Each Person Pays</p>
          <p className="text-4xl font-bold font-mono">₹{splitAmount(peopleCount)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={copyToClipboard} variant="secondary" className="flex items-center justify-center gap-2">
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy Info'}
          </Button>
          <Button onClick={shareViaWhatsApp} className="flex items-center justify-center gap-2 !bg-[#25D366] hover:!bg-[#20b958] !text-white">
            <Share2 className="w-4 h-4" />
            WhatsApp
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};
