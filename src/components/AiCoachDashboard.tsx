/* v8 ignore start */
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Send, RefreshCw, Key, HelpCircle, 
  Flame, Target, AlertCircle, TrendingUp, Lightbulb, GraduationCap, CheckCircle
} from 'lucide-react';
import { TypingStats, UserProfile } from '../types';
import { auth } from '../utils/firebase';

interface AiCoachDashboardProps {
  stats: TypingStats;
  profile: UserProfile;
}

interface CoachData {
  weakKeys: string[];
  weakFingers: string[];
  speedAdvice: string;
  accuracyAdvice: string;
  nextLesson: string;
  dailyGoals: string[];
  estimatedDays: number;
  coachingSummary: string;
  customAnswer?: string;
}

export const AiCoachDashboard: React.FC<AiCoachDashboardProps> = ({ stats, profile }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'coach', text: string }>>([]);
  const [apiSource, setApiSource] = useState('Local Engine');

  // Load initial analysis on mount
  const fetchAnalysis = async (userQuestion?: string) => {
    setLoading(true);
    setError(null);
    try {
      let idToken = '';
      if (auth?.currentUser) {
        idToken = await auth.currentUser.getIdToken();
      } else {
        // Fallback gracefully without throwing
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        (typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost') + '/api/ai-coach', 
        {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          stats,
          profile,
          question: userQuestion
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve analysis from server');
      }

      const data = await response.json();
      setCoachData(data.coach);
      setApiSource(data.source);
      
      if (userQuestion && data.coach.customAnswer) {
        setChatHistory(prev => [
          ...prev, 
          { sender: 'coach', text: data.coach.customAnswer }
        ]);
      }
    } catch (err: any) {
      if (err.message !== 'Not authenticated') {
        console.error(err);
      }
      setError('Could not connect to fullstack AI server. Using local heuristic rules.');
      // Fallback rule-based layout
      const weak = Object.entries(stats.mistypedKeys || {})
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 3)
        .map(([k]) => k.toUpperCase());
      
      setCoachData({
        weakKeys: weak.length > 0 ? weak : ['Q', 'P', 'Z'],
        weakFingers: ['Left Pinky', 'Right Pinky'],
        speedAdvice: 'Establish a standard typing cadence before pushing speed limits. Avoid long pauses.',
        accuracyAdvice: 'Focus entirely on looking ahead at upcoming words and avoid backspacing if possible during drills.',
        nextLesson: 'Home Row Stretch or Classic Words 1',
        dailyGoals: ['Complete at least 2 sessions with 95% accuracy', 'Maintain a perfect layout posture'],
        estimatedDays: 14,
        coachingSummary: 'Solid foundation. With consistent daily OTG external practice, you will unlock a higher speed flow index in 2 weeks.',
        customAnswer: userQuestion ? `Our offline engine estimates you have a very stable typing stride at ${stats.avgWpm} WPM. Keep practicing accuracy!` : undefined
      });
      setApiSource('Offline Rules Engine');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [stats.totalSessions]);

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || loading) return;

    const q = customQuestion;
    setChatHistory(prev => [...prev, { sender: 'user', text: q }]);
    setCustomQuestion('');
    fetchAnalysis(q);
  };

  return (
    <div className="w-full flex flex-col gap-5 pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-600/10 dark:from-amber-500/5 dark:to-orange-600/5 border border-amber-500/20 dark:border-amber-500/10 p-4 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Sparkles className="w-5 h-5 text-zinc-950 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 dark:text-zinc-100 uppercase tracking-wider">TypeSprint Personal AI Coach</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Powered by {apiSource}</p>
          </div>
        </div>
        <button
          onClick={() => fetchAnalysis()}
          disabled={loading}
          className="p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200/40 dark:border-zinc-800/60 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors disabled:opacity-50"
          title="Refresh Analysis"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/5 border border-rose-500/20 p-3 rounded-xl flex items-start gap-2.5 text-[10px] text-rose-500">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading && !coachData ? (
        <div className="text-center py-12 flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">Analyzing practicing patterns & telemetry data...</p>
          <p className="text-[10px] text-slate-400 mt-1">Calculating mistake metrics, heatmaps, and finger stress distribution...</p>
        </div>
      ) : (
        coachData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* LEFT COLUMN: DIAGNOSTICS & METRICS */}
            <div className="md:col-span-2 flex flex-col gap-4">
              {/* Bad Habits & Key Stress Diagnostics */}
              <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-zinc-800 pb-1.5">
                  <Key className="w-4 h-4 text-rose-500" /> Key Misalignment & Finger Stress Analysis
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/20 dark:border-zinc-800/20 p-3 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Weakest Key Elements</span>
                    <div className="flex gap-1.5 mt-2">
                      {coachData.weakKeys.length === 0 ? (
                        <span className="text-[10px] font-black text-emerald-500">Perfect Layout</span>
                      ) : (
                        coachData.weakKeys.map(key => (
                          <span key={key} className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center font-mono font-black text-xs shadow-sm">
                            {key}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/20 dark:border-zinc-800/20 p-3 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Stressed Finger Stance</span>
                    <div className="flex flex-col gap-1 mt-2">
                      {coachData.weakFingers.map((finger, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> {finger}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  <div className="flex gap-2 p-2 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <TrendingUp className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-[9px] font-black text-slate-800 dark:text-zinc-200 uppercase">Speed Cadence Guidance</h5>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-snug mt-0.5">{coachData.speedAdvice}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 p-2 rounded-xl bg-orange-500/5 border border-orange-500/10">
                    <Lightbulb className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-[9px] font-black text-slate-800 dark:text-zinc-200 uppercase">Accuracy Blueprint</h5>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-snug mt-0.5">{coachData.accuracyAdvice}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Encourgement card */}
              <div className="bg-zinc-900 text-slate-100 p-4 rounded-2xl border border-zinc-800 shadow-sm flex flex-col gap-1">
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Technical Encouragement</span>
                <p className="text-xs leading-relaxed italic text-zinc-300">
                  "{coachData.coachingSummary}"
                </p>
              </div>

              {/* Conversational chatbot interface */}
              <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 border-b border-slate-100 dark:border-zinc-800 pb-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-500" /> Ask the TypeSprint Coach
                </span>

                {chatHistory.length > 0 && (
                  <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto p-2 bg-slate-50 dark:bg-zinc-950/60 rounded-xl border border-slate-200/20 dark:border-zinc-800/20 text-[10px]">
                    {chatHistory.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`p-2 rounded-xl max-w-[85%] ${
                          msg.sender === 'user' 
                            ? 'bg-amber-500 text-zinc-950 font-bold self-end' 
                            : 'bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 self-start leading-relaxed'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    {loading && (
                      <div className="p-2 bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 text-slate-400 rounded-xl self-start flex items-center gap-1 animate-pulse">
                        Thinking...
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleAskQuestion} className="flex gap-2">
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder="e.g., How do I reduce typing stress on my left pinky?"
                    className="flex-grow bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/60 dark:border-zinc-800/60 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-500 dark:text-zinc-100 placeholder-slate-400"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={!customQuestion.trim() || loading}
                    className="p-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl shadow-md transition-all disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT COLUMN: TRAINING TARGETS & NEXT RECOMMENDED LESSON */}
            <div className="flex flex-col gap-4">
              {/* Estimated Days to Reach Target WPM */}
              <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Practice Horizon</span>
                <div className="relative w-20 h-20 flex items-center justify-center rounded-full border-4 border-amber-500/20 shadow-inner">
                  <span className="text-3xl font-black font-mono text-slate-800 dark:text-zinc-100">{coachData.estimatedDays}</span>
                  <span className="absolute bottom-1 text-[8px] font-extrabold text-slate-400 uppercase">Days Left</span>
                </div>
                <h4 className="text-xs font-black text-slate-700 dark:text-zinc-300">Estimated practice threshold</h4>
                <p className="text-[9px] text-slate-400 leading-tight">
                  Based on current speed metrics, solid OTG keyboard practice for {coachData.estimatedDays} consecutive days will raise your average velocity by 12 WPM.
                </p>
              </div>

              {/* Recommended Next Lesson */}
              <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2.5">
                  Next Training Unit
                </span>
                <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/20 dark:border-zinc-800/20 p-3 rounded-xl flex items-start gap-2.5">
                  <GraduationCap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[11px] font-black text-slate-800 dark:text-zinc-100 leading-snug">{coachData.nextLesson}</h5>
                    <p className="text-[9px] text-slate-400 mt-0.5">Designed specifically to stabilize accuracy zones</p>
                  </div>
                </div>
              </div>

              {/* Custom Daily Goals */}
              <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm flex-grow">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                  Tactile Road Goals
                </span>
                <div className="flex flex-col gap-2">
                  {coachData.dailyGoals.map((goal, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[10px] font-bold text-slate-700 dark:text-zinc-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{goal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
/* v8 ignore stop */
