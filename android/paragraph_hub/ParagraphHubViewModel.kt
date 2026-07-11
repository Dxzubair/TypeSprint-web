package com.typesprint.app.paragraph_hub

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class ParagraphHubViewModel(
    application: Application,
    private val repository: ParagraphHubRepository
) : AndroidViewModel(application) {

    // Filter and search parameters
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedCategory = MutableStateFlow("All")
    val selectedCategory: StateFlow<String> = _selectedCategory.asStateFlow()

    private val _selectedDifficulty = MutableStateFlow("All")
    val selectedDifficulty: StateFlow<String> = _selectedDifficulty.asStateFlow()

    private val _selectedFolderId = MutableStateFlow<String?>(null)
    val selectedFolderId: StateFlow<String?> = _selectedFolderId.asStateFlow()

    private val _sortBy = MutableStateFlow("Recent") // "Recent", "A-Z", "WPM", "Favorites"
    val sortBy: StateFlow<String> = _sortBy.asStateFlow()

    // Database flows
    val paragraphs: StateFlow<List<ParagraphEntity>> = repository.paragraphs
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val folders: StateFlow<List<FolderEntity>> = repository.folders
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val favorites: StateFlow<List<FavoriteEntity>> = repository.favorites
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val recents: StateFlow<List<RecentEntity>> = repository.recents
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val categories: StateFlow<List<CategoryEntity>> = repository.categories
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val tags: StateFlow<List<TagEntity>> = repository.tags
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Active practice session state
    private val _activeParagraph = MutableStateFlow<ParagraphEntity?>(null)
    val activeParagraph: StateFlow<ParagraphEntity?> = _activeParagraph.asStateFlow()

    private val _isSessionActive = MutableStateFlow(false)
    val isSessionActive: StateFlow<Boolean> = _isSessionActive.asStateFlow()

    // Custom test state configurations
    private val _customDuration = MutableStateFlow(60) // in seconds
    val customDuration: StateFlow<Int> = _customDuration.asStateFlow()

    private val _typingMode = MutableStateFlow("standard") // "standard", "no_backspace"
    val typingMode: StateFlow<String> = _typingMode.asStateFlow()

    private val _repeatMode = MutableStateFlow(false)
    val repeatMode: StateFlow<Boolean> = _repeatMode.asStateFlow()

    // Derived filtered paragraphs flow
    val filteredParagraphs: StateFlow<List<ParagraphEntity>> = combine(
        paragraphs, _searchQuery, _selectedCategory, _selectedDifficulty, _selectedFolderId, _sortBy, favorites
    ) { list, query, category, difficulty, folderId, sort, favs ->
        var filtered = list

        if (query.isNotEmpty()) {
            filtered = filtered.filter {
                it.title.contains(query, ignoreCase = true) ||
                it.content.contains(query, ignoreCase = true) ||
                it.category.contains(query, ignoreCase = true) ||
                (it.exam != null && it.exam.contains(query, ignoreCase = true)) ||
                it.tags.contains(query, ignoreCase = true)
            }
        }

        if (category != "All") {
            filtered = filtered.filter { it.category == category }
        }

        if (difficulty != "All") {
            filtered = filtered.filter { it.difficulty == difficulty }
        }

        if (folderId != null) {
            filtered = filtered.filter { it.folderId == folderId }
        }

        val favIds = favs.map { it.paragraphId }.toSet()

        when (sort) {
            "A-Z" -> filtered.sortedBy { it.title }
            "WPM" -> filtered.sortedByDescending { it.wordCount }
            "Favorites" -> filtered.sortedWith { a, b ->
                val aFav = if (favIds.contains(a.id)) 1 else 0
                val bFav = if (favIds.contains(b.id)) 1 else 0
                bFav.compareTo(aFav)
            }
            else -> filtered.sortedByDescending { it.createdAt }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        viewModelScope.launch {
            repository.seedDatabaseIfEmpty()
        }
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setSelectedCategory(category: String) {
        _selectedCategory.value = category
    }

    fun setSelectedDifficulty(difficulty: String) {
        _selectedDifficulty.value = difficulty
    }

    fun setSelectedFolder(folderId: String?) {
        _selectedFolderId.value = folderId
    }

    fun setSortBy(sort: String) {
        _sortBy.value = sort
    }

    fun setCustomDuration(durationSeconds: Int) {
        _customDuration.value = durationSeconds
    }

    fun setTypingMode(mode: String) {
        _typingMode.value = mode
    }

    fun setRepeatMode(repeat: Boolean) {
        _repeatMode.value = repeat
    }

    // CRUD database commands
    fun createCustomParagraph(title: String, content: String, category: String, difficulty: String, language: String, tags: String, folderId: String? = null) {
        viewModelScope.launch {
            val words = content.trim().split("\\s+".toRegex()).size
            val entity = ParagraphEntity(
                id = "custom_" + System.currentTimeMillis(),
                title = title,
                content = content,
                exam = null,
                difficulty = difficulty,
                wordCount = words,
                estimatedTime = words * 2, // approximation for time limit
                language = language,
                category = category,
                tags = tags,
                folderId = folderId,
                isCustom = true
            )
            repository.addParagraph(entity)
        }
    }

    fun duplicateParagraph(p: ParagraphEntity) {
        viewModelScope.launch {
            val copy = p.copy(
                id = "custom_copy_" + System.currentTimeMillis(),
                title = "${p.title} (Copy)",
                isCustom = true,
                createdAt = System.currentTimeMillis()
            )
            repository.addParagraph(copy)
        }
    }

    fun deleteParagraph(paragraphId: String) {
        viewModelScope.launch {
            repository.deleteParagraph(paragraphId)
        }
    }

    fun toggleFavorite(paragraphId: String, isFav: Boolean) {
        viewModelScope.launch {
            repository.toggleFavorite(paragraphId, isFav)
        }
    }

    fun createFolder(name: String) {
        viewModelScope.launch {
            val folder = FolderEntity(
                id = "folder_" + System.currentTimeMillis(),
                name = name
            )
            repository.addFolder(folder)
        }
    }

    fun deleteFolder(folderId: String) {
        viewModelScope.launch {
            repository.deleteFolder(folderId)
            // Remove folder references from paragraphs in that folder
            val folderParas = paragraphs.value.filter { it.folderId == folderId }
            for (p in folderParas) {
                repository.updateParagraph(p.copy(folderId = null))
            }
        }
    }

    fun startPracticeSession(paragraph: ParagraphEntity) {
        _activeParagraph.value = paragraph
        _isSessionActive.value = true
    }

    fun endPracticeSession(wpm: Double, accuracy: Double, timeSpentSeconds: Long) {
        val paragraph = _activeParagraph.value ?: return
        viewModelScope.launch {
            repository.recordPracticeSession(paragraph.id, wpm, accuracy, timeSpentSeconds)
        }
        _isSessionActive.value = false
    }

    fun cancelPracticeSession() {
        _isSessionActive.value = false
        _activeParagraph.value = null
    }
}
