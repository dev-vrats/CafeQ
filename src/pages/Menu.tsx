import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../contexts/CartContext';
import type { MenuItem } from '../contexts/CartContext';
import { BentoGrid, BentoItem } from '../components/BentoGrid';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Menu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const { addToCart, updateQuantity, items: cartItems, total } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'menu'), (snapshot) => {
      const items: MenuItem[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as MenuItem);
      });
      setMenuItems(items);
    });
    return () => unsub();
  }, []);

  const categories = Array.from(new Set(menuItems.map(i => i.category)));

  return (
    <div className="min-h-screen p-6 pb-32">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="!p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Menu</h1>
      </div>

      {menuItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-8 h-8 text-text-muted" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Menu is empty</h2>
          <p className="text-text-muted max-w-sm">
            The kiosk owner hasn't added any items yet. If you are testing, log in as an Owner and click "Seed Menu Data".
          </p>
        </div>
      ) : (
        categories.map(category => (
          <div key={category} className="mb-8">
          <h2 className="text-xl font-bold mb-4 ml-2 text-text-muted">{category}</h2>
          <BentoGrid>
            {menuItems.filter(i => i.category === category).map((item, idx) => {
              const cartItem = cartItems.find(c => c.id === item.id);
              return (
                <BentoItem key={item.id} colSpan={(idx % 3 === 0) ? 2 : 1}>
                  <GlassCard className="h-full flex flex-col justify-between p-4 relative overflow-hidden group">
                    <div className="relative z-10">
                      <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                      <p className="font-medium text-maroon">₹{item.price}</p>
                    </div>
                    
                    <div className="mt-4 relative z-10">
                      {!item.available ? (
                        <span className="text-sm font-medium text-red-500 bg-red-100 px-2 py-1 rounded-md">Sold Out</span>
                      ) : cartItem ? (
                        <div className="flex items-center gap-3 bg-white/50 rounded-full p-1 w-fit">
                          <button onClick={() => updateQuantity(item.id, cartItem.quantity - 1)} className="p-1 hover:bg-white rounded-full transition-colors"><Minus className="w-4 h-4" /></button>
                          <span className="font-bold w-4 text-center">{cartItem.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, cartItem.quantity + 1)} className="p-1 hover:bg-white rounded-full transition-colors"><Plus className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => addToCart(item)} className="w-full sm:w-auto">Add</Button>
                      )}
                    </div>
                    
                    {/* Decorative Background Blob */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-maroon/5 rounded-full blur-2xl group-hover:bg-maroon/10 transition-colors" />
                  </GlassCard>
                </BentoItem>
              );
            })}
          </BentoGrid>
        </div>
        ))
      )}

      {/* Floating Cart Summary */}
      {cartItems.length > 0 && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 left-6 right-6 z-50 flex justify-center"
        >
          <GlassCard className="!bg-maroon text-white w-full max-w-md flex items-center justify-between p-4 shadow-2xl shadow-maroon/40 border-maroon-light">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-white/80">{cartItems.reduce((acc, i) => acc + i.quantity, 0)} items</p>
                <p className="font-bold">₹{total}</p>
              </div>
            </div>
            <Button variant="secondary" className="!bg-white !text-maroon border-none hover:!bg-bg-cream" onClick={() => navigate('/checkout')}>
              Checkout
            </Button>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};
