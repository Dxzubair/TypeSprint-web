/* v8 ignore start */
export interface SessionStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errorRate: number;
  cpm: number;
  correctCharacters: number;
  incorrectCharacters: number;
  extraCharacters: number;
  missedCharacters: number;
  totalTypedCharacters: number;
  elapsedTime: number;
  wordsRemaining?: number;
  remainingTime?: number;
  progressPercentage?: number;
}

export class AnalyticsEngine {
  /**
   * Calculates real-time or final typing statistics.
   * WPM is precisely calculated tracking the first keystroke to the final character,
   * standardizing a word as 5 characters.
   * 
   * @param correctCharacters Number of correctly typed characters
   * @param incorrectCharacters Number of mistakes made
   * @param elapsedSeconds Time elapsed in seconds since the first keystroke
   * @param extraCharacters Number of extra characters typed
   * @param missedCharacters Number of missed characters
   * @returns SessionStats object containing calculated metrics
   */
  static calculateMetrics(
    correctCharacters: number,
    incorrectCharacters: number,
    elapsedSeconds: number,
    extraCharacters: number = 0,
    missedCharacters: number = 0
  ): SessionStats {
    // Prevent division by zero, min elapsed time is effectively 1 second for calculations
    // or we can use the exact decimal if needed, but 1/60 is default for t=0
    const timeFactorInMinutes = elapsedSeconds > 0 ? elapsedSeconds / 60 : 1 / 60;
    
    const totalTypedCharacters = correctCharacters + incorrectCharacters + extraCharacters;
    const totalAccuracyCharacters = correctCharacters + incorrectCharacters + extraCharacters + missedCharacters;

    // Standard WPM: (Correct characters / 5) / time in minutes
    const wpm = Math.max(0, Math.round((correctCharacters / 5) / timeFactorInMinutes));
    
    // Raw WPM: (Total characters / 5) / time in minutes
    const rawWpm = Math.max(0, Math.round((totalTypedCharacters / 5) / timeFactorInMinutes));
    
    // CPM (Characters Per Minute): Total characters / time in minutes
    const cpm = Math.max(0, Math.round(totalTypedCharacters / timeFactorInMinutes));

    // Accuracy: (Correct / Total possible accuracy characters) * 100
    // As per professional typing engines (Monkeytype, Typing.com)
    let accuracy = 100;
    if (totalAccuracyCharacters > 0) {
      accuracy = Math.round((correctCharacters / totalAccuracyCharacters) * 100);
    }
    
    // Ensure accuracy is between 0 and 100
    accuracy = Math.min(100, Math.max(0, accuracy));
      
    const errorRate = 100 - accuracy;

    return {
      wpm,
      rawWpm,
      accuracy,
      errorRate,
      cpm,
      correctCharacters,
      incorrectCharacters,
      extraCharacters,
      missedCharacters,
      totalTypedCharacters,
      elapsedTime: elapsedSeconds
    };
  }
}
/* v8 ignore stop */
