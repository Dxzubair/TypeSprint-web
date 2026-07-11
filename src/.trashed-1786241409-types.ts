/* v8 ignore start */
export type LessonCategory =
  | 'home_row'
  | 'top_row'
  | 'bottom_row'
  | 'numbers'
  | 'symbols'
  | 'common_words'
  | 'sentences'
  | 'paragraphs'
  | 'coding'
  | 'email'
  | 'custom';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: LessonCategory;
  targetKeys: string[];
  texts: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface TypingSessionResult {
  id: string;
  type: 'lesson' | 'test' | 'custom' | 'game';
  title: string;
  date: string;
  wpm: number;
  rawWpm?: number;
  cpm: number;
  accuracy: number;
  timeSpentSeconds: number;
  mistakesCount: number;
  totalKeysPressed: number;
  correctCharacters?: number;
  incorrectCharacters?: number;
  extraCharacters?: number;
  missedCharacters?: number;
  coinsEarned?: number;
  xpEarned?: number;
  fastestKey?: string;
  slowestKey?: string;
  typingMode?: 'mobile_keyboard' | 'external_keyboard' | 'computer_keyboard';
  keyboardType?: 'bluetooth' | 'usb' | 'none';
  deviceName?: string;
}

export interface KeyboardSettings {
  layout: 'QWERTY' | 'QWERTZ' | 'AZERTY' | 'COLEMAK' | 'DVORAK';
  soundType: 'mechanical' | 'chiclet' | 'typewriter' | 'mute' | 'cherry_mx_blue' | 'linear_red' | 'silent_tactile' | 'topre' | 'buckling_spring';
  backspaceEnabled: boolean;
  simulatedConnection: 'bluetooth' | 'usb_otg' | 'none';
  showFingerGuide: boolean;
  blockOnScreenKeyboard: boolean;
  theme: string;
  fontFamily: string;
  fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  hapticEnabled: boolean;
  language: string;
}

export interface TypingStats {
  bestWpm: number;
  avgWpm: number;
  bestAccuracy: number;
  avgAccuracy: number;
  totalSessions: number;
  totalMinutes: number;
  totalCorrectKeystrokes: number;
  totalIncorrectKeystrokes: number;
  totalAccuracy: number; // legacy or sum
  lifetimeAccuracy: number;
  streak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  mistypedKeys: Record<string, number>;
  history: TypingSessionResult[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinsReward?: number;
  category?: string;
  icon: string; // lucide-react icon name
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface DailyChallenge {
  id: string;
  description: string;
  targetWpm: number;
  targetAccuracy: number;
  xpReward: number;
  coinsReward?: number;
  completed: boolean;
}

export interface UserProfile {
  xp: number;
  level: number;
  name: string;
  username?: string;
  coins: number;
  gems?: number; // Premium rare currency
  selectedAvatar: string;
  selectedTitle: string;
  unlockedAvatars: string[];
  unlockedTitles: string[];
  unlockedThemes: string[];
  unlockedSkins: string[];
  selectedSkin: string;
  
  // Customization elements
  selectedFrame?: string;
  selectedNameColor?: string;
  selectedSfxPack?: string;
  selectedTypingEffect?: string;
  selectedCursorStyle?: string;
  selectedFont?: string;
  unlockedFrames?: string[];
  unlockedNameColors?: string[];
  unlockedSfxPacks?: string[];
  unlockedTypingEffects?: string[];
  unlockedCursorStyles?: string[];
  unlockedFonts?: string[];
  
  // Login calendar
  calendarClaimedDays?: number[];
  calendarLastClaimDate?: string;
  
  // Streaks
  streakDaily?: number;
  streakWeekly?: number;
  streakMonthly?: number;
  streakYearly?: number;
  
  // Battle Pass
  battlePassXp?: number;
  battlePassTier?: number;
  battlePassPremium?: boolean;
  claimedFreeTiers?: number[];
  claimedPremiumTiers?: number[];

  // Multi-Input System Properties
  typingMode?: 'mobile_keyboard' | 'external_keyboard' | 'computer_keyboard';
  keyboardType?: 'bluetooth' | 'usb' | 'none';
  deviceName?: string;
  onboardingCompleted?: boolean;

  // Authentication and Profile Fields
  email?: string;
  profilePhoto?: string;
  country?: string;
  preferredLanguage?: string;
}

export interface ExamRule {
  examId: string;
  examName: string;
  organization: string;
  postName: string;
  language: string;
  typingMethod: string;
  requiredWpm: number;
  requiredAccuracy: number;
  duration: number;
  minPassingScore: number;
  officialPattern: string;
  difficulty: string;
  textType: string;
  keyboardType: string;
  remarks: string;
  officialNotificationUrl: string;
  lastUpdated: string;
  version: string;
}

export interface TypingPassage {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  language: string;
  wordCount: number;
  estimatedWpm: number;
  estimatedDuration: number;
  content: string;
}

export interface ExamAttemptResult {
  attemptId: string;
  examId: string;
  examName: string;
  date: string;
  wpm: number;
  accuracy: number;
  mistakes: number;
  isPass: boolean;
  readinessScore: number;
  timeSpentSeconds: number;
  weakKeys: string[];
  weakFingers: string[];
}

export interface UserExamStats {
  targetExamId: string | null;
  attemptsCount: number;
  passedCount: number;
  averageWpm: number;
  bestWpm: number;
  averageAccuracy: number;
  totalPracticeSeconds: number;
  readinessScore: number;
}

export interface BetaFeedback {
  userId: string;
  username: string;
  rating: number;
  category: string;
  message: string;
  device: string;
  androidVersion: string;
  appVersion: string;
  keyboardType: string;
  createdAt?: any;
}

export interface ParagraphReport {
  reportId: string;
  paragraphId: string;
  paragraphTitle: string;
  category: string;
  difficulty: string;
  reportType: string;
  comment?: string;
  userId: string;
  username: string;
  deviceModel: string;
  androidVersion: string;
  appVersion: string;
  keyboardType: string;
  createdAt: any;
  status: 'Pending' | 'Resolved' | 'Ignored';
}

/* v8 ignore stop */
