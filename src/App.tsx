/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  BookOpen, 
  Clock, 
  RotateCcw, 
  Play, 
  ChevronLeft, 
  Search,
  Settings,
  Check,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
interface PrayerTimings {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

interface Ayah {
  number: number;
  text: string;
  audio?: string;
  translation?: string;
}

export default function App() {
  const [activePage, setActivePage] = useState<'home' | 'quran' | 'surah'>('home');
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimings | null>(null);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<{ number: number; name: string } | null>(null);
  const [surahData, setSurahData] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [tasbeehCount, setTasbeehCount] = useState(0);
  const [isEditingPrayerTimes, setIsEditingPrayerTimes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchPrayerTimes();
    fetchSurahs();
  }, []);

  const fetchPrayerTimes = async () => {
    try {
      const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Quetta&country=Pakistan&method=2');
      const data = await res.json();
      setPrayerTimes(data.data.timings);
    } catch (error) {
      console.error("Error fetching prayer times:", error);
    }
  };

  const fetchSurahs = async () => {
    try {
      const res = await fetch('https://api.alquran.cloud/v1/surah');
      const data = await res.json();
      setSurahs(data.data);
    } catch (error) {
      console.error("Error fetching surahs:", error);
    }
  };

  const openSurah = async (num: number, name: string) => {
    setLoading(true);
    setSelectedSurah({ number: num, name });
    setActivePage('surah');
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${num}/editions/quran-uthmani,ur.jawadi,ar.alafasy`);
      const data = await res.json();
      
      const combinedAyahs = data.data[0].ayahs.map((ayah: any, index: number) => ({
        number: ayah.numberInSurah,
        text: ayah.text,
        translation: data.data[1].ayahs[index].text,
        audio: data.data[2].ayahs[index].audio
      }));
      
      setSurahData(combinedAyahs);
    } catch (error) {
      console.error("Error fetching surah details:", error);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(url);
    audioRef.current.play();
  };

  const handlePrayerTimeChange = (key: keyof PrayerTimings, value: string) => {
    if (prayerTimes) {
      setPrayerTimes({
        ...prayerTimes,
        [key]: value
      });
    }
  };

  const filteredSurahs = surahs.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.number.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Decorative Background Element */}
      <div className="fixed -top-24 -right-24 w-64 h-64 bg-islamic-accent/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed -bottom-24 -left-24 w-64 h-64 bg-islamic-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="bg-gradient-to-r from-islamic-primary via-islamic-secondary to-islamic-primary text-islamic-accent p-6 text-center border-b-4 border-islamic-accent sticky top-0 z-50 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center justify-center gap-3">
          <Moon className="fill-islamic-accent animate-pulse" size={24} />
          <h1 className="text-2xl font-bold tracking-tight drop-shadow-md">NoorPath اسلامی ایپ</h1>
          <Sun className="fill-islamic-accent" size={24} />
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {activePage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Prayer Times Card */}
              <div className="card group">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-islamic-accent/10 rounded-full blur-2xl group-hover:bg-islamic-accent/20 transition-all duration-500"></div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-islamic-bg rounded-xl text-islamic-primary">
                      <Clock size={22} />
                    </div>
                    <h3 className="font-bold text-xl">نماز کے اوقات (کوئٹہ)</h3>
                  </div>
                  <button 
                    onClick={() => setIsEditingPrayerTimes(!isEditingPrayerTimes)}
                    className={`p-2.5 rounded-xl transition-all shadow-sm ${isEditingPrayerTimes ? 'bg-islamic-accent text-islamic-primary scale-110' : 'bg-islamic-bg hover:bg-emerald-100 text-islamic-primary'}`}
                    title={isEditingPrayerTimes ? "Save" : "Edit Prayer Times"}
                  >
                    {isEditingPrayerTimes ? <Check size={20} strokeWidth={3} /> : <Settings size={20} />}
                  </button>
                </div>
                {prayerTimes ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm relative z-10">
                    {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map((key) => (
                      <div key={key} className="bg-gradient-to-b from-islamic-bg/50 to-white p-4 rounded-2xl text-center border border-emerald-50/50 shadow-sm hover:shadow-md transition-all duration-300">
                        <span className="block text-gray-500 font-medium mb-2">{key === 'Fajr' ? 'فجر' : key === 'Dhuhr' ? 'ظہر' : key === 'Asr' ? 'عصر' : key === 'Maghrib' ? 'مغرب' : 'عشاء'}</span>
                        {isEditingPrayerTimes ? (
                          <input 
                            type="text"
                            value={prayerTimes[key]}
                            onChange={(e) => handlePrayerTimeChange(key, e.target.value)}
                            className="w-full bg-white border-2 border-islamic-accent/30 rounded-xl px-1 py-1 text-center font-bold text-lg focus:outline-none focus:border-islamic-accent transition-all"
                          />
                        ) : (
                          <span className="font-bold text-xl text-islamic-primary">{prayerTimes[key]}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-islamic-accent border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Tasbeeh Card */}
              <div className="card text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-islamic-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <h3 className="font-bold text-xl mb-4 relative z-10">ڈیجیٹل تسبیح</h3>
                <div className="relative inline-block my-8 z-10">
                  <motion.div 
                    key={tasbeehCount}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-7xl font-bold text-islamic-primary tabular-nums drop-shadow-sm"
                  >
                    {tasbeehCount}
                  </motion.div>
                  <div className="absolute -inset-8 border-2 border-dashed border-islamic-accent/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
                </div>
                <div className="flex justify-center gap-4 relative z-10">
                  <button 
                    onClick={() => setTasbeehCount(prev => prev + 1)}
                    className="btn-primary flex-1 py-5 text-2xl"
                  >
                    تسبیح کریں
                  </button>
                  <button 
                    onClick={() => setTasbeehCount(0)}
                    className="bg-emerald-50 text-emerald-700 p-5 rounded-2xl active:scale-90 hover:bg-emerald-100 transition-all shadow-sm"
                    title="Reset"
                  >
                    <RotateCcw size={28} />
                  </button>
                </div>
              </div>

              {/* Surah List Preview */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-islamic-bg rounded-xl text-islamic-primary">
                      <BookOpen size={22} />
                    </div>
                    <h3 className="font-bold text-xl">قرآن پاک</h3>
                  </div>
                  <button 
                    onClick={() => setActivePage('quran')}
                    className="text-islamic-accent bg-islamic-primary px-4 py-1.5 rounded-full text-sm font-bold shadow-md hover:brightness-125 transition-all"
                  >
                    تمام دیکھیں
                  </button>
                </div>
                <div className="space-y-3">
                  {surahs.slice(0, 5).map(s => (
                    <button
                      key={s.number}
                      onClick={() => openSurah(s.number, s.name)}
                      className="w-full text-right p-4 rounded-2xl hover:bg-emerald-50/50 border border-transparent hover:border-emerald-100 transition-all flex items-center justify-between group shadow-sm hover:shadow-md bg-white/50"
                    >
                      <span className="text-gray-400 text-sm font-medium">{s.englishName}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-amiri text-2xl group-hover:text-islamic-accent transition-colors">{s.name}</span>
                        <span className="bg-gradient-to-br from-islamic-primary to-islamic-secondary text-islamic-accent w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm">{s.number}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activePage === 'quran' && (
            <motion.div
              key="quran"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4 mb-6">
                <button 
                  onClick={() => setActivePage('home')}
                  className="p-2 hover:bg-white rounded-full transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-xl font-bold">تمام سورتیں</h2>
              </div>

              <div className="relative mb-4">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="سورت تلاش کریں..."
                  className="w-full bg-white p-4 pr-12 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-islamic-accent transition-all text-right"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                {filteredSurahs.map(s => (
                  <button
                    key={s.number}
                    onClick={() => openSurah(s.number, s.name)}
                    className="card !mb-0 flex items-center justify-between hover:bg-islamic-bg transition-colors group"
                  >
                    <div className="text-left">
                      <div className="font-bold text-islamic-primary">{s.englishName}</div>
                      <div className="text-xs text-gray-400">{s.numberOfAyahs} آیات</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-amiri text-2xl group-hover:text-islamic-accent transition-colors">{s.name}</span>
                      <span className="bg-islamic-bg w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm">{s.number}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activePage === 'surah' && (
            <motion.div
              key="surah"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-6 sticky top-20 bg-islamic-bg/80 backdrop-blur-md p-2 rounded-2xl z-40">
                <button 
                  onClick={() => setActivePage('quran')}
                  className="p-2 hover:bg-white rounded-full transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-amiri font-bold text-islamic-accent">{selectedSurah?.name}</h2>
                <div className="w-10"></div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-12 h-12 border-4 border-islamic-accent border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-500">لوڈ ہو رہا ہے...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {surahData.map((ayah) => (
                    <div key={ayah.number} className="card !p-6">
                      <div className="flex justify-between items-start mb-4">
                        <button 
                          onClick={() => ayah.audio && playAudio(ayah.audio)}
                          className="bg-islamic-accent text-white p-2 rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg"
                        >
                          <Play size={16} fill="currentColor" />
                        </button>
                        <span className="bg-islamic-bg px-3 py-1 rounded-full text-xs font-bold">آیت {ayah.number}</span>
                      </div>
                      <p className="font-amiri text-3xl text-right leading-loose mb-4">
                        {ayah.text}
                      </p>
                      <p className="text-islamic-primary text-right text-sm leading-relaxed opacity-80 border-t border-emerald-100 pt-4 font-urdu">
                        {ayah.translation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav h-24 flex justify-around items-center px-6 z-50">
        <button 
          onClick={() => setActivePage('home')}
          className={`flex flex-col items-center gap-2 transition-all relative ${activePage === 'home' ? 'text-islamic-primary scale-110' : 'text-gray-400'}`}
        >
          <div className={`p-2 rounded-2xl transition-all ${activePage === 'home' ? 'bg-islamic-accent/20 text-islamic-primary' : ''}`}>
            <Home size={26} />
          </div>
          <span className={`text-xs font-bold tracking-wide ${activePage === 'home' ? 'opacity-100' : 'opacity-60'}`}>ہوم</span>
          {activePage === 'home' && <motion.div layoutId="nav-indicator" className="absolute -bottom-2 w-1.5 h-1.5 bg-islamic-accent rounded-full" />}
        </button>
        <button 
          onClick={() => setActivePage('quran')}
          className={`flex flex-col items-center gap-2 transition-all relative ${activePage === 'quran' || activePage === 'surah' ? 'text-islamic-primary scale-110' : 'text-gray-400'}`}
        >
          <div className={`p-2 rounded-2xl transition-all ${activePage === 'quran' || activePage === 'surah' ? 'bg-islamic-accent/20 text-islamic-primary' : ''}`}>
            <BookOpen size={26} />
          </div>
          <span className={`text-xs font-bold tracking-wide ${activePage === 'quran' || activePage === 'surah' ? 'opacity-100' : 'opacity-60'}`}>قرآن</span>
          {(activePage === 'quran' || activePage === 'surah') && <motion.div layoutId="nav-indicator" className="absolute -bottom-2 w-1.5 h-1.5 bg-islamic-accent rounded-full" />}
        </button>
      </nav>
    </div>
  );
}
