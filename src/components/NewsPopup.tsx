import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, ExternalLink, Newspaper, Zap, Activity } from 'lucide-react';

const NEWS_DATABASE = [
  {
    category: 'Economy',
    title: 'Food Security Crisis: Cowpeas worth P15m rot in silos',
    summary: 'A forensic audit has revealed that millions of pula worth of cowpeas have deteriorated in storage silos due to poor management.',
    intensity: 'high'
  },
  {
    category: 'Sports',
    title: 'World Relays Success: Botswana passes international test',
    summary: 'Botswana Athletics has received high praise for hosting a successful World Relays event, positioning the country as a hub for major sports.',
    intensity: 'medium'
  },
  {
    category: 'Education',
    title: 'Landmark Summit: Gaborone hosts continental education talks',
    summary: 'Education ministers from across Africa gathered in Gaborone this week to discuss digital transformation in schools.',
    intensity: 'medium'
  },
  {
    category: 'Weather',
    title: 'Flood Alert: Heavy rains predicted for northern districts',
    summary: 'The Department of Meteorological Services warns of localized flooding in Ngamiland and Chobe regions over the next 48 hours.',
    intensity: 'high'
  },
  {
    category: 'Business',
    title: 'Diamond Sector Update: De Beers and Botswana finalize sales agreement',
    summary: 'The landmark deal between the government and De Beers is expected to boost local diamond processing capabilities.',
    intensity: 'high'
  }
];

export default function NewsPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentNews, setCurrentNews] = useState<typeof NEWS_DATABASE[0] | null>(null);

  useEffect(() => {
    // Show first pop-up after 10 seconds for demo, then every 5 minutes
    const initialTimer = setTimeout(() => {
      showRandomNews();
    }, 10000);

    const intervalTimer = setInterval(() => {
      showRandomNews();
    }, 300000); // 5 minutes

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  const showRandomNews = () => {
    const randomIndex = Math.floor(Math.random() * NEWS_DATABASE.length);
    setCurrentNews(NEWS_DATABASE[randomIndex]);
    setIsVisible(true);

    // Auto close after 15 seconds if not closed manually
    setTimeout(() => {
      setIsVisible(false);
    }, 15000);
  };

  return (
    <AnimatePresence>
      {isVisible && currentNews && (
        <motion.div 
          initial={{ opacity: 0, x: 100, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
          className="fixed bottom-24 right-6 z-[300] w-full max-w-sm"
        >
          <div className="bg-white rounded-[2.5rem] shadow-3xl border border-slate-100 overflow-hidden relative">
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setIsVisible(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-2xl ${
                  currentNews.intensity === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {currentNews.intensity === 'high' ? <Zap className="w-5 h-5" /> : <Newspaper className="w-5 h-5" />}
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{currentNews.category} • Current News</p>
                   <p className="text-[10px] font-bold text-slate-400">Botswana Updates</p>
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 leading-tight mb-3">
                {currentNews.title}
              </h3>

              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                {currentNews.summary}
              </p>

              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setIsVisible(false)}
                  className="flex items-center gap-2 text-xs font-black uppercase text-indigo-600 hover:underline"
                >
                  Read Full Story <ExternalLink className="w-3 h-3" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + currentNews.title}`} alt="u" />
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-tighter">+12k Reading</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <motion.div 
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 15, ease: 'linear' }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
