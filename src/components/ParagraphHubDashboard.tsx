/* v8 ignore start */
import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Sparkles, Plus, Search, FolderPlus, Folder, Trash2, Star, 
  Copy, Edit3, Clock, Play, FileText, ChevronRight, ArrowUpDown, Check, 
  CheckCircle2, Clipboard, Lock, Settings, Activity, Award, FileDown,
  RefreshCw, Keyboard, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveUserDataToCloud } from '../utils/sync';
import { motion, AnimatePresence } from 'motion/react';
import { audioSynth } from '../utils/audio';
import { AnalyticsEngine } from '../utils/analyticsEngine';
import { ReportParagraphSheet } from './ReportParagraphSheet';

import { Paragraph, PARAGRAPH_DATABASE, PARAGRAPH_CATEGORIES } from '../data/paragraphs';
import { KeyboardSettings } from '../types';

export interface FolderItem {
  id: string;
  name: string;
  createdAt: number;
}

export interface ParagraphStats {
  timesPracticed: number;
  bestWpm: number;
  bestAccuracy: number;
  averageWpm: number;
  averageAccuracy: number;
  practiceTimeSeconds: number;
  lastPracticed: number;
}

export interface PracticeHistoryItem {
  id: string;
  paragraphId: string;
  paragraphTitle: string;
  date: string;
  wpm: number;
  accuracy: number;
  timeSpentSeconds: number;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-teal-50 text-teal-700 border-teal-100/60 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/30';
    case 'Easy':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
    case 'Medium':
      return 'bg-blue-50 text-blue-700 border-blue-100/60 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
    case 'Hard':
      return 'bg-orange-50 text-orange-700 border-orange-100/60 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30';
    case 'Expert':
      return 'bg-rose-50 text-rose-700 border-rose-100/60 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-100/60 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700/30';
  }
};

const getDifficultyDotColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-teal-500 dark:bg-teal-400';
    case 'Easy':
      return 'bg-emerald-500 dark:bg-emerald-400';
    case 'Medium':
      return 'bg-blue-500 dark:bg-blue-400';
    case 'Hard':
      return 'bg-orange-500 dark:bg-orange-400';
    case 'Expert':
      return 'bg-rose-500 dark:bg-rose-400';
    default:
      return 'bg-slate-400 dark:bg-zinc-400';
  }
};

interface ParagraphHubDashboardProps {
  onSessionComplete?: (results: {
    wpm: number;
    accuracy: number;
    xpGained: number;
    coinsEarned: number;
    mistakesCount: number;
    title: string;
  }) => void;
  profile: any;
  stats: any;
  settings?: KeyboardSettings;
}

export function ParagraphHubDashboard({ onSessionComplete, profile, stats, settings }: ParagraphHubDashboardProps) {
  const { user } = useAuth();

  // Navigation states
  const [activeTab, setActiveTab] = useState<'official' | 'library' | 'my-paragraphs' | 'ai-generator'>('official');
  const [isGridView, setIsGridView] = useState<boolean>(true);

  // DB entities stored in LocalStorage
  const [customParagraphs, setCustomParagraphs] = useState<Paragraph[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]); // list of paragraph ids
  const [practiceStats, setPracticeStats] = useState<Record<string, ParagraphStats>>({});
  const [history, setHistory] = useState<PracticeHistoryItem[]>([]);

  // Search, Filter, and Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard' | 'Expert'>('All');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'favorites' | 'wpm' | 'alphabetical'>('recent');

  // Custom configuration state
  const [testTimeLimit, setTestTimeLimit] = useState<number>(60); // seconds
  const [typingMode, setTypingMode] = useState<'standard' | 'strict'>('standard');
  const [languageFilter, setLanguageFilter] = useState<string>('English');

  // Interactive UI trigger states
  const [activePracticeParagraph, setActivePracticeParagraph] = useState<Paragraph | null>(null);
  const [isPracticeActive, setIsPracticeActive] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showFolderModal, setShowFolderModal] = useState<boolean>(false);
  const [reportParagraph, setReportParagraph] = useState<Paragraph | null>(null);
  
  // Create / Edit Paragraph fields
  const [inputTitle, setInputTitle] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [inputCategory, setInputCategory] = useState('Office Letters');
  const [inputDifficulty, setInputDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Expert'>('Medium');
  const [inputLanguage, setInputLanguage] = useState('English');
  const [inputTags, setInputTags] = useState('');
  const [editingParagraphId, setEditingParagraphId] = useState<string | null>(null);
  
  // Folder fields
  const [inputFolderName, setInputFolderName] = useState('');

  // Practice run state
  const [typedText, setTypedText] = useState('');
  const [practiceTimeLeft, setPracticeTimeLeft] = useState(60);
  const [practiceTotalDuration, setPracticeTotalDuration] = useState(60);
  const [lastSessionResults, setLastSessionResults] = useState<{
    wpm: number;
    accuracy: number;
    grossWpm: number;
    mistakes: number;
    earnedXp: number;
    earnedCoins: number;
  } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const practiceTypedRef = useRef<string>('');
  const inputTextAreaRef = useRef<HTMLTextAreaElement | null>(null);

  // Initialize and load localStorage data
  const loadStoredData = () => {
    const storedCustom = localStorage.getItem('typesprint_custom_paragraphs');
    const storedFolders = localStorage.getItem('typesprint_paragraph_folders');
    const storedFavs = localStorage.getItem('typesprint_paragraph_favorites');
    const storedStats = localStorage.getItem('typesprint_paragraph_stats');
    const storedHistory = localStorage.getItem('typesprint_paragraph_history');

    if (storedCustom) setCustomParagraphs(JSON.parse(storedCustom));
    if (storedFolders) setFolders(JSON.parse(storedFolders));
    if (storedFavs) setFavorites(JSON.parse(storedFavs));
    if (storedStats) setPracticeStats(JSON.parse(storedStats));
    if (storedHistory) setHistory(JSON.parse(storedHistory));
  };

  useEffect(() => {
    loadStoredData();

    window.addEventListener('typesprint_paragraphhub_sync', loadStoredData);
    return () => {
      window.removeEventListener('typesprint_paragraphhub_sync', loadStoredData);
    };
  }, []);

  // Sync data to Firestore and save locally
  const saveCustomParagraphs = (updated: Paragraph[]) => {
    setCustomParagraphs(updated);
    localStorage.setItem('typesprint_custom_paragraphs', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('typesprint_request_sync'));
  };

  const saveFolders = (updated: FolderItem[]) => {
    setFolders(updated);
    localStorage.setItem('typesprint_paragraph_folders', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('typesprint_request_sync'));
  };

  const saveFavorites = (updated: string[]) => {
    setFavorites(updated);
    localStorage.setItem('typesprint_paragraph_favorites', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('typesprint_request_sync'));
  };

  const savePracticeStats = (updated: Record<string, ParagraphStats>) => {
    setPracticeStats(updated);
    localStorage.setItem('typesprint_paragraph_stats', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('typesprint_request_sync'));
  };

  const saveHistory = (updated: PracticeHistoryItem[]) => {
    setHistory(updated);
    localStorage.setItem('typesprint_paragraph_history', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('typesprint_request_sync'));
  };

  // Combine local seed paragraphs with custom paragraphs
  const allParagraphs = [...PARAGRAPH_DATABASE, ...customParagraphs];

  // Filtering list based on search and parameters
  const filteredList = allParagraphs.filter((p) => {
    // Tab checks
    if (activeTab === 'official' && !p.exam) return false;
    if (activeTab === 'library' && p.isCustom) return false;
    if (activeTab === 'my-paragraphs' && !p.isCustom) return false;
    if (activeTab === 'my-paragraphs' && selectedFolderId && p.folderId !== selectedFolderId) return false;

    // Search query checks
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q) || false;
      const matchContent = p.content?.toLowerCase().includes(q) || false;
      const matchCategory = p.category?.toLowerCase().includes(q) || false;
      const matchExam = p.exam ? p.exam.toLowerCase().includes(q) : false;
      const matchTags = p.tags?.some(tag => tag?.toLowerCase().includes(q)) || false;
      if (!matchTitle && !matchContent && !matchCategory && !matchExam && !matchTags) return false;
    }

    // Dropdown filters
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) return false;

    return true;
  });

  // Sorting
  const sortedList = [...filteredList].sort((a, b) => {
    if (sortBy === 'favorites') {
      const aFav = favorites.includes(a.id) ? 1 : 0;
      const bFav = favorites.includes(b.id) ? 1 : 0;
      return bFav - aFav; // favorites first
    }
    if (sortBy === 'wpm') {
      return b.wordCount - a.wordCount; // longer passages first
    }
    if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    // Default 'recent'
    return b.createdAt - a.createdAt;
  });

  // Extract unique categories for filter dropdown
  const uniqueCategories = Array.from(new Set(allParagraphs.map(p => p.category)));

  // Toggle favorite
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let next;
    if (favorites.includes(id)) {
      next = favorites.filter(favId => favId !== id);
    } else {
      next = [...favorites, id];
    }
    saveFavorites(next);
  };

  // CRUD custom paragraphs
  const handleCreateOrUpdateParagraph = () => {
    if (!inputTitle.trim() || !inputContent.trim()) return;

    const words = inputContent.trim().split(/\s+/).length;
    
    if (editingParagraphId) {
      // Update
      const updated = customParagraphs.map(p => {
        if (p.id === editingParagraphId) {
          return {
            ...p,
            title: inputTitle,
            content: inputContent,
            category: inputCategory,
            difficulty: inputDifficulty,
            language: inputLanguage,
            wordCount: words,
            estimatedTime: Math.round(words * 1.5),
            tags: inputTags.split(',').map(t => t.trim()).filter(Boolean),
            folderId: selectedFolderId || undefined
          };
        }
        return p;
      });
      saveCustomParagraphs(updated);
    } else {
      // Create
      const newParagraph: Paragraph = {
        id: `custom_p_${Date.now()}`,
        title: inputTitle,
        content: inputContent,
        category: inputCategory,
        difficulty: inputDifficulty,
        language: inputLanguage,
        wordCount: words,
        estimatedTime: Math.round(words * 1.5),
        tags: inputTags.split(',').map(t => t.trim()).filter(Boolean),
        isCustom: true,
        createdAt: Date.now(),
        folderId: selectedFolderId || undefined
      };
      saveCustomParagraphs([newParagraph, ...customParagraphs]);
    }

    // Reset fields
    setInputTitle('');
    setInputContent('');
    setInputCategory('Office Letters');
    setInputDifficulty('Medium');
    setInputLanguage('English');
    setInputTags('');
    setEditingParagraphId(null);
    setShowCreateModal(false);
  };

  const handleEditClick = (p: Paragraph, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingParagraphId(p.id);
    setInputTitle(p.title);
    setInputContent(p.content);
    setInputCategory(p.category);
    setInputDifficulty(p.difficulty);
    setInputLanguage(p.language);
    setInputTags(p.tags.join(', '));
    setShowCreateModal(true);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this custom paragraph?")) {
      const updated = customParagraphs.filter(p => p.id !== id);
      saveCustomParagraphs(updated);
      // Clean favorite or history if appropriate (optional)
    }
  };

  const handleDuplicateClick = (p: Paragraph, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated: Paragraph = {
      ...p,
      id: `custom_p_${Date.now()}`,
      title: `${p.title} (Copy)`,
      createdAt: Date.now()
    };
    saveCustomParagraphs([duplicated, ...customParagraphs]);
  };

  // TXT file import handler
  const handleTxtImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setInputTitle(file.name.replace(/\.[^/.]+$/, ""));
        setInputContent(text);
        setShowCreateModal(true);
      }
    };
    reader.readAsText(file);
  };

  // Folder management
  const handleCreateFolder = () => {
    if (!inputFolderName.trim()) return;
    const newFolder: FolderItem = {
      id: `folder_${Date.now()}`,
      name: inputFolderName,
      createdAt: Date.now()
    };
    saveFolders([...folders, newFolder]);
    setInputFolderName('');
    setShowFolderModal(false);
  };

  const handleDeleteFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this folder? (Paragraphs inside will be kept in 'All Docs')")) {
      setFolders(folders.filter(f => f.id !== id));
      if (selectedFolderId === id) setSelectedFolderId(null);

      // Remove folderId from custom paragraphs that belonged to this folder
      const updated = customParagraphs.map(p => {
        if (p.folderId === id) {
          const { folderId, ...rest } = p;
          return rest as Paragraph;
        }
        return p;
      });
      saveCustomParagraphs(updated);
    }
  };

  // Live typing test running engine
  const startParagraphRun = (p: Paragraph) => {
    setActivePracticeParagraph(p);
    setTypedText('');
    practiceTypedRef.current = '';
    setPracticeTimeLeft(testTimeLimit);
    setPracticeTotalDuration(testTimeLimit);
    setLastSessionResults(null);
    setIsPracticeActive(true);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setPracticeTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          evaluateSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto focus textarea
    setTimeout(() => {
      if (inputTextAreaRef.current) {
        inputTextAreaRef.current.focus();
      }
    }, 100);
  };

  // Handle live inputs keystrokes
  const handleTypingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const soundType = settings?.soundType || 'mechanical';
    
    // Play keystroke sound if audio Synth is enabled
    if (val.length > typedText.length) {
      const lastCharIndex = val.length - 1;
      const typedChar = val[lastCharIndex];
      const expectedChar = activePracticeParagraph?.content[lastCharIndex];

      if (expectedChar !== undefined && typedChar !== expectedChar) {
        audioSynth.playError();
      } else {
        audioSynth.playClick(soundType);
      }
    } else if (val.length < typedText.length) {
      audioSynth.playClick(soundType);
    }
    
    setTypedText(val);
    practiceTypedRef.current = val;
  };

  // Session completion evaluations
  const evaluateSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const p = activePracticeParagraph;
    if (!p) return;

    const typedVal = practiceTypedRef.current;
    
    // Calculate total correct and incorrect characters
    let correctCharacters = 0;
    let incorrectCharacters = 0;
    
    // We can evaluate character by character up to the typed length
    for (let i = 0; i < typedVal.length; i++) {
      if (i < p.content.length && typedVal[i] === p.content[i]) {
        correctCharacters++;
      } else {
        incorrectCharacters++;
      }
    }
    
    const extraCharacters = typedVal.length > p.content.length ? typedVal.length - p.content.length : 0;
    const sessionDurationSeconds = practiceTotalDuration - practiceTimeLeft;

    const stats = AnalyticsEngine.calculateMetrics(
      correctCharacters, 
      incorrectCharacters, 
      sessionDurationSeconds, 
      extraCharacters, 
      0 // missed characters aren't easily calculated in this free-type mode, keep 0
    );

    const netWpm = stats.wpm;
    const grossWpm = stats.rawWpm;
    const calculatedAccuracy = stats.accuracy;
    const mistakes = incorrectCharacters + extraCharacters;

    // XP/Coin distributions
    const finalXp = netWpm >= 30 ? 200 : 80;
    const finalCoins = netWpm >= 35 ? 75 : 25;

    setLastSessionResults({
      wpm: netWpm,
      accuracy: calculatedAccuracy,
      grossWpm: grossWpm,
      mistakes: mistakes,
      earnedXp: finalXp,
      earnedCoins: finalCoins
    });

    // Update paragraph local stats
    const currentStats = practiceStats[p.id] || {
      timesPracticed: 0,
      bestWpm: 0,
      bestAccuracy: 0,
      averageWpm: 0,
      averageAccuracy: 0,
      practiceTimeSeconds: 0,
      lastPracticed: 0
    };

    const nextTimes = currentStats.timesPracticed + 1;
    const nextBestWpm = Math.max(currentStats.bestWpm, netWpm);
    const nextBestAcc = Math.max(currentStats.bestAccuracy, calculatedAccuracy);
    const nextAvgWpm = Math.round(((currentStats.averageWpm * currentStats.timesPracticed) + netWpm) / nextTimes);
    const nextAvgAcc = Math.round(((currentStats.averageAccuracy * currentStats.timesPracticed) + calculatedAccuracy) / nextTimes);
    
    const updatedStats: ParagraphStats = {
      timesPracticed: nextTimes,
      bestWpm: nextBestWpm,
      bestAccuracy: nextBestAcc,
      averageWpm: nextAvgWpm,
      averageAccuracy: nextAvgAcc,
      practiceTimeSeconds: currentStats.practiceTimeSeconds + sessionDurationSeconds,
      lastPracticed: Date.now()
    };

    const nextPracticeStats = {
      ...practiceStats,
      [p.id]: updatedStats
    };
    savePracticeStats(nextPracticeStats);

    // Save history log item
    const historyItem: PracticeHistoryItem = {
      id: `hist_${Date.now()}`,
      paragraphId: p.id,
      paragraphTitle: p.title,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      wpm: netWpm,
      accuracy: calculatedAccuracy,
      timeSpentSeconds: sessionDurationSeconds
    };
    saveHistory([historyItem, ...history]);

    // Play completion success audio chime
    audioSynth.playSuccess();

    // Push completion to parent profile
    if (onSessionComplete) {
      onSessionComplete({
        wpm: netWpm,
        accuracy: calculatedAccuracy,
        xpGained: finalXp,
        coinsEarned: finalCoins,
        mistakesCount: mistakes,
        title: p.title
      });
    }
  };

  // Close interactive modal
  const exitPractice = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPracticeActive(false);
    setActivePracticeParagraph(null);
    setTypedText('');
  };

  return (
    <div className="flex flex-col gap-4 min-h-0 text-slate-800 dark:text-zinc-100">
      
      <AnimatePresence>
        {isPracticeActive && activePracticeParagraph && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 z-50 bg-slate-900/95 dark:bg-zinc-950/98 flex items-center justify-center p-4 md:p-6 overflow-y-auto"
          >
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-3xl w-full flex flex-col gap-5 shadow-2xl relative">
              
              {!lastSessionResults ? (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="px-2 py-0.5 bg-amber-500/10 text-[9px] text-amber-500 font-extrabold uppercase rounded-md border border-amber-500/20">
                        {activePracticeParagraph.category}
                      </span>
                      <h3 className="text-sm font-black font-display text-slate-800 dark:text-zinc-100 tracking-tight mt-1">
                        Active Run: {activePracticeParagraph.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-primary-500 font-mono font-bold text-xs bg-primary-500/10 px-3 py-1.5 rounded-lg border border-primary-500/20 animate-pulse">
                        <Clock className="w-4 h-4 text-primary-500" />
                        <span>{practiceTimeLeft}s left</span>
                      </div>
                      <button 
                        onClick={exitPractice}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Exit Run
                      </button>
                    </div>
                  </div>

                  {/* Reference Passage Panel */}
                  <div className="bg-slate-50 dark:bg-zinc-950 p-5 rounded-2xl border border-slate-100 dark:border-zinc-850 font-mono leading-relaxed select-none max-h-48 overflow-y-auto text-left relative">
                    <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400 absolute top-2 right-3">Reference Content</span>
                    
                    {/* Visual highlighted display of text */}
                    <div className="text-slate-600 dark:text-zinc-300 text-[13px] tracking-wide whitespace-pre-wrap leading-relaxed pt-2">
                      {activePracticeParagraph.content}
                    </div>
                  </div>

                  {/* Typing input */}
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Enter typing text matching reference above</label>
                    <textarea
                      ref={inputTextAreaRef}
                      value={typedText}
                      onChange={handleTypingChange}
                      placeholder="Click here and begin typing characters matching the sequence..."
                      className="w-full h-32 p-4 font-mono text-[13px] bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800/80 rounded-2xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  {/* Progress stats bar */}
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 uppercase border-t border-slate-100 dark:border-zinc-800/40 pt-4">
                    <span>Keystrokes: {typedText.length}</span>
                    <span>Words: {typedText.trim().split(/\s+/).filter(Boolean).length} / {activePracticeParagraph.wordCount}</span>
                    <button 
                      onClick={evaluateSession}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-500 dark:bg-amber-500 dark:text-zinc-950 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                    >
                      Complete Session
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 flex flex-col gap-5 items-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-lg font-black font-display text-slate-800 dark:text-zinc-100 tracking-tight">Run Complete!</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Excellent typing drills on "{activePracticeParagraph.title}"</p>
                  </div>

                  {/* Performance metrics dashboard */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md mt-2">
                    <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-100 dark:border-zinc-850">
                      <span className="text-[8px] text-slate-400 block uppercase font-mono">Net Speed</span>
                      <span className="text-lg font-black font-mono text-primary-500">{lastSessionResults.wpm} WPM</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-100 dark:border-zinc-850">
                      <span className="text-[8px] text-slate-400 block uppercase font-mono">Accuracy</span>
                      <span className="text-lg font-black font-mono text-emerald-500">{lastSessionResults.accuracy}%</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-100 dark:border-zinc-850">
                      <span className="text-[8px] text-slate-400 block uppercase font-mono">XP gained</span>
                      <span className="text-lg font-black font-mono text-amber-500">+{lastSessionResults.earnedXp} XP</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-100 dark:border-zinc-850">
                      <span className="text-[8px] text-slate-400 block uppercase font-mono">Coins earned</span>
                      <span className="text-lg font-black font-mono text-amber-400">+{lastSessionResults.earnedCoins}</span>
                    </div>
                  </div>

                  {/* Rewards animation row */}
                  <div className="flex gap-2.5 mt-2 bg-primary-500/[0.02] border border-primary-500/10 p-4 rounded-2xl w-full text-left max-w-sm">
                    <Award className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-slate-500">Practice Hub Statistics</h4>
                      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-zinc-400 mt-1">
                        Statistics have been updated under local storage and synced automatically with cloud databases.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={() => startParagraphRun(activePracticeParagraph)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-400" /> Repeat Run
                    </button>
                    <button 
                      onClick={exitPractice}
                      className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 dark:bg-amber-500 dark:text-zinc-950 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                    >
                      Return to Hub
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {reportParagraph && (
        <ReportParagraphSheet
          isOpen={!!reportParagraph}
          onClose={() => setReportParagraph(null)}
          paragraph={{ id: reportParagraph.id, title: reportParagraph.title, category: reportParagraph.category, difficulty: reportParagraph.difficulty }}
          profile={profile}
          settings={settings || { layout: 'QWERTY', soundType: 'mechanical', backspaceEnabled: true }}
        />
      )}

      {/* Main dashboard navigation cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Main list & library elements */}
        <div className="md:col-span-8 flex flex-col gap-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-slate-100 dark:border-zinc-850">
            {/* Horizontal Sections Tabs Bar */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'official', label: 'Official Exam Paragraphs' },
                { id: 'library', label: 'Practice Library' },
                { id: 'my-paragraphs', label: 'My Paragraphs' },
                { id: 'ai-generator', label: 'AI Generator' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSelectedFolderId(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all border shrink-0 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white border-primary-600 dark:bg-amber-500 dark:text-zinc-950 dark:border-amber-500 shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Layout options */}
            <div className="flex items-center gap-1 shrink-0 self-end">
              <button 
                onClick={() => setIsGridView(true)} 
                className={`p-1.5 rounded-lg border ${isGridView ? 'bg-slate-200 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-primary-500' : 'border-slate-100 dark:border-zinc-900 text-slate-400'} cursor-pointer`}
              >
                <Play className="w-3.5 h-3.5 rotate-90" />
              </button>
              <button 
                onClick={() => setIsGridView(false)} 
                className={`p-1.5 rounded-lg border ${!isGridView ? 'bg-slate-200 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-primary-500' : 'border-slate-100 dark:border-zinc-900 text-slate-400'} cursor-pointer`}
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Render filters, search database */}
          {activeTab !== 'ai-generator' && (
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search */}
              <div className="relative flex-grow">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search paragraph list..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs font-bold rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Category selector */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-[10px] font-bold rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="All">Category: All</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Difficulty selector */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                className="px-3 py-2 text-[10px] font-bold rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="All">Difficulty: All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
              </select>

              {/* Sort filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-[10px] font-bold rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="recent">Sort: Recent</option>
                <option value="favorites">Sort: Favorites</option>
                <option value="wpm">Sort: Passage Length</option>
                <option value="alphabetical">Sort: Alphabetical</option>
              </select>
            </div>
          )}

          {/* Folders row inside custom paragraphs */}
          {activeTab === 'my-paragraphs' && (
            <div className="flex flex-col gap-2.5 text-left bg-slate-50 dark:bg-zinc-950/20 p-4 rounded-2xl border border-slate-200/40 dark:border-zinc-800/60">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black uppercase text-slate-400">My Custom Folders</h4>
                <button 
                  onClick={() => setShowFolderModal(true)}
                  className="text-[9px] font-bold text-primary-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" /> Add Folder
                </button>
              </div>

              <div className="flex gap-2 flex-wrap mt-1">
                <button
                  onClick={() => setSelectedFolderId(null)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all border cursor-pointer ${
                    selectedFolderId === null
                      ? 'bg-primary-600 text-white border-primary-600 dark:bg-amber-500 dark:text-zinc-950 dark:border-amber-500'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  📁 All custom docs
                </button>

                {folders.map(fol => (
                  <div key={fol.id} className="relative group flex items-center">
                    <button
                      onClick={() => setSelectedFolderId(fol.id)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all border cursor-pointer ${
                        selectedFolderId === fol.id
                          ? 'bg-primary-600 text-white border-primary-600 dark:bg-amber-500 dark:text-zinc-950 dark:border-amber-500'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      📁 {fol.name}
                    </button>
                    
                    <button 
                      onClick={(e) => handleDeleteFolder(fol.id, e)}
                      className="ml-1 p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-md text-[8px] cursor-pointer"
                      title="Delete Folder"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEWPORT AREA: Paragraph list or AI coach */}
          {activeTab === 'ai-generator' ? (
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-black font-display tracking-tight text-slate-800 dark:text-zinc-100">
                AI Paragraph Generator (Coming Soon)
              </h3>
              <p className="text-[11px] leading-relaxed text-slate-400 max-w-sm">
                Unlock advanced customized passage synthesis. Generate highly-curated drafts based on your personal analytical weaknesses, target typing keys, and specialized vocabulary.
              </p>
              <div className="px-4 py-2 bg-slate-50 dark:bg-zinc-950/60 rounded-xl border border-slate-100 dark:border-zinc-850/60 text-[9px] text-amber-500 font-mono font-bold">
                🔮 INTEGRATED WITH TYPE-SPRINT AI COACH
              </div>
            </div>
          ) : sortedList.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 p-12 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-xs font-black text-slate-700 dark:text-zinc-300">No Paragraphs Found</h4>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">
                Try widening your filters or create a custom paragraph under the 'My Paragraphs' tab to get started.
              </p>
            </div>
          ) : isGridView ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[480px] overflow-y-auto pr-1">
              {sortedList.map((p) => {
                const statsObj = practiceStats[p.id];
                const isFav = favorites.includes(p.id);
                return (
                  <div 
                    key={p.id}
                    onClick={() => startParagraphRun(p)}
                    className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm hover:border-primary-500/50 dark:hover:border-amber-500/50 transition-all text-left flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {p.exam && (
                            <span className="px-2 py-0.5 bg-rose-50/70 dark:bg-rose-950/25 text-rose-700 dark:text-rose-400 border border-rose-100/30 dark:border-rose-900/30 text-[8px] font-black uppercase font-mono rounded-full">
                              {p.exam}
                            </span>
                          )}
                        </div>
                        
                        <button 
                          onClick={(e) => toggleFavorite(p.id, e)}
                          className="text-xs text-slate-400 hover:text-amber-500 transition-all shrink-0 cursor-pointer p-0.5 ml-auto"
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setReportParagraph(p); }}
                          className="text-xs text-slate-400 hover:text-rose-500 transition-all shrink-0 cursor-pointer p-0.5"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-black text-slate-800 dark:text-zinc-100 mt-2.5 line-clamp-1">{p.title}</h4>
                      
                      {/* Material 3 Styled Badges layout */}
                      <div className="flex flex-wrap gap-1.5 mt-2 mb-2.5">
                        <span className="px-2 py-0.5 bg-slate-100/70 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/40 dark:border-zinc-700/40 text-[9px] font-bold rounded-full tracking-wide">
                          {p.category}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full tracking-wide border flex items-center gap-1 ${getDifficultyColor(p.difficulty)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getDifficultyDotColor(p.difficulty)}`} />
                          {p.difficulty}
                        </span>
                        <span className="px-2 py-0.5 bg-indigo-50/70 dark:bg-indigo-950/25 text-indigo-700 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30 text-[9px] font-bold rounded-full tracking-wide">
                          {p.wordCount} words
                        </span>
                        {p.xpReward && (
                          <span className="px-2 py-0.5 bg-amber-50/70 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100/30 dark:border-amber-900/30 text-[9px] font-bold rounded-full tracking-wide flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-amber-500" /> +{p.xpReward} XP
                          </span>
                        )}
                        {p.recommendedWpm && (
                          <span className="px-2 py-0.5 bg-violet-50/70 dark:bg-violet-950/25 text-violet-700 dark:text-violet-400 border border-violet-100/30 dark:border-violet-900/30 text-[9px] font-bold rounded-full tracking-wide">
                            Rec: {p.recommendedWpm} WPM
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{p.content}</p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-50 dark:border-zinc-800/30 flex items-center justify-between">
                      <div>
                        {statsObj ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] text-slate-400 uppercase tracking-wider font-mono font-bold">Personal Best</span>
                            <span className="text-[10px] text-emerald-500 font-black font-mono">
                              {statsObj.bestWpm} WPM <span className="text-slate-400 font-normal">({statsObj.bestAccuracy}% Acc)</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-[8px] text-slate-400 font-semibold italic">Unpracticed</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {p.isCustom && (
                          <>
                            <button 
                              onClick={(e) => handleEditClick(p, e)}
                              className="p-1 text-slate-400 hover:text-slate-200 border border-slate-200 dark:border-zinc-800/60 rounded-md cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={(e) => handleDuplicateClick(p, e)}
                              className="p-1 text-slate-400 hover:text-slate-200 border border-slate-200 dark:border-zinc-800/60 rounded-md cursor-pointer"
                              title="Duplicate"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteClick(p.id, e)}
                              className="p-1 text-rose-500 hover:text-rose-400 border border-rose-500/20 rounded-md cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => startParagraphRun(p)}
                          className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 dark:bg-amber-500 dark:text-zinc-950 text-white rounded-lg text-[9px] font-bold transition-all cursor-pointer flex items-center gap-0.5"
                        >
                          <Play className="w-2.5 h-2.5 fill-white dark:fill-zinc-950" /> Run
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
              {sortedList.map((p) => {
                const statsObj = practiceStats[p.id];
                const isFav = favorites.includes(p.id);
                return (
                  <div 
                    key={p.id}
                    onClick={() => startParagraphRun(p)}
                    className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm hover:border-primary-500/50 dark:hover:border-amber-500/50 transition-all text-left flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex-grow min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-800 dark:text-zinc-100 line-clamp-1">{p.title}</h4>
                        {p.exam && (
                          <span className="px-1.5 py-0.5 bg-rose-50/70 dark:bg-rose-950/25 text-rose-700 dark:text-rose-400 border border-rose-100/30 dark:border-rose-900/30 text-[8px] font-black uppercase font-mono rounded-full shrink-0">
                            {p.exam}
                          </span>
                        )}
                      </div>
                      
                      {/* Material 3 Styled Badges layout for List View */}
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className="px-1.5 py-0.5 bg-slate-100/70 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/40 dark:border-zinc-700/40 text-[8px] font-bold rounded-full tracking-wide">
                          {p.category}
                        </span>
                        <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded-full tracking-wide border flex items-center gap-1 ${getDifficultyColor(p.difficulty)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getDifficultyDotColor(p.difficulty)}`} />
                          {p.difficulty}
                        </span>
                        <span className="px-1.5 py-0.5 bg-indigo-50/70 dark:bg-indigo-950/25 text-indigo-700 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30 text-[8px] font-bold rounded-full tracking-wide">
                          {p.wordCount} words
                        </span>
                        {p.xpReward && (
                          <span className="px-1.5 py-0.5 bg-amber-50/70 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100/30 dark:border-amber-900/30 text-[8px] font-bold rounded-full tracking-wide flex items-center gap-0.5">
                            <Sparkles className="w-2 h-2 text-amber-500" /> +{p.xpReward} XP
                          </span>
                        )}
                        {p.recommendedWpm && (
                          <span className="px-1.5 py-0.5 bg-violet-50/70 dark:bg-violet-950/25 text-violet-700 dark:text-violet-400 border border-violet-100/30 dark:border-violet-900/30 text-[8px] font-bold rounded-full tracking-wide">
                            Rec: {p.recommendedWpm} WPM
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 bg-slate-100/60 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 border border-slate-200/20 dark:border-zinc-700/20 text-[8px] font-bold rounded-full tracking-wide">
                          {p.language}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {statsObj && (
                        <div className="text-right flex flex-col justify-center font-mono">
                          <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300">{statsObj.bestWpm} WPM</span>
                          <span className="text-[8px] text-emerald-500 font-black">{statsObj.bestAccuracy}% Acc</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => toggleFavorite(p.id, e)}
                          className="p-1 hover:bg-slate-50 dark:hover:bg-zinc-950 rounded-lg cursor-pointer"
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                        </button>

                        {p.isCustom && (
                          <>
                            <button 
                              onClick={(e) => handleEditClick(p, e)}
                              className="p-1 text-slate-400 hover:text-slate-200 rounded cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteClick(p.id, e)}
                              className="p-1 text-rose-500 hover:text-rose-400 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Configurations, Statistics and Custom actions */}
        <div className="md:col-span-4 flex flex-col gap-4 text-left">
          
          {/* Quick Custom Test settings panel */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col gap-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-primary-500" /> Custom Test Rules
            </h4>

            {/* Selection values */}
            <div className="flex flex-col gap-3 mt-1.5">
              
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Duration Time Limit</label>
                <div className="grid grid-cols-4 gap-1">
                  {[15, 30, 60, 120].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTestTimeLimit(t)}
                      className={`py-1.5 text-[9px] font-mono font-black border rounded-lg transition-all cursor-pointer ${
                        testTimeLimit === t
                          ? 'bg-primary-600 border-primary-600 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-zinc-950'
                          : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-850 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Typing Mode Settings</label>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: 'standard', label: 'Standard' },
                    { id: 'strict', label: 'Strict (No Backspace)' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setTypingMode(m.id as any)}
                      className={`py-1.5 text-[9px] font-bold border rounded-lg transition-all cursor-pointer ${
                        typingMode === m.id
                          ? 'bg-primary-600 border-primary-600 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-zinc-950'
                          : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-850 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom file imports actions */}
            <div className="border-t border-slate-50 dark:border-zinc-800/50 pt-4 flex flex-col gap-2">
              <button 
                onClick={() => {
                  setEditingParagraphId(null);
                  setInputTitle('');
                  setInputContent('');
                  setInputCategory('Office Letters');
                  setInputDifficulty('Medium');
                  setInputLanguage('English');
                  setInputTags('');
                  setShowCreateModal(true);
                }}
                className="w-full py-2 bg-primary-600 hover:bg-primary-500 dark:bg-amber-500 dark:text-zinc-950 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Create Typing Passage
              </button>

              <div className="flex gap-2">
                <label className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-950 dark:hover:bg-zinc-850 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800/80 rounded-xl text-[9px] font-extrabold uppercase text-center cursor-pointer transition-all flex items-center justify-center gap-1">
                  <FileDown className="w-3.5 h-3.5 text-slate-400" />
                  <span>Import TXT</span>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleTxtImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Practice Run statistics summary card */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-500" /> Practice Analytics
            </h4>

            {/* Mini metrics cards */}
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-100 dark:border-zinc-850 font-mono text-center">
                <span className="text-[7px] text-slate-400 uppercase block">Times Run</span>
                <span className="text-sm font-black text-slate-700 dark:text-zinc-200">
                  {(Object.values(practiceStats) as ParagraphStats[]).reduce((acc, curr) => acc + curr.timesPracticed, 0)}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-100 dark:border-zinc-850 font-mono text-center">
                <span className="text-[7px] text-slate-400 uppercase block">Practice Time</span>
                <span className="text-sm font-black text-slate-700 dark:text-zinc-200">
                  {Math.round((Object.values(practiceStats) as ParagraphStats[]).reduce((acc, curr) => acc + curr.practiceTimeSeconds, 0) / 60)}m
                </span>
              </div>
            </div>

            {/* Recents Practiced Paragraphs list */}
            <div className="flex flex-col gap-2 border-t border-slate-50 dark:border-zinc-800/40 pt-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-left">Recently Practiced</span>
              {history.length === 0 ? (
                <span className="text-[9px] text-slate-400 italic text-left">No practice history logs found.</span>
              ) : (
                <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
                  {history.slice(0, 5).map(hist => (
                    <div key={hist.id} className="flex items-center justify-between border-b border-slate-50 dark:border-zinc-850/40 pb-1.5 last:border-0 last:pb-0 text-left">
                      <div className="min-w-0 pr-2">
                        <h5 className="text-[10px] font-bold text-slate-700 dark:text-zinc-200 line-clamp-1">{hist.paragraphTitle}</h5>
                        <p className="text-[8px] text-slate-400 mt-0.5">{hist.date} • {hist.timeSpentSeconds}s</p>
                      </div>
                      <div className="text-right shrink-0 font-mono">
                        <span className="text-[10px] font-bold text-primary-500">{hist.wpm} WPM</span>
                        <span className="text-[8px] text-emerald-500 block">{hist.accuracy}% Acc</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Creation Modal dialog */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 max-w-lg w-full flex flex-col gap-4 text-left"
            >
              <h3 className="text-sm font-black font-display text-slate-800 dark:text-zinc-100 uppercase tracking-wider">
                {editingParagraphId ? 'Edit Custom Paragraph' : 'Create Custom Paragraph'}
              </h3>

              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Document Title</label>
                  <input
                    type="text"
                    placeholder="Enter document title..."
                    value={inputTitle}
                    onChange={(e) => setInputTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Typing passage content</label>
                  <textarea
                    placeholder="Paste or write your custom typing paragraph text here..."
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    className="w-full h-32 p-3 text-xs font-bold font-mono rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Category</label>
                    <select
                      value={inputCategory}
                      onChange={(e) => setInputCategory(e.target.value)}
                      className="w-full px-3 py-2 text-[10px] font-bold rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                    >
                      {PARAGRAPH_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="Mixed Practice">Mixed Practice</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Difficulty</label>
                    <select
                      value={inputDifficulty}
                      onChange={(e) => setInputDifficulty(e.target.value as any)}
                      className="w-full px-3 py-2 text-[10px] font-bold rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Legal, Circular, Practice"
                    value={inputTags}
                    onChange={(e) => setInputTags(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-4 border-t border-slate-100 dark:border-zinc-800/40 pt-4">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-500 dark:text-zinc-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateOrUpdateParagraph}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-500 dark:bg-amber-500 dark:text-zinc-950 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                >
                  Save Document
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Folder creation Modal */}
      <AnimatePresence>
        {showFolderModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 max-w-xs w-full flex flex-col gap-4 text-left"
            >
              <h3 className="text-sm font-black font-display text-slate-800 dark:text-zinc-100 uppercase tracking-wider">
                Create Folder
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Folder Name</label>
                <input
                  type="text"
                  placeholder="e.g. Circulars 2024"
                  value={inputFolderName}
                  onChange={(e) => setInputFolderName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 mt-2 border-t border-slate-100 dark:border-zinc-800/40 pt-4">
                <button 
                  onClick={() => setShowFolderModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-500 dark:text-zinc-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateFolder}
                  className="px-4 py-1.5 bg-primary-600 hover:bg-primary-500 dark:bg-amber-500 dark:text-zinc-950 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
/* v8 ignore stop */
