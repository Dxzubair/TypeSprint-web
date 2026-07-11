import { Lesson } from '../types';

export const LESSONS: Lesson[] = [
  // HOME ROW
  {
    id: 'home_row_1',
    title: 'The Core Keys (F, J, D, K)',
    description: 'Learn index and middle finger positioning on the home row.',
    category: 'home_row',
    targetKeys: ['f', 'j', 'd', 'k'],
    texts: [
      'f j d k f j d k ff jj dd kk fd jk df kj',
      'fdfd jkjk dfdf kjkj fjd fjd kdk kdk fjdk',
      'f j d k d k j f ff jj dd kk fd jk fjdk dkfj'
    ],
    difficulty: 'Beginner'
  },
  {
    id: 'home_row_2',
    title: 'Full Home Row (A, S, L, ;)',
    description: 'Add your ring and pinky fingers to complete the basic home row stance.',
    category: 'home_row',
    targetKeys: ['a', 's', 'l', ';', 'f', 'j', 'd', 'k'],
    texts: [
      'a s d f j k l ; as df jk l; asdf jkl;',
      'a ; s l d k f j a; sl dk fj asdf jkl;',
      'fad lad sad dad ask fall flask salad dallas'
    ],
    difficulty: 'Beginner'
  },
  {
    id: 'home_row_3',
    title: 'Home Row Stretch (G, H)',
    description: 'Extend your index fingers inward to master the G and H keys.',
    category: 'home_row',
    targetKeys: ['g', 'h', 'a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
    texts: [
      'f g j h fg jh f g j h fg jh gh hg fg jh',
      'has glad shad flag half flash gash dash gh',
      'glass salad flask glad dad ask dallas flags'
    ],
    difficulty: 'Beginner'
  },

  // TOP ROW
  {
    id: 'top_row_1',
    title: 'Top Row Index & Middle (R, U, E, I)',
    description: 'Stretch upward with your strongest fingers.',
    category: 'top_row',
    targetKeys: ['r', 'u', 'e', 'i', 'f', 'j', 'd', 'k'],
    texts: [
      'f r j u d e k i fr ju de ki frju deki',
      'rude ride dire duke rude rude fire user',
      'red rug rid kid due rue did kid ill ruff'
    ],
    difficulty: 'Beginner'
  },
  {
    id: 'top_row_2',
    title: 'Top Row Ring & Pinky (W, O, Q, P)',
    description: 'Train the trickier outer stretches on the top row.',
    category: 'top_row',
    targetKeys: ['w', 'o', 'q', 'p', 'a', 's', 'l', ';'],
    texts: [
      'a q s w l o ; p aq sw lo ;p aqsw lo;p',
      'pow wool slow loop plow spill sold pool',
      'quad quit quiet quick low row pass wasp'
    ],
    difficulty: 'Intermediate'
  },
  {
    id: 'top_row_3',
    title: 'Top Row Complete (T, Y)',
    description: 'Add the middle-stretch keys T and Y to your repertoire.',
    category: 'top_row',
    targetKeys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    texts: [
      'f t j y ft jy f t j y ft jy ty yt rtyu',
      'type toy your try rout pity wire write write',
      'pretty yellow quiet power output utility'
    ],
    difficulty: 'Intermediate'
  },

  // BOTTOM ROW
  {
    id: 'bottom_row_1',
    title: 'Bottom Row Right (M, N, , , .)',
    description: 'Stretch downward to the right side of the bottom row.',
    category: 'bottom_row',
    targetKeys: ['m', 'n', ',', '.', 'j', 'k', 'l'],
    texts: [
      'j m k , l . jm k, l. j m k , l . jm k, l.',
      'men run map sun pen fun mind plan line.',
      'some more milk. mine and yours. mom runs.'
    ],
    difficulty: 'Intermediate'
  },
  {
    id: 'bottom_row_2',
    title: 'Bottom Row Left (V, C, X, Z)',
    description: 'Master the complex left-hand downward stretches.',
    category: 'bottom_row',
    targetKeys: ['v', 'c', 'x', 'z', 'f', 'd', 's', 'a'],
    texts: [
      'f v d c s x a z fv dc sx az fvdc sxaz',
      'cave zero wax zebra voice exact scale zoo',
      'box size flex zero voice excess civic buzz'
    ],
    difficulty: 'Intermediate'
  },

  // NUMBERS & SYMBOLS
  {
    id: 'numbers_1',
    title: 'Numbers Stretches',
    description: 'Reach up to the top numeric row accurately.',
    category: 'numbers',
    targetKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    texts: [
      '1 2 3 4 5 6 7 8 9 0 12 34 56 78 90',
      'year 1995, code 404, page 320, route 66',
      'count 503, level 99, 12345, 67890, 2026'
    ],
    difficulty: 'Intermediate'
  },
  {
    id: 'symbols_1',
    title: 'Common Symbols',
    description: 'Practice the modifier keys and symbols commonly used in tech.',
    category: 'symbols',
    targetKeys: ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '{', '}'],
    texts: [
      '#hashtag @mention $100 &co *star (parenthesis)',
      'x + y = z, a - b = c, { curly brackets }',
      'system_status = true; !!check_count && (items > 0)'
    ],
    difficulty: 'Advanced'
  },

  // COMMON WORDS & SENTENCES
  {
    id: 'common_words_1',
    title: 'Frequent Word Drills',
    description: 'Typing the most common English words to build muscle memory.',
    category: 'common_words',
    targetKeys: [],
    texts: [
      'the of and to in is you that it he was for on are as with his they',
      'at be this have from or one had by word but not what all were we when',
      'your can said there use an each which she do how their if will up other'
    ],
    difficulty: 'Beginner'
  },
  {
    id: 'sentences_1',
    title: 'Classic Typing Sentences',
    description: 'Real sentence training with capitalization and simple punctuation.',
    category: 'sentences',
    targetKeys: [],
    texts: [
      'The quick brown fox jumps over the lazy dog.',
      'Pack my box with five dozen liquor jugs.',
      'Jinxed wizards pluck ivy from the big quilt.'
    ],
    difficulty: 'Intermediate'
  },

  // PARAGRAPHS
  {
    id: 'paragraphs_1',
    title: 'Technology & Typing',
    description: 'Type continuous paragraph prose with professional vocabulary.',
    category: 'paragraphs',
    targetKeys: [],
    texts: [
      'A physical keyboard connected to a smartphone transforms it from a consumption device into a high-octane workspace. Real tactile keys allow the fingers to fly with microsecond latency, bypassing visual screen checking. By keeping the full screen available, writers, programmers, and students can compose paragraphs with speed and precision.',
      'To master high-speed typing, consistency is far more important than momentary bursts of speed. Keep your wrists hovering slightly above the table, your back aligned, and use all ten fingers in their dedicated zones. Accurate typing builds fluid rhythm, which eventually yields effortless velocity.'
    ],
    difficulty: 'Advanced'
  },

  // CODING PRACTICE
  {
    id: 'coding_1',
    title: 'Kotlin & Jetpack Compose Syntax',
    description: 'Familiarize yourself with symbols, braces, and keywords used in Android.',
    category: 'coding',
    targetKeys: ['{', '}', '(', ')', '.', ':', '=', '<', '>'],
    texts: [
      'fun main() { println("Hello TypeSprint") }',
      'val modifier = Modifier.padding(16.dp).fillMaxWidth()',
      '@Composable\nfun TypeScreen(wpm: Int) {\n    Text(text = "WPM: $wpm")\n}'
    ],
    difficulty: 'Advanced'
  },
  {
    id: 'coding_2',
    title: 'JavaScript & React Code Snippet',
    description: 'Train your curly braces, arrow functions, and react hook definitions.',
    category: 'coding',
    targetKeys: ['[', ']', '{', '}', '(', ')', '>', '=', ';'],
    texts: [
      'const [wpm, setWpm] = useState(0);',
      'useEffect(() => {\n  const handleKey = (e) => console.log(e.key);\n  window.addEventListener("keydown", handleKey);\n}, []);',
      'const formatted = list.map(item => item.value);'
    ],
    difficulty: 'Advanced'
  },
  
  // CAPITALS & SHIFT
  {
    id: 'capitals_1',
    title: 'Shift Modifier & Capitals',
    description: 'Master the fluid synchronization of the Shift key for capitalizations.',
    category: 'symbols', // map to symbols categories for backwards compat if needed, or email category
    targetKeys: ['Shift', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
    texts: [
      'Asdf Jkl; Gh Qwer Tyui Op Zxcv Bnm',
      'Kotlin is the official language for Android development.',
      'London, Paris, Berlin, Tokyo, New York, San Francisco.'
    ],
    difficulty: 'Intermediate'
  },

  // EMAIL PRACTICE
  {
    id: 'email_1',
    title: 'Professional Email Composition',
    description: 'Practice typing business emails with standard symbols and polite greetings.',
    category: 'email',
    targetKeys: ['@', '.', '_', '-'],
    texts: [
      'Subject: Project Update Proposal\n\nDear Team,\n\nI hope this email finds you well. I would like to propose a quick sync tomorrow at 10 AM to review the Android release schedule. Please let me know your availability.\n\nBest regards,\nAlex',
      'Subject: Support Ticket #94812\n\nHi support@typesprint.com,\n\nI am experiencing a slight bluetooth pairing delay with my external mechanical keyboard in landscape mode. Please review my attached logs.\n\nThank you for your assistance.'
    ],
    difficulty: 'Intermediate'
  }
];

export const TYPING_TESTS = [
  { id: 'test_15', title: '15-Second Blitz', duration: 15, difficulty: 'Beginner' },
  { id: 'test_30', title: '30-Second Sprint', duration: 30, difficulty: 'Beginner' },
  { id: 'test_60', title: '1-Minute Standard', duration: 60, difficulty: 'Intermediate' },
  { id: 'test_120', title: '2-Minute Sprint', duration: 120, difficulty: 'Intermediate' },
  { id: 'test_300', title: '5-Minute Endurance', duration: 300, difficulty: 'Advanced' },
  { id: 'test_600', title: '10-Minute Professional', duration: 600, difficulty: 'Advanced' },
  { id: 'test_marathon', title: 'Marathon Mode (15 mins)', duration: 900, difficulty: 'Advanced' },
  { id: 'test_endless', title: 'Endless Flow Mode', duration: 0, difficulty: 'Advanced' }
];

export const TEST_BANK = [
  'A physical keyboard provides tactile feedback, letting your muscles register every strike. Over time, you stop thinking about individual letters and start thinking in whole words. This shift from physical targeting to cognitive flowing is the hallmark of professional typing mastery.',
  'Jetpack Compose is Android modern design toolkit for building native UI. It simplifies and accelerates UI development on Android with less code, powerful tools, and intuitive Kotlin APIs, facilitating fluid animations and cohesive material designs.',
  'Typing accuracy is the bedrock of pure speed. If you make mistakes frequently, your fingers develop broken muscle memory, forcing constant backspacing and halting your cognitive flow. Slow down to aim for perfect accuracy first, and the speed will emerge naturally.',
  'The digital nomad movement has highlighted the utility of ultra-compact mechanical keyboards. Connected via Bluetooth or a simple USB OTG adapter, a phone becomes a highly mobile workstation, allowing developers and writers to complete entire projects from coffee shops, planes, or remote trains.',
  'TypeScript brings static typing to the flexible world of JavaScript. By declaring types, developers prevent spelling mistakes, invalid null states, and runtime errors before the code even runs, promoting rich editor completions and self-documenting APIs.',
  'An external keyboard, whether linear, tactile, or clicky, delivers a highly satisfying acoustic rhythm. Typing becomes an artistic and athletic performance where speed meets precision. Remember to maintain light, graceful finger strikes to minimize fatigue and preserve joint health over long sessions.'
];
