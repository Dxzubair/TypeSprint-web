import React from 'react';

/* v8 ignore start */


interface VirtualKeyboardProps {
  layout: 'QWERTY' | 'QWERTZ' | 'AZERTY' | 'COLEMAK' | 'DVORAK';
  activeKeys: Set<string>; // Keys currently being held down
  nextKey: string | null;   // The character the user is supposed to type next
  showFingerGuide: boolean;
  lastTypedStatus?: { key: string; status: 'correct' | 'incorrect'; timestamp: number } | null;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  layout,
  activeKeys,
  nextKey,
  showFingerGuide,
  lastTypedStatus,
}) => {
  // Map keyboard rows
  const getRows = () => {
    switch (layout) {
      case 'COLEMAK':
        return [
          ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
          ['Tab', 'Q', 'W', 'F', 'P', 'G', 'J', 'L', 'U', 'Y', ';', '[', ']', '\\'],
          ['Caps', 'A', 'R', 'S', 'T', 'D', 'H', 'N', 'E', 'I', 'O', "'", 'Enter'],
          ['Shift_L', 'Z', 'X', 'C', 'V', 'B', 'K', 'M', ',', '.', '/', 'Shift_R'],
          ['Ctrl_L', 'Win', 'Alt_L', 'Space', 'Alt_R', 'Fn', 'Ctrl_R']
        ];
      case 'DVORAK':
        return [
          ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '[', ']', 'Backspace'],
          ['Tab', "'", ',', '.', 'P', 'Y', 'F', 'G', 'C', 'R', 'L', '/', '=', '\\'],
          ['Caps', 'A', 'O', 'E', 'U', 'I', 'D', 'H', 'T', 'N', 'S', '-', 'Enter'],
          ['Shift_L', ';', 'Q', 'J', 'K', 'X', 'B', 'M', 'W', 'V', 'Z', 'Shift_R'],
          ['Ctrl_L', 'Win', 'Alt_L', 'Space', 'Alt_R', 'Fn', 'Ctrl_R']
        ];
      case 'QWERTZ':
        return [
          ['^', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'ß', '´', 'Backspace'],
          ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ü', '*', '+'],
          ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ö', 'Ä', '#', 'Enter'],
          ['Shift_L', '<', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '-', 'Shift_R'],
          ['Ctrl_L', 'Win', 'Alt_L', 'Space', 'Alt_R', 'Fn', 'Ctrl_R']
        ];
      case 'AZERTY':
        return [
          ['²', '&', 'é', '"', "'", '(', '-', 'è', '_', 'ç', 'à', ')', '=', 'Backspace'],
          ['Tab', 'A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '^', '$', '*'],
          ['Caps', 'Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', '%', 'µ', 'Enter'],
          ['Shift_L', '<', 'W', 'X', 'C', 'V', 'B', 'N', '?', ',', ';', ':', '!', 'Shift_R'],
          ['Ctrl_L', 'Win', 'Alt_L', 'Space', 'Alt_R', 'Fn', 'Ctrl_R']
        ];
      case 'QWERTY':
      default:
        return [
          ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
          ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
          ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
          ['Shift_L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift_R'],
          ['Ctrl_L', 'Win', 'Alt_L', 'Space', 'Alt_R', 'Fn', 'Ctrl_R']
        ];
    }
  };

  // Determine finger associated with each key for touch-typing color guide
  const getFingerClass = (key: string) => {
    if (!showFingerGuide) return 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200';

    const normalized = key.toUpperCase();

    // Left Pinky
    if (['1', 'Q', 'A', 'Z', 'TAB', 'CAPS', 'SHIFT_L', 'CTRL_L', '`', '²', '&', 'W', '<', '^'].includes(normalized)) {
      return 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-900';
    }
    // Left Ring
    if (['2', 'W', 'S', 'X', 'É', 'Z'].includes(normalized)) {
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900';
    }
    // Left Middle
    if (['3', 'E', 'D', 'C', '"'].includes(normalized)) {
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
    }
    // Left Index
    if (['4', '5', 'R', 'T', 'F', 'G', 'V', 'B', "'", '(', 'E'].includes(normalized)) {
      return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900';
    }
    // Thumbs (Space)
    if (normalized === 'SPACE') {
      return 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-900';
    }
    // Right Index
    if (['6', '7', 'Y', 'U', 'H', 'J', 'N', 'M', '-', 'È', 'Y', '_'].includes(normalized)) {
      return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900';
    }
    // Right Middle
    if (['8', 'I', 'K', ',', 'Ç', ';'].includes(normalized)) {
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
    }
    // Right Ring
    if (['9', 'O', 'L', '.', 'À', ':'].includes(normalized)) {
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900';
    }
    // Right Pinky (default rest)
    return 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-900';
  };

  // Label display mapping for control keys
  const getKeyLabel = (key: string) => {
    if (key === 'Shift_L' || key === 'Shift_R') return 'Shift';
    if (key === 'Ctrl_L' || key === 'Ctrl_R') return 'Ctrl';
    if (key === 'Alt_L') return 'Alt';
    if (key === 'Alt_R') return 'AltGr';
    return key;
  };

  // Determine width weight for specific control keys in Tailwind flex layout
  const getKeyWidthClass = (key: string) => {
    switch (key) {
      case 'Backspace':
        return 'w-16 md:w-20';
      case 'Tab':
        return 'w-14 md:w-16';
      case 'Caps':
        return 'w-16 md:w-18';
      case 'Enter':
        return 'w-18 md:w-22';
      case 'Shift_L':
        return 'w-18 md:w-24';
      case 'Shift_R':
        return 'w-20 md:w-28';
      case 'Space':
        return 'flex-grow min-w-[150px] md:min-w-[250px]';
      case 'Ctrl_L':
      case 'Ctrl_R':
      case 'Alt_L':
      case 'Alt_R':
      case 'Win':
      case 'Fn':
        return 'w-10 md:w-12';
      default:
        return 'w-8 h-8 md:w-11 md:h-11';
    }
  };

  const rows = getRows();

  // Match typing criteria with key names
  const isTargetKey = (key: string): boolean => {
    if (!nextKey) return false;
    
    const target = nextKey.toUpperCase();
    const current = key.toUpperCase();

    if (target === ' ' && current === 'SPACE') return true;
    if (target === '\n' && current === 'ENTER') return true;
    if (target === 'BACKSPACE' && current === 'BACKSPACE') return true;
    
    // Check if target matches shift modifier or AZERTY accent
    if (current === target) return true;
    if (current === 'SHIFT_L' || current === 'SHIFT_R') {
      // Highlight shift key if target is uppercase or a special upper symbol
      const needsShift = nextKey && nextKey !== nextKey.toLowerCase() && nextKey.match(/[A-Z!@#$%^&*()_+{}|:"<>?~`]/);
      return !!needsShift;
    }

    return false;
  };

  const getGlowStatus = (key: string): 'correct' | 'incorrect' | null => {
    if (!lastTypedStatus) return null;
    
    // Only glow keys for 250ms
    const age = Date.now() - lastTypedStatus.timestamp;
    if (age > 250) return null;

    const target = lastTypedStatus.key.toUpperCase();
    const current = key.toUpperCase();

    const isMatch = 
      (target === current) ||
      (target === ' ' && current === 'SPACE') ||
      (target === 'ENTER' && current === 'ENTER') ||
      (target === '\n' && current === 'ENTER') ||
      (target === 'BACKSPACE' && current === 'BACKSPACE') ||
      (target === 'SHIFT' && (current === 'SHIFT_L' || current === 'SHIFT_R')) ||
      (target === 'CONTROL' && (current === 'CTRL_L' || current === 'CTRL_R')) ||
      (target === 'ALT' && current === 'ALT_L');

    return isMatch ? lastTypedStatus.status : null;
  };

  const isActiveKey = (key: string): boolean => {
    const current = key.toUpperCase();
    if (activeKeys.has(current)) return true;
    if (current === 'SPACE' && activeKeys.has(' ')) return true;
    if (current === 'ENTER' && activeKeys.has('ENTER')) return true;
    if (current === 'SHIFT_L' && activeKeys.has('SHIFT')) return true;
    if (current === 'SHIFT_R' && activeKeys.has('SHIFT')) return true;
    if (current === 'CTRL_L' && activeKeys.has('CONTROL')) return true;
    if (current === 'CTRL_R' && activeKeys.has('CONTROL')) return true;
    if (current === 'ALT_L' && activeKeys.has('ALT')) return true;
    return false;
  };

  return (
    <div className="flex flex-col gap-1 md:gap-1.5 p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-inner border border-slate-100 dark:border-zinc-800 w-full overflow-x-auto select-none">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 md:gap-1.5 w-full">
          {row.map((key, keyIndex) => {
            const active = isActiveKey(key);
            const target = isTargetKey(key);
            const glowStatus = getGlowStatus(key);
            const fingerColor = getFingerClass(key);
            const widthClass = getKeyWidthClass(key);

            let borderAndBg = fingerColor + ' border dark:border-zinc-700/80';
            let animationClass = '';

            if (active) {
              // Highlight actively held keys - Pressed keys animate down/shrink
              borderAndBg = 'bg-primary-500 text-white border-primary-600 dark:bg-amber-500 dark:text-zinc-950 dark:border-amber-600 font-bold scale-90 translate-y-[1px] shadow-inner';
            } else if (glowStatus === 'correct') {
              // Correct keys briefly glow green
              borderAndBg = 'bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-500 dark:text-zinc-950 dark:border-emerald-600 font-bold ring-2 ring-emerald-300 dark:ring-emerald-400/50 scale-105';
            } else if (glowStatus === 'incorrect') {
              // Wrong keys flash red
              borderAndBg = 'bg-rose-500 text-white border-rose-600 dark:bg-rose-500 dark:text-white dark:border-rose-600 font-bold ring-2 ring-rose-400 dark:ring-rose-500/50 scale-105';
              animationClass = 'animate-shake';
            } else if (target) {
              // The key that should be pressed next glows orange
              borderAndBg = 'bg-orange-500 text-white border-orange-600 dark:bg-orange-500 dark:text-zinc-950 dark:border-orange-600 font-bold animate-pulse ring-2 ring-orange-300 dark:ring-orange-500/50 scale-105';
            }

            return (
              <div
                id={`vkey_${key}`}
                key={keyIndex}
                className={`
                  ${widthClass} h-8 md:h-11 rounded-lg flex items-center justify-center text-[10px] md:text-xs font-semibold shadow-sm transition-all duration-100 capitalize
                  ${borderAndBg} ${animationClass}
                `}
              >
                {getKeyLabel(key)}
              </div>
            );
          })}
        </div>
      ))}
      
      {showFingerGuide && nextKey && (
        <div className="mt-2 text-center text-xs text-slate-500 dark:text-zinc-400 font-medium">
          Target Key: <span className="font-bold text-slate-800 dark:text-zinc-200 font-mono">"{nextKey === ' ' ? 'Space' : nextKey === '\n' ? 'Enter' : nextKey}"</span>
        </div>
      )}
    </div>
  );
};


/* v8 ignore stop */
