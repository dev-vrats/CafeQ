import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { GlassCard } from './GlassCard';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const chatWithGemini = httpsCallable(functions, 'chatWithGemini');
      const result: any = await chatWithGemini({ message: text });
      setMessages(prev => [...prev, { role: 'ai', text: result.data.response }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickReplies = ["Suggest a combo", "What's cheap and filling?", "Is it a good time to order?"];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4"
          >
            <GlassCard className="w-80 h-[400px] flex flex-col shadow-2xl overflow-hidden border border-maroon-light/30 bg-bg-cream/90 backdrop-blur-2xl">
              <div className="bg-maroon p-3 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-bold">CafeQ Assistant</span>
                </div>
                <button onClick={() => setIsOpen(false)}><X className="w-5 h-5 hover:text-white/80" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.length === 0 && (
                  <p className="text-sm text-text-muted text-center mt-4">
                    Hi! I'm the CafeQ assistant. How can I help you today?
                  </p>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-maroon text-white self-end rounded-br-sm' : 'bg-white/80 border border-glass-border self-start rounded-bl-sm'}`}>
                    {m.text}
                  </div>
                ))}
                {loading && (
                  <div className="bg-white/80 border border-glass-border self-start rounded-bl-sm p-3 rounded-2xl w-12 flex justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-maroon" />
                  </div>
                )}
              </div>

              {messages.length === 0 && (
                <div className="flex gap-2 overflow-x-auto p-2 scrollbar-hide">
                  {quickReplies.map(qr => (
                    <button key={qr} onClick={() => sendMessage(qr)} className="whitespace-nowrap bg-white/50 border border-maroon-light/20 text-maroon text-xs px-3 py-1.5 rounded-full hover:bg-white transition-colors">
                      {qr}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-3 bg-white/50 border-t border-glass-border flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-white border border-glass-border rounded-full px-4 py-2 text-sm outline-none focus:border-maroon"
                />
                <button 
                  onClick={() => sendMessage(input)} 
                  disabled={loading || !input.trim()}
                  className="bg-maroon text-white w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-maroon text-white rounded-full flex items-center justify-center shadow-xl shadow-maroon/30"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
    </div>
  );
};
