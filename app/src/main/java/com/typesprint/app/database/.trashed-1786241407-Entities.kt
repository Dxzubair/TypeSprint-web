package com.typesprint.app.database

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "practice_paragraphs")
data class PracticeParagraph(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val title: String,
    val bodyText: String,
    val level: String // "Easy", "Medium", "Hard"
)

@Entity(tableName = "exam_passages")
data class ExamPassage(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val name: String,
    val passageText: String,
    val examDurationMinutes: Int,
    val backspaceAllowed: Boolean,
    val errorHighlighting: Boolean,
    val description: String
)

@Entity(tableName = "practice_sessions")
data class PracticeSession(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val title: String,
    val wpm: Int,
    val accuracy: Int,
    val date: Long = System.currentTimeMillis()
)

@Entity(tableName = "exam_attempts")
data class ExamAttempt(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val examName: String,
    val wpm: Int,
    val accuracy: Int,
    val errorsCount: Int,
    val date: Long = System.currentTimeMillis()
)
