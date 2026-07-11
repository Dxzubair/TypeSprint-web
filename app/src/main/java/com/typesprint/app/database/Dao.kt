package com.typesprint.app.database

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface TypeSprintDao {
    // Paragraph Hub Queries
    @Query("SELECT * FROM practice_paragraphs ORDER BY id ASC")
    fun getAllParagraphs(): Flow<List<PracticeParagraph>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertParagraph(paragraph: PracticeParagraph)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertParagraphs(paragraphs: List<PracticeParagraph>)

    // Govt Exam Hub Queries
    @Query("SELECT * FROM exam_passages ORDER BY id ASC")
    fun getAllExams(): Flow<List<ExamPassage>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExam(exam: ExamPassage)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExams(exams: List<ExamPassage>)

    // Session Tracking Queries
    @Query("SELECT * FROM practice_sessions ORDER BY date DESC")
    fun getAllPracticeSessions(): Flow<List<PracticeSession>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPracticeSession(session: PracticeSession)

    @Query("SELECT * FROM exam_attempts ORDER BY date DESC")
    fun getAllExamAttempts(): Flow<List<ExamAttempt>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExamAttempt(attempt: ExamAttempt)
}
