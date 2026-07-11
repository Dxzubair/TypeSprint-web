package com.typesprint.app.exam_hub

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ExamHubDao {
    // Exam Rules Queries
    @Query("SELECT * FROM exam_rules")
    fun getAllExamRules(): Flow<List<ExamRuleEntity>>

    @Query("SELECT * FROM exam_rules WHERE examId = :examId LIMIT 1")
    suspend fun getExamRuleById(examId: String): ExamRuleEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExamRules(rules: List<ExamRuleEntity>)

    // Typing Passages Queries
    @Query("SELECT * FROM typing_passages")
    fun getAllPassages(): Flow<List<TypingPassageEntity>>

    @Query("SELECT * FROM typing_passages WHERE id = :id LIMIT 1")
    suspend fun getPassageById(id: String): TypingPassageEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPassages(passages: List<TypingPassageEntity>)

    // Exam Attempts Queries
    @Query("SELECT * FROM exam_attempts ORDER BY id DESC")
    fun getAllAttempts(): Flow<List<ExamAttemptEntity>>

    @Query("SELECT * FROM exam_attempts WHERE examId = :examId ORDER BY id DESC")
    fun getAttemptsForExam(examId: String): Flow<List<ExamAttemptEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAttempt(attempt: ExamAttemptEntity)

    @Query("DELETE FROM exam_attempts")
    suspend fun clearAttemptHistory()
}

@Database(
    entities = [ExamRuleEntity::class, TypingPassageEntity::class, ExamAttemptEntity::class],
    version = 1,
    exportSchema = false
)
abstract class ExamHubDatabase : RoomDatabase() {
    abstract fun examHubDao(): ExamHubDao
}
