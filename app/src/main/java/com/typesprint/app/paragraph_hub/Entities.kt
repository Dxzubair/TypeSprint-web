package com.typesprint.app.paragraph_hub

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "paragraphs")
data class ParagraphEntity(
    @PrimaryKey val id: String,
    val title: String,
    val content: String,
    val exam: String?,
    val difficulty: String, // Easy, Medium, Hard, Expert
    val wordCount: Int,
    val estimatedTime: Int, // in seconds
    val language: String, // English, Hindi, etc.
    val category: String, // Office Letters, Government Circulars, Legal, etc.
    val tags: String, // Comma separated tags
    val folderId: String?, // Folder ID if grouped
    val isCustom: Boolean, // User-created vs Seeded
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "paragraph_categories")
data class CategoryEntity(
    @PrimaryKey val id: String,
    val name: String,
    val type: String // "exam" or "practice"
)

@Entity(tableName = "paragraph_folders")
data class FolderEntity(
    @PrimaryKey val id: String,
    val name: String,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "paragraph_favorites")
data class FavoriteEntity(
    @PrimaryKey val paragraphId: String,
    val addedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "paragraph_recents")
data class RecentEntity(
    @PrimaryKey val paragraphId: String,
    val lastPracticed: Long,
    val timesPracticed: Int,
    val bestWpm: Double,
    val bestAccuracy: Double,
    val averageWpm: Double,
    val averageAccuracy: Double,
    val totalPracticeTimeSeconds: Long
)

@Entity(tableName = "paragraph_tags")
data class TagEntity(
    @PrimaryKey val name: String
)
