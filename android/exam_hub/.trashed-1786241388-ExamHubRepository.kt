package com.typesprint.app.exam_hub

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import org.json.JSONArray
import java.io.InputStream

class ExamHubRepository(
    private val context: Context,
    private val dao: ExamHubDao
) {
    // Flows exposed directly to ViewModel
    val examRules: Flow<List<ExamRuleEntity>> = dao.getAllExamRules()
    val passages: Flow<List<TypingPassageEntity>> = dao.getAllPassages()
    val attempts: Flow<List<ExamAttemptEntity>> = dao.getAllAttempts()

    fun getAttemptsForExam(examId: String): Flow<List<ExamAttemptEntity>> {
        return dao.getAttemptsForExam(examId)
    }

    // Initialize Database with Local JSON Files (Offline Seed Support)
    suspend fun seedDatabaseIfEmpty() = withContext(Dispatchers.IO) {
        // Here we simulate checking if database has entries, if not we parse assets/exam_rules.json
        try {
            // Seed Rules
            val rulesJson = loadJsonFromAsset("exam_rules.json")
            if (rulesJson != null) {
                val rulesArray = JSONArray(rulesJson)
                val rulesList = mutableListOf<ExamRuleEntity>()
                for (i in 0 until rulesArray.length()) {
                    val obj = rulesArray.getJSONObject(i)
                    rulesList.add(
                        ExamRuleEntity(
                            examId = obj.getString("examId"),
                            examName = obj.getString("examName"),
                            organization = obj.getString("organization"),
                            postName = obj.getString("postName"),
                            language = obj.getString("language"),
                            typingMethod = obj.getString("typingMethod"),
                            requiredWpm = obj.getInt("requiredWpm"),
                            requiredAccuracy = obj.getDouble("requiredAccuracy"),
                            duration = obj.getInt("duration"),
                            minPassingScore = obj.getInt("minPassingScore"),
                            officialPattern = obj.getString("officialPattern"),
                            difficulty = obj.getString("difficulty"),
                            textType = obj.getString("textType"),
                            keyboardType = obj.getString("keyboardType"),
                            remarks = obj.getString("remarks"),
                            officialNotificationUrl = obj.getString("officialNotificationUrl"),
                            lastUpdated = obj.getString("lastUpdated"),
                            version = obj.getString("version")
                        )
                    )
                }
                dao.insertExamRules(rulesList)
            }

            // Seed Passages
            val passagesJson = loadJsonFromAsset("typing_passages.json")
            if (passagesJson != null) {
                val passagesArray = JSONArray(passagesJson)
                val passagesList = mutableListOf<TypingPassageEntity>()
                for (i in 0 until passagesArray.length()) {
                    val obj = passagesArray.getJSONObject(i)
                    passagesList.add(
                        TypingPassageEntity(
                            id = obj.getString("id"),
                            title = obj.getString("title"),
                            category = obj.getString("category"),
                            difficulty = obj.getString("difficulty"),
                            language = obj.getString("language"),
                            wordCount = obj.getInt("wordCount"),
                            estimatedWpm = obj.getInt("estimatedWpm"),
                            estimatedDuration = obj.getInt("estimatedDuration"),
                            content = obj.getString("content")
                        )
                    )
                }
                dao.insertPassages(passagesList)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // Dynamic Admin-Ready Update System (Overwrites changed files locally)
    suspend fun updateDatabaseFromCloud(updatedRulesJson: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val rulesArray = JSONArray(updatedRulesJson)
            val rulesList = mutableListOf<ExamRuleEntity>()
            for (i in 0 until rulesArray.length()) {
                val obj = rulesArray.getJSONObject(i)
                rulesList.add(
                    ExamRuleEntity(
                        examId = obj.getString("examId"),
                        examName = obj.getString("examName"),
                        organization = obj.getString("organization"),
                        postName = obj.getString("postName"),
                        language = obj.getString("language"),
                        typingMethod = obj.getString("typingMethod"),
                        requiredWpm = obj.getInt("requiredWpm"),
                        requiredAccuracy = obj.getDouble("requiredAccuracy"),
                        duration = obj.getInt("duration"),
                        minPassingScore = obj.getInt("minPassingScore"),
                        officialPattern = obj.getString("officialPattern"),
                        difficulty = obj.getString("difficulty"),
                        textType = obj.getString("textType"),
                        keyboardType = obj.getString("keyboardType"),
                        remarks = obj.getString("remarks"),
                        officialNotificationUrl = obj.getString("officialNotificationUrl"),
                        lastUpdated = obj.getString("lastUpdated"),
                        version = obj.getString("version")
                    )
                )
            }
            dao.insertExamRules(rulesList)
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    suspend fun saveAttempt(attempt: ExamAttemptEntity) = withContext(Dispatchers.IO) {
        dao.insertAttempt(attempt)
    }

    suspend fun clearAttempts() = withContext(Dispatchers.IO) {
        dao.clearAttemptHistory()
    }

    private fun loadJsonFromAsset(fileName: String): String? {
        return try {
            val inputStream: InputStream = context.assets.open(fileName)
            val size: Int = inputStream.available()
            val buffer = ByteArray(size)
            inputStream.read(buffer)
            inputStream.close()
            String(buffer, Charsets.UTF_8)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
