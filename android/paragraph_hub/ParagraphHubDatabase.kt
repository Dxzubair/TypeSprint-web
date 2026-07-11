package com.typesprint.app.paragraph_hub

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ParagraphHubDao {
    // Paragraph Queries
    @Query("SELECT * FROM paragraphs ORDER BY createdAt DESC")
    fun getAllParagraphs(): Flow<List<ParagraphEntity>>

    @Query("SELECT * FROM paragraphs WHERE folderId = :folderId ORDER BY createdAt DESC")
    fun getParagraphsByFolder(folderId: String): Flow<List<ParagraphEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertParagraphs(paragraphs: List<ParagraphEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertParagraph(paragraph: ParagraphEntity)

    @Update
    suspend fun updateParagraph(paragraph: ParagraphEntity)

    @Query("DELETE FROM paragraphs WHERE id = :id")
    suspend fun deleteParagraph(id: String)

    // Folder Queries
    @Query("SELECT * FROM paragraph_folders ORDER BY name ASC")
    fun getAllFolders(): Flow<List<FolderEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFolder(folder: FolderEntity)

    @Query("DELETE FROM paragraph_folders WHERE id = :id")
    suspend fun deleteFolder(id: String)

    // Favorite Queries
    @Query("SELECT * FROM paragraph_favorites")
    fun getAllFavorites(): Flow<List<FavoriteEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFavorite(favorite: FavoriteEntity)

    @Query("DELETE FROM paragraph_favorites WHERE paragraphId = :paragraphId")
    suspend fun deleteFavorite(paragraphId: String)

    // Recent / Practice History Queries
    @Query("SELECT * FROM paragraph_recents ORDER BY lastPracticed DESC")
    fun getAllRecents(): Flow<List<RecentEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecent(recent: RecentEntity)

    @Query("SELECT * FROM paragraph_recents WHERE paragraphId = :paragraphId LIMIT 1")
    suspend fun getRecentForParagraph(paragraphId: String): RecentEntity?

    // Category Queries
    @Query("SELECT * FROM paragraph_categories")
    fun getAllCategories(): Flow<List<CategoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCategories(categories: List<CategoryEntity>)

    // Tag Queries
    @Query("SELECT * FROM paragraph_tags")
    fun getAllTags(): Flow<List<TagEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTag(tag: TagEntity)
}

@Database(
    entities = [
        ParagraphEntity::class,
        CategoryEntity::class,
        FolderEntity::class,
        FavoriteEntity::class,
        RecentEntity::class,
        TagEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class ParagraphHubDatabase : RoomDatabase() {
    abstract fun paragraphHubDao(): ParagraphHubDao
}
