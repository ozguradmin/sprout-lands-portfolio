import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { ViewState } from '../../types';
import { ArrowLeft, Instagram, Github, Linkedin, Mail, Youtube, Camera, Globe, MessageSquare, Send, X } from 'lucide-react';

export const ArcadeView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    instagram: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Telegram Konfigürasyonu (Netlify Environment Variables)
  const T_B_T = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const T_C_I = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    setIsSending(true);
    try {
      const text = `📬 *Yeni Mesaj:*\n\n` +
                   `👤 *İsim:* ${formData.name || 'Belirtilmedi'}\n` +
                   `📞 *Tel:* ${formData.phone || 'Belirtilmedi'}\n` +
                   `📸 *IG:* ${formData.instagram || 'Belirtilmedi'}\n\n` +
                   `💬 *Mesaj:*\n${formData.message}`;

      const response = await fetch(`https://api.telegram.org/bot${T_B_T}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: T_C_I,
          text: text,
          parse_mode: 'Markdown'
        })
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', phone: '', instagram: '', message: '' });
        setTimeout(() => {
          setIsMessageOpen(false);
          setStatus('idle');
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  const mainLinks = [
    { 
      name: 'GitHub', 
      icon: <Github size={24} />, 
      username: '@ozguradmin', 
      link: 'https://github.com/ozguradmin',
      color: 'hover:bg-gray-500/10 hover:border-gray-500/50 hover:text-gray-200'
    },
    { 
      name: 'LinkedIn', 
      icon: <Linkedin size={24} />, 
      username: 'Özgür Güler', 
      link: 'https://www.linkedin.com/in/%C3%B6zg%C3%BCr-g-133a33219/',
      color: 'hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-500'
    }
  ];

  const instagramAccounts = [
    '@tarihselwojak',
    '@wtfceviri',
    '@galaktikuzay',
    '@manipulatix',
    '@wtfmcraft'
  ];

  return (
    <div className="h-full w-full overflow-y-auto bg-[#0a0a0a] pt-24 px-6 pb-24 relative font-sans">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-2xl mx-auto relative z-10">
        <header className="mb-12">
           <button 
            onClick={() => {
              sessionStorage.setItem('lastView', 'ARCADE');
              setCurrentView(ViewState.HUB);
            }}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft size={18} /> Geri Dön
          </button>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">Sosyal Hesaplarım</h1>
        </header>

        {/* Ana Linkler */}
        <div className="grid gap-4 mb-8">
           {mainLinks.map((social, i) => (
             <motion.a
               key={i}
               href={social.link}
               target="_blank"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className={`group flex items-center justify-between p-5 bg-[#111] border border-white/5 rounded-2xl transition-all duration-300 ${social.color}`}
             >
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
                     {social.icon}
                  </div>
                  <div>
                     <h3 className="font-bold text-white text-lg">{social.name}</h3>
                     <p className="text-sm text-gray-500 font-mono">{social.username}</p>
                  </div>
               </div>
             </motion.a>
           ))}
        </div>

        <div className="h-px w-full bg-white/10 my-8"></div>

        {/* E-posta */}
        <motion.a
           href="mailto:ozgurglr256@gmail.com"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="flex items-center gap-4 p-5 bg-[#111] border border-emerald-800/30 rounded-2xl hover:bg-emerald-900/10 hover:border-emerald-700/50 hover:text-emerald-500 transition-all group mb-8"
        >
           <div className="p-3 bg-emerald-900/20 rounded-xl text-emerald-700 group-hover:text-emerald-600 transition-colors">
              <Mail size={24} />
           </div>
           <div>
              <h3 className="font-bold text-emerald-700 group-hover:text-emerald-600 text-lg transition-colors">E-posta Gönder</h3>
              <p className="text-sm text-emerald-800/70 font-mono group-hover:text-emerald-700/80 transition-colors">ozgurglr256@gmail.com</p>
           </div>
        </motion.a>

        <div className="h-px w-full bg-white/10 my-8"></div>

        {/* Sosyal Medya Sayfaları */}
        <div className="space-y-6">
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
             <Globe size={20} className="text-indigo-400" />
             Sosyal Medya Sayfalarım
           </h2>

           <div className="grid gap-3">
              {instagramAccounts.map((acc, i) => (
                <a 
                  key={i} 
                  href={`https://instagram.com/${acc.replace('@', '')}`}
                  target="_blank"
                  className="flex items-center gap-3 p-4 bg-[#111] rounded-xl border border-white/5 hover:border-pink-600/50 hover:text-pink-500 hover:bg-pink-600/10 transition-all group"
                >
                   <Instagram size={18} className="text-gray-500 group-hover:text-pink-500 transition-colors" />
                   <span className="text-gray-300 font-medium group-hover:text-pink-500 transition-colors">{acc}</span>
                </a>
              ))}

              <a 
                  href="https://www.youtube.com/@Tarihselwojak"
                  target="_blank"
                  className="flex items-center gap-3 p-4 bg-[#111] rounded-xl border border-white/5 hover:border-red-600/50 hover:text-red-500 hover:bg-red-600/10 transition-all group"
                >
                   <Youtube size={18} className="text-gray-500 group-hover:text-red-500 transition-colors" />
                   <span className="text-gray-300 font-medium group-hover:text-red-500 transition-colors">YouTube: Tarihselwojak</span>
                </a>
           </div>
        </div>
      </div>

      {/* Mesaj Butonu ve Baloncuk - Whitish Minimal Glass Redesign */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
        <AnimatePresence>
          {!isMessageOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="relative px-3 py-1.5 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full shadow-lg mb-1 pointer-events-none"
            >
              <p className="text-white text-[9px] font-bold tracking-tight flex items-center gap-1.5 whitespace-nowrap uppercase">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                </span>
                Bana mesaj gönder!
              </p>
              {/* Arrow - More realistic pointing arrow */}
              <div className="absolute -bottom-1.5 right-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/30"></div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMessageOpen(true)}
          className="w-10 h-10 bg-white/10 backdrop-blur-2xl border border-white/40 rounded-xl flex items-center justify-center shadow-xl transition-all duration-300 group"
        >
          <MessageSquare size={18} className="text-white group-hover:scale-110 transition-transform" />
        </motion.button>
      </div>

      {/* Mesaj Gönderme Modal - Glassmorphism Redesign */}
      <AnimatePresence>
        {isMessageOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-6 font-pixel"
            onClick={() => setIsMessageOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 w-full max-w-lg rounded-[2rem] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 pb-2 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-xl">
                      <Send size={20} className="text-white" />
                    </div>
                    İLETİŞİME GEÇ
                  </h3>
                </div>
                <button 
                  onClick={() => setIsMessageOpen(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="p-6 pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* İsim */}
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-bold text-gray-500 uppercase tracking-widest ml-1">İsim (Opsiyonel)</label>
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Adın Soyadın"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs placeholder:text-gray-600 focus:bg-white/10 focus:border-white/30 outline-none transition-all"
                    />
                  </div>
                  {/* Instagram */}
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-bold text-gray-500 uppercase tracking-widest ml-1">Instagram (Opsiyonel)</label>
                    <input 
                      type="text"
                      value={formData.instagram}
                      onChange={e => setFormData({...formData, instagram: e.target.value})}
                      placeholder="@kullaniciadi"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs placeholder:text-gray-600 focus:bg-white/10 focus:border-white/30 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Telefon */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-bold text-gray-500 uppercase tracking-widest ml-1">Telefon (Opsiyonel)</label>
                  <input 
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="05xx xxx xx xx"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs placeholder:text-gray-600 focus:bg-white/10 focus:border-white/30 outline-none transition-all"
                  />
                </div>

                {/* Mesaj */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-bold text-gray-500 uppercase tracking-widest ml-1">Mesajın</label>
                  <textarea 
                    required
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    placeholder="Mesajını yaz..."
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs placeholder:text-gray-600 focus:bg-white/10 focus:border-white/30 outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isSending || status === 'success'}
                    className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 ${
                      status === 'success' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 active:scale-[0.98]'
                    }`}
                  >
                    {isSending ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : status === 'success' ? (
                      'İLETİLDİ!'
                    ) : (
                      <>GÖNDER <Send size={16} /></>
                    )}
                  </button>
                </div>
                
                {status === 'error' && (
                  <p className="text-red-400 text-[8px] text-center font-medium bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                    BİR HATA OLUŞTU!
                  </p>
                )}
                
                <p className="text-[8px] text-gray-500 text-center px-4 leading-normal">
                  Senle iletişime geçmemi istiyorsan iletişim bilgilerini yazmayı unutma.
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
