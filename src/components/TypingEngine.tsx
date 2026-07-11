import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, RefreshCw, Trophy, Zap, Award, Activity, Keyboard, 
  AlertTriangle, ShieldCheck, Sparkles, Star, ChevronRight, 
  CheckCircle2, ArrowRight, Lock, ArrowLeft, Hourglass, BarChart3, ListOrdered,
  Smartphone, Volume2, VolumeX, MessageSquare
} from 'lucide-react';
import { Lesson, KeyboardSettings, TypingStats, UserProfile } from '../types';
import { VirtualKeyboard } from './VirtualKeyboard';
import { audioSynth } from '../utils/audio';
import { AnalyticsEngine } from '../utils/analyticsEngine';
import { useKeyboardDetector, inferLayoutFromKeyEvent, translateCodeToLayoutChar } from '../utils/keyboardDetector';
import { 
  processSessionCompletion, registerMistypedKey, markLessonCompleted, saveLessonProgress,
  loadStats, loadProfile, loadAchievements, loadDailyChallenges
} from '../utils/storage';
import { LESSONS } from '../data/lessons';
import { ReportParagraphSheet } from './ReportParagraphSheet';

/* v8 ignore start */


interface TypingEngineProps {
  sessionType: 'lesson' | 'test' | 'custom';
  title: string;
  lessonData?: Lesson;
  customText?: string;
  timeLimit?: number; // in seconds, null for infinite (lessons)
  settings: KeyboardSettings;
  onUpdateSettings?: (settings: KeyboardSettings) => void;
  onSessionComplete: (results: {
    wpm: number;
    accuracy: number;
    xpGained: number;
    leveledUp: boolean;
    mistakesCount: number;
  }) => void;
  onNextLesson?: (currentLessonId: string) => void;
  onExit: () => void;
  onOpenFeedback?: () => void;
}

// Confetti particle element for high-quality SVG/Framer-Motion animation
const Confetti: React.FC = () => {
  const particles = Array.from({ length: 70 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((_, i) => {
        const xStart = Math.random() * 100; // %
        const xEnd = xStart + (Math.random() * 40 - 20); // %
        const delay = Math.random() * 1.5; // seconds
        const duration = 2.5 + Math.random() * 2.5; // seconds
        const scale = 0.4 + Math.random() * 0.7;
        const colors = ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#EF4444', '#F43F5E'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <motion.div
            key={i}
            className="absolute w-2.5 h-2.5 rounded-sm"
            style={{
              backgroundColor: randomColor,
              left: `${xStart}%`,
              top: `-15px`,
            }}
            animate={{
              y: ['0vh', '110vh'],
              x: [`${xStart}%`, `${xEnd}%`],
              rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
            }}
            transition={{
              duration: duration,
              delay: delay,
              ease: 'easeOut',
              repeat: Infinity,
            }}
          />
        );
      })}
    </div>
  );
};

export const TypingEngine: React.FC<TypingEngineProps> = ({
  sessionType,
  title,
  lessonData,
  customText,
  timeLimit,
  settings,
  onUpdateSettings,
  onSessionComplete,
  onNextLesson,
  onExit,
  onOpenFeedback,
}) => {
  // Get source text
  const sourceText = useMemo(() => {
    if (sessionType === 'lesson' && lessonData) {
      return lessonData.texts.join('\n\n');
    }
    return customText || 'TypeSprint external keyboard tutor is ready.';
  }, [sessionType, lessonData, customText]);

  // External physical keyboard detection status
  const keyboardDevice = useKeyboardDetector();
  const [simulationMode, setSimulationMode] = useState(false);

  // Session identification for persistence
  const sessionId = useMemo(() => {
    if (sessionType === 'lesson' && lessonData) return `lesson_${lessonData.id}`;
    if (sessionType === 'test') return `test_${timeLimit}`;
    if (customText) return `custom_${customText.substring(0, 20)}`;
    return 'unknown';
  }, [sessionType, lessonData, customText, timeLimit]);

  // Key states
  const [typedText, setTypedText] = useState('');
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [maxComboStreak, setMaxComboStreak] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [reportLesson, setReportLesson] = useState<Lesson | null>(null);
  
  // Last typed status for virtual keyboard glows
  const [lastTypedStatus, setLastTypedStatus] = useState<{ key: string; status: 'correct' | 'incorrect'; timestamp: number } | null>(null);

  // Software layout translation and auto-detection toasts
  const [softwareTranslation, setSoftwareTranslation] = useState(true);
  const [detectedLayoutToast, setDetectedLayoutToast] = useState<{ original: string; detected: string; method: string } | null>(null);

  useEffect(() => {
    if (detectedLayoutToast) {
      const t = setTimeout(() => setDetectedLayoutToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [detectedLayoutToast]);

  // Profile and stats loaded inside components for calculations
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadProfile());
  const [userStats, setUserStats] = useState<TypingStats>(() => loadStats());

  // Premium Results Page state
  const [finalSessionResult, setFinalSessionResult] = useState<{
    wpm: number;
    rawWpm: number;
    cpm: number;
    accuracy: number;
    mistakesCount: number;
    timeSpent: number;
    xpGained: number;
    coinsGained: number;
    leveledUp: boolean;
    starsEarned: number;
    unlockedAchievements: any[];
    averageWpm: number;
    peakWpm: number;
    newPersonalBest: boolean;
    maxComboStreak: number;
  } | null>(null);

  // DOM and Timer refs
  const isMobileMode = userProfile.typingMode === 'mobile_keyboard';
  const mobileInputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);

  // Initialize and auto-focus typing container
  useEffect(() => {
    if (isMobileMode && mobileInputRef.current) {
      mobileInputRef.current.focus();
    } else if (containerRef.current) {
      containerRef.current.focus();
    }
    // Clean timer
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isMobileMode]);

  // Determine current target character

    const calculateLiveMetrics = (currentTypedText: string, elapsedSecs: number) => {
    const sourceTokens = sourceText.split(/( |\n)/g);
    const typedTokens = currentTypedText.split(/( |\n)/g);
    
    let correct = 0;
    let incorrect = 0;
    let extra = 0;
    let missed = 0;

    for (let i = 0; i < typedTokens.length; i++) {
      const srcToken = sourceTokens[i];
      const typedToken = typedTokens[i];
      
      if (srcToken === undefined) {
        extra += typedToken.length;
        continue;
      }
      
      const isActive = i === typedTokens.length - 1;
      
      for (let j = 0; j < Math.max(srcToken.length, typedToken.length); j++) {
        const sChar = srcToken[j];
        const tChar = typedToken[j];
        
        if (tChar === undefined) {
          if (!isActive) missed++;
        } else if (sChar === undefined) {
          extra++;
        } else if (tChar === sChar) {
          correct++;
        } else {
          incorrect++;
        }
      }
    }
    
    return {
      sourceTokens,
      typedTokens,
      correct,
      incorrect,
      extra,
      missed,
      metrics: AnalyticsEngine.calculateMetrics(correct, incorrect, elapsedSecs, extra, missed)
    };
  };

  const currentIdx = typedText.length;
  const typedTokensForTarget = typedText.split(/( |\n)/g);
  const sourceTokensForTarget = sourceText.split(/( |\n)/g);
  const activeTargetToken = sourceTokensForTarget[typedTokensForTarget.length - 1];
  const activeTypedToken = typedTokensForTarget[typedTokensForTarget.length - 1];
  let currentTargetChar: string | null | undefined = (activeTargetToken !== undefined && activeTypedToken !== undefined) ? activeTargetToken[activeTypedToken.length] : undefined;
  if (currentTargetChar === undefined) {
    currentTargetChar = sourceTokensForTarget[typedTokensForTarget.length];
  }
  if (currentTargetChar === undefined) currentTargetChar = null;

  // Real-time calculations
  const stats = useMemo(() => {
    if (!startTime) return { 
      wpm: 0, 
      rawWpm: 0,
      accuracy: 100, 
      errorRate: 0,
      cpm: 0, 
      wordsRemaining: 0,
      correctCharacters: 0,
      incorrectCharacters: 0,
      totalTypedCharacters: 0,
      elapsedTime: 0,
      remainingTime: timeLimit || 0,
      progressPercentage: 0
    };
    
    const { sourceTokens, typedTokens, metrics } = calculateLiveMetrics(typedText, elapsedSeconds);
    const wordsRemaining = Math.max(0, sourceTokens.filter((t, i) => i % 2 === 0).length - Math.floor(typedTokens.length / 2));
    const remainingTime = timeLimit ? Math.max(0, timeLimit - elapsedSeconds) : 0;
    const progressPercentage = Math.round((typedText.length / sourceText.length) * 100);

    return {
      ...metrics,
      wordsRemaining,
      remainingTime,
      progressPercentage
    };
  }, [typedText, elapsedSeconds, startTime, sourceText, timeLimit]);

  // Live dynamic XP calculation
  const liveXp = useMemo(() => {
    let base = 60; // Base completion XP for finishing a lesson
    
    // Potential perfect accuracy achievement bonus (300 XP)
    if (stats.accuracy === 100 && typedText.length > 5) {
      base += 300;
    }
    
    // Potential speed achievements bonus
    if (stats.wpm >= 100) {
      base += 500; // 100 WPM achievement
    } else if (stats.wpm >= 80) {
      base += 450; // Speed Demon achievement
    }
    
    return base;
  }, [stats.wpm, stats.accuracy, typedText.length]);

  // Save lesson progress real-time
  useEffect(() => {
    if (sessionType === 'lesson' && lessonData && stats.progressPercentage > 0) {
      saveLessonProgress(lessonData.id, stats.progressPercentage);
    }
  }, [stats.progressPercentage, sessionType, lessonData]);

  // Timer runner
  useEffect(() => {
    if (startTime && !sessionCompleted && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          // Check for time limits in Time Tests
          if (timeLimit && next >= timeLimit) {
            triggerComplete(next);
            return timeLimit;
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, sessionCompleted, isPaused, timeLimit]);

  // Finalize session and trigger reward calculation
  const triggerComplete = (finalTimeSeconds: number) => {
    if (sessionCompleted) return;
    setSessionCompleted(true);
    localStorage.removeItem('active_typing_session');
    if (timerRef.current) clearInterval(timerRef.current);

    audioSynth.playSuccess();

    const { metrics: finalStats } = calculateLiveMetrics(typedText, finalTimeSeconds);

    // Save progress to storage
    const rewards = processSessionCompletion({
      type: sessionType,
      title: title,
      wpm: finalStats.wpm,
      rawWpm: finalStats.rawWpm,
      cpm: finalStats.cpm,
      accuracy: finalStats.accuracy,
      timeSpentSeconds: finalTimeSeconds,
      mistakesCount: mistakesCount,
      totalKeysPressed: finalStats.totalTypedCharacters,
      correctCharacters: finalStats.correctCharacters,
      incorrectCharacters: finalStats.incorrectCharacters,
      extraCharacters: finalStats.extraCharacters,
      missedCharacters: finalStats.missedCharacters,
      typingMode: userProfile.typingMode || 'mobile_keyboard',
      keyboardType: keyboardDevice.status,
      deviceName: keyboardDevice.name
    });

    const stars = finalStats.accuracy >= 95 ? 3 : finalStats.accuracy >= 90 ? 2 : finalStats.accuracy >= 80 ? 1 : 0;

    // Save lesson lock status locally
    if (sessionType === 'lesson' && lessonData && finalStats.accuracy >= 80) {
      markLessonCompleted(lessonData.id);
      saveLessonProgress(lessonData.id, 100);
    }

    // Refresh states
    const updatedStats = loadStats();
    const updatedProfile = loadProfile();
    setUserStats(updatedStats);
    setUserProfile(updatedProfile);

    // Filter sessions to calculate average and peak for THIS drill
    const lessonHistory = updatedStats.history.filter(h => h.title === title && h.type === sessionType);
    const peakWpm = lessonHistory.length > 0 ? Math.max(...lessonHistory.map(h => h.wpm)) : finalStats.wpm;
    const avgWpm = lessonHistory.length > 0 
      ? Math.round(lessonHistory.reduce((acc, h) => acc + h.wpm, 0) / lessonHistory.length) 
      : finalStats.wpm;

    setFinalSessionResult({
      wpm: finalStats.wpm,
      rawWpm: finalStats.rawWpm,
      cpm: finalStats.cpm,
      accuracy: finalStats.accuracy,
      mistakesCount: mistakesCount,
      timeSpent: finalTimeSeconds,
      xpGained: rewards.xpGained,
      coinsGained: rewards.coinsGained,
      leveledUp: rewards.leveledUp,
      starsEarned: stars,
      unlockedAchievements: rewards.unlockedAchievements,
      averageWpm: avgWpm,
      peakWpm: Math.max(peakWpm, finalStats.wpm),
      newPersonalBest: rewards.newPersonalBest,
      maxComboStreak: maxComboStreak
    });

    onSessionComplete({
      wpm: finalStats.wpm,
      accuracy: finalStats.accuracy,
      xpGained: rewards.xpGained,
      leveledUp: rewards.leveledUp,
      mistakesCount: mistakesCount
    });
  };

  // Dynamic audio tactile feedback manager helper function
  const triggerKeystrokeFeedback = (key: string, isCorrect: boolean) => {
    if (settings.soundType === 'mute') return;
    if (isCorrect) {
      audioSynth.playDynamicClick(key, settings.soundType);
    } else {
      audioSynth.playError();
    }
  };

  // Keyboard interceptor
  const handleKeyDownInternal = (key: string, preventDefault: () => void, isModifierPressed: boolean) => {
    // Escape or Ctrl+P pauses
    if (key === 'Escape') {
      setIsPaused((p) => !p);
      preventDefault();
      return;
    }

    if (sessionCompleted || isPaused) return;

    if (!isMobileMode && settings.blockOnScreenKeyboard && keyboardDevice.status === 'none' && !simulationMode) {
      preventDefault();
      return;
    }

    if (isModifierPressed && key !== 'Backspace' && key !== 'Enter') {
      return;
    }

    if (!startTime) {
      setStartTime(Date.now());
    }

    setActiveKeys((prev) => {
      const next = new Set(prev);
      next.add(key.toUpperCase());
      return next;
    });

    if (key === 'Backspace') {
      if (settings.backspaceEnabled && typedText.length > 0) {
        setTypedText((prev) => prev.slice(0, -1));
        triggerKeystrokeFeedback('Backspace', true);
      } else {
        triggerKeystrokeFeedback('Backspace', false);
      }
      preventDefault();
      return;
    }

    if (key.length > 1 && key !== 'Enter') {
      if (key === 'Tab') preventDefault();
      return;
    }

    const sourceTokens = sourceText.split(/( |\n)/g);
    const typedTokens = typedText.split(/( |\n)/g);
    const inputChar = key === 'Enter' ? '\n' : key;
    
    if (inputChar === ' ' || inputChar === '\n') {
      if (typedText.endsWith(' ') || typedText.endsWith('\n')) {
        preventDefault();
        return;
      }
      if (typedTokens.length >= sourceTokens.length) {
        preventDefault();
        return;
      }
      setTypedText(prev => prev + inputChar);
      triggerKeystrokeFeedback(inputChar, true);
    } else {
      const currentWordIdx = typedTokens.length - 1;
      const targetWord = sourceTokens[currentWordIdx] || '';
      const currentTypedWord = typedTokens[currentWordIdx];
      
      if (currentTypedWord.length >= targetWord.length + 10) {
        preventDefault();
        return;
      }
      
      setTypedText(prev => prev + inputChar);
      const isCorrect = inputChar === targetWord[currentTypedWord.length];
      if (isCorrect) {
        setComboStreak(prev => {
          const next = prev + 1;
          setMaxComboStreak(max => Math.max(max, next));
          return next;
        });
        setLastTypedStatus({ key: inputChar, status: 'correct', timestamp: Date.now() });
        triggerKeystrokeFeedback(inputChar, true);
      } else {
        setComboStreak(0);
        setMistakesCount(prev => prev + 1);
        setLastTypedStatus({ key: inputChar, status: 'incorrect', timestamp: Date.now() });
        registerMistypedKey(targetWord[currentTypedWord.length] || inputChar);
        triggerKeystrokeFeedback(inputChar, false);
      }
      
      const newTypedText = typedText + inputChar;
      const newTypedTokens = newTypedText.split(/( |\n)/g);
      if (newTypedTokens.length >= sourceTokens.length) {
        const lastTarget = sourceTokens[sourceTokens.length - 1];
        const lastTyped = newTypedTokens[newTypedTokens.length - 1];
        if (lastTyped.length >= lastTarget.length) {
          triggerComplete(elapsedSeconds);
        }
      }
    }
    preventDefault();
  };

  const handleMobileInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (sessionCompleted || isPaused) return;

    const newValue = e.target.value;
    const expectedLength = typedText.length;

    if (newValue.length < expectedLength) {
      if (settings.backspaceEnabled && typedText.length > 0) {
        setTypedText(newValue);
        triggerKeystrokeFeedback('Backspace', true);
      } else {
        triggerKeystrokeFeedback('Backspace', false);
      }
      return;
    }

    const typedChar = newValue[newValue.length - 1];
    if (!typedChar) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    const sourceTokens = sourceText.split(/( |\n)/g);
    const prevTypedTokens = typedText.split(/( |\n)/g);
    
    if (typedChar === ' ' || typedChar === '\n') {
      if (typedText.endsWith(' ') || typedText.endsWith('\n')) return;
      if (prevTypedTokens.length >= sourceTokens.length) return;
      
      setTypedText(newValue);
      triggerKeystrokeFeedback(typedChar, true);
    } else {
      const currentWordIdx = prevTypedTokens.length - 1;
      const targetWord = sourceTokens[currentWordIdx] || '';
      const currentTypedWord = prevTypedTokens[currentWordIdx];
      
      if (currentTypedWord.length >= targetWord.length + 10) return;
      
      setTypedText(newValue);
      
      const isCorrect = typedChar === targetWord[currentTypedWord.length];
      if (isCorrect) {
        setComboStreak(prev => {
          const next = prev + 1;
          setMaxComboStreak(max => Math.max(max, next));
          return next;
        });
        setLastTypedStatus({ key: typedChar, status: 'correct', timestamp: Date.now() });
        triggerKeystrokeFeedback(typedChar, true);
      } else {
        setComboStreak(0);
        setMistakesCount(prev => prev + 1);
        setLastTypedStatus({ key: typedChar, status: 'incorrect', timestamp: Date.now() });
        registerMistypedKey(targetWord[currentTypedWord.length] || typedChar);
        triggerKeystrokeFeedback(typedChar, false);
      }
      
      const newTypedTokens = newValue.split(/( |\n)/g);
      if (newTypedTokens.length >= sourceTokens.length) {
        const lastTarget = sourceTokens[sourceTokens.length - 1];
        const lastTyped = newTypedTokens[newTypedTokens.length - 1];
        if (lastTyped.length >= lastTarget.length) {
          triggerComplete(elapsedSeconds);
        }
      }
    }
  };

  const handleKeyUpInternal = (key: string) => {
    setActiveKeys((prev) => {
      const next = new Set(prev);
      next.delete(key.toUpperCase());
      return next;
    });
  };

  // Focus-free Global physical keyboard capture
  useEffect(() => {
    if (isMobileMode) return; // Skip global listeners in mobile mode to let mobile textarea work smoothly

    const onGlobalKeyDown = (e: KeyboardEvent) => {
      if (sessionCompleted) return;
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      // 1. Dynamic Layout Inference from Keystrokes Heuristics
      const inferred = inferLayoutFromKeyEvent(e.code, e.key);
      if (inferred && inferred !== settings.layout && onUpdateSettings) {
        onUpdateSettings({
          ...settings,
          layout: inferred,
        });
        setDetectedLayoutToast({
          original: settings.layout,
          detected: inferred,
          method: 'Heuristic Keystrokes'
        });
      }

      const isModifierPressed = e.ctrlKey || e.metaKey || e.altKey;
      
      // 2. Real-time layout mapping/translation
      let finalKey = e.key;
      if (softwareTranslation && settings.layout !== 'QWERTY' && !isModifierPressed) {
        const translated = translateCodeToLayoutChar(e.code, e.shiftKey, settings.layout);
        if (translated) {
          finalKey = translated;
        }
      }

      handleKeyDownInternal(finalKey, () => e.preventDefault(), isModifierPressed);
    };

    const onGlobalKeyUp = (e: KeyboardEvent) => {
      if (sessionCompleted) return;
      
      let finalKey = e.key;
      if (softwareTranslation && settings.layout !== 'QWERTY') {
        const translated = translateCodeToLayoutChar(e.code, e.shiftKey, settings.layout);
        if (translated) {
          finalKey = translated;
        }
      }
      handleKeyUpInternal(finalKey);
    };

    window.addEventListener('keydown', onGlobalKeyDown);
    window.addEventListener('keyup', onGlobalKeyUp);

    return () => {
      window.removeEventListener('keydown', onGlobalKeyDown);
      window.removeEventListener('keyup', onGlobalKeyUp);
    };
  }, [startTime, sessionCompleted, isPaused, typedText, settings, mistakesCount, elapsedSeconds, isMobileMode, softwareTranslation, onUpdateSettings]);

  // Focus re-claimer
  const claimFocus = () => {
    if (isMobileMode && mobileInputRef.current) {
      mobileInputRef.current.focus();
    } else if (containerRef.current) {
      containerRef.current.focus();
    }
  };

  // Restart practice session
  const restartSession = () => {
    localStorage.removeItem('active_typing_session');
    setTypedText('');
    setActiveKeys(new Set());
    setStartTime(null);
    setElapsedSeconds(0);
    setMistakesCount(0);
    setComboStreak(0);
    setMaxComboStreak(0);
    setSessionCompleted(false);
    setIsPaused(false);
    setFinalSessionResult(null);
    setLastTypedStatus(null);
    claimFocus();
  };

  // Auto-scroll as the user types - keeps active character perfectly centered on screen
  useEffect(() => {
    if (activeCharRef.current) {
      activeCharRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }, [typedText.length]);

  // Render typing visual words with rich highlighting
  const renderTextFlow = () => {
    const sourceTokens = sourceText.split(/( |\n)/g);
    const typedTokens = typedText.split(/( |\n)/g);

    return (
      <div className="text-2xl md:text-3xl font-medium font-mono leading-relaxed select-none break-words whitespace-pre-wrap tracking-wide outline-none">
        {sourceTokens.map((srcToken, i) => {
          const typedToken = typedTokens[i];
          const isActive = i === typedTokens.length - 1;

          if (i % 2 !== 0) {
            const displayChar = srcToken === '\n' ? '↵\n' : srcToken;
            return (
              <span key={i} className={`${isActive ? 'relative' : ''} text-slate-400 dark:text-zinc-600`}>
                {displayChar}
                {isActive && <span className="absolute w-[2px] h-6 bg-amber-500 animate-pulse -ml-[2px]" ref={activeCharRef}></span>}
              </span>
            );
          }

          const charsToRender = Math.max(srcToken.length, typedToken ? typedToken.length : 0);
          
          return (
            <span key={i} className={`inline-block ${typedToken !== undefined && typedToken !== srcToken && !isActive ? 'border-b-2 border-rose-500/30' : ''}`}>
              {Array.from({ length: charsToRender }).map((_, j) => {
                const sChar = srcToken[j];
                const tChar = typedToken ? typedToken[j] : undefined;

                let colorClass = 'text-slate-400 dark:text-zinc-600';
                const isCursor = isActive && j === (typedToken ? typedToken.length : 0);

                if (tChar === undefined) {
                  if (!isActive && sChar !== undefined) {
                    colorClass = 'text-rose-400/50 dark:text-rose-500/50';
                  }
                } else if (sChar === undefined) {
                  colorClass = 'text-rose-600 dark:text-rose-500 font-bold';
                } else if (tChar === sChar) {
                  colorClass = 'text-emerald-500 dark:text-emerald-400 font-bold';
                } else {
                  colorClass = 'text-rose-500 bg-rose-50 dark:bg-rose-950/30 font-semibold';
                }

                return (
                  <span key={j} className={`${colorClass} relative`}>
                    {isCursor && (
                      <span className="absolute left-0 top-0 w-[2px] h-full bg-amber-500 animate-pulse z-10 rounded" ref={activeCharRef}></span>
                    )}
                    {sChar !== undefined ? sChar : tChar}
                  </span>
                );
              })}
              {isActive && typedToken && typedToken.length === charsToRender && (
                 <span className="absolute w-[2px] h-[1em] mt-[0.1em] bg-amber-500 animate-pulse rounded" ref={activeCharRef}></span>
              )}
            </span>
          );
        })}
      </div>
    );
  };

  // Percent values
  const completionPct = Math.round((typedText.length / sourceText.length) * 100) || 0;
  const progressPct = completionPct;

  // Active level calculation
  const nextLevelXp = userProfile.level * 300;
  const liveEarnedXp = startTime ? liveXp : 0;
  const predictedTotalXp = userProfile.xp + liveEarnedXp;
  const xpPercentage = Math.min(100, Math.round((predictedTotalXp / nextLevelXp) * 100));

  // Determine lesson details positioning
  const lessonIndex = lessonData ? LESSONS.findIndex(l => l.id === lessonData.id) : -1;
  const totalLessonsCount = LESSONS.length;
  const lessonNumberString = lessonIndex !== -1 ? `Lesson ${lessonIndex + 1} of ${totalLessonsCount}` : 'Special Practice';

  // Goals
  const targetWpmGoal = lessonData?.difficulty === 'Advanced' ? 45 : lessonData?.difficulty === 'Intermediate' ? 30 : 15;
  const targetAccGoal = lessonData?.difficulty === 'Advanced' ? 97 : lessonData?.difficulty === 'Intermediate' ? 95 : 90;

  // PREMIUM RESULTS VIEW SCREEN
  if (finalSessionResult) {
    return (
      <div className="flex flex-col gap-5 justify-center items-center h-full max-w-2xl mx-auto py-2 relative" id="typing_results_screen">
        {/* Render Confetti for impeccable stars! */}
        {finalSessionResult.starsEarned === 3 && <Confetti />}

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 p-6 md:p-8 rounded-3xl shadow-xl w-full text-center relative overflow-hidden"
        >
          {/* Accent strip */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />
          
          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full inline-block">
            {sessionType === 'lesson' ? 'Lesson Accomplished' : 'Practice Completed'}
          </span>
          
          <h2 className="text-xl md:text-2xl font-black font-display text-slate-800 dark:text-zinc-50 mt-3 tracking-tight">
            {title}
          </h2>

          {/* Animated Gold Stars */}
          <div className="flex justify-center gap-3.5 my-5">
            {[0, 1, 2].map((idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0, rotate: -40 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15 + idx * 0.12, type: 'spring', stiffness: 180 }}
              >
                <Star 
                  className={`w-11 h-11 ${
                    idx < finalSessionResult.starsEarned 
                      ? 'text-amber-500 fill-amber-500 filter drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)] animate-pulse' 
                      : 'text-slate-100 dark:text-zinc-800'
                  }`} 
                />
              </motion.div>
            ))}
          </div>

          <p className="text-xs text-slate-400 font-bold mb-3 leading-normal px-4">
            {finalSessionResult.starsEarned === 3 
              ? '🏆 Outstanding Performance! Flawless finger coordinates achieved.' 
              : finalSessionResult.starsEarned === 2 
              ? '✨ Excellent rhythm! Your muscle memory is getting incredibly accurate.' 
              : finalSessionResult.starsEarned === 1 
              ? '👍 Clear victory! Keep practicing these anchor keys for better speeds.' 
              : 'Keep practicing! Steady key coordinates lead to fast typing speeds.'}
          </p>

          {/* New Personal Best Notification Banner */}
          {finalSessionResult.newPersonalBest && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.5 }}
              className="my-4 p-4 bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-orange-500/20 border-2 border-orange-500 rounded-2xl relative overflow-hidden text-center shadow-lg"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
              <h4 className="text-sm font-black text-orange-500 dark:text-amber-400 uppercase tracking-widest font-mono flex items-center justify-center gap-1.5">
                🔥 NEW PERSONAL BEST!
              </h4>
              <p className="text-[11px] text-slate-700 dark:text-zinc-200 font-bold mt-1.5">
                Outstanding progress! You broke your previous speed barrier with <span className="text-orange-500 font-black text-sm">{finalSessionResult.wpm} WPM</span>!
              </p>
            </motion.div>
          )}

          {/* Detailed Statistics Bento Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
            
            {/* Net Speed */}
            <div className="bg-slate-50 dark:bg-zinc-950/60 p-3.5 rounded-2xl border border-slate-100 dark:border-zinc-800/40 text-center relative overflow-hidden">
              <span className="text-[8.5px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-black block">Net Speed</span>
              <span className="text-xl font-black text-slate-800 dark:text-zinc-100 font-display mt-1 block">
                {finalSessionResult.wpm} <span className="text-[10px] font-bold text-slate-400">WPM</span>
              </span>
            </div>

            {/* Raw Speed */}
            <div className="bg-slate-50 dark:bg-zinc-950/60 p-3.5 rounded-2xl border border-slate-100 dark:border-zinc-800/40 text-center relative overflow-hidden">
              <span className="text-[8.5px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-black block">Raw Speed</span>
              <span className="text-xl font-black text-slate-800 dark:text-zinc-100 font-display mt-1 block">
                {finalSessionResult.rawWpm} <span className="text-[10px] font-bold text-slate-400">WPM</span>
              </span>
            </div>

            {/* Accuracy */}
            <div className="bg-slate-50 dark:bg-zinc-950/60 p-3.5 rounded-2xl border border-slate-100 dark:border-zinc-800/40 text-center relative overflow-hidden">
              <span className="text-[8.5px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-black block">Accuracy</span>
              <span className={`text-xl font-black font-display mt-1 block ${
                finalSessionResult.accuracy >= 95 ? 'text-emerald-500' : finalSessionResult.accuracy >= 90 ? 'text-amber-500' : 'text-rose-400'
              }`}>
                {finalSessionResult.accuracy}%
              </span>
            </div>

            {/* Max Combo */}
            <div className="bg-slate-50 dark:bg-zinc-950/60 p-3.5 rounded-2xl border border-slate-100 dark:border-zinc-800/40 text-center relative overflow-hidden">
              <span className="text-[8.5px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-black block">Max Combo</span>
              <span className="text-xl font-black text-orange-500 font-display mt-1 block">
                {finalSessionResult.maxComboStreak} <span className="text-[10px] font-bold text-orange-500/80">🔥</span>
              </span>
            </div>

            {/* Mistakes */}
            <div className="bg-slate-50 dark:bg-zinc-950/60 p-3.5 rounded-2xl border border-slate-100 dark:border-zinc-800/40 text-center relative overflow-hidden">
              <span className="text-[8.5px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-black block">Mistakes</span>
              <span className={`text-xl font-black font-display mt-1 block ${
                finalSessionResult.mistakesCount > 0 ? 'text-rose-500' : 'text-emerald-500'
              }`}>
                {finalSessionResult.mistakesCount}
              </span>
            </div>

            {/* Key Strokes (CPM) */}
            <div className="bg-slate-50 dark:bg-zinc-950/60 p-3.5 rounded-2xl border border-slate-100 dark:border-zinc-800/40 text-center relative overflow-hidden">
              <span className="text-[8.5px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-black block">Key Strokes (CPM)</span>
              <span className="text-xl font-black text-slate-800 dark:text-zinc-100 font-display mt-1 block">
                {finalSessionResult.cpm} <span className="text-[10px] font-bold text-slate-400">CPM</span>
              </span>
            </div>

            {/* Time Taken */}
            <div className="bg-slate-50 dark:bg-zinc-950/60 p-3.5 rounded-2xl border border-slate-100 dark:border-zinc-800/40 text-center relative overflow-hidden">
              <span className="text-[8.5px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-black block">Time Taken</span>
              <span className="text-xl font-black text-slate-800 dark:text-zinc-100 font-display mt-1 block">
                {finalSessionResult.timeSpent} <span className="text-[10px] font-bold text-slate-400">Secs</span>
              </span>
            </div>

            {/* Rewards */}
            <div className="bg-slate-50 dark:bg-zinc-950/60 p-3.5 rounded-2xl border border-slate-100 dark:border-zinc-800/40 text-center relative overflow-hidden">
              <span className="text-[8.5px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-black block">Rewards</span>
              <span className="text-base font-black text-amber-500 font-display mt-1 block flex flex-col items-center justify-center gap-0.5 leading-none">
                <span className="flex items-center gap-0.5"><Sparkles className="w-3 h-3 text-amber-500 animate-pulse" /> +{finalSessionResult.xpGained} XP</span>
                <span className="text-[10px] text-amber-500 font-bold">+{finalSessionResult.coinsGained} Coins</span>
              </span>
            </div>
          </div>

          {/* Level up celebration popup inside results card */}
          {finalSessionResult.leveledUp && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.6 }}
              className="mt-4 p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500 rounded-2xl relative overflow-hidden text-center shadow-lg"
            >
              <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-1 animate-bounce" />
              <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-widest font-mono">
                🚀 LEVEL UP DETECTED!
              </h4>
              <p className="text-[10px] text-zinc-300 font-bold mt-1">
                Congratulations! You reached Level <span className="text-amber-400 font-extrabold text-xs">{userProfile.level}</span>! Your fingertip dexterity is increasing.
              </p>
            </motion.div>
          )}

          {/* Achievements Unlocked panel */}
          {finalSessionResult.unlockedAchievements && finalSessionResult.unlockedAchievements.length > 0 && (
            <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 p-3.5 rounded-2xl text-left flex items-center gap-3 my-4">
              <Award className="w-8 h-8 text-amber-500 shrink-0 animate-bounce" />
              <div>
                <h5 className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  Achievement Unlocked!
                </h5>
                <p className="text-xs text-slate-700 dark:text-zinc-200 font-bold">
                  {finalSessionResult.unlockedAchievements[0].title}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold mt-0.5">
                  {finalSessionResult.unlockedAchievements[0].description}
                </p>
              </div>
            </div>
          )}

          {/* Action Button Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={restartSession}
              className="flex-1 flex items-center justify-center gap-1.5 px-5 py-3 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-2xl font-bold text-xs transition-all cursor-pointer hover:scale-102 active:scale-98"
              id="btn_result_retry"
            >
              <RefreshCw className="w-4 h-4" /> Retry Practice
            </button>

            {sessionType === 'lesson' && lessonData && onNextLesson ? (
              <button
                onClick={() => onNextLesson(lessonData.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-zinc-950 rounded-2xl font-black text-xs transition-all cursor-pointer hover:scale-102 active:scale-98 shadow-md"
                id="btn_result_continue"
              >
                Continue to Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onExit}
                className="flex-1 flex items-center justify-center gap-1.5 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-zinc-950 rounded-2xl font-black text-xs transition-all cursor-pointer hover:scale-102 active:scale-98 shadow-md"
                id="btn_result_exit"
              >
                Back to Lessons <CheckCircle2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onOpenFeedback}
              className="px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" /> Send Feedback
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ACTIVE DRILL PRACTICE VIEW RENDER
  return (
    <motion.div 
      id="typing_engine_root"
      ref={containerRef}
      tabIndex={0}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-between h-full w-full bg-slate-50 dark:bg-zinc-950 focus:outline-none select-none p-4 md:p-6"
      onClick={claimFocus}
    >
      
      {/* 1. MINIMAL HEADER CONTROL ROW */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-900 pb-3">
        {/* Left: Low contrast Exit button */}
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors cursor-pointer bg-slate-100/50 dark:bg-zinc-900/50 rounded-xl"
          id="btn_practice_header_back"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>

        {/* Center: Lesson/Practice info */}
        <div className="text-center flex-grow min-w-0 px-2 flex items-center justify-center gap-2">
          <h2 className="text-xs md:text-sm font-black text-slate-800 dark:text-zinc-200 font-display truncate">
            {title}
          </h2>
          {sessionType === 'lesson' && lessonData && (
             <button 
               onClick={() => setReportLesson(lessonData)}
               className="text-slate-400 hover:text-rose-500 cursor-pointer"
               title="Report this lesson"
             >
               <AlertTriangle className="w-3.5 h-3.5" />
             </button>
          )}
        </div>

        {/* Right: Pause & Restart buttons */}
        <div className="flex items-center gap-2">
          {onUpdateSettings && (
            <button
              onClick={() => {
                const isMuted = settings.soundType === 'mute';
                const nextSound = isMuted ? 'mechanical' : 'mute';
                onUpdateSettings({ ...settings, soundType: nextSound });
              }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/40 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title={settings.soundType === 'mute' ? "Unmute sound feedback" : "Mute sound feedback"}
              id="btn_practice_controls_sound_toggle"
            >
              {settings.soundType === 'mute' ? (
                <VolumeX className="w-4 h-4 text-rose-500 animate-pulse" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-500" />
              )}
            </button>
          )}

          <button
            onClick={() => setIsPaused((p) => !p)}
            className={`px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              isPaused 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
            }`}
            id="btn_practice_controls_pause"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          <button
            onClick={restartSession}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl font-black text-xs shadow-md shadow-amber-500/10 transition-all cursor-pointer"
            id="btn_practice_controls_restart"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restart</span>
          </button>
        </div>
      </div>

      {/* 2. PROGRESS BAR */}
      <div className="w-full bg-slate-100 dark:bg-zinc-900 h-1.5 rounded-full mt-2 overflow-hidden relative">
        <motion.div 
          className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.15 }}
        />
      </div>

      {/* 3. ESSENTIAL LIVE STATS HUD */}
      <div className="grid grid-cols-4 gap-2.5 mt-4">
        {/* NET WPM */}
        <div className="bg-white dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-900 p-2.5 rounded-2xl text-center flex flex-col justify-center shadow-sm">
          <span className="text-[8px] uppercase tracking-widest text-slate-400 dark:text-zinc-500 font-bold flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" /> SPEED
          </span>
          <span className="text-xl md:text-2xl font-black text-slate-800 dark:text-zinc-100 font-display mt-0.5">
            {stats.wpm} <span className="text-[10px] font-bold text-slate-400 font-mono">WPM</span>
          </span>
        </div>

        {/* ACCURACY */}
        <div className="bg-white dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-900 p-2.5 rounded-2xl text-center flex flex-col justify-center shadow-sm">
          <span className="text-[8px] uppercase tracking-widest text-slate-400 dark:text-zinc-500 font-bold flex items-center justify-center gap-1">
            <Award className="w-3 h-3 text-emerald-500" /> ACCURACY
          </span>
          <span className="text-xl md:text-2xl font-black text-emerald-500 dark:text-emerald-400 font-display mt-0.5">
            {stats.accuracy}%
          </span>
        </div>

        {/* TIMER */}
        <div className="bg-white dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-900 p-2.5 rounded-2xl text-center flex flex-col justify-center shadow-sm">
          <span className="text-[8px] uppercase tracking-widest text-slate-400 dark:text-zinc-500 font-bold flex items-center justify-center gap-1">
            <Hourglass className="w-3 h-3 text-blue-500" /> TIMER
          </span>
          <span className="text-xl md:text-2xl font-black text-slate-800 dark:text-zinc-100 font-display mt-0.5 font-mono">
            {timeLimit ? `${Math.max(0, timeLimit - elapsedSeconds)}s` : `${elapsedSeconds}s`}
          </span>
        </div>

        {/* COMBO / STREAK */}
        <div className="bg-white dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-900 p-2.5 rounded-2xl text-center flex flex-col justify-center shadow-sm relative overflow-hidden">
          <span className="text-[8px] uppercase tracking-widest text-slate-400 dark:text-zinc-500 font-bold flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500 animate-spin" /> COMBO
          </span>
          <span className={`text-xl md:text-2xl font-black font-display mt-0.5 transition-all ${
            comboStreak > 15 
              ? 'text-orange-500 scale-110 drop-shadow-[0_0_8px_var(--theme-primary,rgba(249,115,22,0.4))]' 
              : comboStreak > 0 
              ? 'text-amber-500' 
              : 'text-slate-400 dark:text-zinc-500'
          }`}>
            {comboStreak} <span className="text-[12px] font-bold">{comboStreak > 0 ? '🔥' : ''}</span>
          </span>
        </div>
      </div>

      {/* 4. IMMERSIVE TYPOGRAPHIC CANVAS (CENTERED) */}
      <div 
        onClick={claimFocus}
        className="flex-grow min-h-0 my-4 bg-white dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-900 rounded-3xl p-6 shadow-sm overflow-y-auto flex items-center justify-center select-none cursor-text relative"
      >
        {/* Transparent overlay input for capturing mobile keys */}
        {isMobileMode && (
          <textarea
            ref={mobileInputRef}
            className="absolute inset-0 w-full h-full p-6 opacity-0 resize-none outline-none overflow-hidden z-10 cursor-text"
            value={typedText}
            onChange={handleMobileInputChange}
            disabled={sessionCompleted || isPaused}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            placeholder="Tap here to open Gboard/SwiftKey and start typing..."
          />
        )}

        {/* Physical hardware connection warning */}
        {!isMobileMode && settings.blockOnScreenKeyboard && keyboardDevice.status === 'none' && !simulationMode ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/95 z-20 rounded-3xl p-6 text-center text-white">
            <AlertTriangle className="w-10 h-10 text-rose-500 mb-2 animate-bounce" />
            <h4 className="text-sm font-black text-rose-400">Keyboard Connection Required</h4>
            <p className="text-[10px] text-zinc-300 max-w-xs mt-1 leading-relaxed">
              Your settings require a physical keyboard to proceed. Please plug in or pair a keyboard, or click below.
            </p>
            <button 
              onClick={() => setSimulationMode(true)}
              className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl font-bold text-[9px] uppercase tracking-wider transition-colors"
            >
              Simulate Connection
            </button>
          </div>
        ) : null}

        {/* Ready to Start message */}
        {!startTime && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-zinc-900/95 z-10 rounded-3xl p-4 text-center">
            {isMobileMode ? (
              <>
                <Smartphone className="w-8 h-8 text-orange-500 mb-1.5 animate-bounce" />
                <h4 className="text-sm font-black text-slate-800 dark:text-zinc-100">Mobile Keyboard Ready</h4>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 max-w-xs mt-1 font-semibold leading-relaxed">
                  Tap inside this canvas or use the text field below to bring up your keyboard and start typing!
                </p>
              </>
            ) : (
              <>
                <Keyboard className="w-8 h-8 text-amber-500 mb-1.5 animate-bounce" />
                <h4 className="text-sm font-black text-slate-800 dark:text-zinc-100">Ready to start typing!</h4>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 max-w-xs mt-1 font-semibold leading-relaxed">
                  Start typing on your keyboard to launch the practice timer. Keep your eyes on the text!
                </p>
              </>
            )}
          </div>
        )}

        {/* Paused state overlay */}
        {isPaused && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 z-20 rounded-3xl p-4 text-center text-white">
            <Play className="w-8 h-8 text-amber-500 mb-2 cursor-pointer hover:scale-110 active:scale-95 transition-all" onClick={() => setIsPaused(false)} />
            <h4 className="text-sm font-black text-zinc-100">Session Paused</h4>
            <p className="text-[10px] text-zinc-400 max-w-xs mt-1 font-bold leading-normal">
              Typing is suspended. Press ESC or click below to resume.
            </p>
            <button 
              onClick={() => setIsPaused(false)}
              className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl font-bold text-[10px] uppercase cursor-pointer"
            >
              Resume
            </button>
          </div>
        )}

        {/* Main Text Content */}
        <div className="w-full text-center max-h-[160px] overflow-y-auto px-4 py-2 scrollbar-none">
          {renderTextFlow()}
        </div>
      </div>

      {/* 5. VISIBLE TYPING INPUT AREA (FOR MOBILE PORTRAIT VIEWS) */}
      {isMobileMode && (
        <div className="w-full flex flex-col gap-1.5 pb-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[8.5px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
              Active Typing Field
            </span>
            {startTime && (
              <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider animate-pulse">
                Timer Running
              </span>
            )}
          </div>
          <textarea
            ref={mobileInputRef}
            rows={2}
            className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 outline-none font-mono text-sm resize-none focus:ring-2 focus:ring-amber-500/40 transition-all text-slate-800 dark:text-zinc-200 shadow-sm"
            value={typedText}
            onChange={handleMobileInputChange}
            disabled={sessionCompleted || isPaused}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            placeholder="Tap here to open Gboard/SwiftKey and type the passage..."
          />
        </div>
      )}

      {/* 6. VIRTUAL KEYBOARD VISUALIZER FOR DESKTOP PRACTICE */}
      {!isMobileMode && (
        <div className="mt-1 pb-2">
          <div className="flex items-center justify-between px-2 pb-1.5 mb-1 border-b border-slate-100 dark:border-zinc-800/60">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5" /> Keyboard Visualizer
             </span>
             {settings.showFingerGuide && (
               <span className="text-[9px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded uppercase">Target Highlight Active</span>
             )}
          </div>
          <VirtualKeyboard
            layout={settings.layout}
            activeKeys={activeKeys}
            nextKey={currentTargetChar || null}
            showFingerGuide={settings.showFingerGuide}
            lastTypedStatus={lastTypedStatus}
          />
        </div>
      )}

      {/* 7. MINIMAL PRACTICE BOTTOM FOOTER */}
      <div className="border-t border-slate-100 dark:border-zinc-900 pt-2 flex items-center justify-between gap-3 text-[9px] font-bold text-slate-400 dark:text-zinc-500">
        <div className="flex items-center gap-1 truncate">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="truncate">Target Precision: <strong className="text-slate-600 dark:text-zinc-400">{targetAccGoal}% Accuracy</strong></span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1">
            <span>GOAL:</span>
            <span className="text-slate-600 dark:text-zinc-400 font-mono">{targetWpmGoal} WPM</span>
          </div>

          <div className="flex items-center gap-1">
            <span>BONUS:</span>
            <span className="text-amber-500 flex items-center gap-0.5"><Sparkles className="w-3.5 h-3.5" /> +60 XP</span>
          </div>
        </div>
      </div>

      {reportLesson && (
        <ReportParagraphSheet
          isOpen={!!reportLesson}
          onClose={() => setReportLesson(null)}
          paragraph={{ id: reportLesson.id, title: reportLesson.title, category: reportLesson.category, difficulty: reportLesson.difficulty }}
          profile={userProfile}
          settings={settings}
        />
      )}
    </motion.div>
  );
};


/* v8 ignore stop */
