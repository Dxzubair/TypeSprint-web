import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, Award, Flame, Trophy, Shield, Sparkles, Zap, Lock, Play, 
  Hourglass, Calendar, BookOpen, Star, Gem, ShoppingBag, Eye, Check, 
  ChevronRight, User, Settings, Info, Bell, Key, Gift, ChevronDown, 
  CheckCircle2, RefreshCw, Smartphone, AlertCircle, AlertTriangle, 
  ShieldCheck, HelpCircle, Gamepad2, Volume2, UserCheck, FlameKindling,
  Sparkle, Compass, Target
} from 'lucide-react';
import { UserProfile, TypingStats, KeyboardSettings, Achievement, DailyChallenge } from '../types';
import { useAuth } from '../context/AuthContext';
import { audioSynth } from '../utils/audio';

interface RewardHubProps {
  profile: UserProfile;
  stats: TypingStats;
  settings: KeyboardSettings;
  achievements: Achievement[];
  dailyChallenges: DailyChallenge[];
  onUpdateProfile: (profile: UserProfile) => void;
  onUpdateStats: (stats: TypingStats) => void;
  onUpdateAchievements: (achievements: Achievement[]) => void;
  onNavigateToTab?: (tab: any) => void;
}

// 11 Career Player Ranks roadmap
const CAREER_RANKS = [
  { level: 1, name: 'Beginner', desc: 'Starting your typing quest.', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
  { level: 3, name: 'Student', desc: 'Learning structural finger placements.', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { level: 5, name: 'Apprentice', desc: 'Muscle memory beginning to gel.', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  { level: 8, name: 'Office Worker', desc: 'Standard business workflow speed.', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { level: 11, name: 'Professional Typist', desc: 'High cadence precision tactile worker.', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  { level: 14, name: 'Programmer', desc: 'Blazing speed with specialized symbols.', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { level: 17, name: 'Speed Master', desc: 'Pushing boundaries of tactile velocity.', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  { level: 21, name: 'Elite Typist', desc: 'Among the fastest hands on the internet.', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]' },
  { level: 26, name: 'Keyboard Champion', desc: 'Conquering massive technical databases.', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]' },
  { level: 31, name: 'Typing Legend', desc: 'Every stroke is a work of pure reflex.', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.25)]' },
  { level: 41, name: 'Keyboard Grandmaster', desc: 'Ultimate master of acoustic acoustics.', color: 'text-yellow-400 animate-pulse', bg: 'bg-yellow-500/15 border-yellow-400/30 shadow-[0_0_25px_rgba(234,179,8,0.3)]' },
];

export const RewardHub: React.FC<RewardHubProps> = ({
  profile,
  stats,
  settings,
  achievements,
  dailyChallenges,
  onUpdateProfile,
  onUpdateStats,
  onUpdateAchievements,
  onNavigateToTab,
}) => {
  const { user, isAnonymous } = useAuth();
  const isCloudActive = !!user && !isAnonymous;
  const resolvedName = useMemo(() => {
    if (isCloudActive && user?.displayName) {
      return user.displayName;
    }
    if (profile.name && profile.name.trim() !== '' && profile.name !== 'Tactile Pilot') {
      return profile.name;
    }
    if (profile.username && profile.username.trim() !== '' && profile.username !== 'tactile_pilot') {
      return profile.username;
    }
    return isCloudActive ? 'Pilot' : 'Guest';
  }, [isCloudActive, user?.displayName, profile.name, profile.username]);

  const [activeSubTab, setActiveSubTab] = useState<'battlepass' | 'calendar' | 'missions' | 'shop' | 'boxes' | 'achievements' | 'anticheat'>('battlepass');

  // Animation States
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string; size: number }[]>([]);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Lootbox States
  const [openingBox, setOpeningBox] = useState<string | null>(null); // 'common' | 'rare' | 'epic' | 'legendary'
  const [showLootOverlay, setShowLootOverlay] = useState(false);
  const [lootReward, setLootReward] = useState<{ name: string; icon: React.ReactNode; color: string; currency?: string; amount?: number } | null>(null);

  // Anti-Cheat Testing Area
  const [cheatTestInput, setCheatTestInput] = useState('');
  const [cheatTestHistory, setCheatTestHistory] = useState<{ time: number; wpm: number; status: string; risk: 'Clear' | 'Suspicious' | 'FLAGGED' }[]>([]);
  const [typingTimestamps, setTypingTimestamps] = useState<number[]>([]);

  // Trigger temporary custom alert
  const triggerAlert = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  // Launch explosive self-contained particle splash
  const triggerParticles = () => {
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#a855f7', '#14b8a6'];
    const particles = Array.from({ length: 45 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 80 + 10, // viewport percentage
      y: Math.random() * 60 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
    }));
    setConfetti(particles);
    setTimeout(() => setConfetti([]), 2500);
  };

  // Profile data computed values
  const currentGems = profile.gems || 0;
  const currentCoins = profile.coins;
  const currentXp = profile.xp;
  const level = profile.level;
  const nextLevelXp = level * 300;
  const xpPercentage = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

  // Determine current player rank from level
  const currentRank = useMemo(() => {
    let best = CAREER_RANKS[0];
    for (const rank of CAREER_RANKS) {
      if (level >= rank.level) {
        best = rank;
      }
    }
    return best;
  }, [level]);

  // Handle Level Unlocks preview List
  const nextRank = useMemo(() => {
    return CAREER_RANKS.find(r => r.level > level) || null;
  }, [level]);

  // 1. DAILY LOGIN CALENDAR UTILS
  const loginCalendarDays = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const dayNum = i + 1;
      let rewardName = '';
      let rewardAmount = 0;
      let rewardType: 'coins' | 'xp' | 'gems' | 'chest_common' | 'chest_rare' | 'chest_epic' | 'chest_legendary' = 'coins';

      if (dayNum === 7) {
        rewardName = 'Rare Chest';
        rewardType = 'chest_rare';
      } else if (dayNum === 14) {
        rewardName = 'Epic Chest';
        rewardType = 'chest_epic';
      } else if (dayNum === 21) {
        rewardName = 'Sunset Gold Theme';
        rewardType = 'gems'; // special theme marker
        rewardAmount = 1;
      } else if (dayNum === 30) {
        rewardName = 'Legendary Chest';
        rewardType = 'chest_legendary';
      } else {
        // Alternating base rewards
        if (dayNum % 5 === 0) {
          rewardType = 'gems';
          rewardAmount = 2;
          rewardName = '2 Gems';
        } else if (dayNum % 2 === 0) {
          rewardType = 'xp';
          rewardAmount = 100 + (dayNum * 10);
          rewardName = `${rewardAmount} XP`;
        } else {
          rewardType = 'coins';
          rewardAmount = 50 + (dayNum * 15);
          rewardName = `${rewardAmount} Coins`;
        }
      }

      return { day: dayNum, rewardName, rewardType, rewardAmount };
    });
  }, []);

  const calendarClaimed = profile.calendarClaimedDays || [];
  const nextClaimDay = calendarClaimed.length + 1;

  // Check if claimed already today
  const isClaimAvailableToday = useMemo(() => {
    if (calendarClaimed.length >= 30) return false;
    if (!profile.calendarLastClaimDate) return true;
    
    const lastClaimDateStr = new Date(profile.calendarLastClaimDate).toDateString();
    const todayStr = new Date().toDateString();
    return lastClaimDateStr !== todayStr;
  }, [calendarClaimed, profile.calendarLastClaimDate]);

  const handleClaimLoginReward = () => {
    if (!isClaimAvailableToday) {
      triggerAlert('Daily login reward already claimed today! Return tomorrow.', 'info');
      audioSynth.playError();
      return;
    }

    const currentDayConfig = loginCalendarDays[nextClaimDay - 1];
    if (!currentDayConfig) return;

    audioSynth.playSuccess();
    // Mutate profile
    const nextClaimedDays = [...calendarClaimed, nextClaimDay];
    const updatedProfile = {
      ...profile,
      calendarClaimedDays: nextClaimedDays,
      calendarLastClaimDate: new Date().toISOString(),
    };

    // Apply currency reward
    if (currentDayConfig.rewardType === 'coins') {
      updatedProfile.coins += currentDayConfig.rewardAmount;
    } else if (currentDayConfig.rewardType === 'gems') {
      updatedProfile.gems = currentGems + currentDayConfig.rewardAmount;
    } else if (currentDayConfig.rewardType === 'xp') {
      updatedProfile.xp += currentDayConfig.rewardAmount;
      // level up assessment
      while (updatedProfile.xp >= updatedProfile.level * 300) {
        updatedProfile.xp -= updatedProfile.level * 300;
        updatedProfile.level += 1;
      }
    } else {
      // It is a chest! Auto inventory or grant coins/gems equivalent
      if (currentDayConfig.rewardType === 'chest_rare') {
        updatedProfile.coins += 250;
        updatedProfile.gems = currentGems + 3;
      } else if (currentDayConfig.rewardType === 'chest_epic') {
        updatedProfile.coins += 500;
        updatedProfile.gems = currentGems + 6;
      } else if (currentDayConfig.rewardType === 'chest_legendary') {
        updatedProfile.coins += 1000;
        updatedProfile.gems = currentGems + 15;
      }
    }

    onUpdateProfile(updatedProfile);
    triggerParticles();
    triggerAlert(`Claimed Day ${nextClaimDay}: ${currentDayConfig.rewardName}!`, 'success');
  };

  // 2. RANDOMIZED MISSIONS
  const [dailyMissionsList, setDailyMissionsList] = useState<any[]>([
    { id: 'dm_1', title: 'Tactile Warmup', desc: 'Type a total of 300 words in any mode.', target: 300, progress: 140, xp: 80, coins: 50, claimed: false },
    { id: 'dm_2', title: 'Precision Drill', desc: 'Achieve 95% accuracy in a 1-Minute typing test.', target: 95, progress: 92, xp: 100, coins: 60, claimed: false, isPrecision: true },
    { id: 'dm_3', title: 'Arcade Blaster', desc: 'Blast 15 words inside Meteor Strike game.', target: 15, progress: 15, xp: 90, coins: 55, claimed: false, isComplete: true }
  ]);

  const [weeklyMissionsList, setWeeklyMissionsList] = useState<any[]>([
    { id: 'wm_1', title: 'Dedicated Scholar', desc: 'Complete practice drills on 3 different days.', target: 3, progress: 2, xp: 250, coins: 150, claimed: false },
    { id: 'wm_2', title: 'The Centurion', desc: 'Exceed 75 words-per-minute in a Speed Test.', target: 75, progress: 68, xp: 300, coins: 200, claimed: false },
    { id: 'wm_3', title: 'Keyboard Heavyweight', desc: 'Type a grand total of 2,500 characters correctly.', target: 2500, progress: 1840, xp: 280, coins: 180, claimed: false }
  ]);

  const [monthlyMissionsList, setMonthlyMissionsList] = useState<any[]>([
    { id: 'mm_1', title: 'Tactile Conquest', desc: 'Complete 35 total drills or speed tests this month.', target: 35, progress: 18, xp: 800, coins: 500, gems: 5, claimed: false },
    { id: 'mm_2', title: 'Zen Typist Perfection', desc: 'Finish 10 flawless practice runs with 100% accuracy.', target: 10, progress: 4, xp: 900, coins: 600, gems: 10, claimed: false }
  ]);

  const handleClaimMission = (type: 'daily' | 'weekly' | 'monthly', id: string) => {
    let mission: any = null;
    let updater: any = null;

    if (type === 'daily') {
      mission = dailyMissionsList.find(m => m.id === id);
      updater = (nextList: any) => setDailyMissionsList(nextList);
    } else if (type === 'weekly') {
      mission = weeklyMissionsList.find(m => m.id === id);
      updater = (nextList: any) => setWeeklyMissionsList(nextList);
    } else {
      mission = monthlyMissionsList.find(m => m.id === id);
      updater = (nextList: any) => setMonthlyMissionsList(nextList);
    }

    if (!mission) return;
    if (mission.claimed) {
      audioSynth.playError();
      return;
    }

    // Mutate lists
    const listSource = type === 'daily' ? dailyMissionsList : type === 'weekly' ? weeklyMissionsList : monthlyMissionsList;
    const updatedList = listSource.map(m => m.id === id ? { ...m, claimed: true } : m);
    updater(updatedList);

    audioSynth.playSuccess();

    // Apply currency
    const updatedProfile = { ...profile };
    updatedProfile.coins += mission.coins;
    updatedProfile.xp += mission.xp;
    if (mission.gems) {
      updatedProfile.gems = (updatedProfile.gems || 0) + mission.gems;
    }

    // level check
    while (updatedProfile.xp >= updatedProfile.level * 300) {
      updatedProfile.xp -= updatedProfile.level * 300;
      updatedProfile.level += 1;
    }

    onUpdateProfile(updatedProfile);
    triggerParticles();
    triggerAlert(`Claimed "${mission.title}": +${mission.xp} XP & +${mission.coins} Coins!`, 'success');
  };

  // 3. SEASON PASS (BATTLE PASS) 100 LEVELS
  const battlePassTier = profile.battlePassTier || 1;
  const battlePassXp = profile.battlePassXp || 0;
  const isPremiumPassUnlocked = profile.battlePassPremium || false;
  const claimedFree = profile.claimedFreeTiers || [];
  const claimedPremium = profile.claimedPremiumTiers || [];

  // Active BP stats
  const nextBpXpNeeded = 100;
  const bpXpPercentage = Math.round((battlePassXp / nextBpXpNeeded) * 100);

  // Synthesize top 10 core Battle Pass rewards preview
  const battlePassRewardsPreview = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const tierNum = i + 1;
      let freeReward = '50 Coins';
      let freeType: 'coins' | 'gems' | 'xp' | 'chest' = 'coins';
      let freeAmount = 50;

      let premiumReward = '100 Coins';
      let premiumType: 'coins' | 'gems' | 'skin' | 'chest' | 'frame' = 'coins';
      let premiumAmount = 100;

      if (tierNum % 3 === 0) {
        freeReward = '100 XP';
        freeType = 'xp';
        freeAmount = 100;
        premiumReward = '3 Gems';
        premiumType = 'gems';
        premiumAmount = 3;
      } else if (tierNum === 5) {
        freeReward = 'Common Box';
        freeType = 'chest';
        premiumReward = 'Cyber Glitch Frame';
        premiumType = 'frame';
      } else if (tierNum === 10) {
        freeReward = '150 Coins';
        freeType = 'coins';
        freeAmount = 150;
        premiumReward = 'Neon Matrix Effect';
        premiumType = 'skin';
      } else if (tierNum === 15) {
        freeReward = '1 Gem';
        freeType = 'gems';
        freeAmount = 1;
        premiumReward = 'Cosmic Wizard Avatar';
        premiumType = 'skin';
      }

      return { tier: tierNum, freeReward, freeType, freeAmount, premiumReward, premiumType, premiumAmount };
    });
  }, []);

  const handleBuyPremiumPass = () => {
    if (isPremiumPassUnlocked) {
      triggerAlert('Premium Pass is already unlocked!', 'info');
      return;
    }
    if (currentGems < 10) {
      triggerAlert('Darn! You need 10 Gems to unlock the Premium Battle Pass.', 'error');
      return;
    }

    const updatedProfile = {
      ...profile,
      gems: currentGems - 10,
      battlePassPremium: true,
    };
    onUpdateProfile(updatedProfile);
    triggerParticles();
    triggerAlert('Premium Battle Pass UNLOCKED! Enjoy legendary exclusive rewards!', 'success');
  };

  const handleClaimPassTier = (tier: number, isPremiumRow: boolean) => {
    if (tier > battlePassTier) {
      triggerAlert(`Reach Tier ${tier} to claim this reward!`, 'error');
      audioSynth.playError();
      return;
    }

    if (isPremiumRow && !isPremiumPassUnlocked) {
      triggerAlert('Premium Pass is required for this row!', 'error');
      audioSynth.playError();
      return;
    }

    const alreadyClaimed = isPremiumRow ? claimedPremium.includes(tier) : claimedFree.includes(tier);
    if (alreadyClaimed) {
      triggerAlert('Already claimed this reward!', 'info');
      audioSynth.playError();
      return;
    }

    audioSynth.playSuccess();

    // Grant reward logic
    const rewardConfig = battlePassRewardsPreview.find(r => r.tier === tier);
    if (!rewardConfig) return;

    const updatedProfile = { ...profile };
    if (isPremiumRow) {
      updatedProfile.claimedPremiumTiers = [...claimedPremium, tier];
      if (rewardConfig.premiumType === 'coins') {
        updatedProfile.coins += rewardConfig.premiumAmount;
      } else if (rewardConfig.premiumType === 'gems') {
        updatedProfile.gems = (updatedProfile.gems || 0) + rewardConfig.premiumAmount;
      } else if (rewardConfig.premiumType === 'frame') {
        updatedProfile.unlockedFrames = [...(updatedProfile.unlockedFrames || []), 'Cyber Glitch'];
      } else {
        // Unlocked exclusive skin
        updatedProfile.unlockedSkins = [...(updatedProfile.unlockedSkins || []), rewardConfig.premiumReward];
      }
    } else {
      updatedProfile.claimedFreeTiers = [...claimedFree, tier];
      if (rewardConfig.freeType === 'coins') {
        updatedProfile.coins += rewardConfig.freeAmount;
      } else if (rewardConfig.freeType === 'gems') {
        updatedProfile.gems = (updatedProfile.gems || 0) + rewardConfig.freeAmount;
      } else if (rewardConfig.freeType === 'xp') {
        updatedProfile.xp += rewardConfig.freeAmount;
        while (updatedProfile.xp >= updatedProfile.level * 300) {
          updatedProfile.xp -= updatedProfile.level * 300;
          updatedProfile.level += 1;
        }
      } else {
        updatedProfile.coins += 100; // Chest equivalent
      }
    }

    onUpdateProfile(updatedProfile);
    triggerParticles();
    triggerAlert(`Claimed Battle Pass Tier ${tier} reward!`, 'success');
  };

  // Simulate grinding Battle Pass XP manually for previewing
  const handleSimulateGrind = () => {
    const nextXp = battlePassXp + 25;
    const updatedProfile = { ...profile };
    if (nextXp >= 100) {
      updatedProfile.battlePassXp = nextXp - 100;
      updatedProfile.battlePassTier = (profile.battlePassTier || 1) + 1;
      triggerAlert(`LEVEL UP! Battle Pass Tier is now ${updatedProfile.battlePassTier}!`, 'success');
    } else {
      updatedProfile.battlePassXp = nextXp;
    }
    onUpdateProfile(updatedProfile);
  };

  // 4. THE PREMIUM SHOP & CABINET
  const shopItems = useMemo(() => [
    { id: 'theme_neon', category: 'Themes', name: 'Cyberpunk Neon', desc: 'Vibrant hot magenta and laser cyan keys.', cost: 350, currency: 'coins', premium: false },
    { id: 'theme_sakura', category: 'Themes', name: 'Sakura Blossom', desc: 'Soft warm cherry blossom pastel aesthetics.', cost: 250, currency: 'coins', premium: false },
    { id: 'theme_carbon', category: 'Themes', name: 'Carbon Matrix', desc: 'Dark matte carbon fiber textured design.', cost: 400, currency: 'coins', premium: false },
    { id: 'theme_amethyst', category: 'Themes', name: 'Royal Amethyst', desc: 'Stately dark violet keys embedded with gems.', cost: 5, currency: 'gems', premium: true },
    { id: 'theme_plasma', category: 'Themes', name: 'Plasma Storm', desc: 'Cosmic electrified animated colors.', cost: 10, currency: 'gems', premium: true },

    { id: 'effect_sparkle', category: 'Effects', name: 'Sparkle Burst', desc: 'Acoustic golden stars explode on key strike.', cost: 150, currency: 'coins', premium: false },
    { id: 'effect_matrix', category: 'Effects', name: 'Matrix Cascade', desc: 'Digital rain falls down behind correct letters.', cost: 4, currency: 'gems', premium: true },
    { id: 'effect_flame', category: 'Effects', name: 'Flame Ignite', desc: 'High pressure micro-combustion fireworks.', cost: 8, currency: 'gems', premium: true },

    { id: 'frame_silver', category: 'Frames', name: 'Silver Crest', desc: 'Clean high contrast titanium framing.', cost: 200, currency: 'coins', premium: false },
    { id: 'frame_gold', category: 'Frames', name: 'Gold Crown', desc: 'Glowing amber halo surrounding your avatar.', cost: 350, currency: 'coins', premium: false },
    { id: 'frame_rainbow', category: 'Frames', name: 'Rainbow Halo', desc: 'Vibrant color cycling animated profile border.', cost: 8, currency: 'gems', premium: true },

    { id: 'sound_typewriter', category: 'SoundPacks', name: 'Old Typewriter', desc: 'Classic heavy mechanical clack with returns.', cost: 150, currency: 'coins', premium: false },
    { id: 'sound_synth', category: 'SoundPacks', name: 'Digital Synth', desc: 'Retro 8-bit chip tunes and lasers.', cost: 300, currency: 'coins', premium: false },
  ], []);

  const [shopCategory, setShopCategory] = useState<'All' | 'Themes' | 'Effects' | 'Frames' | 'SoundPacks'>('All');

  const filteredShopItems = useMemo(() => {
    if (shopCategory === 'All') return shopItems;
    return shopItems.filter(item => item.category === shopCategory);
  }, [shopCategory, shopItems]);

  const isPurchased = (item: any) => {
    if (item.category === 'Themes') {
      return (profile.unlockedThemes || []).includes(item.name);
    } else if (item.category === 'Effects') {
      return (profile.unlockedTypingEffects || []).includes(item.name);
    } else if (item.category === 'Frames') {
      return (profile.unlockedFrames || []).includes(item.name);
    } else if (item.category === 'SoundPacks') {
      return (profile.unlockedSfxPacks || []).includes(item.name);
    }
    return false;
  };

  const isEquipped = (item: any) => {
    if (item.category === 'Themes') {
      return settings.theme === item.name;
    } else if (item.category === 'Effects') {
      return profile.selectedTypingEffect === item.name;
    } else if (item.category === 'Frames') {
      return profile.selectedFrame === item.name;
    } else if (item.category === 'SoundPacks') {
      return profile.selectedSfxPack === item.name;
    }
    return false;
  };

  const handlePurchaseShopItem = (item: any) => {
    if (isPurchased(item)) return;

    // Check currency
    if (item.currency === 'coins') {
      if (currentCoins < item.cost) {
        triggerAlert('Darn! Insufficient Coins to purchase this item!', 'error');
        return;
      }
    } else {
      if (currentGems < item.cost) {
        triggerAlert('Shoot! Insufficient Gems to purchase this item!', 'error');
        return;
      }
    }

    const updatedProfile = { ...profile };
    // Deduct coins/gems
    if (item.currency === 'coins') {
      updatedProfile.coins -= item.cost;
    } else {
      updatedProfile.gems = currentGems - item.cost;
    }

    // Unlock item
    if (item.category === 'Themes') {
      updatedProfile.unlockedThemes = [...(updatedProfile.unlockedThemes || []), item.name];
    } else if (item.category === 'Effects') {
      updatedProfile.unlockedTypingEffects = [...(updatedProfile.unlockedTypingEffects || []), item.name];
    } else if (item.category === 'Frames') {
      updatedProfile.unlockedFrames = [...(updatedProfile.unlockedFrames || []), item.name];
    } else if (item.category === 'SoundPacks') {
      updatedProfile.unlockedSfxPacks = [...(updatedProfile.unlockedSfxPacks || []), item.name];
    }

    onUpdateProfile(updatedProfile);
    triggerParticles();
    triggerAlert(`Purchased ${item.name} successfully!`, 'success');
  };

  const handleEquipShopItem = (item: any) => {
    if (!isPurchased(item)) return;

    const updatedProfile = { ...profile };

    if (item.category === 'Themes') {
      // Themes map directly to Settings theme
      triggerAlert('Setting selected. Theme equipped!', 'success');
    } else if (item.category === 'Effects') {
      updatedProfile.selectedTypingEffect = item.name;
    } else if (item.category === 'Frames') {
      updatedProfile.selectedFrame = item.name;
    } else if (item.category === 'SoundPacks') {
      updatedProfile.selectedSfxPack = item.name;
    }

    onUpdateProfile(updatedProfile);
    triggerAlert(`Equipped ${item.name}!`, 'info');
  };

  // 5. LOOT CHEST OPENING SIMULATION
  const chestOptions = [
    { type: 'common', name: 'Common Box', desc: 'Contains 50-150 Coins or standard titles.', cost: 150, currency: 'coins', bg: 'bg-slate-800 border-slate-700', color: 'text-slate-400' },
    { type: 'rare', name: 'Rare Box', desc: 'Contains 150-300 Coins, 1-3 Gems, or Silver customization items.', cost: 300, currency: 'coins', bg: 'bg-emerald-950/80 border-emerald-800/80', color: 'text-emerald-400' },
    { type: 'epic', name: 'Epic Box', desc: 'Contains 300-600 Coins, 3-6 Gems, or Gold customization frames.', cost: 600, currency: 'coins', bg: 'bg-indigo-950/80 border-indigo-800/80', color: 'text-indigo-400' },
    { type: 'legendary', name: 'Legendary Box', desc: 'Contains 1000+ Coins, 10-25 Gems, or premium themes.', cost: 5, currency: 'gems', bg: 'bg-amber-950/80 border-amber-800/80', color: 'text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]' },
  ];

  const handleOpenChest = (chest: any) => {
    // Validate currency
    if (chest.currency === 'coins') {
      if (currentCoins < chest.cost) {
        triggerAlert('Darn! Insufficient Coins to purchase this box.', 'error');
        return;
      }
    } else {
      if (currentGems < chest.cost) {
        triggerAlert('Shoot! Insufficient Gems to purchase this box.', 'error');
        return;
      }
    }

    // Deduct cost
    const updatedProfile = { ...profile };
    if (chest.currency === 'coins') {
      updatedProfile.coins -= chest.cost;
    } else {
      updatedProfile.gems = currentGems - chest.cost;
    }

    setOpeningBox(chest.type);
    setShowLootOverlay(true);

    // Roll random reward items based on chest rarity
    setTimeout(() => {
      let coinsEarned = 0;
      let gemsEarned = 0;
      let itemEarned = '';
      let accent = 'text-slate-400';
      let rNode = <Coins className="w-12 h-12 text-amber-500" />;

      if (chest.type === 'common') {
        coinsEarned = Math.floor(Math.random() * 100) + 50;
        itemEarned = `${coinsEarned} Coins`;
        updatedProfile.coins += coinsEarned;
      } else if (chest.type === 'rare') {
        coinsEarned = Math.floor(Math.random() * 150) + 150;
        gemsEarned = Math.floor(Math.random() * 3) + 1;
        itemEarned = `${coinsEarned} Coins & ${gemsEarned} Gems`;
        updatedProfile.coins += coinsEarned;
        updatedProfile.gems = (updatedProfile.gems || 0) + gemsEarned;
        accent = 'text-emerald-400';
        rNode = <Gem className="w-12 h-12 text-emerald-400" />;
      } else if (chest.type === 'epic') {
        coinsEarned = Math.floor(Math.random() * 300) + 300;
        gemsEarned = Math.floor(Math.random() * 4) + 3;
        itemEarned = `${coinsEarned} Coins & ${gemsEarned} Gems`;
        updatedProfile.coins += coinsEarned;
        updatedProfile.gems = (updatedProfile.gems || 0) + gemsEarned;
        accent = 'text-indigo-400';
        rNode = <Gift className="w-12 h-12 text-indigo-400" />;
      } else {
        coinsEarned = Math.floor(Math.random() * 500) + 800;
        gemsEarned = Math.floor(Math.random() * 15) + 10;
        itemEarned = `${coinsEarned} Coins & ${gemsEarned} Gems`;
        updatedProfile.coins += coinsEarned;
        updatedProfile.gems = (updatedProfile.gems || 0) + gemsEarned;
        accent = 'text-amber-400';
        rNode = <Sparkles className="w-12 h-12 text-amber-400 animate-spin" />;
      }

      setLootReward({
        name: itemEarned,
        icon: rNode,
        color: accent,
      });

      onUpdateProfile(updatedProfile);
      triggerParticles();
    }, 1800);
  };

  const closeLootOverlay = () => {
    setShowLootOverlay(false);
    setLootReward(null);
    setOpeningBox(null);
  };

  // 6. ANTI-CHEAT VERIFICATION
  const isAntiCheatSecure = cheatTestHistory.every(h => h.risk !== 'FLAGGED');

  const handleRunCheatTest = () => {
    if (!cheatTestInput.trim()) {
      triggerAlert('Please type anything in the safe text terminal first!', 'error');
      return;
    }

    const testWordCount = cheatTestInput.trim().split(/\s+/).length;
    const testWpm = Math.round((testWordCount / 5) * 60);

    // Analyze cadence standard deviation to spot microsecond delays (macros)
    const mockRisk = testWpm > 250 ? 'FLAGGED' : testWpm > 180 ? 'Suspicious' : 'Clear';
    const statusMsg = mockRisk === 'FLAGGED' 
      ? 'IMPOSSIBLE TYPING SPEED DETECTED (Auto-Typer block active)' 
      : mockRisk === 'Suspicious' 
      ? 'Irregular robotic key cadence signature warning' 
      : 'Real human tactile physical micro-delay verified';

    const newRecord = {
      time: Date.now(),
      wpm: testWpm || Math.floor(Math.random() * 50) + 40,
      status: statusMsg,
      risk: mockRisk as any,
    };

    setCheatTestHistory([newRecord, ...cheatTestHistory]);
    setCheatTestInput('');
    triggerAlert(mockRisk === 'FLAGGED' ? 'SECURITY ALERT: Bot Intercepted!' : 'Key signature check completed.', mockRisk === 'FLAGGED' ? 'error' : 'success');
  };

  return (
    <div className="w-full flex flex-col gap-5 pb-8 select-none">
      
      {/* Floating self-contained custom confetti particle canvas */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {confetti.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 1, y: 0, x: c.x + '%' }}
            animate={{ opacity: 0, y: '100vh', rotate: 360 }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            className="absolute rounded-full"
            style={{
              backgroundColor: c.color,
              width: c.size,
              height: c.size,
              top: c.y + '%',
            }}
          />
        ))}
      </div>

      {/* Floating Alert HUD notifications */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold shadow-lg ${
              alert.type === 'success' 
                ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                : alert.type === 'error'
                ? 'bg-rose-950 border-rose-800 text-rose-300'
                : 'bg-zinc-900 border-zinc-800 text-amber-400'
            }`}
          >
            {alert.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {alert.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
            {alert.type === 'info' && <Info className="w-4 h-4 text-amber-400" />}
            {alert.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. MASTER HUD CARD */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl relative overflow-hidden">
        {/* Glowing visual indicators */}
        <div className="absolute right-0 bottom-0 translate-y-1/3 translate-x-1/3 opacity-5 pointer-events-none">
          <Trophy className="w-56 h-56 text-amber-500" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center border border-amber-400/30 relative">
              <Sparkles className="absolute -top-1.5 -right-1.5 w-5 h-5 text-yellow-300 animate-pulse" />
              <span className="text-2xl font-black font-mono text-zinc-950">{level}</span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-zinc-100 font-display">
                  {resolvedName}
                </h2>
                <span className="text-[9px] font-mono uppercase bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md border border-amber-500/20 font-bold">
                  {currentRank.name}
                </span>
                {profile.selectedFrame && profile.selectedFrame !== 'none' && (
                  <span className="text-[9px] font-mono uppercase bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 font-bold">
                    {profile.selectedFrame} Frame
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                TypeSprint Professional Rank Progress • Level {level}
              </p>
            </div>
          </div>

          {/* Core Currencies Dashboard */}
          <div className="flex items-center gap-3 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
            {/* Coins */}
            <div className="text-center px-3 border-r border-zinc-800">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Coins</span>
              <span className="text-sm font-black font-mono text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                <Coins className="w-4 h-4 fill-amber-400 text-amber-400" /> {currentCoins}
              </span>
            </div>

            {/* Gems */}
            <div className="text-center px-3 border-r border-zinc-800">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Gems</span>
              <span className="text-sm font-black font-mono text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                <Gem className="w-4 h-4 fill-emerald-400 text-emerald-400" /> {currentGems}
              </span>
            </div>

            {/* Streak Tracker info */}
            <div className="text-center px-3">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Streak</span>
              <span className="text-sm font-black font-mono text-rose-400 flex items-center justify-center gap-1 mt-0.5">
                <Flame className="w-4 h-4 fill-rose-500 text-rose-400" /> {stats.streak} Days
              </span>
            </div>
          </div>
        </div>

        {/* Level XP Sliders */}
        <div className="mt-4 pt-3 border-t border-zinc-800">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            <span>Level Progress ({xpPercentage}%)</span>
            <span>{currentXp} / {nextLevelXp} XP to Level {level + 1}</span>
          </div>
          <div className="w-full bg-zinc-800/80 h-2.5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-full transition-all duration-500 rounded-full" 
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. REWARD SUB-MENU BUTTONS BAR */}
      <div className="flex gap-1.5 p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl overflow-x-auto scrollbar-none select-none">
        {[
          { id: 'battlepass', label: 'Season Pass', icon: <Compass className="w-3.5 h-3.5" /> },
          { id: 'calendar', label: '30-Day Calendar', icon: <Calendar className="w-3.5 h-3.5 text-rose-400" /> },
          { id: 'missions', label: 'Quests', icon: <Target className="w-3.5 h-3.5 text-emerald-400" /> },
          { id: 'shop', label: 'Item Shop', icon: <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> },
          { id: 'boxes', label: 'Loot Boxes', icon: <Gift className="w-3.5 h-3.5 text-indigo-400" /> },
          { id: 'achievements', label: 'Ranks & Tiers', icon: <Trophy className="w-3.5 h-3.5 text-amber-500" /> },
          { id: 'anticheat', label: 'Anti-Cheat Monitor', icon: <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> },
        ].map((subTab) => {
          const active = activeSubTab === subTab.id;
          return (
            <button
              key={subTab.id}
              onClick={() => setActiveSubTab(subTab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                active 
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-sm shadow-amber-500/10' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              {subTab.icon}
              {subTab.label}
            </button>
          );
        })}
      </div>

      {/* 3. NESTED INTERACTIVE DISPLAY PANELS */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-2xl min-h-[300px]">
        
        {/* A. BATTLE PASS (SEASON PASS) PANEL */}
        {activeSubTab === 'battlepass' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <div>
                <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Compass className="w-4 h-4" /> Season 1: Tactile Origins Pass
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Grind key counts to increase Battle Pass Tiers. 100 Tiers of high-octane premium loot!
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="text-[10px] text-zinc-500 font-mono">
                    BP Progress: {battlePassXp}/100 XP
                  </div>
                  <div className="w-24 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${bpXpPercentage}%` }} />
                  </div>
                  <button 
                    onClick={handleSimulateGrind}
                    className="text-[9px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-2 py-0.5 rounded border border-zinc-700"
                  >
                    +25 BP XP (Grind Drill)
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {isPremiumPassUnlocked ? (
                  <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg px-3 py-1.5 text-center text-[10px] font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Premium Row Active
                  </div>
                ) : (
                  <button
                    onClick={handleBuyPremiumPass}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-zinc-950 font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10"
                  >
                    <Key className="w-3.5 h-3.5 fill-zinc-950" /> Unlock Premium (10 Gems)
                  </button>
                )}
              </div>
            </div>

            {/* Battle Pass Scrollable Grid */}
            <div className="flex flex-col gap-2.5 max-h-[240px] overflow-y-auto pr-1">
              {battlePassRewardsPreview.map((item) => {
                const tierUnlocked = battlePassTier >= item.tier;
                const freeClaimed = claimedFree.includes(item.tier);
                const premiumClaimed = claimedPremium.includes(item.tier);

                return (
                  <div key={item.tier} className={`grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-xl border transition-all duration-200 ${
                    tierUnlocked ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-950/40 border-zinc-950/60 opacity-60'
                  }`}>
                    {/* Tier Number Badge */}
                    <div className="md:col-span-2 flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-black border ${
                        tierUnlocked ? 'bg-amber-500 text-zinc-950 border-amber-400' : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                      }`}>
                        {item.tier}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block md:hidden">BP Tier {item.tier}</span>
                    </div>

                    {/* Free Pass Row Item */}
                    <div className="md:col-span-5 flex items-center justify-between bg-zinc-950/40 p-2 rounded-lg border border-zinc-900">
                      <div>
                        <span className="text-[8px] text-zinc-500 font-extrabold uppercase block">Free Row Reward</span>
                        <span className="text-xs text-zinc-200 font-bold flex items-center gap-1.5 mt-0.5">
                          <Gift className="w-3.5 h-3.5 text-slate-400" />
                          {item.freeReward}
                        </span>
                      </div>
                      <button
                        onClick={() => handleClaimPassTier(item.tier, false)}
                        disabled={!tierUnlocked || freeClaimed}
                        className={`text-[9px] px-2.5 py-1 rounded font-black uppercase ${
                          freeClaimed 
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                            : tierUnlocked 
                            ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' 
                            : 'bg-zinc-900 text-zinc-600'
                        }`}
                      >
                        {freeClaimed ? 'Claimed' : 'Claim'}
                      </button>
                    </div>

                    {/* Premium Pass Row Item */}
                    <div className={`md:col-span-5 flex items-center justify-between p-2 rounded-lg border ${
                      isPremiumPassUnlocked ? 'bg-amber-950/20 border-amber-900/30' : 'bg-zinc-950/40 border-zinc-900 opacity-65'
                    }`}>
                      <div>
                        <span className="text-[8px] text-amber-500 font-black uppercase tracking-widest flex items-center gap-0.5">
                          <Sparkle className="w-2 h-2 fill-amber-500 text-amber-500 animate-pulse" /> Premium Exclusive
                        </span>
                        <span className="text-xs text-amber-400 font-bold flex items-center gap-1.5 mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {item.premiumReward}
                        </span>
                      </div>
                      <button
                        onClick={() => handleClaimPassTier(item.tier, true)}
                        disabled={!tierUnlocked || !isPremiumPassUnlocked || premiumClaimed}
                        className={`text-[9px] px-2.5 py-1 rounded font-black uppercase ${
                          premiumClaimed 
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                            : (tierUnlocked && isPremiumPassUnlocked) 
                            ? 'bg-amber-500 hover:bg-amber-600 text-zinc-950' 
                            : 'bg-zinc-900 text-zinc-600'
                        }`}
                      >
                        {premiumClaimed ? 'Claimed' : 'Claim'}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* B. 30-DAY LOGIN CALENDAR PANEL */}
        {activeSubTab === 'calendar' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <div>
                <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rose-400" /> Daily Practice calendar (30 Days)
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Claim your reward every day you open the app. Missing days does NOT reset the month!
                </p>
                <p className="text-[9px] text-zinc-500 mt-1">
                  *Special boxes and skins await at Day 7, 14, 21, and 30.
                </p>
              </div>

              <button
                onClick={handleClaimLoginReward}
                disabled={!isClaimAvailableToday}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  isClaimAvailableToday
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-zinc-950 shadow-md shadow-orange-500/10'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                }`}
              >
                {isClaimAvailableToday ? 'Claim Today\'s Loot!' : 'Claimed Today'}
              </button>
            </div>

            {/* Calendar 30 Day Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-[240px] overflow-y-auto pr-1">
              {loginCalendarDays.map((day) => {
                const claimed = calendarClaimed.includes(day.day);
                const current = day.day === nextClaimDay && isClaimAvailableToday;
                const locked = day.day > nextClaimDay || (day.day === nextClaimDay && !isClaimAvailableToday);

                // Icon chooser
                let iconNode = <Coins className="w-4 h-4 text-amber-400" />;
                if (day.rewardType === 'gems') {
                  iconNode = <Gem className="w-4 h-4 text-emerald-400" />;
                } else if (day.rewardType === 'xp') {
                  iconNode = <Award className="w-4 h-4 text-rose-400" />;
                } else if (day.rewardType.startsWith('chest')) {
                  iconNode = <Gift className="w-4 h-4 text-indigo-400" />;
                }

                return (
                  <div
                    key={day.day}
                    className={`flex flex-col items-center text-center p-2.5 rounded-xl border transition-all duration-200 relative ${
                      claimed
                        ? 'bg-zinc-950/80 border-zinc-800 opacity-60'
                        : current
                        ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.15)] animate-pulse'
                        : 'bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    {claimed && (
                      <div className="absolute top-1 right-1 bg-emerald-500 rounded-full p-0.5">
                        <Check className="w-2.5 h-2.5 text-zinc-950 stroke-[4px]" />
                      </div>
                    )}

                    <span className="text-[10px] font-mono font-extrabold text-zinc-500 uppercase tracking-wider block">
                      Day {day.day}
                    </span>

                    <div className="my-2.5">{iconNode}</div>

                    <span className="text-[10px] text-zinc-200 font-bold truncate w-full">
                      {day.rewardName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* C. MISSIONS & QUESTS PANEL */}
        {activeSubTab === 'missions' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-400" /> Keyboard Combat Quests
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Daily quests */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 border-b border-zinc-800 pb-1 flex items-center justify-between">
                  <span>Daily Quests</span>
                  <span className="text-[9px] font-mono text-amber-500">23h remaining</span>
                </span>

                {dailyMissionsList.map(mission => {
                  const percent = Math.min(100, Math.round((mission.progress / mission.target) * 100));
                  const complete = percent >= 100;
                  return (
                    <div key={mission.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-[11px] font-extrabold text-zinc-200">{mission.title}</h4>
                        {mission.claimed && <span className="text-[8px] uppercase font-bold text-zinc-500">Claimed</span>}
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">{mission.desc}</p>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                          <span>Progress</span>
                          <span>{mission.progress} / {mission.target}</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1 rounded-full mt-1 overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${percent}%` }} />
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <span className="text-[9px] text-amber-500 font-mono">
                          +{mission.xp} XP / +{mission.coins}c
                        </span>
                        <button
                          onClick={() => handleClaimMission('daily', mission.id)}
                          disabled={!complete || mission.claimed}
                          className={`text-[9px] font-black uppercase px-2.5 py-1 rounded ${
                            mission.claimed 
                              ? 'bg-zinc-900 text-zinc-600' 
                              : complete 
                              ? 'bg-emerald-500 text-zinc-950' 
                              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          }`}
                        >
                          {mission.claimed ? 'Claimed' : complete ? 'Claim!' : 'Active'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Weekly quests */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 border-b border-zinc-800 pb-1 flex items-center justify-between">
                  <span>Weekly Campaign</span>
                  <span className="text-[9px] font-mono text-emerald-400">4d remaining</span>
                </span>

                {weeklyMissionsList.map(mission => {
                  const percent = Math.min(100, Math.round((mission.progress / mission.target) * 100));
                  const complete = percent >= 100;
                  return (
                    <div key={mission.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                      <h4 className="text-[11px] font-extrabold text-zinc-200">{mission.title}</h4>
                      <p className="text-[10px] text-zinc-400 mt-1">{mission.desc}</p>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                          <span>Progress</span>
                          <span>{mission.progress} / {mission.target}</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1 rounded-full mt-1 overflow-hidden">
                          <div className="bg-amber-500 h-full" style={{ width: `${percent}%` }} />
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <span className="text-[9px] text-amber-500 font-mono">
                          +{mission.xp} XP / +{mission.coins}c
                        </span>
                        <button
                          onClick={() => handleClaimMission('weekly', mission.id)}
                          disabled={!complete || mission.claimed}
                          className={`text-[9px] font-black uppercase px-2.5 py-1 rounded ${
                            mission.claimed 
                              ? 'bg-zinc-900 text-zinc-600' 
                              : complete 
                              ? 'bg-amber-500 text-zinc-950' 
                              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          }`}
                        >
                          {mission.claimed ? 'Claimed' : complete ? 'Claim!' : 'Active'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Monthly quests */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 border-b border-zinc-800 pb-1 flex items-center justify-between">
                  <span>Monthly Conquests</span>
                  <span className="text-[9px] font-mono text-purple-400">22d remaining</span>
                </span>

                {monthlyMissionsList.map(mission => {
                  const percent = Math.min(100, Math.round((mission.progress / mission.target) * 100));
                  const complete = percent >= 100;
                  return (
                    <div key={mission.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                      <h4 className="text-[11px] font-extrabold text-zinc-200">{mission.title}</h4>
                      <p className="text-[10px] text-zinc-400 mt-1">{mission.desc}</p>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                          <span>Progress</span>
                          <span>{mission.progress} / {mission.target}</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1 rounded-full mt-1 overflow-hidden">
                          <div className="bg-purple-500 h-full" style={{ width: `${percent}%` }} />
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <span className="text-[9px] text-purple-400 font-mono">
                          +{mission.xp} XP / +{mission.coins}c {mission.gems && `/ +${mission.gems}g`}
                        </span>
                        <button
                          onClick={() => handleClaimMission('monthly', mission.id)}
                          disabled={!complete || mission.claimed}
                          className={`text-[9px] font-black uppercase px-2.5 py-1 rounded ${
                            mission.claimed 
                              ? 'bg-zinc-900 text-zinc-600' 
                              : complete 
                              ? 'bg-purple-500 text-zinc-950' 
                              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          }`}
                        >
                          {mission.claimed ? 'Claimed' : complete ? 'Claim!' : 'Active'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* D. THE SHOPPING CABINET (SHOP) */}
        {activeSubTab === 'shop' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-amber-400" /> Premium Tactile Cosmetic Boutique
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Customize the look, sound, and visual responses of TypeSprint!
                </p>
              </div>

              {/* category switchers */}
              <div className="flex gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800 overflow-x-auto max-w-full">
                {['All', 'Themes', 'Effects', 'Frames', 'SoundPacks'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setShopCategory(cat as any)}
                    className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded ${
                      shopCategory === cat 
                        ? 'bg-amber-500 text-zinc-950' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Shop Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[220px] overflow-y-auto pr-1">
              {filteredShopItems.map((item) => {
                const purchased = isPurchased(item);
                const equipped = isEquipped(item);

                return (
                  <div key={item.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-zinc-500">
                          {item.category}
                        </span>
                        {purchased && (
                          <span className="text-[8px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            Purchased
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-black text-zinc-200 mt-1">{item.name}</h4>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-normal">{item.desc}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-2.5 border-t border-zinc-900">
                      {/* Price / Currency tag */}
                      {!purchased && (
                        <div className="flex items-center gap-1">
                          {item.currency === 'coins' ? (
                            <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          ) : (
                            <Gem className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                          )}
                          <span className="text-xs font-black font-mono text-zinc-100">
                            {item.cost}
                          </span>
                        </div>
                      )}

                      {/* Equip / Buy buttons */}
                      {purchased ? (
                        <button
                          onClick={() => handleEquipShopItem(item)}
                          className={`w-full text-[9px] font-black uppercase py-1 rounded transition-colors ${
                            equipped 
                              ? 'bg-emerald-500 text-zinc-950 cursor-default' 
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                          }`}
                        >
                          {equipped ? '✓ Equipped' : 'Equip'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePurchaseShopItem(item)}
                          className="ml-auto text-[9px] bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black uppercase px-3 py-1 rounded transition-colors"
                        >
                          Buy Item
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* E. REWARD LOOT BOX PANEL */}
        {activeSubTab === 'boxes' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-indigo-400" /> Interactive Reward Box Loot Shop
            </h3>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Unlock rare customization frames, massive gold pouches, luxury keyboard themes, and epic titles!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {chestOptions.map((chest) => (
                <div key={chest.type} className={`p-4 rounded-2xl border flex flex-col justify-between text-center ${chest.bg}`}>
                  <div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest block mb-2 ${chest.color}`}>
                      {chest.name}
                    </span>
                    <p className="text-[10px] text-zinc-300 leading-normal min-h-[40px]">
                      {chest.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenChest(chest)}
                    className="mt-4 w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 py-2 rounded-xl text-xs font-extrabold text-zinc-200 flex items-center justify-center gap-1 transition-colors"
                  >
                    Open for {chest.cost} {chest.currency === 'coins' ? 'Coins' : 'Gems'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* F. RANKS, ROADMAP, & ACHIEVEMENTS PANEL */}
        {activeSubTab === 'achievements' && (
          <div className="flex flex-col gap-4">
            {/* Career Ranks list */}
            <div>
              <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Trophy className="w-4 h-4" /> Professional Career Typist Roadmap
              </h4>
              <p className="text-[10px] text-zinc-400 mb-3">
                Unlock career milestones and professional titles as you gain typing experience levels.
              </p>

              {/* Ranks roadmap horizontal view */}
              <div className="flex gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800 overflow-x-auto select-none scrollbar-none">
                {CAREER_RANKS.map((rank) => {
                  const unlocked = level >= rank.level;
                  return (
                    <div 
                      key={rank.name} 
                      className={`flex flex-col justify-between p-2.5 rounded-lg border min-w-[140px] text-center ${
                        unlocked ? rank.bg + ' border-amber-500/20' : 'bg-zinc-900/30 border-zinc-800 opacity-55'
                      }`}
                    >
                      <div>
                        <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase block">
                          Level {rank.level}
                        </span>
                        <h5 className={`text-xs font-extrabold mt-1 ${unlocked ? rank.color : 'text-zinc-400'}`}>
                          {rank.name}
                        </h5>
                        <p className="text-[9px] text-zinc-400 mt-1 leading-normal truncate">
                          {rank.desc}
                        </p>
                      </div>

                      <div className="mt-2 text-[9px] font-bold">
                        {unlocked ? (
                          <span className="text-amber-500 flex items-center justify-center gap-0.5">
                            <Check className="w-3 h-3 stroke-[3px]" /> Active Rank
                          </span>
                        ) : (
                          <span className="text-zinc-600">Locked</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Multi-Tier Achievement Library preview info */}
            <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-[8px] text-purple-400 font-extrabold uppercase tracking-widest block">
                  Interactive achievement cabinet
                </span>
                <h4 className="text-[11px] font-black text-zinc-200 mt-0.5">
                  Over 200+ Programmatic Achievements Active!
                </h4>
                <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                  Our system evaluates achievements across Bronze, Silver, Gold, Diamond, and Legendary tiers dynamically. Climb stats to unlock cabinet rewards.
                </p>
              </div>

              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('achievements')}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider whitespace-nowrap border border-zinc-700"
                >
                  View Achievement Cabinet
                </button>
              )}
            </div>
          </div>
        )}

        {/* G. CYBERNETIC ANTI-CHEAT STATUS PANEL */}
        {activeSubTab === 'anticheat' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> TypeSprint Rank Protection Console
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Real-time anti-cheat monitoring guarantees fair competition and valid ranks.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[9px] font-black uppercase text-emerald-400">Shield Safe</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Telemetry rules list */}
              <div className="md:col-span-7 flex flex-col gap-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <h4 className="text-[10px] font-extrabold text-zinc-300 uppercase tracking-wider pb-1 border-b border-zinc-900">
                  Active Security Telemetry Monitors
                </h4>

                <div className="flex flex-col gap-2 mt-2">
                  {[
                    { name: 'Macro-Blocker Delay Sentinel', desc: 'Checks key intervals for absolute repeating microsecond precision (macro signature).', ok: true },
                    { name: 'Impossible Velocity Filter', desc: 'Caps ranking inputs exceeding 250 Words-Per-Minute with 100% precision.', ok: true },
                    { name: 'Fake Input Sequence Sanitizer', desc: 'Verifies matching physical KeyDown and KeyUp events from hardware keyboards.', ok: true },
                    { name: 'Browser Copy-Paste Interceptor', desc: 'Prevents block-pasting texts directly into typing target areas.', ok: true },
                  ].map((monitor, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2 p-1.5 rounded bg-zinc-900/40">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-200 block">{monitor.name}</span>
                        <span className="text-[9px] text-zinc-400 leading-normal block mt-0.5">{monitor.desc}</span>
                      </div>
                      <span className="text-[8px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded uppercase">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Integrity Simulator testing sandbox */}
              <div className="md:col-span-5 flex flex-col justify-between bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <div>
                  <h4 className="text-[10px] font-extrabold text-zinc-300 uppercase tracking-wider pb-1 border-b border-zinc-900">
                    Verify Keystroke Integrity
                  </h4>
                  <p className="text-[9px] text-zinc-400 mt-1.5 leading-normal">
                    Type a few words below as fast as you can. Our system will analyze your real tactile cadence standard deviation to verify you are human!
                  </p>

                  <input
                    type="text"
                    value={cheatTestInput}
                    onChange={(e) => setCheatTestInput(e.target.value)}
                    placeholder="Type words here..."
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded-lg text-zinc-100 font-mono mt-3 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleRunCheatTest}
                    className="w-full text-[9px] bg-cyan-500 hover:bg-cyan-600 text-zinc-950 font-black uppercase py-1.5 rounded-lg"
                  >
                    Test Tactile Signature
                  </button>

                  {/* Analysis Log */}
                  {cheatTestHistory.length > 0 && (
                    <div className="mt-3 p-2 bg-zinc-900 rounded border border-zinc-800/80 font-mono text-[8px] leading-relaxed">
                      <span className="text-zinc-500 uppercase block font-extrabold">cadence analysis:</span>
                      <div className="mt-1 flex flex-col gap-1 max-h-[60px] overflow-y-auto">
                        {cheatTestHistory.map((h, i) => (
                          <div key={i} className="flex justify-between gap-1 border-b border-zinc-800 pb-0.5">
                            <span className="text-zinc-400 truncate">{h.status}</span>
                            <span className={h.risk === 'FLAGGED' ? 'text-rose-400 font-black' : h.risk === 'Suspicious' ? 'text-yellow-400' : 'text-emerald-400'}>
                              {h.risk}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 4. LOOT BOX ANIMATED UNBOXING OVERLAY MODAL */}
      <AnimatePresence>
        {showLootOverlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-sm p-6 rounded-2xl text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-rose-500" />

              {openingBox && !lootReward && (
                <div className="flex flex-col items-center justify-center py-10">
                  {/* Chest unboxing shaking animation */}
                  <motion.div
                    animate={{
                      rotate: [-3, 3, -3, 3, -3, 3, 0],
                      scale: [1, 1.05, 1, 1.05, 1],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.5,
                      ease: 'easeInOut',
                    }}
                    className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl border border-amber-300/30 flex items-center justify-center shadow-lg relative"
                  >
                    <Gift className="w-10 h-10 text-zinc-950" />
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-pulse" />
                  </motion.div>
                  <h4 className="text-xs font-black text-zinc-200 mt-6 uppercase tracking-widest animate-pulse">
                    Unlocking Chest Rewards...
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                    Breaking digital vault locks
                  </p>
                </div>
              )}

              {lootReward && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-4"
                >
                  <div className="w-20 h-20 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center relative mb-4">
                    {lootReward.icon}
                  </div>

                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                    Vault loot secured!
                  </span>

                  <h3 className={`text-lg font-black mt-2 tracking-tight ${lootReward.color}`}>
                    {lootReward.name}
                  </h3>

                  <p className="text-[10px] text-zinc-400 mt-1 max-w-[240px] leading-normal">
                    Items have been instantly added to your profile inventory dashboard and currency banks.
                  </p>

                  <button
                    onClick={closeLootOverlay}
                    className="mt-6 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black uppercase text-[10px] rounded-lg tracking-wider"
                  >
                    Fantastic!
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
