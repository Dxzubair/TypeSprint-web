package com.typesprint.app.paragraph_hub

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

class ParagraphHubRepository(
    private val context: Context,
    private val dao: ParagraphHubDao
) {
    val paragraphs: Flow<List<ParagraphEntity>> = dao.getAllParagraphs()
    val folders: Flow<List<FolderEntity>> = dao.getAllFolders()
    val favorites: Flow<List<FavoriteEntity>> = dao.getAllFavorites()
    val recents: Flow<List<RecentEntity>> = dao.getAllRecents()
    val categories: Flow<List<CategoryEntity>> = dao.getAllCategories()
    val tags: Flow<List<TagEntity>> = dao.getAllTags()

    suspend fun getParagraphsByFolder(folderId: String): Flow<List<ParagraphEntity>> {
        return dao.getParagraphsByFolder(folderId)
    }

    suspend fun addParagraph(paragraph: ParagraphEntity) = withContext(Dispatchers.IO) {
        dao.insertParagraph(paragraph)
    }

    suspend fun updateParagraph(paragraph: ParagraphEntity) = withContext(Dispatchers.IO) {
        dao.updateParagraph(paragraph)
    }

    suspend fun deleteParagraph(id: String) = withContext(Dispatchers.IO) {
        dao.deleteParagraph(id)
    }

    suspend fun addFolder(folder: FolderEntity) = withContext(Dispatchers.IO) {
        dao.insertFolder(folder)
    }

    suspend fun deleteFolder(id: String) = withContext(Dispatchers.IO) {
        dao.deleteFolder(id)
    }

    suspend fun toggleFavorite(paragraphId: String, isFav: Boolean) = withContext(Dispatchers.IO) {
        if (isFav) {
            dao.insertFavorite(FavoriteEntity(paragraphId))
        } else {
            dao.deleteFavorite(paragraphId)
        }
    }

    suspend fun recordPracticeSession(
        paragraphId: String,
        wpm: Double,
        accuracy: Double,
        timeSpentSeconds: Long
    ) = withContext(Dispatchers.IO) {
        val existing = dao.getRecentForParagraph(paragraphId)
        if (existing != null) {
            val nextTimes = existing.timesPracticed + 1
            val nextBestWpm = maxOf(existing.bestWpm, wpm)
            val nextBestAcc = maxOf(existing.bestAccuracy, accuracy)
            val nextAvgWpm = ((existing.averageWpm * existing.timesPracticed) + wpm) / nextTimes
            val nextAvgAcc = ((existing.averageAccuracy * existing.timesPracticed) + accuracy) / nextTimes
            
            dao.insertRecent(
                RecentEntity(
                    paragraphId = paragraphId,
                    lastPracticed = System.currentTimeMillis(),
                    timesPracticed = nextTimes,
                    bestWpm = nextBestWpm,
                    bestAccuracy = nextBestAcc,
                    averageWpm = nextAvgWpm,
                    averageAccuracy = nextAvgAcc,
                    totalPracticeTimeSeconds = existing.totalPracticeTimeSeconds + timeSpentSeconds
                )
            )
        } else {
            dao.insertRecent(
                RecentEntity(
                    paragraphId = paragraphId,
                    lastPracticed = System.currentTimeMillis(),
                    timesPracticed = 1,
                    bestWpm = wpm,
                    bestAccuracy = accuracy,
                    averageWpm = wpm,
                    averageAccuracy = accuracy,
                    totalPracticeTimeSeconds = timeSpentSeconds
                )
            )
        }
    }

    suspend fun seedDatabaseIfEmpty() = withContext(Dispatchers.IO) {
        // Here we seed some popular Indian Government typing paragraphs & general practice items if empty.
        val defaultCategories = listOf(
            CategoryEntity("ssc-chsl", "SSC CHSL", "exam"),
            CategoryEntity("ssc-cgl", "SSC CGL DEST", "exam"),
            CategoryEntity("ssc-steno", "SSC Stenographer", "exam"),
            CategoryEntity("rrb-ntpc", "RRB NTPC", "exam"),
            CategoryEntity("jkssb-ja", "JKSSB Junior Assistant", "exam"),
            CategoryEntity("office-letters", "Office Letters", "practice"),
            CategoryEntity("gov-circulars", "Government Circulars", "practice"),
            CategoryEntity("legal-docs", "Legal Documents", "practice"),
            CategoryEntity("coding", "Coding Practice", "practice")
        )
        dao.insertCategories(defaultCategories)

        val defaultTags = listOf(
            TagEntity("Official"), TagEntity("Administrative"), TagEntity("Legal"), 
            TagEntity("Circular"), TagEntity("Coding"), TagEntity("Speedrun")
        )
        for (tag in defaultTags) {
            dao.insertTag(tag)
        }

        val initialParagraphs = listOf(
            ParagraphEntity(
                id = "ssc-chsl-01",
                title = "CHSL 2024 Administrative Correspondence",
                content = "The Department of Personnel and Training under the Ministry of Personnel, Public Grievances and Pensions hereby issues detailed directives concerning the submission of annual performance evaluation reports. All state secretaries and Union Territory administrators are advised to strictly adhere to the schedule of timeline set for the digital appraisal system to prevent procedural delays.",
                exam = "SSC CHSL",
                difficulty = "Medium",
                wordCount = 59,
                estimatedTime = 90,
                language = "English",
                category = "Office Letters",
                tags = "Official, Administrative",
                folderId = null,
                isCustom = false
            ),
            ParagraphEntity(
                id = "ssc-cgl-dest-01",
                title = "CGL DEST Economic Survey Abstract",
                content = "Economic growth is projected to remain resilient in the upcoming fiscal quarters, driven by strong domestic demand, robust credit expansion, and progressive digitization in infrastructure project monitoring. Capital expenditure by the government has catalyzed private investments, leading to job creation across key manufacturing hubs, which serves to boost the consumer index ratings.",
                exam = "SSC CGL DEST",
                difficulty = "Hard",
                wordCount = 61,
                estimatedTime = 100,
                language = "English",
                category = "Government Circulars",
                tags = "Circular",
                folderId = null,
                isCustom = false
            ),
            ParagraphEntity(
                id = "legal-judgement-01",
                title = "Supreme Court Judgment Excerpt",
                content = "In the High Court of Judicature, the learned counsel appearing on behalf of the appellant contended that the lower court had gravely erred in appreciating the circumstantial evidence. The division bench, having reviewed the depositions of the material witnesses, finds that the prosecution has proved the guilt of the accused beyond all reasonable doubt, thereby upholding the primary conviction.",
                exam = "JK High Court",
                difficulty = "Hard",
                wordCount = 66,
                estimatedTime = 120,
                language = "English",
                category = "Legal Documents",
                tags = "Legal",
                folderId = null,
                isCustom = false
            ),
            ParagraphEntity(
                id = "office-circular-01",
                title = "Central Government Notification",
                content = "All administrative departments are notified that working hours will stand adjusted for the winter season, effective from next Monday. Staff members are requested to ensure all files pertaining to public grievances are cleared within the same working cycle to preserve departmental efficiency ratios. By order of the Secretary, Board of Revenue.",
                exam = "JKSSB Junior Assistant",
                difficulty = "Easy",
                wordCount = 55,
                estimatedTime = 80,
                language = "English",
                category = "Government Circulars",
                tags = "Official, Circular",
                folderId = null,
                isCustom = false
            )
        )
        dao.insertParagraphs(initialParagraphs)
    }
}
