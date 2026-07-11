import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Play, Crown, Zap, Flame, Keyboard, Hourglass, Calendar, 
  Trophy, Target, Lock, CheckCircle2, Award, Sparkles, Code, Coins
} from 'lucide-react';
import { Achievement, DailyChallenge, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';

interface AchievementsShelfProps {
  achievements: Achievement[];
  dailyChallenges: DailyChallenge[];
  profile: UserProfile;
}

export const AchievementsShelf: React.FC<AchievementsShelfProps> = ({
  achievements,
  dailyChallenges,
  profile,
}) => {
  const { user, isAnonymous } = useAuth();
  const isCloudActive = !!user && !isAnonymous;
  const resolvedName = useMemo(() => {
    if (isCloudActive && user?.displayName) {
      return user.displayName;
    }
    if (profile?.name && profile?.name.trim() !== '' && profile?.name !== 'Tactile Pilot') {
      return profile.name;
    }
    if (profile?.username && profile?.username.trim() !== '' && profile?.username !== 'tactile_pilot') {
      return profile.username;
    }
    return isCloudActive ? 'Pilot' : 'Guest';
  }, [isCloudActive, user?.displayName, profile?.name, profile?.username]);

  // Mapping string to actual Lucide Icon
  const getIcon = (name: string) => {
    switch (name) {
      case 'Play': return <Play className="w-4 h-4 text-emerald-500" />;
      case 'Target': return <Target className="w-4 h-4 text-sky-500" />;
      case 'Crown': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'Keyboard': return <Keyboard className="w-4 h-4 text-purple-500" />;
      case 'Award': return <Award className="w-4 h-4 text-orange-500" />;
      case 'Flame': return <Flame className="w-4 h-4 text-rose-500" />;
      case 'Code': return <Code className="w-4 h-4 text-indigo-500" />;
      case 'Hourglass': return <Hourglass className="w-4 h-4 text-blue-500" />;
      case 'Calendar': return <Calendar className="w-4 h-4 text-teal-500" />;
      default: return <Award className="w-4 h-4 text-amber-500" />;
    }
  };

  // Level cap calculation
  const nextLevelXp = profile.level * 300;
  const xpPercentage = Math.min(100, Math.round((profile.xp / nextLevelXp) * 100));

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="w-full flex flex-col gap-5 pb-8">
      {/* Gamification profile header card */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-slate-200/40 dark:border-zinc-800/80 p-5 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 opacity-10 pointer-events-none">
          <Trophy className="w-44 h-44 text-amber-500" />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center border border-amber-400/30 relative">
              <Sparkles className="absolute -top-1.5 -right-1.5 w-4 h-4 text-yellow-300 animate-pulse" />
              <span className="text-xl font-extrabold font-mono text-zinc-950">{profile.level}</span>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                {resolvedName} 
                <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-md font-mono border border-amber-500/20">{profile.selectedTitle}</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Typing Level Progress</p>
            </div>
          </div>

          <div className="flex gap-4 self-stretch sm:self-auto bg-slate-500/5 p-2 rounded-xl border border-white/5">
            <div className="text-center px-2">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Vault Coins</span>
              <div className="text-sm font-black font-mono text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                <Coins className="w-4 h-4 text-amber-400 fill-amber-400" /> {profile.coins}
              </div>
            </div>
            <div className="text-center px-2 border-l border-white/10">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Unlocked</span>
              <div className="text-sm font-black font-mono text-slate-100 mt-0.5">
                {unlockedCount} / {achievements.length}
              </div>
            </div>
          </div>
        </div>

        {/* Level progress */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
            <span>XP Progress</span>
            <span>{profile.xp} / {nextLevelXp} XP</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-full transition-all duration-500 rounded-full" 
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily Challenges */}
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1.5 mb-3">
          <Target className="w-4 h-4 text-rose-500" />
          <h4 className="text-xs font-black text-slate-800 dark:text-zinc-100 uppercase tracking-wider">Today's Challenges</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dailyChallenges.map((challenge) => (
            <div 
              key={challenge.id} 
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                challenge.completed 
                  ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 text-slate-700 dark:text-zinc-300' 
                  : 'bg-slate-50 dark:bg-zinc-950/40 border-slate-200/40 dark:border-zinc-800/60 text-slate-800 dark:text-zinc-200'
              }`}
            >
              {challenge.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-zinc-700 mt-0.5 shrink-0" />
              )}
              <div className="min-w-0 flex-grow">
                <p className="text-[10px] font-black leading-snug">{challenge.description}</p>
                <div className="flex gap-2 mt-1.5">
                  <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1 rounded font-bold font-mono">
                    +{challenge.xpReward} XP
                  </span>
                  {challenge.coinsReward && (
                    <span className="text-[8px] bg-yellow-500/10 text-yellow-500 px-1 rounded font-bold font-mono">
                      +{challenge.coinsReward} Coins
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Shelf */}
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm">
        <h4 className="text-xs font-black text-slate-800 dark:text-zinc-100 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
          <Award className="w-4 h-4 text-amber-500" /> Milestone Achievement Shelf
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((ach) => {
            const pct = Math.round((ach.progress / ach.maxProgress) * 100);

            return (
              <div 
                key={ach.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  ach.unlocked 
                    ? 'bg-slate-50 dark:bg-zinc-950/40 border-slate-200/30 dark:border-zinc-800/30' 
                    : 'bg-slate-50/40 dark:bg-zinc-950/10 border-slate-200/10 dark:border-zinc-800/10 opacity-60'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 relative mt-0.5 ${
                  ach.unlocked 
                    ? 'bg-white dark:bg-zinc-900 border-amber-500/20 shadow-sm' 
                    : 'bg-slate-100 dark:bg-zinc-850 border-slate-200 dark:border-zinc-800'
                }`}>
                  {ach.unlocked ? getIcon(ach.icon) : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h5 className="text-[10px] font-black text-slate-800 dark:text-zinc-100 truncate">{ach.title}</h5>
                      <span className="text-[8px] font-extrabold text-slate-400 block tracking-wide uppercase mt-0.5">{ach.category} Category</span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0 text-[8px] font-mono font-bold">
                      <span className="text-amber-500">+{ach.xpReward} XP</span>
                      {ach.coinsReward && <span className="text-yellow-500">+{ach.coinsReward} Coins</span>}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 leading-snug">{ach.description}</p>
                  
                  {/* Progress segment if locked */}
                  {!ach.unlocked && ach.maxProgress > 1 && (
                    <div className="mt-2">
                      <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[8px] font-black font-mono text-slate-400 mt-0.5 block">
                        PROGRESS: {ach.progress} / {ach.maxProgress}
                      </span>
                    </div>
                  )}

                  {ach.unlocked && ach.unlockedAt && (
                    <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 mt-1.5 block uppercase tracking-wider">
                      ★ Unlocked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
