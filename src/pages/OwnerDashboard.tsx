import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { signOut, auth, db } from '../firebase';
import { collection, doc, onSnapshot, query, orderBy, setDoc, updateDoc, increment } from 'firebase/firestore';
import { GlassCard } from '../components/GlassCard';
import { BentoGrid, BentoItem } from '../components/BentoGrid';
import { LogOut, Coffee, Flame, Zap } from 'lucide-react';
import type { MenuItem } from '../contexts/CartContext';

export const OwnerDashboard: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [rushMeter, setRushMeter] = useState<any>({ level: 'relaxed', mode: 'auto' });

  useEffect(() => {
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    const unsubMenu = onSnapshot(collection(db, 'menu'), (snap) => {
      setMenuItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem)));
    });

    const unsubRush = onSnapshot(doc(db, 'rushMeter', 'current'), (snap) => {
      if (snap.exists()) setRushMeter(snap.data());
    });

    return () => { unsubOrders(); unsubMenu(); unsubRush(); };
  }, []);

  const advanceOrderStatus = async (order: any) => {
    const flow = { 'new': 'accepted', 'accepted': 'preparing', 'preparing': 'ready', 'ready': 'pickedUp' };
    const nextStatus = (flow as any)[order.status];
    if (nextStatus) {
      await updateDoc(doc(db, 'orders', order.id), { status: nextStatus });
      if (nextStatus === 'pickedUp' && order.studentUid) {
        const totalItems = order.items.reduce((sum: number, item: any) => sum + item.qty, 0);
        await updateDoc(doc(db, 'users', order.studentUid), {
          'loyalty.coffee': increment(totalItems)
        });
      }
    }
  };

  const toggleAvailability = async (itemId: string, current: boolean) => {
    await updateDoc(doc(db, 'menu', itemId), { available: !current });
  };

  const setRushMode = async (mode: 'auto' | 'manual', level?: string) => {
    await setDoc(doc(db, 'rushMeter', 'current'), {
      mode,
      level: level || rushMeter.level,
      updatedAt: Date.now()
    }, { merge: true });
  };

  const seedData = async () => {
    const seedMenu = [
      { id: 'm1', name: 'Hot Coffee', category: 'Beverage', price: 20, available: true },
      { id: 'm2', name: 'Cold Coffee', category: 'Beverage', price: 50, available: true },
      { id: 'm3', name: 'Iced Latte', category: 'Beverage', price: 60, available: true },
      { id: 'm4', name: 'Black Coffee', category: 'Beverage', price: 15, available: true },
      { id: 'm5', name: 'Masala Chai', category: 'Beverage', price: 15, available: true },
      { id: 'm6', name: 'Maggi', category: 'Food', price: 40, available: true },
      { id: 'm7', name: 'Cheese Maggi', category: 'Food', price: 50, available: true },
      { id: 'm8', name: 'Bread Omelette', category: 'Food', price: 35, available: true },
      { id: 'm9', name: 'Veg Sandwich', category: 'Food', price: 45, available: true },
      { id: 'm10', name: 'French Fries', category: 'Food', price: 40, available: true },
      { id: 'm11', name: 'Lemon Iced Tea', category: 'Beverage', price: 35, available: true },
    ];
    for (const item of seedMenu) {
      const { id, ...data } = item;
      await setDoc(doc(db, 'menu', id), data);
    }
    await setDoc(doc(db, 'rushMeter', 'current'), { level: 'relaxed', mode: 'auto', updatedAt: Date.now() });
    alert('Seeded successfully!');
  };

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Removed blurred orbs */}

      <header className="flex justify-between items-center mb-6 relative z-10">
        <h1 className="text-3xl font-bold text-text-dark font-heading drop-shadow-sm">Owner Dashboard</h1>
        <Button onClick={() => signOut(auth)} variant="secondary" size="sm" className="!p-2">
          <LogOut className="w-5 h-5 text-text-muted hover:text-maroon transition-colors" />
        </Button>
      </header>

      <BentoGrid className="auto-rows-min relative z-10">
        {/* Live Order Queue */}
        <BentoItem colSpan={4} rowSpan={1} className="min-h-[400px]">
          <GlassCard className="h-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold font-heading text-text-dark drop-shadow-sm">Live Order Queue</h2>
              {menuItems.length === 0 && <Button onClick={seedData} size="sm">Seed Menu Data</Button>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100%-3rem)]">
              {['new', 'preparing', 'ready'].map(statusColumn => (
                <div key={statusColumn} className="bg-glass-fill/50 rounded-3xl p-5 overflow-y-auto border border-white/40 shadow-inner">
                  <h3 className="font-bold text-sm uppercase tracking-wider mb-4 opacity-70 text-text-dark">
                    {statusColumn === 'new' ? 'New Orders' : statusColumn === 'preparing' ? 'Preparing' : 'Ready'}
                  </h3>
                  <div className="space-y-4">
                    {orders.filter(o => {
                      if (statusColumn === 'new') return o.status === 'new';
                      if (statusColumn === 'preparing') return o.status === 'accepted' || o.status === 'preparing';
                      if (statusColumn === 'ready') return o.status === 'ready';
                      return false;
                    }).map(order => (
                      <GlassCard key={order.id} className="p-4 bg-white/80 border-white/60 shadow-lg hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold font-mono text-sm">#{order.id.slice(-4).toUpperCase()}</span>
                          <span className="text-xs bg-maroon-light/30 text-maroon px-2 py-0.5 rounded-md font-bold">{order.type}</span>
                        </div>
                        <ul className="text-sm mb-4 space-y-1 text-text-muted">
                          {order.items.map((i: any, idx: number) => (
                            <li key={idx}><span className="font-bold text-text-dark">{i.qty}x</span> {i.name}</li>
                          ))}
                        </ul>
                        <Button 
                          size="sm" 
                          variant={statusColumn === 'new' ? 'primary' : 'secondary'}
                          className={`w-full text-xs ${statusColumn !== 'new' && 'border-maroon/30 text-maroon hover:bg-maroon-light/20'}`}
                          onClick={() => advanceOrderStatus(order)}
                        >
                          {order.status === 'new' ? 'Accept' : order.status === 'accepted' ? 'Start Preparing' : order.status === 'preparing' ? 'Mark Ready' : 'Mark Picked Up'}
                        </Button>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </BentoItem>

        {/* Rush Meter Control */}
        <BentoItem colSpan={2} rowSpan={1}>
          <GlassCard className="h-full p-6 flex flex-col justify-between">
            <h2 className="text-xl font-bold mb-4 font-heading drop-shadow-sm">Rush Meter</h2>
            <div className="flex items-center justify-between mb-4 bg-white/40 p-2 rounded-2xl border border-white/50 shadow-inner">
              <span className="font-medium text-sm ml-2 text-text-muted">Mode:</span>
              <div className="flex gap-2">
                <Button size="sm" variant={rushMeter.mode === 'auto' ? 'primary' : 'ghost'} onClick={() => setRushMode('auto')}>Auto</Button>
                <Button size="sm" variant={rushMeter.mode === 'manual' ? 'primary' : 'ghost'} onClick={() => setRushMode('manual')}>Manual</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <Button size="sm" disabled={rushMeter.mode === 'auto'} onClick={() => setRushMode('manual', 'relaxed')} className={`shadow-none hover:shadow-none border-transparent text-white ${rushMeter.level === 'relaxed' ? 'bg-status-relaxed scale-105' : 'bg-status-relaxed/40 opacity-70 hover:opacity-100'}`}><Coffee className="w-4 h-4 mr-1"/> Relax</Button>
              <Button size="sm" disabled={rushMeter.mode === 'auto'} onClick={() => setRushMode('manual', 'busy')} className={`shadow-none hover:shadow-none border-transparent text-white ${rushMeter.level === 'busy' ? 'bg-status-busy scale-105' : 'bg-status-busy/40 opacity-70 hover:opacity-100'}`}><Flame className="w-4 h-4 mr-1"/> Busy</Button>
              <Button size="sm" disabled={rushMeter.mode === 'auto'} onClick={() => setRushMode('manual', 'jammed')} className={`shadow-none hover:shadow-none border-transparent text-white ${rushMeter.level === 'jammed' ? 'bg-status-jammed scale-105' : 'bg-status-jammed/40 opacity-70 hover:opacity-100'}`}><Zap className="w-4 h-4 mr-1"/> Jam</Button>
            </div>
          </GlassCard>
        </BentoItem>

        {/* Inventory Management */}
        <BentoItem colSpan={2} rowSpan={1}>
          <GlassCard className="h-full p-6 overflow-y-auto max-h-[300px] custom-scrollbar">
            <h2 className="text-xl font-bold mb-4 font-heading drop-shadow-sm">Inventory</h2>
            <div className="space-y-3">
              {menuItems.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-white/40 border border-white/50 shadow-sm rounded-2xl hover:bg-white/60 transition-colors">
                  <span className="font-medium text-text-dark drop-shadow-sm">{item.name}</span>
                  <Button 
                    size="sm" 
                    variant={item.available ? 'secondary' : 'danger'} 
                    onClick={() => toggleAvailability(item.id, item.available)}
                    className={item.available ? 'border-maroon/20 text-maroon hover:bg-maroon-light/20 shadow-none' : ''}
                  >
                    {item.available ? 'In Stock' : 'Sold Out'}
                  </Button>
                </div>
              ))}
            </div>
          </GlassCard>
        </BentoItem>

      </BentoGrid>
    </div>
  );
};
