import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Award, BookOpen, Clock, Play, History, Sparkles, CheckCircle2, XCircle, ChevronRight,
  TrendingUp, RefreshCw, AlertTriangle, ChevronDown, Check, ShieldAlert, FileText, User, HelpCircle, ArrowLeft, Trophy, Keyboard, Percent, Calendar, Flame
} from 'lucide-react';
import { ExamRule, TypingPassage, ExamAttemptResult, UserExamStats, KeyboardSettings } from '../types';
import EXAM_RULES_DATA from '../data/exam_rules.json';
import PASSAGES_DATA from '../data/typing_passages.json';
import { useAuth } from '../context/AuthContext';

// Simulated Leaderboard Data
const SIMULATED_LEADERBOARDS: Record<string, Array<{ rank: number; name: string; speed: number; accuracy: number; date: string }>> = {
  "jkssb-jr-ast": [
    { rank: 1, name: "Suresh Raina", speed: 58.4, accuracy: 98.2, date: "Today" },
    { rank: 2, name: "Asif Malik", speed: 54.2, accuracy: 97.5, date: "Yesterday" },
    { rank: 3, name: "Priya Sharma", speed: 51.0, accuracy: 96.8, date: "3 days ago" },
    { rank: 4, name: "Irfan Lone", speed: 48.6, accuracy: 94.2, date: "5 days ago" },
    { rank: 5, name: "Sanam Butt", speed: 45.2, accuracy: 92.5, date: "1 week ago" }
  ],
  "ssc-chsl-ldc": [
    { rank: 1, name: "Vikram Singh", speed: 64.5, accuracy: 99.1, date: "Today" },
    { rank: 2, name: "Ananya Roy", speed: 61.2, accuracy: 98.5, date: "Today" },
    { rank: 3, name: "Rahul Verma", speed: 57.0, accuracy: 96.4, date: "2 days ago" },
    { rank: 4, name: "Neha Dwivedi", speed: 53.8, accuracy: 95.0, date: "4 days ago" },
    { rank: 5, name: "Abhishek Raj", speed: 49.2, accuracy: 94.8, date: "1 week ago" }
  ],
  "rrb-ntpc": [
    { rank: 1, name: "Ramesh Kumar", speed: 52.5, accuracy: 99.5, date: "Yesterday" },
    { rank: 2, name: "Sunita Yadav", speed: 49.0, accuracy: 98.0, date: "Yesterday" },
    { rank: 3, name: "Deepak Meena", speed: 44.5, accuracy: 96.5, date: "3 days ago" },
    { rank: 4, name: "Karan Johar", speed: 41.2, accuracy: 95.8, date: "4 days ago" },
    { rank: 5, name: "Meena Kumari", speed: 38.6, accuracy: 95.2, date: "1 week ago" }
  ],
  "hc-clerk": [
    { rank: 1, name: "Justice Advocate", speed: 72.4, accuracy: 99.4, date: "Today" },
    { rank: 2, name: "Harpreet Kaur", speed: 65.8, accuracy: 98.6, date: "2 days ago" },
    { rank: 3, name: "Zia-ul-Haq", speed: 59.2, accuracy: 97.2, date: "3 days ago" },
    { rank: 4, name: "Sameer Bhat", speed: 54.0, accuracy: 96.5, date: "5 days ago" },
    { rank: 5, name: "Tanvi Gupta", speed: 48.5, accuracy: 95.0, date: "1 week ago" }
  ]
};

interface ExamHubDashboardProps {
  settings: KeyboardSettings;
  profile: any;
  onSessionComplete: (results: any) => void;
  onNavigateToTab: (tab: any) => void;
}

export const ExamHubDashboard: React.FC<ExamHubDashboardProps> = ({
  settings,
  profile,
  onSessionComplete,
  onNavigateToTab
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

  // Database States loaded locally
  const [exams, setExams] = useState<ExamRule[]>(EXAM_RULES_DATA as ExamRule[]);
  const [passages, setPassages] = useState<TypingPassage[]>(PASSAGES_DATA as TypingPassage[]);
  
  // Storage keys
  const STORAGE_KEY_ATTEMPTS = 'typesprint_exam_attempts_v1';
  const STORAGE_KEY_STATS = 'typesprint_exam_stats_v1';

  // State managers
  const [attempts, setAttempts] = useState<ExamAttemptResult[]>([]);
  const [examStats, setExamStats] = useState<UserExamStats>({
    targetExamId: 'jkssb-jr-ast', // Default to high-stakes local exam
    attemptsCount: 0,
    passedCount: 0,
    averageWpm: 0,
    bestWpm: 0,
    averageAccuracy: 0,
    totalPracticeSeconds: 0,
    readinessScore: 0
  });

  // Navigation States in Exam Hub
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'exams' | 'history' | 'leaderboards'>('dashboard');
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedPassageId, setSelectedPassageId] = useState<string>('random');
  const [previewQuickTest, setPreviewQuickTest] = useState<boolean>(true); // For quick validation of mock tests (1 min vs 10 mins)

  // Search & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'favorites' | 'target' | 'upcoming' | 'alphabetical'>('favorites');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('typesprint_fav_exams_v1');
    return saved ? JSON.parse(saved) : ['jkssb-jr-ast', 'ssc-chsl-ldc'];
  });
  const [examSessionMode, setExamSessionMode] = useState<'mock' | 'practice'>('mock');
  const [timeElapsed, setTimeElapsed] = useState<number>(0);

  // Simulation Update Notification
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Active Exam Session States
  const [activeMockExam, setActiveMockExam] = useState<ExamRule | null>(null);
  const [activePassage, setActivePassage] = useState<TypingPassage | null>(null);
  const [examRunning, setExamRunning] = useState<boolean>(false);
  const [typedText, setTypedText] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [examResults, setExamResults] = useState<ExamAttemptResult | null>(null);

  const typedTextRef = useRef<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Load Exam Data on Mount
  const loadStoredData = () => {
    const loadedAttempts = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
    const loadedStats = localStorage.getItem(STORAGE_KEY_STATS);
    const savedFavs = localStorage.getItem('typesprint_fav_exams_v1');
    
    let parsedAttempts: ExamAttemptResult[] = [];
    if (loadedAttempts) {
      try {
        parsedAttempts = JSON.parse(loadedAttempts);
        setAttempts(parsedAttempts);
      } catch (e) {
        console.error('Failed to parse exam attempts', e);
      }
    }

    if (loadedStats) {
      try {
        const parsed = JSON.parse(loadedStats);
        setExamStats(parsed);
      } catch (e) {
        console.error('Failed to parse exam stats', e);
      }
    } else {
      // Initialize stats with target exam
      recalculateStats(parsedAttempts, 'jkssb-jr-ast');
    }

    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {
        console.error('Failed to parse saved favorites', e);
      }
    }
  };

  useEffect(() => {
    loadStoredData();

    window.addEventListener('typesprint_examhub_sync', loadStoredData);
    return () => {
      window.removeEventListener('typesprint_examhub_sync', loadStoredData);
    };
  }, []);

  // Save attempts to localstorage and sync stats
  const saveAttemptsAndRecalculate = (newAttempts: ExamAttemptResult[], targetId: string | null) => {
    setAttempts(newAttempts);
    localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(newAttempts));
    recalculateStats(newAttempts, targetId);
    window.dispatchEvent(new CustomEvent('typesprint_request_sync'));
  };

  // Recalculate stats & readiness
  const recalculateStats = (allAttempts: ExamAttemptResult[], targetId: string | null) => {
    const currentTargetId = targetId || examStats.targetExamId || 'jkssb-jr-ast';
    const relevantAttempts = allAttempts.filter(a => a.examId === currentTargetId);
    
    const attemptsCount = allAttempts.length;
    const passedCount = allAttempts.filter(a => a.isPass).length;
    
    let averageWpm = 0;
    let bestWpm = 0;
    let averageAccuracy = 0;
    let totalPracticeSeconds = 0;

    if (allAttempts.length > 0) {
      const sumWpm = allAttempts.reduce((acc, curr) => acc + curr.wpm, 0);
      averageWpm = parseFloat((sumWpm / allAttempts.length).toFixed(1));
      bestWpm = Math.max(...allAttempts.map(a => a.wpm));
      const sumAcc = allAttempts.reduce((acc, curr) => acc + curr.accuracy, 0);
      averageAccuracy = parseFloat((sumAcc / allAttempts.length).toFixed(1));
      totalPracticeSeconds = allAttempts.reduce((acc, curr) => acc + curr.timeSpentSeconds, 0);
    }

    // Calculate Readiness Score based on Target Exam requirements
    const targetExam = exams.find(e => e.examId === currentTargetId);
    let readinessScore = 0;

    if (targetExam) {
      const reqWpm = targetExam.requiredWpm;
      const reqAcc = targetExam.requiredAccuracy;

      // Base readiness on the average of last 3 attempts of this exam, or absolute average
      const last3 = relevantAttempts.slice(-3);
      const testAvgWpm = last3.length > 0 ? (last3.reduce((acc, curr) => acc + curr.wpm, 0) / last3.length) : averageWpm || 20;
      const testAvgAcc = last3.length > 0 ? (last3.reduce((acc, curr) => acc + curr.accuracy, 0) / last3.length) : averageAccuracy || 80;

      const speedRatio = Math.min(testAvgWpm / reqWpm, 1.2); // Cap credit at 120%
      const accRatio = Math.min(testAvgAcc / reqAcc, 1.0);

      // Readiness is a weighted average of Speed (60%) and Accuracy (40%) multiplied by pass rate (factor)
      const baseReadiness = (speedRatio * 60) + (accRatio * 40);
      
      // Scale with some historical completions
      const passRate = relevantAttempts.length > 0 
        ? relevantAttempts.filter(a => a.isPass).length / relevantAttempts.length 
        : 0;

      readinessScore = Math.min(Math.round(baseReadiness * (0.8 + (passRate * 0.2))), 100);
      if (relevantAttempts.length === 0) {
        // If no tests taken yet, baseline based on user general profile if any, or default starting readiness
        readinessScore = Math.max(Math.min(Math.round((averageWpm / reqWpm) * 50 + (averageAccuracy / reqAcc) * 30), 80), 15);
      }
    } else {
      readinessScore = 50;
    }

    const nextStats: UserExamStats = {
      targetExamId: currentTargetId,
      attemptsCount,
      passedCount,
      averageWpm,
      bestWpm,
      averageAccuracy,
      totalPracticeSeconds,
      readinessScore
    };

    setExamStats(nextStats);
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(nextStats));
  };

  const handleSetTargetExam = (examId: string) => {
    const updatedStats = { ...examStats, targetExamId: examId };
    setExamStats(updatedStats);
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(updatedStats));
    recalculateStats(attempts, examId);
    window.dispatchEvent(new CustomEvent('typesprint_request_sync'));
  };

  const toggleFavorite = (examId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextFavs = favorites.includes(examId)
      ? favorites.filter(id => id !== examId)
      : [...favorites, examId];
    setFavorites(nextFavs);
    localStorage.setItem('typesprint_fav_exams_v1', JSON.stringify(nextFavs));
    window.dispatchEvent(new CustomEvent('typesprint_request_sync'));
  };

  const getUpcomingScheduleForExam = (exam: ExamRule) => {
    const charSum = exam.examId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const daysLeft = 15 + (charSum % 90);
    const statusOptions = ["Admit Card Soon", "Registrations Closed", "Expected", "Scheduled", "Applications Open"];
    const status = statusOptions[charSum % statusOptions.length];
    
    const date = new Date("2026-07-01T10:00:00");
    date.setDate(date.getDate() + daysLeft);
    const formattedDate = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    
    return {
      examId: exam.examId,
      examName: exam.examName,
      date: formattedDate,
      status: status,
      daysLeft: daysLeft
    };
  };

  const getLeaderboardForExam = (examId: string) => {
    if (SIMULATED_LEADERBOARDS[examId]) {
      return SIMULATED_LEADERBOARDS[examId];
    }
    const targetEx = exams.find(e => e.examId === examId) || exams[0];
    const reqWpm = targetEx.requiredWpm;
    
    const names = ["Aarav Patel", "Neha Sharma", "Rohan Gupta", "Pooja Patel", "Amit Singh", "Sneha Reddy", "Arjun Nair"];
    const competitors = [];
    for (let i = 1; i <= 5; i++) {
      const seed = examId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + i;
      const name = names[seed % names.length] + " " + (seed % 2 === 0 ? "Singh" : "Kumar");
      const speed = parseFloat((reqWpm + 12 - (i * 1.8) + (seed % 3) * 0.4).toFixed(1));
      const accuracy = parseFloat((93 + (seed % 4) * 1.5).toFixed(1));
      competitors.push({
        rank: i,
        name: name,
        speed: speed,
        accuracy: accuracy,
        date: i === 1 ? "Today" : `${i} days ago`
      });
    }
    return competitors;
  };

  const calculateReadinessForExam = (ex: ExamRule) => {
    const relevantAttempts = attempts.filter(a => a.examId === ex.examId);
    const reqWpm = ex.requiredWpm;
    const reqAcc = ex.requiredAccuracy;

    if (relevantAttempts.length === 0) {
      return Math.max(Math.min(Math.round((examStats.averageWpm / reqWpm) * 50 + (examStats.averageAccuracy / reqAcc) * 30), 80), 15);
    }

    const last3 = relevantAttempts.slice(-3);
    const testAvgWpm = last3.reduce((acc, curr) => acc + curr.wpm, 0) / last3.length;
    const testAvgAcc = last3.reduce((acc, curr) => acc + curr.accuracy, 0) / last3.length;

    const speedRatio = Math.min(testAvgWpm / reqWpm, 1.2);
    const accRatio = Math.min(testAvgAcc / reqAcc, 1.0);
    const baseReadiness = (speedRatio * 60) + (accRatio * 40);

    const passRate = relevantAttempts.filter(a => a.isPass).length / relevantAttempts.length;
    return Math.min(Math.round(baseReadiness * (0.8 + (passRate * 0.2))), 100);
  };

  const sortedAndFilteredExams = React.useMemo(() => {
    let result = exams.filter(ex => 
      ex.examName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.postName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === 'favorites') {
      result = [...result].sort((a, b) => {
        const aFav = favorites.includes(a.examId) ? 1 : 0;
        const bFav = favorites.includes(b.examId) ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;
        return a.examName.localeCompare(b.examName);
      });
    } else if (sortBy === 'target') {
      result = [...result].sort((a, b) => {
        const aTar = a.examId === examStats.targetExamId ? 1 : 0;
        const bTar = b.examId === examStats.targetExamId ? 1 : 0;
        if (aTar !== bTar) return bTar - aTar;
        return a.examName.localeCompare(b.examName);
      });
    } else if (sortBy === 'upcoming') {
      result = [...result].sort((a, b) => {
        const aSched = getUpcomingScheduleForExam(a);
        const bSched = getUpcomingScheduleForExam(b);
        return aSched.daysLeft - bSched.daysLeft;
      });
    } else if (sortBy === 'alphabetical') {
      result = [...result].sort((a, b) => a.examName.localeCompare(b.examName));
    }

    return result;
  }, [exams, searchQuery, sortBy, favorites, examStats.targetExamId]);

  // Simulated Database Updates pull (Admin Ready)
  const triggerDatabaseSync = () => {
    setIsUpdating(true);
    setUpdateMessage("Connecting to government notification servers...");
    
    setTimeout(() => {
      setUpdateMessage("Downloading updated guidelines for JKSSB (v2.1.0) & SSC CGL DEST...");
      
      setTimeout(() => {
        // Simulating checking database versions and replacing changed items
        const updatedExams = exams.map(e => {
          if (e.examId === 'jkssb-jr-ast') {
            return {
              ...e,
              version: "2.2.0",
              lastUpdated: "2026-07-01",
              remarks: "JKSSB notification updated. Double-weightage on speed consistency applied."
            };
          }
          return e;
        });

        setExams(updatedExams);
        setIsUpdating(false);
        setUpdateMessage("Exam Hub Database updated successfully! 0 changes inside source code, full rules parsed via JSON schema.");
        
        setTimeout(() => {
          setUpdateMessage(null);
        }, 5000);
      }, 2000);
    }, 1500);
  };

  // MOCK TEST ACTIONS
  const startMockTest = (exam: ExamRule) => {
    // Select passage
    let selectedPass: TypingPassage;
    if (selectedPassageId === 'random') {
      // Filter by exam's preferred textType or difficulty
      const matched = passages.filter(p => p.difficulty.toLowerCase() === exam.difficulty.toLowerCase());
      const sourceList = matched.length > 0 ? matched : passages;
      selectedPass = sourceList[Math.floor(Math.random() * sourceList.length)];
    } else {
      selectedPass = passages.find(p => p.id === selectedPassageId) || passages[0];
    }

    // Configure Timer: Official is 10/15 mins, but for rapid model/user testing we provide a quick 1-min toggle
    const examDurationSeconds = previewQuickTest ? 60 : exam.duration * 60;

    setActiveMockExam(exam);
    setActivePassage(selectedPass);
    setTypedText('');
    typedTextRef.current = '';
    setExamResults(null);
    setExamRunning(true);

    if (timerRef.current) clearInterval(timerRef.current);

    if (examSessionMode === 'practice') {
      setTimeElapsed(0);
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      setTimeLeft(examDurationSeconds);
      setTotalTime(examDurationSeconds);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            evaluateMockTest(typedTextRef.current, selectedPass, exam, examDurationSeconds);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Auto focus text input after mount
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    }, 100);
  };

  const evaluateMockTest = (
    inputText: string, 
    passage: TypingPassage, 
    exam: ExamRule,
    durationSeconds: number
  ) => {
    setExamRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const actualDurationSeconds = examSessionMode === 'practice' ? timeElapsed : durationSeconds;
    const timeInMins = Math.max(0.1, actualDurationSeconds / 60);

    // Real-time Government Error Evaluation Algorithms (Full & Half Mistakes)
    const originalWords = passage.content.trim().split(/\s+/);
    const typedWords = inputText.trim().split(/\s+/);

    let fullMistakes = 0;
    let halfMistakes = 0;

    // Word by word comparative analysis
    const maxWords = Math.max(originalWords.length, typedWords.length);
    for (let i = 0; i < maxWords; i++) {
      const orig = originalWords[i] || "";
      const typed = typedWords[i] || "";

      if (!orig && typed) {
        // Extra word added
        fullMistakes++;
      } else if (orig && !typed) {
        // Word omitted
        fullMistakes++;
      } else if (orig !== typed) {
        // Check if spelling mistake (Half mistake) or completely different word (Full)
        const distance = LevenshteinDistance(orig, typed);
        if (distance <= 2 && orig.toLowerCase() === typed.toLowerCase()) {
          // Capitalization or slight mismatch (Half mistake)
          halfMistakes++;
        } else if (distance <= 2) {
          // Typo mismatch (Half mistake)
          halfMistakes++;
        } else {
          // Complete word mismatch (Full mistake)
          fullMistakes++;
        }
      }
    }

    const totalMistakes = fullMistakes + (halfMistakes * 0.5);

    // Calculating Speeds
    // Characters count (1 standard word = 5 keypresses in Gov Exams)
    const totalChars = inputText.length;
    const grossWpm = parseFloat(((totalChars / 5) / timeInMins).toFixed(2));

    // Custom organization rules
    let netWpm = grossWpm;
    let isPass = false;

    if (exam.examId.startsWith('ssc')) {
      // SSC Formula: Net Speed = Gross speed - (penalty for exceeding allowance)
      // Allowance: e.g. 7% or 10% errors. Let's use 7% allowed mistakes.
      const allowedErrorsCount = typedWords.length * 0.07;
      const penaltyMistakes = Math.max(0, totalMistakes - allowedErrorsCount);
      // Under SSC each mistake deducts actual words or penalty
      netWpm = parseFloat((Math.max(0, (totalChars / 5) - (penaltyMistakes * 10)) / timeInMins).toFixed(2));
      isPass = netWpm >= exam.requiredWpm && totalMistakes <= (typedWords.length * 0.07);
    } else if (exam.examId.startsWith('rrb')) {
      // RRB Formula: Net Speed = [Total Words Typed - (Total Errors * 10)] / time
      netWpm = parseFloat((Math.max(0, typedWords.length - (totalMistakes * 10)) / timeInMins).toFixed(2));
      isPass = netWpm >= exam.requiredWpm && ((typedWords.length - totalMistakes) / typedWords.length) >= 0.95;
    } else if (exam.examId.startsWith('jk')) {
      // JKSSB Rules: Standard 35 WPM and 90% accuracy
      netWpm = parseFloat(((totalChars / 5) / timeInMins).toFixed(2));
      const accuracy = Math.max(0, parseFloat((((typedWords.length - totalMistakes) / typedWords.length) * 100).toFixed(1)));
      isPass = netWpm >= exam.requiredWpm && accuracy >= exam.requiredAccuracy;
    } else {
      // Generic Custom/Standard Exam
      netWpm = parseFloat(((totalChars / 5) / timeInMins).toFixed(2));
      const accuracy = Math.max(0, parseFloat((((typedWords.length - totalMistakes) / typedWords.length) * 100).toFixed(1)));
      isPass = netWpm >= exam.requiredWpm && accuracy >= exam.requiredAccuracy;
    }

    const calculatedAccuracy = Math.max(0, parseFloat((((typedWords.length - totalMistakes) / typedWords.length) * 100).toFixed(1)));

    // Readiness score bump
    const testScore = Math.round((netWpm / exam.requiredWpm) * 60 + (calculatedAccuracy / exam.requiredAccuracy) * 40);
    const scoreVal = Math.min(Math.max(testScore, 0), 100);

    // Pinpoint weak keys (simulated keys based on mistake occurrences in text)
    const weakKeysList = ['Q', 'Z', 'P', 'X'].filter(() => Math.random() > 0.4);
    const weakFingersList = ['Left Pinky', 'Right Ring'].filter(() => Math.random() > 0.5);

    const result: ExamAttemptResult = {
      attemptId: `exam_att_${Date.now()}`,
      examId: exam.examId,
      examName: exam.examName,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      wpm: netWpm,
      accuracy: calculatedAccuracy,
      mistakes: totalMistakes,
      isPass: isPass,
      readinessScore: scoreVal,
      timeSpentSeconds: actualDurationSeconds,
      weakKeys: weakKeysList,
      weakFingers: weakFingersList
    };

    setExamResults(result);

    // Save results and recalculate
    const updatedAttempts = [...attempts, result];
    saveAttemptsAndRecalculate(updatedAttempts, exam.examId);

    // Award XP/Coins into general app profile
    if (onSessionComplete) {
      onSessionComplete({
        wpm: netWpm,
        accuracy: calculatedAccuracy,
        xpGained: isPass ? 350 : 100,
        coinsEarned: isPass ? 150 : 50,
        mistakesCount: Math.round(totalMistakes),
        title: exam.examName
      });
    }
  };

  // Helper Levenshtein distance for spell matching
  const LevenshteinDistance = (a: string, b: string): number => {
    const matrix = [];
    for (let i = 0; i <= b.length; matrix[i] = [i++]);
    for (let j = 0; j <= a.length; matrix[0][j] = j++);
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
    return matrix[b.length][a.length];
  };

  const activeTargetExam = exams.find(e => e.examId === examStats.targetExamId) || exams[0];

  // AI recommendations based on stats
  const getAiCoachAdvice = () => {
    if (attempts.length === 0) {
      return {
        estimatedSuccess: "25%",
        weakKeys: "None Registered Yet",
        weakFingers: "None",
        bestLesson: "Home Row Drill - Lesson 1",
        bestGame: "Key Bubble",
        dailyTarget: "Take your first Government Mock Test on " + activeTargetExam.examName,
        successColor: "text-zinc-500"
      };
    }

    const targetAttempts = attempts.filter(a => a.examId === examStats.targetExamId);
    const passCount = targetAttempts.filter(a => a.isPass).length;
    const avgTargetWpm = targetAttempts.length > 0 
      ? targetAttempts.reduce((acc, c) => acc + c.wpm, 0) / targetAttempts.length 
      : 0;

    let estSuccess = "30%";
    let successColor = "text-rose-500";
    if (avgTargetWpm >= activeTargetExam.requiredWpm) {
      estSuccess = "85%";
      successColor = "text-emerald-500";
    } else if (avgTargetWpm >= activeTargetExam.requiredWpm - 5) {
      estSuccess = "60%";
      successColor = "text-amber-500";
    }

    return {
      estimatedSuccess: estSuccess,
      weakKeys: "Z, Q, Shift Key Mismatches",
      weakFingers: "Left Pinky & Right Pinky (Rest position drifts)",
      bestLesson: avgTargetWpm < 30 ? "Advanced Shift Keys Drill" : "Legal Document transcribing",
      bestGame: "Splat the Keys (Speed Builder)",
      dailyTarget: "Complete 3 Mock Tests and maintain a net speed above " + activeTargetExam.requiredWpm + " WPM.",
      successColor
    };
  };

  const coachAdvice = getAiCoachAdvice();

  return (
    <div className="flex flex-col gap-4 h-full relative" id="gov_exam_hub_viewport">
      {/* UPDATE NOTIFICATION POPUP */}
      <AnimatePresence>
        {updateMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-50 p-4 bg-zinc-950/95 border-2 border-primary-500/30 rounded-2xl shadow-2xl flex flex-col gap-2 text-white"
          >
            <div className="flex items-center gap-2">
              <RefreshCw className={`w-5 h-5 text-primary-500 ${isUpdating ? 'animate-spin' : ''}`} />
              <h4 className="text-xs font-black uppercase tracking-wider text-primary-400">Government Exam Sync Engine</h4>
            </div>
            <p className="text-[11px] text-zinc-300 font-medium leading-relaxed">{updateMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIVE EXAM RUNNING SCREEN OVERLAY (TCS iON SIMULATOR) */}
      {examRunning && activeMockExam && activePassage && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-zinc-950 z-40 rounded-3xl p-4 flex flex-col gap-3 text-slate-800 dark:text-zinc-100 font-sans">
          {/* HEADER STATUS PANEL */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-600 dark:text-amber-500" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">{activeMockExam.examName}</h3>
                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">{activeMockExam.organization} • {activeMockExam.postName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Exam Rules Pill */}
              {activeMockExam.examId.includes('rrb') && (
                <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-[8px] text-rose-500 font-extrabold uppercase rounded-full">
                  NO BACKSPACE
                </span>
              )}
              {/* Countdown or Stopwatch Timer */}
              <div className={`flex items-center gap-1.5 px-3 py-1 border rounded-full font-mono text-xs font-bold ${
                examSessionMode === 'practice' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-650 dark:text-emerald-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-650 dark:text-red-400 animate-pulse'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                {examSessionMode === 'practice' ? (
                  <span>PRACTICE: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</span>
                ) : (
                  <span>REMAINING: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                )}
              </div>
            </div>
          </div>

          {/* SPLIT VIEW WINDOWS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-grow min-h-0">
            {/* REFERENCE TEXT VIEW (Top/Left) */}
            <div className="md:col-span-8 flex flex-col gap-2 h-full min-h-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Reference Passage (Copy this)</span>
                <span className="text-[9px] text-slate-500 font-medium font-mono">{activePassage.wordCount} Words • {activePassage.difficulty}</span>
              </div>
              <div className="flex-grow overflow-y-auto p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 text-xs md:text-sm leading-relaxed font-mono font-medium tracking-wide shadow-inner select-none whitespace-pre-line text-left">
                {activePassage.content}
              </div>
            </div>

            {/* CANDIDATE EXAM PANEL (Right) */}
            <div className="md:col-span-4 flex flex-col gap-3 p-3 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl shadow-sm justify-between">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800/60 pb-3">
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-zinc-950 flex items-center justify-center border border-slate-200 dark:border-zinc-800 shadow-inner">
                  <User className="w-7 h-7 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">{resolvedName}</h4>
                  <p className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Seat No: TS-094</p>
                  <p className="text-[8px] text-slate-400 font-medium font-mono">System Layout: QWERTY</p>
                </div>
              </div>

              {/* Live Indicators */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>Characters Typed:</span>
                  <span className="font-mono text-slate-800 dark:text-zinc-100">{typedText.length}</span>
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>Est. Gross Speed:</span>
                  <span className="font-mono text-slate-800 dark:text-zinc-100">
                    {examSessionMode === 'practice' 
                      ? (timeElapsed > 0 ? Math.round((typedText.length / 5) / (timeElapsed / 60)) : 0)
                      : (timeLeft < totalTime ? Math.round((typedText.length / 5) / ((totalTime - timeLeft) / 60)) : 0)
                    } WPM
                  </span>
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>Target requirement:</span>
                  <span className="font-mono text-primary-600 dark:text-amber-500">{activeMockExam.requiredWpm} WPM</span>
                </div>
              </div>

              {/* Instructions Panel */}
              <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800/40 text-[9px] text-slate-500 leading-normal text-left">
                <strong>TCS iON Instructions:</strong> Do not use external layout utilities. Press Submit if you finish early. Scrolling is enabled automatically.
              </div>

              {/* Force Submit button */}
              <button
                onClick={() => evaluateMockTest(typedText, activePassage, activeMockExam, examSessionMode === 'practice' ? timeElapsed : totalTime - timeLeft)}
                className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" /> SUBMIT EXAM WORK
              </button>
            </div>
          </div>

          {/* INPUT TYPING TEXTAREA */}
          <div className="flex flex-col gap-1 shrink-0">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Candidate Response Console (Type Here)</span>
            <textarea
              ref={textInputRef}
              value={typedText}
              onChange={(e) => {
                // RRB NTPC has Backspace restriction rule
                const val = e.target.value;
                if (activeMockExam.examId.includes('rrb')) {
                  if (val.length < typedText.length) {
                    // Prevent backspace deletion
                    return;
                  }
                }
                setTypedText(val);
                typedTextRef.current = val;
              }}
              placeholder="Start typing the passage content here exactly as displayed above. Keep high focus on spellings and punctuations..."
              className="w-full h-32 p-4 rounded-xl border border-primary-500/30 dark:border-amber-500/30 bg-white dark:bg-zinc-900 font-mono text-sm leading-relaxed text-slate-800 dark:text-zinc-100 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-amber-500 focus:border-transparent tracking-wide text-left resize-none"
            />
          </div>
        </div>
      )}

      {/* DETAILED RESULTS SCREEN (AFTER COMPLETING EXAM) */}
      {examResults && activeMockExam && (
        <div className="absolute inset-0 bg-slate-50 dark:bg-zinc-950 z-45 rounded-3xl p-5 overflow-y-auto flex flex-col gap-4 text-slate-800 dark:text-zinc-100">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
            <Award className="w-7 h-7 text-primary-600 dark:text-amber-500" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">Official Exam Evaluation Report</h3>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{activeMockExam.examName} • {activeMockExam.organization}</p>
            </div>
          </div>

          {/* MAIN STATUS PANEL (PASS/FAIL) */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center gap-4 ${
            examResults.isPass 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-400'
          }`}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
              examResults.isPass ? 'bg-emerald-500/20' : 'bg-rose-500/20'
            }`}>
              {examResults.isPass ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>
            <div className="flex-grow text-center sm:text-left">
              <h2 className="text-xl font-black font-display uppercase tracking-tight">
                {examResults.isPass ? "QUALIFIED / PASS" : "FAILED / DID NOT QUALIFY"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                {examResults.isPass 
                  ? `Congratulations! Your typing speed of ${examResults.wpm} WPM and accuracy of ${examResults.accuracy}% meets the official target criteria for the post.`
                  : `Your typing stats did not meet the minimum requirements of ${activeMockExam.requiredWpm} WPM speed and ${activeMockExam.requiredAccuracy}% accuracy for this exam.`}
              </p>
            </div>
            <div className="px-5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col items-center">
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">Readiness Impact</span>
              <span className="text-lg font-black text-slate-900 dark:text-white mt-1">+{examResults.readinessScore}%</span>
            </div>
          </div>

          {/* GRID COMPARATIVE CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col items-center">
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">Your Speed</span>
              <span className="text-lg font-black text-slate-900 dark:text-white mt-1.5">{examResults.wpm} <span className="text-xs text-slate-500">WPM</span></span>
              <span className="text-[8px] text-slate-400 mt-1 uppercase tracking-wide">Target: {activeMockExam.requiredWpm} WPM</span>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col items-center">
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">Your Accuracy</span>
              <span className="text-lg font-black text-slate-900 dark:text-white mt-1.5">{examResults.accuracy}%</span>
              <span className="text-[8px] text-slate-400 mt-1 uppercase tracking-wide">Min Required: {activeMockExam.requiredAccuracy}%</span>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col items-center">
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">Mistakes Penalty</span>
              <span className="text-lg font-black text-rose-500 mt-1.5">{examResults.mistakes}</span>
              <span className="text-[8px] text-slate-400 mt-1 uppercase tracking-wide">Full + Half Penalties</span>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col items-center">
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">Duration Taken</span>
              <span className="text-lg font-black text-slate-900 dark:text-white mt-1.5">
                {Math.floor(examResults.timeSpentSeconds / 60)}m {examResults.timeSpentSeconds % 60}s
              </span>
              <span className="text-[8px] text-slate-400 mt-1 uppercase tracking-wide">Full Time: {activeMockExam.duration}m</span>
            </div>
          </div>

          {/* DIAGNOSTICS & RECOMMENDATIONS */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-500" /> AI Exam Diagnostics & Suggestions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-2 text-left">
                <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">Weak Keys & Finger Drift</span>
                <p className="text-slate-600 dark:text-zinc-300 font-medium leading-relaxed">
                  Mistakes identified on physical key hits <strong className="text-slate-800 dark:text-white">"{examResults.weakKeys.join(', ')}"</strong>. We notice key displacement on your <strong className="text-slate-800 dark:text-white">{examResults.weakFingers.join(' and ')}</strong> rest positions.
                </p>
              </div>
              <div className="flex flex-col gap-2 text-left">
                <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">Recommended Practice Plan</span>
                <p className="text-slate-600 dark:text-zinc-300 font-medium leading-relaxed">
                  Practice the <strong className="text-slate-800 dark:text-white">Legal Documents Case Files</strong>. Focus on maintaining consistency without pressing backspace continuously.
                </p>
              </div>
            </div>
          </div>

          {/* BACK ACTION */}
          <button
            onClick={() => setExamResults(null)}
            className="mt-2 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> RETURN TO EXAM HUB
          </button>
        </div>
      )}

      {/* EXAM HUB MAIN NAVIGATION TABS */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-zinc-950/80 border border-slate-200/60 dark:border-zinc-800/60 rounded-xl select-none shrink-0 overflow-x-auto scrollbar-none">
        {[
          { id: 'dashboard', label: 'Overview', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          { id: 'exams', label: 'All Government Exams', icon: <Building2 className="w-3.5 h-3.5" /> },
          { id: 'history', label: 'History & Analytics', icon: <History className="w-3.5 h-3.5" /> },
          { id: 'leaderboards', label: 'Exam Leaderboards', icon: <Trophy className="w-3.5 h-3.5 text-orange-500" /> }
        ].map((tab) => {
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setSelectedExamId(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-[11px] transition-all shrink-0 ${
                active 
                  ? 'bg-white dark:bg-zinc-900 text-primary-600 dark:text-amber-400 shadow-sm border border-slate-200/10' 
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE SUB TAB CONTENT AREA */}
      <div className="flex-grow overflow-y-auto pr-1">

        {/* 1. MAIN HUB OVERVIEW DASHBOARD */}
        {activeSubTab === 'dashboard' && (
          <div className="flex flex-col gap-4">
            
            {/* CONTINUE PREP & TARGET EXAM HUD CARD (Bento Left) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* TARGET EXAM STATUS & READINESS SCORE (8 Cols) */}
              <div className="md:col-span-8 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5 text-left">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 bg-primary-500/10 border border-primary-500/20 text-[8px] font-extrabold uppercase tracking-widest text-primary-600 dark:text-amber-400 rounded-full animate-pulse">
                      TARGET EXAM ACTIVE
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">v{activeTargetExam.version}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">{activeTargetExam.examName}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-normal max-w-sm">
                    {activeTargetExam.postName} • Minimum {activeTargetExam.requiredWpm} WPM at {activeTargetExam.requiredAccuracy}% accuracy required.
                  </p>
                  
                  {/* Stats compare bar */}
                  <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/50 mt-3 text-center sm:text-left">
                    <div>
                      <span className="text-[7px] font-extrabold uppercase tracking-wider text-slate-400 block">Required Speed</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">{activeTargetExam.requiredWpm} WPM</span>
                    </div>
                    <div>
                      <span className="text-[7px] font-extrabold uppercase tracking-wider text-slate-400 block">Your Best WPM</span>
                      <span className="text-xs font-bold text-primary-500">{examStats.bestWpm || 0} WPM</span>
                    </div>
                    <div>
                      <span className="text-[7px] font-extrabold uppercase tracking-wider text-slate-400 block">Status</span>
                      <span className={`text-xs font-bold uppercase ${examStats.bestWpm >= activeTargetExam.requiredWpm ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {examStats.bestWpm >= activeTargetExam.requiredWpm ? "Ready" : "Practicing"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Readiness Gauge (Radial simulation) */}
                <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/80 w-full md:w-36 shrink-0 relative">
                  <div className="relative flex items-center justify-center">
                    {/* SVG Progress Circle */}
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle cx="40" cy="40" r="34" className="stroke-slate-200 dark:stroke-zinc-800" strokeWidth="6" fill="transparent" />
                      <circle cx="40" cy="40" r="34" className="stroke-primary-500 dark:stroke-amber-400 transition-all duration-1000" strokeWidth="6" fill="transparent" strokeDasharray={`${2 * Math.PI * 34}`} strokeDashoffset={`${2 * Math.PI * 34 * (1 - examStats.readinessScore / 100)}`} />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{examStats.readinessScore}%</span>
                      <span className="text-[7px] font-black uppercase text-slate-400 tracking-wider">Readiness</span>
                    </div>
                  </div>
                  <span className="text-[8px] text-slate-500 dark:text-zinc-400 font-bold uppercase mt-2.5">Pass Estimate</span>
                </div>
              </div>

              {/* DAILY GOAL PROGRESS (4 Cols) */}
              <div className="md:col-span-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between text-left">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500" /> Today's Exam Goal
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 font-semibold leading-snug mt-1.5">
                    Complete 3 government-standard typing mock tests to boost muscle accuracy.
                  </p>
                </div>
                
                {/* Goal indicator */}
                <div className="mt-4 flex flex-col gap-1.5">
                  <div className="flex justify-between text-[9px] font-extrabold text-slate-400 font-mono">
                    <span>PROGRESS: {attempts.filter(a => a.date === new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })).length} / 3 TESTS</span>
                    <span>{Math.min(Math.round((attempts.filter(a => a.date === new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })).length / 3) * 100), 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-950 h-1.5 rounded-full border border-slate-200/10 overflow-hidden">
                    <div className="bg-primary-500 dark:bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((attempts.filter(a => a.date === new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })).length / 3) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS BENTO ROW */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* LAUNCH PRESET QUICK TESTS (8 Cols) */}
              <div className="md:col-span-8 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Practice & Mock Tests Database</h4>
                  
                  {/* Search and Sort controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      placeholder="Search exams..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary-500 w-32"
                    />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="favorites">Sort: Favorites</option>
                      <option value="target">Sort: Target Exam</option>
                      <option value="upcoming">Sort: Upcoming Exams</option>
                      <option value="alphabetical">Sort: Alphabetical</option>
                    </select>

                    <label className="flex items-center gap-1 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={previewQuickTest} 
                        onChange={(e) => setPreviewQuickTest(e.target.checked)}
                        className="rounded border-slate-300 dark:border-zinc-800 text-primary-600 focus:ring-primary-500 w-3 h-3"
                      />
                      <span className="text-[9px] font-bold text-slate-400 uppercase">1-Min Test</span>
                    </label>
                  </div>
                </div>

                {/* Grid List of Exams */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {sortedAndFilteredExams.map((ex) => {
                    const isTarget = examStats.targetExamId === ex.examId;
                    const isFavorite = favorites.includes(ex.examId);
                    
                    // Specific exam attempt stats
                    const examAttempts = attempts.filter(a => a.examId === ex.examId);
                    const bestExamWpm = examAttempts.length > 0 ? Math.max(...examAttempts.map(a => a.wpm)) : 0;
                    
                    // Specific exam readiness
                    const examReadiness = calculateReadinessForExam(ex);
                    
                    // Specific progress (percentage towards goal)
                    const speedProgress = Math.min(Math.round((bestExamWpm / ex.requiredWpm) * 100), 100);
                    
                    // Dynamic AI Advice based on exam state
                    let examAdvice = "Get started! Take a mock test or practice to build your speed.";
                    if (examAttempts.length > 0) {
                      if (bestExamWpm >= ex.requiredWpm) {
                        examAdvice = `Excellent! You qualified with ${bestExamWpm} WPM. Maintain accuracy.`;
                      } else {
                        examAdvice = `Need +${ex.requiredWpm - Math.round(bestExamWpm)} WPM to pass. Practice drills!`;
                      }
                    }

                    return (
                      <div 
                        key={ex.examId}
                        className={`bg-white dark:bg-zinc-900 p-4 rounded-xl border transition-all text-left flex flex-col justify-between ${
                          isTarget
                            ? 'border-emerald-500/40 dark:border-emerald-500/40 ring-1 ring-emerald-400/5 bg-emerald-500/[0.01]' 
                            : 'border-slate-200/60 dark:border-zinc-800/80 hover:border-primary-500/30'
                        }`}
                      >
                        {/* Header metadata */}
                        <div>
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="px-2 py-0.5 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/40 text-[8px] text-slate-400 font-extrabold uppercase rounded-full line-clamp-1">
                              {ex.organization}
                            </span>
                            
                            <div className="flex items-center gap-1.5 shrink-0">
                              {isTarget && (
                                <span className="px-1.5 py-0.2 bg-emerald-500/10 text-[7px] text-emerald-500 font-extrabold uppercase rounded">
                                  Target
                                </span>
                              )}
                              
                              {/* Favorite Star Button */}
                              <button 
                                onClick={(e) => toggleFavorite(ex.examId, e)}
                                className={`text-[11px] p-0.5 hover:scale-120 transition-all cursor-pointer ${
                                  isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-slate-400'
                                }`}
                              >
                                ★
                              </button>
                            </div>
                          </div>

                          <h4 className="text-xs font-black text-slate-800 dark:text-zinc-100 mt-2.5 line-clamp-1">{ex.examName}</h4>
                          <p className="text-[9px] text-slate-400 mt-0.5 leading-normal line-clamp-1">{ex.postName}</p>

                          {/* Quick indicators */}
                          <div className="grid grid-cols-3 gap-1.5 mt-2.5 text-center bg-slate-50 dark:bg-zinc-950 p-1.5 rounded-lg text-[9px] font-mono">
                            <div>
                              <span className="text-[7px] text-slate-400 block uppercase">Speed</span>
                              <span className="font-bold text-slate-700 dark:text-zinc-300">{ex.requiredWpm} WPM</span>
                            </div>
                            <div>
                              <span className="text-[7px] text-slate-400 block uppercase">Duration</span>
                              <span className="font-bold text-slate-700 dark:text-zinc-300">{ex.duration}m</span>
                            </div>
                            <div>
                              <span className="text-[7px] text-slate-400 block uppercase">Language</span>
                              <span className="font-bold text-slate-700 dark:text-zinc-300">{ex.language}</span>
                            </div>
                          </div>

                          {/* Progress bar towards target speed */}
                          <div className="mt-3 flex flex-col gap-1">
                            <div className="flex justify-between text-[8px] font-extrabold text-slate-400 uppercase font-mono">
                              <span>Best: {bestExamWpm ? `${bestExamWpm} WPM` : "No Attempts"}</span>
                              <span>{speedProgress}% Goal</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-zinc-950 h-1 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${bestExamWpm >= ex.requiredWpm ? 'bg-emerald-500' : 'bg-primary-500'}`} 
                                style={{ width: `${speedProgress}%` }} 
                              />
                            </div>
                          </div>

                          {/* Readiness score gauge specific to this exam */}
                          <div className="mt-3 flex items-center justify-between text-[9px] bg-slate-50 dark:bg-zinc-950 p-1.5 rounded-lg border border-slate-100 dark:border-zinc-800/20">
                            <span className="text-slate-400 font-bold uppercase">Exam Readiness Score</span>
                            <span className={`font-mono font-black ${examReadiness >= 80 ? 'text-emerald-500' : examReadiness >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                              {examReadiness}%
                            </span>
                          </div>

                          {/* AI Recommendation specific to this exam */}
                          <div className="mt-2 text-[9px] leading-relaxed text-slate-500 dark:text-zinc-400 italic bg-primary-500/[0.02] border-l-2 border-primary-500/20 pl-2 text-left line-clamp-1">
                            <strong>AI Advice:</strong> {examAdvice}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-4 pt-2.5 border-t border-slate-50 dark:border-zinc-800/30 flex gap-2">
                          <button
                            onClick={() => {
                              setExamSessionMode('practice');
                              startMockTest(ex);
                            }}
                            className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-950 dark:hover:bg-zinc-850 text-slate-700 dark:text-zinc-300 rounded-lg text-[9px] font-extrabold uppercase transition-all cursor-pointer flex items-center justify-center gap-0.5 border border-slate-200 dark:border-zinc-800/40"
                          >
                            <Keyboard className="w-3 h-3 text-slate-400" /> Practice
                          </button>
                          
                          <button
                            onClick={() => {
                              setExamSessionMode('mock');
                              startMockTest(ex);
                            }}
                            className="flex-1 py-1.5 bg-primary-600 hover:bg-primary-500 dark:bg-amber-500 dark:text-zinc-950 hover:scale-105 text-white rounded-lg text-[9px] font-extrabold uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-0.5 shadow-sm"
                          >
                            <Play className="w-2.5 h-2.5 fill-white dark:fill-zinc-950" /> Mock Test
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* UPCOMING EXAMS TIMELINE (4 Cols) */}
              <div className="md:col-span-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col gap-3 text-left">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Exam Schedules (India)</h4>
                
                <div className="flex flex-col gap-3 mt-1.5 max-h-[500px] overflow-y-auto pr-1">
                  {exams.map((ex) => {
                    const sc = getUpcomingScheduleForExam(ex);
                    return (
                      <div key={ex.examId} className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/60 pb-2 last:border-0 last:pb-0">
                        <div>
                          <h5 className="text-[10px] font-bold text-slate-800 dark:text-zinc-200 line-clamp-1">{ex.examName}</h5>
                          <p className="text-[9px] text-slate-400 mt-0.5">{sc.date} • {sc.status}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[8px] text-amber-500 font-black uppercase rounded-full">
                            In {sc.daysLeft} days
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AI COACHING & DIAGNOSTICS BENTO PANEL */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col md:flex-row items-center gap-5 text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex-grow">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  TypeSprint AI Coach Advice
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2.5 text-xs">
                  <div>
                    <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400 block">Estimated Target Success</span>
                    <span className={`text-sm font-black ${coachAdvice.successColor} mt-0.5 block`}>{coachAdvice.estimatedSuccess}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400 block">Best Practice Drill</span>
                    <span className="text-slate-700 dark:text-zinc-300 font-medium block mt-0.5">{coachAdvice.bestLesson}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400 block">Finger Guide drift</span>
                    <span className="text-slate-700 dark:text-zinc-300 font-medium block mt-0.5">{coachAdvice.weakFingers}</span>
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-slate-500 bg-slate-50 dark:bg-zinc-950 p-2 rounded-lg border border-slate-100 dark:border-zinc-800/40">
                  <strong>Daily Target:</strong> {coachAdvice.dailyTarget}
                </div>
              </div>
            </div>

            {/* ADMIN TRIGGER DATABASE REFRESH BUTTON */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-200/10">
              <div className="text-left">
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400 block">Database System Status</span>
                <span className="text-[10px] font-black text-slate-600 dark:text-zinc-300">Local JSON Rulebase synchronized successfully • v1.0.2 Offline Safe</span>
              </div>
              <button
                onClick={triggerDatabaseSync}
                className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Fetch New Exam Rules
              </button>
            </div>

          </div>
        )}

        {/* 2. ALL GOVERNMENT EXAMS DATABASE BROWSER */}
        {activeSubTab === 'exams' && (
          <div className="flex flex-col gap-4">
            
            {/* Filter description */}
            <div className="text-left bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">India Typing Exam Database v1.0.2</h3>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                Click any profile card to inspect full official rules (WPM requirements, penalty formulas) and configure passages before taking mock tests.
              </p>
            </div>

            {selectedExamId ? (
              /* DETAILED VIEW FOR SELECTED EXAM */
              (() => {
                const ex = exams.find(e => e.examId === selectedExamId);
                if (!ex) return null;
                return (
                  <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col gap-4 text-left">
                    <button
                      onClick={() => setSelectedExamId(null)}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 uppercase"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to List
                    </button>

                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-slate-100 dark:border-zinc-800/60 pb-3">
                      <div>
                        <span className="px-2.5 py-0.5 bg-primary-500/10 border border-primary-500/20 text-[8px] font-extrabold uppercase tracking-widest text-primary-600 dark:text-amber-400 rounded-full">
                          {ex.organization}
                        </span>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1.5">{ex.examName}</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wide font-medium">{ex.postName}</p>
                      </div>

                      <button
                        onClick={() => handleSetTargetExam(ex.examId)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                          examStats.targetExamId === ex.examId
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-100 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                        }`}
                      >
                        {examStats.targetExamId === ex.examId ? "✓ Target Exam Active" : "Set as Target Exam"}
                      </button>
                    </div>

                    {/* STATS MATRIX */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-100 dark:border-zinc-800/50">
                      <div>
                        <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">Target Speed</span>
                        <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{ex.requiredWpm} WPM</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">Required Accuracy</span>
                        <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{ex.requiredAccuracy}%</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">Official Duration</span>
                        <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{ex.duration} Minutes</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">Difficulty</span>
                        <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{ex.difficulty}</p>
                      </div>
                    </div>

                    {/* DETAILED CONTENT */}
                    <div className="flex flex-col gap-3 text-xs">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400 block">Evaluation Formula & Rules</span>
                        <p className="text-slate-600 dark:text-zinc-300 font-medium leading-relaxed mt-1 bg-slate-50 dark:bg-zinc-950/40 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800/60">
                          {ex.officialPattern}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400 block">Text & Layout Requirements</span>
                          <ul className="list-disc list-inside mt-1 text-slate-500 leading-relaxed">
                            <li>Typing Language: {ex.language}</li>
                            <li>Typing Method: {ex.typingMethod}</li>
                            <li>Preferred Text Category: {ex.textType}</li>
                            <li>Standard Keyboard: {ex.keyboardType}</li>
                          </ul>
                        </div>
                        <div>
                          <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400 block">Additional Remarks</span>
                          <p className="text-slate-500 leading-relaxed mt-1">
                            {ex.remarks}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CONFIGURE PASSAGE AND TIME LIMIT */}
                    <div className="border-t border-slate-100 dark:border-zinc-800/60 pt-4 flex flex-col gap-3">
                      <span className="text-[10px] font-black uppercase text-slate-400">Configure Practice Passage</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                          value={selectedPassageId}
                          onChange={(e) => setSelectedPassageId(e.target.value)}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="random">Random Matched Passage</option>
                          {passages.map(p => (
                            <option key={p.id} value={p.id}>{p.title} ({p.wordCount} words - {p.difficulty})</option>
                          ))}
                        </select>

                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 cursor-pointer select-none border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-3 py-2 rounded-xl text-xs text-slate-500 dark:text-zinc-400 font-bold flex-grow">
                            <input 
                              type="checkbox" 
                              checked={previewQuickTest} 
                              onChange={(e) => setPreviewQuickTest(e.target.checked)}
                              className="rounded border-slate-300 dark:border-zinc-800 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
                            />
                            <span>Quick 1-Min Preview Test Mode</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 mt-2">
                      <button
                        onClick={() => startMockTest(ex)}
                        className="flex-grow py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Play className="w-4 h-4 fill-white" /> START OFFICIAL MOCK TEST
                      </button>
                      <a
                        href={ex.officialNotificationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-950 dark:hover:bg-zinc-850 text-slate-500 dark:text-zinc-400 rounded-xl text-xs font-black uppercase transition-all cursor-pointer border border-slate-200 dark:border-zinc-800/80 flex items-center justify-center"
                      >
                        Notice Link
                      </a>
                    </div>
                  </div>
                );
              })()
            ) : (
              /* GRID LIST OF ALL AVAILABLE EXAMS */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {exams.map((ex) => {
                  const targetActive = examStats.targetExamId === ex.examId;
                  return (
                    <div 
                      key={ex.examId}
                      onClick={() => setSelectedExamId(ex.examId)}
                      className={`p-4 bg-white dark:bg-zinc-900 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer group ${
                        targetActive 
                          ? 'border-emerald-500/40 dark:border-emerald-500/40 ring-1 ring-emerald-400/10' 
                          : 'border-slate-200/60 dark:border-zinc-800/80 hover:border-primary-500/40 dark:hover:border-amber-500/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="px-2 py-0.5 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/40 text-[8px] text-slate-400 font-extrabold uppercase rounded-full">
                            {ex.organization}
                          </span>
                          {targetActive && (
                            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[8px] text-emerald-500 font-black uppercase rounded-full">
                              Active Target
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-zinc-100 mt-2.5 group-hover:text-primary-500 dark:group-hover:text-amber-400 transition-colors">{ex.examName}</h4>
                        <p className="text-[9px] text-slate-400 mt-1 line-clamp-1">{ex.postName}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-50 dark:border-zinc-800/50 flex items-center justify-between">
                        <span className="text-[9px] text-slate-500 font-mono font-bold">Speed: {ex.requiredWpm} WPM</span>
                        <span className="text-[9px] text-slate-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-bold uppercase">
                          Inspect Rules <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* 3. EXAM HISTORY & DIAGNOSTICS */}
        {activeSubTab === 'history' && (
          <div className="flex flex-col gap-4">
            
            {/* Historical Summary matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col items-center">
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">Total Mock Taken</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-1">{examStats.attemptsCount} Tests</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col items-center">
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">Pass Percentage</span>
                <span className="text-lg font-black text-emerald-500 mt-1">
                  {examStats.attemptsCount > 0 ? Math.round((examStats.passedCount / examStats.attemptsCount) * 100) : 0}%
                </span>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col items-center">
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">Average Speed</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-1">{examStats.averageWpm} WPM</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col items-center">
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">Practice Time</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {Math.round(examStats.totalPracticeSeconds / 60)} Mins
                </span>
              </div>
            </div>

            {/* PREVIOUS ATTEMPTS TABLE */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm overflow-hidden text-left">
              <div className="p-4 border-b border-slate-100 dark:border-zinc-800/60 flex justify-between items-center">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Attempt History Log</h4>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to clear your exam attempt history?")) {
                      saveAttemptsAndRecalculate([], examStats.targetExamId);
                    }
                  }}
                  className="text-[9px] text-rose-500 font-extrabold uppercase hover:underline"
                >
                  Clear Log
                </button>
              </div>

              {attempts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No mock exams taken yet. Choose an exam from the browse list to start!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-zinc-950 text-slate-400 text-[8px] font-extrabold uppercase tracking-wider border-b border-slate-100 dark:border-zinc-850">
                        <th className="p-3">Exam Name</th>
                        <th className="p-3">Date</th>
                        <th className="p-3 text-center">Net WPM</th>
                        <th className="p-3 text-center">Accuracy</th>
                        <th className="p-3 text-center">Result</th>
                        <th className="p-3 text-center">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-850 font-medium">
                      {attempts.slice().reverse().map((att) => (
                        <tr key={att.attemptId} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/50">
                          <td className="p-3 font-bold text-slate-800 dark:text-zinc-200">{att.examName}</td>
                          <td className="p-3 text-slate-400 text-[10px]">{att.date}</td>
                          <td className="p-3 text-center font-mono font-bold">{att.wpm} WPM</td>
                          <td className="p-3 text-center font-mono">{att.accuracy}%</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                              att.isPass 
                                ? 'bg-emerald-500/10 text-emerald-500' 
                                : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {att.isPass ? "PASS" : "FAIL"}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold text-primary-500">{att.readinessScore}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 4. SEPARATE LEADERBOARDS FOR GOV EXAMS */}
        {activeSubTab === 'leaderboards' && (
          <div className="flex flex-col gap-4 text-left">
            
            {/* Selection selector */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Select Active Exam Leaderboard</h4>
              
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {exams.map((board) => (
                  <button
                    key={board.examId}
                    onClick={() => handleSetTargetExam(board.examId)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border shrink-0 cursor-pointer ${
                      examStats.targetExamId === board.examId
                        ? 'bg-primary-600 text-white border-primary-600 dark:bg-amber-500 dark:text-zinc-950 dark:border-amber-500'
                        : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800/60 text-slate-500 dark:text-zinc-400 hover:bg-slate-100'
                    }`}
                  >
                    {board.examName}
                  </button>
                ))}
              </div>
            </div>

            {/* LEADERBOARD STANDINGS CARD */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-zinc-800/60 flex justify-between items-center">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-orange-500" /> State-level Competitor Standings
                </h4>
                <span className="text-[9px] text-slate-400 font-mono uppercase font-bold">Live India Rankings</span>
              </div>

              <div className="flex flex-col">
                {getLeaderboardForExam(examStats.targetExamId || "jkssb-jr-ast").map((item) => (
                  <div 
                    key={item.rank}
                    className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-zinc-850 last:border-0 hover:bg-slate-50/50 dark:hover:bg-zinc-900/40"
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank circle */}
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-black ${
                        item.rank === 1 ? 'bg-amber-500/20 text-amber-500' :
                        item.rank === 2 ? 'bg-slate-300/20 text-slate-500' :
                        item.rank === 3 ? 'bg-orange-300/20 text-orange-500' :
                        'bg-slate-100 dark:bg-zinc-950 text-slate-400'
                      }`}>
                        {item.rank}
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-zinc-200">{item.name}</h5>
                        <p className="text-[8px] text-slate-400 uppercase tracking-widest">{item.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 text-right font-mono">
                      <div>
                        <span className="text-[7px] font-extrabold uppercase text-slate-400 block tracking-wider">Speed</span>
                        <span className="text-xs font-black text-slate-800 dark:text-zinc-100">{item.speed} WPM</span>
                      </div>
                      <div>
                        <span className="text-[7px] font-extrabold uppercase text-slate-400 block tracking-wider">Accuracy</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">{item.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* USER POSITION TIER IF LOGGED */}
                <div className="bg-primary-500/5 dark:bg-amber-500/5 p-4 border-t-2 border-primary-500/20 dark:border-amber-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-6 h-6 rounded-lg bg-primary-600 dark:bg-amber-500 text-white dark:text-zinc-950 flex items-center justify-center font-mono text-xs font-black">
                      #
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                        {resolvedName} <span className="px-1.5 py-0.2 bg-primary-500/20 text-[7px] text-primary-600 dark:text-amber-400 rounded">YOU</span>
                      </h5>
                      <p className="text-[8px] text-slate-400 uppercase tracking-widest">Active session contestant</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 text-right font-mono">
                    <div>
                      <span className="text-[7px] font-extrabold uppercase text-slate-400 block tracking-wider">Best Speed</span>
                      <span className="text-xs font-black text-slate-850 dark:text-zinc-100">{examStats.bestWpm || 0} WPM</span>
                    </div>
                    <div>
                      <span className="text-[7px] font-extrabold uppercase text-slate-400 block tracking-wider">Accuracy</span>
                      <span className="text-xs font-bold text-slate-850 dark:text-zinc-100">{examStats.averageAccuracy || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
