import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

// Initialize Firebase Admin SDK
try {
  if (!getApps().length) {
    initializeApp({
      credential: applicationDefault()
    });
  }
} catch (e) {
  console.error('Firebase admin initialization error:', e);
}

// Authentication Middleware
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid ID token' });
  }
};

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini on server-side only
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Coach analysis endpoint
app.post('/api/ai-coach', requireAuth, async (req, res) => {
  const { stats, profile, question } = req.body;

  if (!stats || !profile) {
    return res.status(400).json({ error: 'Stats and profile information is required' });
  }

  // Baseline rule-based analysis (always available as fallback)
  const fallbackAdvice = {
    weakKeys: Object.entries(stats.mistypedKeys || {})
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 3)
      .map(([k]) => k.toUpperCase()),
    weakFingers: [] as string[],
    speedAdvice: "Practice rhythm and continuous forward typing. Do not stop to look at keys.",
    accuracyAdvice: "Slow down slightly to focus on consistent landing rather than bursts of typing speed.",
    nextLesson: "Home Row Focus or Paragraph Drill 1",
    dailyGoals: ["Spend 5 minutes practice today", "Maintain streak of " + (stats.streak || 1) + " days"],
    estimatedDays: 14,
    coachingSummary: "Focus on consistent accuracy of >95% first before attempting speed drills. Regular practice creates durable muscle memory.",
    customAnswer: question ? `I've reviewed your request: "${question}". Since you are typing at an average of ${stats.avgWpm} WPM with ${stats.totalAccuracy}% accuracy, focus on clean wrist posture and landing keys with standard finger zones.` : undefined
  };

  // Derive weak fingers based on weak keys
  const leftPinky = ['q', 'a', 'z', '1', '!'];
  const leftRing = ['w', 's', 'x', '2', '@'];
  const leftMiddle = ['e', 'd', 'c', '3', '#'];
  const leftIndex = ['r', 'f', 'v', 't', 'g', 'b', '4', '5', '$', '%'];
  const rightIndex = ['y', 'h', 'n', 'u', 'j', 'm', '6', '7', '^', '&'];
  const rightMiddle = ['i', 'k', ',', '8', '*'];
  const rightRing = ['o', 'l', '.', '9', '('];
  const rightPinky = ['p', ';', '/', '-', '=', '[', ']', '0', ')', '_', '+'];

  const keyToFinger = (key: string): string => {
    const k = key.toLowerCase();
    if (leftPinky.includes(k)) return 'Left Pinky';
    if (leftRing.includes(k)) return 'Left Ring';
    if (leftMiddle.includes(k)) return 'Left Middle';
    if (leftIndex.includes(k)) return 'Left Index';
    if (rightIndex.includes(k)) return 'Right Index';
    if (rightMiddle.includes(k)) return 'Right Middle';
    if (rightRing.includes(k)) return 'Right Ring';
    if (rightPinky.includes(k)) return 'Right Pinky';
    return 'Thumbs (Space)';
  };

  const detectedWeakFingers = Array.from(
    new Set(
      fallbackAdvice.weakKeys.map(k => keyToFinger(k))
    )
  ).slice(0, 2);

  fallbackAdvice.weakFingers = detectedWeakFingers.length > 0 ? detectedWeakFingers : ["Left Ring Finger", "Right Pinky"];

  if (!ai) {
    // If API key is not present, return elegant mock/rule-based coach advice gracefully
    return res.json({
      coach: fallbackAdvice,
      source: 'Local Engine'
    });
  }

  try {
    const prompt = `
    You are an expert, friendly AI typing coach inside the TypeSprint Android application.
    Analyze the following user data and provide an actionable, highly motivating typing assessment.
    
    User Profile:
    - Level: ${profile.level}
    - Total practice sessions: ${stats.totalSessions}
    - Best WPM: ${stats.bestWpm}
    - Average WPM: ${stats.avgWpm}
    - Average Accuracy: ${stats.totalAccuracy}%
    - Current Streak: ${stats.streak} days
    - Mistyped Keys (frequency map): ${JSON.stringify(stats.mistypedKeys || {})}
    
    ${question ? `The user asked a custom question: "${question}". Please answer this question inside the "customAnswer" property, tailoring your advice to their statistics listed above.` : ''}

    Structure your JSON response to match the target schema:
    {
      "weakKeys": ["list of up to 3 uppercase keys", ...],
      "weakFingers": ["list of up to 2 specific fingers e.g. Left Ring Finger, Right Pinky", ...],
      "speedAdvice": "one sentence action instruction",
      "accuracyAdvice": "one sentence precision instruction",
      "nextLesson": "specific lesson title appropriate for user level",
      "dailyGoals": ["up to 3 specific items", ...],
      "estimatedDays": 10, // estimated days of practice to reach 20% higher WPM
      "coachingSummary": "2-3 sentences of warm, professional encouragement and technical insight",
      "customAnswer": "detailed answer to user custom question (if provided, else leave empty)"
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weakKeys: { type: Type.ARRAY, items: { type: Type.STRING } },
            weakFingers: { type: Type.ARRAY, items: { type: Type.STRING } },
            speedAdvice: { type: Type.STRING },
            accuracyAdvice: { type: Type.STRING },
            nextLesson: { type: Type.STRING },
            dailyGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimatedDays: { type: Type.INTEGER },
            coachingSummary: { type: Type.STRING },
            customAnswer: { type: Type.STRING }
          },
          required: [
            'weakKeys',
            'weakFingers',
            'speedAdvice',
            'accuracyAdvice',
            'nextLesson',
            'dailyGoals',
            'estimatedDays',
            'coachingSummary',
            'customAnswer'
          ]
        }
      }
    });

    const text = response.text?.trim() || '';
    if (text) {
      const parsed = JSON.parse(text);
      return res.json({
        coach: parsed,
        source: 'Gemini AI'
      });
    }

    res.json({
      coach: fallbackAdvice,
      source: 'Local Engine'
    });
  } catch (error) {
    console.error('Gemini AI Coach Error:', error);
    res.json({
      coach: fallbackAdvice,
      source: 'Local Engine (Fallback)'
    });
  }
});

// Configure Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TypeSprint custom fullstack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
