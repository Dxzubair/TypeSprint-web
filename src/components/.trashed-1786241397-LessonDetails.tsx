import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, BookOpen, Clock, Sparkles, ChevronRight, ChevronLeft,
  CheckCircle2, AlertTriangle, Play, RefreshCw, Key, HelpCircle, 
  Tv, Hand, Keyboard, Star
} from 'lucide-react';
import { Lesson, TypingStats, UserProfile } from '../types';
import { LESSONS } from '../data/lessons';
import { getCompletedLessons, isLessonUnlocked } from '../utils/storage';

interface LessonDetailsProps {
  lesson: Lesson;
  stats: TypingStats;
  profile: UserProfile;
  onBack: () => void;
  onStartPractice: (lesson: Lesson) => void;
  onNavigateToLesson: (lesson: Lesson) => void;
}

interface FingerInfo {
  name: string;
  hand: 'left' | 'right';
  finger: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';
  color: string;
  bgColor: string;
  textColor: string;
}

// Finger mapping function
const getFingerForKey = (key: string): FingerInfo => {
  const k = key.toLowerCase();
  
  // Left Pinky
  if (['1', 'q', 'a', 'z', '`', '~', 'tab', 'caps', 'shift_l', 'ctrl_l'].includes(k)) {
    return { name: 'Left Pinky', hand: 'left', finger: 'pinky', color: '#F43F5E', bgColor: 'bg-rose-500/20', textColor: 'text-rose-400' };
  }
  // Left Ring
  if (['2', 'w', 's', 'x'].includes(k)) {
    return { name: 'Left Ring', hand: 'left', finger: 'ring', color: '#F59E0B', bgColor: 'bg-amber-500/20', textColor: 'text-amber-400' };
  }
  // Left Middle
  if (['3', 'e', 'd', 'c'].includes(k)) {
    return { name: 'Left Middle', hand: 'left', finger: 'middle', color: '#10B981', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400' };
  }
  // Left Index
  if (['4', '5', 'r', 't', 'f', 'g', 'v', 'b'].includes(k)) {
    return { name: 'Left Index', hand: 'left', finger: 'index', color: '#3B82F6', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' };
  }
  // Thumbs
  if ([' ', 'space'].includes(k)) {
    return { name: 'Thumb', hand: 'left', finger: 'thumb', color: '#8B5CF6', bgColor: 'bg-violet-500/20', textColor: 'text-violet-400' };
  }
  // Right Index
  if (['6', '7', 'y', 'u', 'h', 'j', 'n', 'm'].includes(k)) {
    return { name: 'Right Index', hand: 'right', finger: 'index', color: '#3B82F6', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' };
  }
  // Right Middle
  if (['8', 'i', 'k', ',', '<'].includes(k)) {
    return { name: 'Right Middle', hand: 'right', finger: 'middle', color: '#10B981', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400' };
  }
  // Right Ring
  if (['9', 'o', 'l', '.', '>'].includes(k)) {
    return { name: 'Right Ring', hand: 'right', finger: 'ring', color: '#F59E0B', bgColor: 'bg-amber-500/20', textColor: 'text-amber-400' };
  }
  // Right Pinky (default rest)
  return { name: 'Right Pinky', hand: 'right', finger: 'pinky', color: '#F43F5E', bgColor: 'bg-rose-500/20', textColor: 'text-rose-400' };
};

export const LessonDetails: React.FC<LessonDetailsProps> = ({
  lesson,
  stats,
  profile,
  onBack,
  onStartPractice,
  onNavigateToLesson
}) => {
  const completedLessons = getCompletedLessons();
  const isCompleted = completedLessons.includes(lesson.id);
  const unlocked = isLessonUnlocked(lesson.id, LESSONS);

  // Lesson index & positioning
  const lessonIndex = LESSONS.findIndex(l => l.id === lesson.id);
  const totalLessons = LESSONS.length;
  const lessonNumber = lessonIndex + 1;

  const prevLesson = lessonIndex > 0 ? LESSONS[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < totalLessons - 1 ? LESSONS[lessonIndex + 1] : null;
  const isNextUnlocked = isCompleted && nextLesson !== null;

  // Track down session achievements from history
  const lessonHistory = stats.history.filter(session => session.title === lesson.title && session.type === 'lesson');
  const bestWpm = lessonHistory.length > 0 ? Math.max(...lessonHistory.map(h => h.wpm)) : null;
  const bestAccuracy = lessonHistory.length > 0 ? Math.max(...lessonHistory.map(h => h.accuracy)) : null;

  // Calculate stars: 3 for >=98% accuracy, 2 for >=95%, 1 for >=90%, 0 otherwise
  const starsEarned = bestAccuracy 
    ? bestAccuracy >= 98 ? 3 : bestAccuracy >= 95 ? 2 : bestAccuracy >= 90 ? 1 : 0 
    : isCompleted ? 1 : 0;

  // Overall course progress
  const courseProgressPct = Math.round((completedLessons.length / totalLessons) * 100);

  // Estimated completion time based on texts
  const totalChars = lesson.texts.join(' ').length;
  const estimatedTimeMins = Math.max(1, Math.ceil(totalChars / 120)); // approx 120 chars per min

  // Fingers utilized for this lesson
  const activeFingers: string[] = Array.from(new Set(lesson.targetKeys.map(k => {
    const f = getFingerForKey(k);
    return `${f.hand}_${f.finger}`;
  })));

  // Keys placement helper for static visualization
  const miniKeyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.']
  ];

  // Dynamic goals
  const targetWpmGoal = lesson.difficulty === 'Advanced' ? 45 : lesson.difficulty === 'Intermediate' ? 30 : 15;
  const targetAccGoal = lesson.difficulty === 'Advanced' ? 97 : lesson.difficulty === 'Intermediate' ? 95 : 90;

  const renderHandSVG = (hand: 'left' | 'right') => {
    const isActive = (finger: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb') => {
      return activeFingers.includes(`${hand}_${finger}`);
    };

    const getFingerColor = (finger: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb') => {
      if (!isActive(finger)) return 'rgba(161, 161, 170, 0.2)'; // neutral/zinc-300 in dark mode
      
      switch (finger) {
        case 'pinky': return '#F43F5E';
        case 'ring': return '#F59E0B';
        case 'middle': return '#10B981';
        case 'index': return '#3B82F6';
        case 'thumb': return '#8B5CF6';
      }
    };

    return (
      <svg viewBox="0 0 120 140" className="w-24 h-24 md:w-28 md:h-28 mx-auto">
        {hand === 'left' ? (
          <g>
            {/* Palm */}
            <path d="M20 70 C20 120 100 120 100 70 C100 65 95 60 90 65 C85 70 80 75 75 70 C70 65 65 65 60 70 C55 75 50 75 45 70 C40 65 35 65 30 70 C25 75 20 75 20 70 Z" fill="rgba(161, 161, 170, 0.1)" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-zinc-800" />
            {/* Pinky */}
            <rect x="20" y="35" width="10" height="35" rx="5" fill={getFingerColor('pinky')} />
            {/* Ring */}
            <rect x="35" y="15" width="10" height="55" rx="5" fill={getFingerColor('ring')} />
            {/* Middle */}
            <rect x="50" y="5" width="10" height="65" rx="5" fill={getFingerColor('middle')} />
            {/* Index */}
            <rect x="65" y="15" width="10" height="55" rx="5" fill={getFingerColor('index')} />
            {/* Thumb */}
            <rect x="85" y="45" width="10" height="28" rx="5" transform="rotate(-30 85 45)" fill={getFingerColor('thumb')} />
          </g>
        ) : (
          <g>
            {/* Palm */}
            <path d="M100 70 C100 120 20 120 20 70 C20 65 25 60 30 65 C35 70 40 75 45 70 C50 65 55 65 60 70 C65 75 70 75 75 70 C80 65 85 65 90 70 C95 75 100 75 100 70 Z" fill="rgba(161, 161, 170, 0.1)" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-zinc-800" />
            {/* Thumb */}
            <rect x="25" y="45" width="10" height="28" rx="5" transform="rotate(30 25 45)" fill={getFingerColor('thumb')} />
            {/* Index */}
            <rect x="45" y="15" width="10" height="55" rx="5" fill={getFingerColor('index')} />
            {/* Middle */}
            <rect x="60" y="5" width="10" height="65" rx="5" fill={getFingerColor('middle')} />
            {/* Ring */}
            <rect x="75" y="15" width="10" height="55" rx="5" fill={getFingerColor('ring')} />
            {/* Pinky */}
            <rect x="90" y="35" width="10" height="35" rx="5" fill={getFingerColor('pinky')} />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="flex flex-col flex-grow h-full overflow-y-auto pr-1 select-none scrollbar-none" id="lesson_details_viewport">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-amber-400 transition-colors"
          id="btn_details_back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
          TypeSprint Academy
        </span>
      </div>

      <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-900 rounded-3xl p-5 mb-4 shadow-sm relative overflow-hidden">
        {/* Subtle orange accent glow inside card */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap gap-1.5 items-center">
          <span className={`px-2 py-0.5 text-[8.5px] font-extrabold uppercase rounded-full ${
            lesson.difficulty === 'Beginner' 
              ? 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/5'
              : lesson.difficulty === 'Intermediate'
              ? 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/5'
              : 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/5'
          }`}>
            {lesson.difficulty}
          </span>
          <span className="text-[9.5px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
            {lesson.category.replace('_', ' ')}
          </span>
        </div>

        <h1 className="text-base md:text-lg font-black font-display text-slate-800 dark:text-zinc-100 mt-2 tracking-tight">
          {lesson.title}
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
          {lesson.description}
        </p>

        <div className="flex gap-4 mt-4 text-[11px] font-bold border-t border-slate-100 dark:border-zinc-900/60 pt-3">
          <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>~{estimatedTimeMins} Min Read & practice</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>+60 XP Reward</span>
          </div>
        </div>
      </div>

      {/* PROGRESS SECTION */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/60 p-3 rounded-2xl flex flex-col justify-between">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Course Progress</span>
          <div className="mt-1">
            <div className="flex justify-between items-end">
              <span className="text-[10px] text-slate-400 font-bold">Lvl {profile.level}</span>
              <span className="text-xs font-black text-slate-800 dark:text-zinc-100">{courseProgressPct}%</span>
            </div>
            {/* Animated Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-zinc-950 h-1.5 rounded-full mt-1 overflow-hidden">
              <motion.div 
                className="bg-amber-500 h-full rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${courseProgressPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/60 p-3 rounded-2xl flex flex-col justify-between">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Lesson Rank</span>
          <div className="mt-1">
            <span className="text-xs font-black text-slate-800 dark:text-zinc-100 block">
              {lessonNumber} <span className="text-[9px] text-slate-400 font-normal">of {totalLessons}</span>
            </span>
            <span className={`text-[8.5px] font-extrabold uppercase mt-0.5 inline-block ${
              unlocked 
                ? isCompleted ? 'text-amber-500' : 'text-emerald-500' 
                : 'text-slate-400'
            }`}>
              {unlocked ? isCompleted ? '★ Completed' : '● Available' : '🔒 Locked'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/60 p-3 rounded-2xl flex flex-col justify-between">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Personal Best</span>
          <div className="mt-1">
            <span className="text-xs font-black text-slate-800 dark:text-zinc-100 block">
              {bestWpm ? `${bestWpm} WPM` : 'N/A'}
            </span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[9px] font-bold text-slate-400">
                {bestAccuracy ? `${bestAccuracy}%` : '0% acc'}
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-2.5 h-2.5 ${
                      star <= starsEarned 
                        ? 'text-amber-500 fill-amber-500' 
                        : 'text-slate-200 dark:text-zinc-800'
                    }`} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN ROW FOR LEARN & PLACEMENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        
        {/* WHAT YOU WILL LEARN */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> What You Will Learn
          </h3>
          
          <div className="grid grid-cols-2 gap-2.5">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/60 p-3 rounded-2xl flex flex-col gap-1 shadow-sm"
            >
              <Key className="w-4 h-4 text-amber-500" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Keys Introduced</span>
              <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono tracking-wide">
                {lesson.targetKeys.map(k => k.toUpperCase()).join(', ')}
              </span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/60 p-3 rounded-2xl flex flex-col gap-1 shadow-sm"
            >
              <Hand className="w-4 h-4 text-amber-500" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Fingers Engaged</span>
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 truncate">
                {activeFingers.map(f => {
                  const parts = f.split('_');
                  return `${parts[0] === 'left' ? 'L.' : 'R.'} ${parts[1].charAt(0).toUpperCase() + parts[1].slice(1)}`;
                }).join(', ')}
              </span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/60 p-3 rounded-2xl flex flex-col gap-1 shadow-sm text-left"
            >
              <Tv className="w-4 h-4 text-amber-500" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Posture Check</span>
              <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 leading-normal">
                Sit upright, elbows at 90°, relaxed wrists.
              </span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/60 p-3 rounded-2xl flex flex-col gap-1 shadow-sm text-left"
            >
              <Keyboard className="w-4 h-4 text-amber-500" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Home Row Anchor</span>
              <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 leading-normal">
                Rest rest of fingers on ASDF and JKL;
              </span>
            </motion.div>
          </div>
        </div>

        {/* FINGER PLACEMENT */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1">
            <Hand className="w-3.5 h-3.5" /> Finger Placement
          </h3>
          
          <div className="bg-slate-50 dark:bg-zinc-950/50 border border-slate-200/30 dark:border-zinc-900 p-4 rounded-3xl flex flex-col items-center justify-center gap-4">
            
            {/* Realistic hands rendering */}
            <div className="flex gap-4 items-center justify-center w-full">
              <div className="text-center">
                {renderHandSVG('left')}
                <span className="text-[9px] font-bold text-slate-400 block mt-1">Left Hand</span>
              </div>
              <div className="text-center">
                {renderHandSVG('right')}
                <span className="text-[9px] font-bold text-slate-400 block mt-1">Right Hand</span>
              </div>
            </div>

            {/* Realistic Miniature Keyboard Illustration */}
            <div className="w-full bg-slate-100/70 dark:bg-zinc-950 border border-slate-200/40 dark:border-zinc-900 p-2 rounded-xl flex flex-col gap-1 select-none">
              {miniKeyboardRows.map((row, rIdx) => (
                <div key={rIdx} className="flex justify-center gap-0.5">
                  {row.map((key) => {
                    const isTarget = lesson.targetKeys.map(tk => tk.toUpperCase()).includes(key);
                    const fingerInfo = isTarget ? getFingerForKey(key) : null;
                    const style = fingerInfo 
                      ? { backgroundColor: `${fingerInfo.color}30`, borderColor: fingerInfo.color, color: fingerInfo.color }
                      : {};
                    return (
                      <span
                        key={key}
                        style={style}
                        className={`w-6 h-6 md:w-7 md:h-7 rounded-md border text-[9px] font-extrabold font-mono flex items-center justify-center transition-all ${
                          isTarget 
                            ? 'shadow-[0_0_8px_-2px_currentColor]' 
                            : 'bg-white dark:bg-zinc-900 text-slate-400 dark:text-zinc-600 border-slate-200/50 dark:border-zinc-800'
                        }`}
                      >
                        {key}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* LESSON GOALS SECTION */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/60 p-4 rounded-3xl mb-4 shadow-sm">
        <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Lesson Goals & Targets
        </h3>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Learn the <span className="font-mono text-amber-500 font-extrabold">{lesson.targetKeys.slice(0, 2).map(k => k.toUpperCase()).join(' and ')}</span> anchor keys</span>
          </div>

          {lesson.targetKeys.length > 2 && (
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Learn the complementary <span className="font-mono text-amber-500 font-extrabold">{lesson.targetKeys.slice(2).map(k => k.toUpperCase()).join(' and ')}</span> coordinates</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Maintain drill precision and accuracy above <span className="text-amber-500 font-extrabold">{targetAccGoal}%</span></span>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Build continuous typing speed and reach <span className="text-amber-500 font-extrabold">{targetWpmGoal} WPM</span></span>
          </div>
        </div>
      </div>

      {/* TIPS SECTION */}
      <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-3xl mb-4">
        <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" /> Expert Training Tips
        </h3>
        
        <ul className="text-xs text-slate-600 dark:text-zinc-300 font-semibold space-y-2.5 pl-1">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 shrink-0 select-none">•</span>
            <span><strong className="text-slate-800 dark:text-zinc-100">Don't look at the keyboard</strong> — Trust your muscle memory. Highlighted onscreen keys are there to guide you.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 shrink-0 select-none">•</span>
            <span><strong className="text-slate-800 dark:text-zinc-100">Keep wrists relaxed</strong> — Let your fingers rest gracefully without hovering them at high stress angles.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 shrink-0 select-none">•</span>
            <span><strong className="text-slate-800 dark:text-zinc-100">Use only the correct fingers</strong> — Speed relies on ergonomic splitting. Never use random index fingers to punch outer keys.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 shrink-0 select-none">•</span>
            <span><strong className="text-slate-800 dark:text-zinc-100">Accuracy is more important than speed</strong> — Going slowly ensures neural connection strength. Speeds will organically unlock.</span>
          </li>
        </ul>
      </div>

      {/* PREVIEW SECTION */}
      <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-900 rounded-3xl p-4 mb-4">
        <span className="text-[8px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono block mb-2.5">
          LESSON EXERCISE PREVIEW
        </span>
        <div className="bg-white dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-900/80 p-3.5 rounded-2xl font-mono text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-bold tracking-wider select-none">
          {lesson.texts.slice(0, 3).map((text, idx) => (
            <div key={idx} className="truncate">
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* START PRACTICE AND WARNINGS */}
      <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-900 rounded-3xl p-4.5 mb-4 flex flex-col gap-3">
        {unlocked ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onStartPractice(lesson)}
              className="flex-grow flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-zinc-950 font-black text-xs rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg cursor-pointer text-center relative overflow-hidden"
              id="btn_details_start_practice"
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              <span>▶ START PRACTICE</span>
            </button>
            
            <button
              onClick={() => onStartPractice(lesson)}
              className="px-5 py-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold text-xs rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              id="btn_details_review"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Review Lesson</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-4 py-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 rounded-2xl text-xs font-bold leading-normal">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Complete the previous lesson to unlock this lesson.</span>
            </div>
            
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 font-black text-xs rounded-2xl cursor-not-allowed opacity-50"
            >
              <Play className="w-4 h-4 fill-slate-400 dark:fill-zinc-600" />
              <span>▶ START PRACTICE (LOCKED)</span>
            </button>
          </div>
        )}
      </div>

      {/* PREVIOUS / NEXT NAVIGATION FOOTER */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-900/60 pt-4 mt-2 mb-6">
        <button
          disabled={!prevLesson}
          onClick={() => prevLesson && onNavigateToLesson(prevLesson)}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border font-bold text-xs transition-all ${
            prevLesson 
              ? 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 border-slate-200/60 dark:border-zinc-800/80 hover:border-amber-500/40 hover:scale-102 active:scale-98' 
              : 'bg-slate-100 dark:bg-zinc-950/60 text-slate-300 dark:text-zinc-700 border-slate-100 dark:border-zinc-900/30 cursor-not-allowed'
          }`}
          id="btn_details_prev"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Lesson</span>
        </button>

        <button
          disabled={!isNextUnlocked}
          onClick={() => isNextUnlocked && nextLesson && onNavigateToLesson(nextLesson)}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border font-bold text-xs transition-all ${
            isNextUnlocked 
              ? 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 border-slate-200/60 dark:border-zinc-800/80 hover:border-amber-500/40 hover:scale-102 active:scale-98' 
              : 'bg-slate-100 dark:bg-zinc-950/60 text-slate-300 dark:text-zinc-700 border-slate-100 dark:border-zinc-900/30 cursor-not-allowed'
          }`}
          id="btn_details_next"
        >
          <span>Next Lesson</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
