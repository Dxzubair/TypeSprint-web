package com.typesprint.app.exam_hub

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "exam_rules")
data class ExamRuleEntity(
    @PrimaryKey val examId: String,
    val examName: String,
    val organization: String,
    val postName: String,
    val language: String,
    val typingMethod: String,
    val requiredWpm: Int,
    val requiredAccuracy: Double,
    val duration: Int, // in minutes
    val minPassingScore: Int,
    val officialPattern: String,
    val difficulty: String,
    val textType: String,
    val keyboardType: String,
    val remarks: String,
    val officialNotificationUrl: String,
    val lastUpdated: String,
    val version: String
)

@Entity(tableName = "typing_passages")
data class TypingPassageEntity(
    @PrimaryKey val id: String,
    val title: String,
    val category: String,
    val difficulty: String,
    val language: String,
    val wordCount: Int,
    val estimatedWpm: Int,
    val estimatedDuration: Int, // in seconds
    val content: String
)

@Entity(tableName = "exam_attempts")
data class ExamAttemptEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val examId: String,
    val examName: String,
    val date: String,
    val wpm: Double,
    val accuracy: Double,
    val mistakes: Double,
    val isPass: Boolean,
    val readinessScore: Int,
    val timeSpentSeconds: Int,
    val weakKeys: String, // Comma separated keys
    val weakFingers: String // Comma separated fingers
)
