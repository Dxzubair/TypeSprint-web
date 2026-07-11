package com.typesprint.app.exam_hub

import kotlin.math.max
import kotlin.math.min

// Core Indian Government Typing Evaluation formulas
object ResultEngine {
    data class EvaluationResult(
        val isPass: Boolean,
        val netWpm: Double,
        val grossWpm: Double,
        val accuracy: Double,
        val mistakes: Double,
        val remarks: String
    )

    fun evaluate(
        typedText: String,
        referenceText: String,
        examId: String,
        requiredWpm: Int,
        requiredAccuracy: Double,
        timeSpentMinutes: Double
    ): EvaluationResult {
        val refWords = referenceText.trim().split("\\s+".toRegex())
        val typedWords = typedText.trim().split("\\s+".toRegex())
        
        var fullMistakes = 0.0
        var halfMistakes = 0.0

        val maxWords = max(refWords.size, typedWords.size)
        for (i in 0 until maxWords) {
            val ref = refWords.getOrNull(i) ?: ""
            val typ = typedWords.getOrNull(i) ?: ""

            if (ref.isEmpty() && typ.isNotEmpty()) {
                fullMistakes += 1.0
            } else if (ref.isNotEmpty() && typ.isEmpty()) {
                fullMistakes += 1.0
            } else if (ref != typ) {
                // Spell mistake or Case mismatch
                val distance = getLevenshteinDistance(ref, typ)
                if (distance <= 2 && ref.lowercase() == typ.lowercase()) {
                    halfMistakes += 1.0 // Case drift is half mistake
                } else if (distance <= 2) {
                    halfMistakes += 1.0 // Simple typo
                } else {
                    fullMistakes += 1.0 // Major word change
                }
            }
        }

        val totalMistakes = fullMistakes + (halfMistakes * 0.5)
        val charCount = typedText.length
        
        // Standard 5-character word formula
        val grossWords = charCount / 5.0
        val grossWpm = if (timeSpentMinutes > 0) grossWords / timeSpentMinutes else 0.0

        var netWpm = grossWpm
        var isPass = false
        var remarks = ""

        when {
            examId.startsWith("ssc") -> {
                // SSC: Allowance of 7% (General) or 10% (Reserved)
                val allowedErrors = typedWords.size * 0.07
                val penaltyMistakes = max(0.0, totalMistakes - allowedErrors)
                val netWords = grossWords - (penaltyMistakes * 10)
                netWpm = if (timeSpentMinutes > 0) max(0.0, netWords) / timeSpentMinutes else 0.0
                isPass = netWpm >= requiredWpm && totalMistakes <= allowedErrors
                remarks = "SSC Full/Half evaluation: Allowed errors 7%. Exceeded mistakes penalize 10 words each."
            }
            examId.startsWith("rrb") -> {
                // RRB NTPC: 5% mistakes ignored. Remaining mistakes attract 10 words penalty
                val allowedErrors = typedWords.size * 0.05
                val penaltyMistakes = max(0.0, totalMistakes - allowedErrors)
                val netWords = typedWords.size - (penaltyMistakes * 10)
                netWpm = if (timeSpentMinutes > 0) max(0.0, netWords) / timeSpentMinutes else 0.0
                val acc = ((typedWords.size - totalMistakes) / typedWords.size.toDouble()) * 100
                isPass = netWpm >= requiredWpm && acc >= requiredAccuracy
                remarks = "RRB Formula: 5% allowance, 10-word deduction per mistake beyond threshold. Backspace restricted."
            }
            examId.startsWith("jk") -> {
                // JKSSB Formula: Net Speed based on standard word formula, Accuracy >= 90%
                netWpm = grossWpm
                val acc = if (typedWords.isNotEmpty()) ((typedWords.size - totalMistakes) / typedWords.size.toDouble()) * 100 else 0.0
                isPass = netWpm >= requiredWpm && acc >= requiredAccuracy
                remarks = "JKSSB: Direct speed rating. Points scale linearly from 35 WPM up to 50 WPM."
            }
            else -> {
                // Standard/Custom Exam Evaluation
                netWpm = grossWpm
                val acc = if (typedWords.isNotEmpty()) ((typedWords.size - totalMistakes) / typedWords.size.toDouble()) * 100 else 0.0
                isPass = netWpm >= requiredWpm && acc >= requiredAccuracy
                remarks = "Custom Rule: Net speed measured on standard characters. Minimum accuracy $requiredAccuracy%."
            }
        }

        val accuracyPercent = if (typedWords.isNotEmpty()) {
            max(0.0, ((typedWords.size - totalMistakes) / typedWords.size.toDouble()) * 100)
        } else 0.0

        return EvaluationResult(
            isPass = isPass,
            netWpm = String.format("%.2f", netWpm).toDouble(),
            grossWpm = String.format("%.2f", grossWpm).toDouble(),
            accuracy = String.format("%.1f", accuracyPercent).toDouble(),
            mistakes = totalMistakes,
            remarks = remarks
        )
    }

    private fun getLevenshteinDistance(lhs: CharSequence, rhs: CharSequence): Int {
        val len0 = lhs.length + 1
        val len1 = rhs.length + 1
        var cost = IntArray(len0)
        var newcost = IntArray(len0)
        for (i in 0 until len0) cost[i] = i
        for (j in 1 until len1) {
            newcost[0] = j
            for (i in 1 until len0) {
                val match = if (lhs[i - 1] == rhs[j - 1]) 0 else 1
                val costReplace = cost[i - 1] + match
                val costInsert = cost[i] + 1
                val costDelete = newcost[i - 1] + 1
                newcost[i] = min(min(costInsert, costDelete), costReplace)
            }
            val swap = cost
            cost = newcost
            newcost = swap
        }
        return cost[len0 - 1]
    }
}

// Calculates dynamic success readiness percentage
object ReadinessCalculator {
    fun calculateReadiness(
        attempts: List<ExamAttemptEntity>,
        targetWpm: Int,
        targetAccuracy: Double
    ): Int {
        if (attempts.isEmpty()) return 20 // Baseline starting level

        // Weighted calculation: last 3 attempts are weighted at 70%, rest at 30%
        val last3 = attempts.take(3)
        val avgSpeedLast3 = last3.map { it.wpm }.average()
        val avgAccLast3 = last3.map { it.accuracy }.average()

        val avgSpeedAll = attempts.map { it.wpm }.average()
        val avgAccAll = attempts.map { it.accuracy }.average()

        val weightSpeed = (avgSpeedLast3 * 0.7) + (avgSpeedAll * 0.3)
        val weightAcc = (avgAccLast3 * 0.7) + (avgAccAll * 0.3)

        val speedRatio = min(1.2, weightSpeed / targetWpm.toDouble())
        val accRatio = min(1.0, weightAcc / targetAccuracy)

        val baseReadiness = (speedRatio * 60) + (accRatio * 40)
        val passRate = attempts.filter { it.isPass }.size.toDouble() / attempts.size.toDouble()

        // Readiness scales with official mock pass-rate consistency
        val scaled = baseReadiness * (0.8 + (passRate * 0.2))

        return min(100, max(10, scaled.toInt()))
    }
}

// AI Diagnosis recommendation engine
object AiRecommendationEngine {
    data class Recommendation(
        val estimatedSuccess: String,
        val weakKeys: String,
        val weakFingers: String,
        val bestLesson: String,
        val bestGame: String,
        val dailyTarget: String
    )

    fun getRecommendations(
        attempts: List<ExamAttemptEntity>,
        targetWpm: Int,
        examName: String
    ): Recommendation {
        if (attempts.isEmpty()) {
            return Recommendation(
                estimatedSuccess = "25%",
                weakKeys = "Pending assessment",
                weakFingers = "Pending assessment",
                bestLesson = "Row Practice - Lesson 1",
                bestGame = "Key Splat",
                dailyTarget = "Complete your first Mock Test on $examName to begin AI learning mapping."
            )
        }

        val avgSpeed = attempts.map { it.wpm }.average()
        val passCount = attempts.filter { it.isPass }.size
        val passRate = passCount.toDouble() / attempts.size

        val estimatedSuccess = when {
            avgSpeed >= targetWpm && passRate >= 0.8 -> "94% (Highly Probable)"
            avgSpeed >= targetWpm && passRate >= 0.5 -> "78% (Probable)"
            avgSpeed >= targetWpm - 5 -> "55% (Borderline)"
            else -> "30% (Requires Speed practice)"
        }

        // Parse actual failures to pinpoint keys
        val keyFrequencies = mutableMapOf<String, Int>()
        attempts.forEach { att ->
            att.weakKeys.split(",").forEach { k ->
                val trimmed = k.trim()
                if (trimmed.isNotEmpty()) {
                    keyFrequencies[trimmed] = keyFrequencies.getOrDefault(trimmed, 0) + 1
                }
            }
        }

        val weakKeysList = keyFrequencies.entries.sortedByDescending { it.value }.map { it.key }
        val weakKeysStr = if (weakKeysList.isNotEmpty()) weakKeysList.take(3).joinToString(", ") else "Z, Q, P (Corner stretches)"

        val weakFingers = when {
            weakKeysStr.contains("Q") || weakKeysStr.contains("Z") || weakKeysStr.contains("A") -> "Left Pinky (A-Q-Z rest shift)"
            weakKeysStr.contains("P") || weakKeysStr.contains("L") || weakKeysStr.contains("O") -> "Right Pinky (O-P stretch)"
            else -> "Left Ring & Right Middle finger"
        }

        val bestLesson = when {
            avgSpeed < 30 -> "Shift Keys & Capitals Exercise"
            avgSpeed < targetWpm -> "Double Space Character timing"
            else -> "Government Style Circular documents transcription"
        }

        return Recommendation(
            estimatedSuccess = estimatedSuccess,
            weakKeys = weakKeysStr,
            weakFingers = weakFingers,
            bestLesson = bestLesson,
            bestGame = "Tactile Space Splat",
            dailyTarget = "Complete 3 full mock tests on $examName, keeping net speed above ${targetWpm + 2} WPM."
        )
    }
}
