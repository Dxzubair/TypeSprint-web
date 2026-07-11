"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_app = require("firebase-admin/app");
var import_auth = require("firebase-admin/auth");
var import_genai = require("@google/genai");
import_dotenv.default.config();
try {
  if (!(0, import_app.getApps)().length) {
    (0, import_app.initializeApp)({
      credential: (0, import_app.applicationDefault)()
    });
  }
} catch (e) {
  console.error("Firebase admin initialization error:", e);
}
var requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid Authorization header" });
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await (0, import_auth.getAuth)().verifyIdToken(idToken);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid ID token" });
  }
};
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var apiKey = process.env.GEMINI_API_KEY;
var ai = null;
if (apiKey) {
  ai = new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
app.post("/api/ai-coach", requireAuth, async (req, res) => {
  const { stats, profile, question } = req.body;
  if (!stats || !profile) {
    return res.status(400).json({ error: "Stats and profile information is required" });
  }
  const fallbackAdvice = {
    weakKeys: Object.entries(stats.mistypedKeys || {}).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k.toUpperCase()),
    weakFingers: [],
    speedAdvice: "Practice rhythm and continuous forward typing. Do not stop to look at keys.",
    accuracyAdvice: "Slow down slightly to focus on consistent landing rather than bursts of typing speed.",
    nextLesson: "Home Row Focus or Paragraph Drill 1",
    dailyGoals: ["Spend 5 minutes practice today", "Maintain streak of " + (stats.streak || 1) + " days"],
    estimatedDays: 14,
    coachingSummary: "Focus on consistent accuracy of >95% first before attempting speed drills. Regular practice creates durable muscle memory.",
    customAnswer: question ? `I've reviewed your request: "${question}". Since you are typing at an average of ${stats.avgWpm} WPM with ${stats.totalAccuracy}% accuracy, focus on clean wrist posture and landing keys with standard finger zones.` : void 0
  };
  const leftPinky = ["q", "a", "z", "1", "!"];
  const leftRing = ["w", "s", "x", "2", "@"];
  const leftMiddle = ["e", "d", "c", "3", "#"];
  const leftIndex = ["r", "f", "v", "t", "g", "b", "4", "5", "$", "%"];
  const rightIndex = ["y", "h", "n", "u", "j", "m", "6", "7", "^", "&"];
  const rightMiddle = ["i", "k", ",", "8", "*"];
  const rightRing = ["o", "l", ".", "9", "("];
  const rightPinky = ["p", ";", "/", "-", "=", "[", "]", "0", ")", "_", "+"];
  const keyToFinger = (key) => {
    const k = key.toLowerCase();
    if (leftPinky.includes(k)) return "Left Pinky";
    if (leftRing.includes(k)) return "Left Ring";
    if (leftMiddle.includes(k)) return "Left Middle";
    if (leftIndex.includes(k)) return "Left Index";
    if (rightIndex.includes(k)) return "Right Index";
    if (rightMiddle.includes(k)) return "Right Middle";
    if (rightRing.includes(k)) return "Right Ring";
    if (rightPinky.includes(k)) return "Right Pinky";
    return "Thumbs (Space)";
  };
  const detectedWeakFingers = Array.from(
    new Set(
      fallbackAdvice.weakKeys.map((k) => keyToFinger(k))
    )
  ).slice(0, 2);
  fallbackAdvice.weakFingers = detectedWeakFingers.length > 0 ? detectedWeakFingers : ["Left Ring Finger", "Right Pinky"];
  if (!ai) {
    return res.json({
      coach: fallbackAdvice,
      source: "Local Engine"
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
    
    ${question ? `The user asked a custom question: "${question}". Please answer this question inside the "customAnswer" property, tailoring your advice to their statistics listed above.` : ""}

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
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            weakKeys: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
            weakFingers: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
            speedAdvice: { type: import_genai.Type.STRING },
            accuracyAdvice: { type: import_genai.Type.STRING },
            nextLesson: { type: import_genai.Type.STRING },
            dailyGoals: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
            estimatedDays: { type: import_genai.Type.INTEGER },
            coachingSummary: { type: import_genai.Type.STRING },
            customAnswer: { type: import_genai.Type.STRING }
          },
          required: [
            "weakKeys",
            "weakFingers",
            "speedAdvice",
            "accuracyAdvice",
            "nextLesson",
            "dailyGoals",
            "estimatedDays",
            "coachingSummary",
            "customAnswer"
          ]
        }
      }
    });
    const text = response.text?.trim() || "";
    if (text) {
      const parsed = JSON.parse(text);
      return res.json({
        coach: parsed,
        source: "Gemini AI"
      });
    }
    res.json({
      coach: fallbackAdvice,
      source: "Local Engine"
    });
  } catch (error) {
    console.error("Gemini AI Coach Error:", error);
    res.json({
      coach: fallbackAdvice,
      source: "Local Engine (Fallback)"
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TypeSprint custom fullstack server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
