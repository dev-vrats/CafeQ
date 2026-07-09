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

  const advanceOrderStatus = async (orderId: string, currentStatus: string, studentUid?: string) => {
    const flow = { 'new': 'accepted', 'accepted': 'preparing', 'preparing': 'ready', 'ready': 'pickedUp' };
    const nextStatus = (flow as any)[currentStatus];
    if (nextStatus) {
      await updateDoc(doc(db, 'orders', orderId), { status: nextStatus });
      if (nextStatus === 'pickedUp' && studentUid) {
        await updateDoc(doc(db, 'users', studentUid), {
          'loyalty.coffee': increment(1)
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
    <div className="min-h-screen p-6 bg-bg-cream">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-dark">Owner Dashboard</h1>
        <Button onClick={() => signOut(auth)} variant="secondary" size="sm" className="!p-2">
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      <BentoGrid className="auto-rows-min">
        {/* Live Order Queue */}
        <BentoItem colSpan={4} rowSpan={1} className="min-h-[400px]">
          <GlassCard className="h-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Live Order Queue</h2>
              {menuItems.length === 0 && <Button onClick={seedData} size="sm">Seed Menu Data</Button>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100%-3rem)]">
              {['new', 'preparing', 'ready'].map(statusColumn => (
                <div key={statusColumn} className="bg-black/5 rounded-xl p-4 overflow-y-auto">
                  <h3 className="font-bold text-sm uppercase tracking-wider mb-4 opacity-70">
                    {statusColumn === 'new' ? 'New Orders' : statusColumn === 'preparing' ? 'Preparing' : 'Ready'}
                  </h3>
                  <div className="space-y-3">
                    {orders.filter(o => {
                      if (statusColumn === 'new') return o.status === 'new';
                      if (statusColumn === 'preparing') return o.status === 'accepted' || o.status === 'preparing';
                      if (statusColumn === 'ready') return o.status === 'ready';
                      return false;
                    }).map(order => (
                      <GlassCard key={order.id} className="p-3 bg-glass-fill border-glass-border">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold font-mono text-sm">#{order.id.slice(-4).toUpperCase()}</span>
                          <span className="text-xs bg-maroon/10 text-maroon px-2 py-0.5 rounded-md font-bold">{order.type}</span>
                        </div>
                        <ul className="text-sm mb-3 space-y-1">
                          {order.items.map((i: any, idx: number) => (
                            <li key={idx}><span className="font-bold">{i.qty}x</span> {i.name}</li>
                          ))}
                        </ul>
                        <Button 
                          size="sm" 
                          className="w-full text-xs"
                          onClick={() => advanceOrderStatus(order.id, order.status, order.studentUid)}
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
            <h2 className="text-xl font-bold mb-4">Rush Meter</h2>
            <div className="flex items-center justify-between mb-4 bg-black/5 p-2 rounded-xl">
              <span className="font-medium text-sm ml-2">Mode:</span>
              <div className="flex gap-2">
                <Button size="sm" variant={rushMeter.mode === 'auto' ? 'primary' : 'ghost'} onClick={() => setRushMode('auto')}>Auto</Button>
                <Button size="sm" variant={rushMeter.mode === 'manual' ? 'primary' : 'ghost'} onClick={() => setRushMode('manual')}>Manual</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button size="sm" disabled={rushMeter.mode === 'auto'} onClick={() => setRushMode('manual', 'relaxed')} className={`!bg-status-relaxed ${rushMeter.level === 'relaxed' ? 'ring-2 ring-offset-2 ring-status-relaxed' : 'opacity-50'}`}><Coffee className="w-4 h-4 mr-1"/> Relaxed</Button>
              <Button size="sm" disabled={rushMeter.mode === 'auto'} onClick={() => setRushMode('manual', 'busy')} className={`!bg-status-busy ${rushMeter.level === 'busy' ? 'ring-2 ring-offset-2 ring-status-busy' : 'opacity-50'}`}><Flame className="w-4 h-4 mr-1"/> Busy</Button>
              <Button size="sm" disabled={rushMeter.mode === 'auto'} onClick={() => setRushMode('manual', 'jammed')} className={`!bg-status-jammed ${rushMeter.level === 'jammed' ? 'ring-2 ring-offset-2 ring-status-jammed' : 'opacity-50'}`}><Zap className="w-4 h-4 mr-1"/> Jammed</Button>
            </div>
          </GlassCard>
        </BentoItem>

        {/* Inventory Management */}
        <BentoItem colSpan={2} rowSpan={1}>
          <GlassCard className="h-full p-6 overflow-y-auto max-h-[300px]">
            <h2 className="text-xl font-bold mb-4">Inventory</h2>
            <div className="space-y-2">
              {menuItems.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 hover:bg-black/5 rounded-lg transition-colors">
                  <span className="font-medium">{item.name}</span>
                  <Button 
                    size="sm" 
                    variant={item.available ? 'ghost' : 'danger'} 
                    onClick={() => toggleAvailability(item.id, item.available)}
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
