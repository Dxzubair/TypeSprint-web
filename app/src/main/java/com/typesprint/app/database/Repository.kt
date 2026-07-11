package com.typesprint.app.database

import kotlinx.coroutines.flow.Flow

class TypeSprintRepository(private val dao: TypeSprintDao) {
    val allParagraphs: Flow<List<PracticeParagraph>> = dao.getAllParagraphs()
    val allExams: Flow<List<ExamPassage>> = dao.getAllExams()
    val allPracticeSessions: Flow<List<PracticeSession>> = dao.getAllPracticeSessions()
    val allExamAttempts: Flow<List<ExamAttempt>> = dao.getAllExamAttempts()

    suspend fun insertParagraph(paragraph: PracticeParagraph) {
        dao.insertParagraph(paragraph)
    }

    suspend fun insertExam(exam: ExamPassage) {
        dao.insertExam(exam)
    }

    suspend fun insertPracticeSession(session: PracticeSession) {
        dao.insertPracticeSession(session)
    }

    suspend fun insertExamAttempt(attempt: ExamAttempt) {
        dao.insertExamAttempt(attempt)
    }
}
