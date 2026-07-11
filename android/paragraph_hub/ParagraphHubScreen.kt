package com.typesprint.app.paragraph_hub

import androidx.compose.animation.*
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
fun ParagraphHubScreen(
    viewModel: ParagraphHubViewModel,
    modifier: Modifier = Modifier
) {
    val paragraphs by viewModel.paragraphs.collectAsState()
    val filteredParagraphs by viewModel.filteredParagraphs.collectAsState()
    val folders by viewModel.folders.collectAsState()
    val favorites by viewModel.favorites.collectAsState()
    val recents by viewModel.recents.collectAsState()
    val categories by viewModel.categories.collectAsState()
    val tags by viewModel.tags.collectAsState()

    val searchQuery by viewModel.searchQuery.collectAsState()
    val selectedCategory by viewModel.selectedCategory.collectAsState()
    val selectedDifficulty by viewModel.selectedDifficulty.collectAsState()
    val selectedFolderId by viewModel.selectedFolderId.collectAsState()
    val sortBy by viewModel.sortBy.collectAsState()

    val activeParagraph by viewModel.activeParagraph.collectAsState()
    val isSessionActive by viewModel.isSessionActive.collectAsState()

    var activeTab by remember { mutableStateOf(0) } // 0: Official, 1: Practice, 2: My Paragraphs, 3: AI Generator
    var isGridView by remember { mutableStateOf(true) }
    var showCreateDialog by remember { mutableStateOf(false) }
    var showFolderDialog by remember { mutableStateOf(false) }

    val coroutineScope = rememberCoroutineScope()
    val clipboardManager = LocalClipboardManager.current

    // Orange/Amber colors fitting TypeSprint styling
    val OrangeAccent = Color(0xFFFF9800)
    val CardBackground = Color(0xFF1E1E24)
    val ScreenBackground = Color(0xFF121214)

    if (isSessionActive && activeParagraph != null) {
        // Mock Session Engine view
        KotlinPracticeSession(
            paragraph = activeParagraph!!,
            viewModel = viewModel,
            onCancel = { viewModel.cancelPracticeSession() },
            onComplete = { wpm, acc, secs ->
                viewModel.endPracticeSession(wpm, acc, secs)
            }
        )
    } else {
        Column(
            modifier = modifier
                .fillMaxSize()
                .background(ScreenBackground)
                .padding(16.dp)
        ) {
            // Header and Tab switching
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Paragraph Hub",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Row {
                    IconButton(onClick = { isGridView = !isGridView }) {
                        Icon(
                            imageVector = if (isGridView) Icons.Default.List else Icons.Default.GridOn,
                            contentDescription = "Toggle Grid/List",
                            tint = Color.LightGray
                        )
                    }
                    if (activeTab == 2) {
                        IconButton(onClick = { showCreateDialog = true }) {
                            Icon(
                                imageVector = Icons.Default.Add,
                                contentDescription = "Add custom paragraph",
                                tint = OrangeAccent
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Navigation tabs row
            ScrollableTabRow(
                selectedTabIndex = activeTab,
                containerColor = Color.Transparent,
                contentColor = OrangeAccent,
                edgePadding = 0.dp
            ) {
                listOf("Official Exams", "Practice Library", "My Paragraphs", "AI Paragraphs").forEachIndexed { index, title ->
                    Tab(
                        selected = activeTab == index,
                        onClick = { 
                            activeTab = index
                            // Reset folder selection when moving tabs
                            viewModel.setSelectedFolder(null)
                        },
                        text = { 
                            Text(
                                text = title,
                                fontWeight = if (activeTab == index) FontWeight.Bold else FontWeight.Normal,
                                color = if (activeTab == index) OrangeAccent else Color.Gray
                            )
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Search Bar and Quick filters
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { viewModel.setSearchQuery(it) },
                placeholder = { Text("Search title, tags, or content...", color = Color.Gray) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = Color.Gray) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = TextFieldDefaults.outlinedTextFieldColors(
                    focusedBorderColor = OrangeAccent,
                    unfocusedBorderColor = Color.DarkGray,
                    textColor = Color.White,
                    containerColor = CardBackground
                )
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Category & Sort row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Category Selector
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .background(CardBackground, RoundedCornerShape(8.dp))
                        .border(1.dp, Color.DarkGray, RoundedCornerShape(8.dp))
                        .clickable { /* Toggle category sheet */ }
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = "Category: $selectedCategory",
                        color = Color.LightGray,
                        fontSize = 12.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                // Sort Selector
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .background(CardBackground, RoundedCornerShape(8.dp))
                        .border(1.dp, Color.DarkGray, RoundedCornerShape(8.dp))
                        .clickable {
                            val nextSort = when (sortBy) {
                                "Recent" -> "A-Z"
                                "A-Z" -> "WPM"
                                "WPM" -> "Favorites"
                                else -> "Recent"
                            }
                            viewModel.setSortBy(nextSort)
                        }
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = "Sort: $sortBy",
                        color = Color.LightGray,
                        fontSize = 12.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Body depending on selected tab
            when (activeTab) {
                3 -> {
                    // AI Generator Coming Soon UI
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                            .background(CardBackground, RoundedCornerShape(16.dp))
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.AutoAwesome,
                                contentDescription = "AI Coach",
                                tint = OrangeAccent,
                                modifier = Modifier.size(64.dp)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "AI Paragraph Generator",
                                style = MaterialTheme.typography.titleLarge,
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Generate tailored paragraphs targeting your weak keys dynamically using Gemini AI Coach.",
                                color = Color.Gray,
                                textAlign = TextAlign.Center,
                                fontSize = 12.sp
                            )
                            Spacer(modifier = Modifier.height(24.dp))
                            Button(
                                onClick = { /* Upcoming */ },
                                colors = ButtonDefaults.buttonColors(containerColor = OrangeAccent)
                            ) {
                                Text("Premium AI Coach Access", color = Color.Black, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
                else -> {
                    // Display folders list on custom paragraphs
                    if (activeTab == 2) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("My Folders", color = Color.LightGray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Text(
                                text = "+ Add Folder",
                                color = OrangeAccent,
                                fontSize = 12.sp,
                                modifier = Modifier.clickable { showFolderDialog = true }
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Folders list row
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .background(
                                        if (selectedFolderId == null) OrangeAccent.copy(alpha = 0.15f) else CardBackground,
                                        RoundedCornerShape(8.dp)
                                    )
                                    .border(
                                        1.dp,
                                        if (selectedFolderId == null) OrangeAccent else Color.DarkGray,
                                        RoundedCornerShape(8.dp)
                                    )
                                    .clickable { viewModel.setSelectedFolder(null) }
                                    .padding(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text("All Docs", color = if (selectedFolderId == null) OrangeAccent else Color.White, fontSize = 11.sp)
                            }

                            folders.forEach { folder ->
                                Box(
                                    modifier = Modifier
                                        .background(
                                            if (selectedFolderId == folder.id) OrangeAccent.copy(alpha = 0.15f) else CardBackground,
                                            RoundedCornerShape(8.dp)
                                        )
                                        .border(
                                            1.dp,
                                            if (selectedFolderId == folder.id) OrangeAccent else Color.DarkGray,
                                            RoundedCornerShape(8.dp)
                                        )
                                        .combinedClickable(
                                            onClick = { viewModel.setSelectedFolder(folder.id) },
                                            onLongClick = { viewModel.deleteFolder(folder.id) }
                                        )
                                        .padding(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Text(
                                        text = folder.name,
                                        color = if (selectedFolderId == folder.id) OrangeAccent else Color.White,
                                        fontSize = 11.sp
                                    )
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                    }

                    // Render list of matching paragraphs
                    val displayList = filteredParagraphs.filter {
                        when (activeTab) {
                            0 -> it.exam != null
                            1 -> it.exam == null && !it.isCustom
                            else -> it.isCustom
                        }
                    }

                    if (displayList.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("No paragraphs found in this section.", color = Color.Gray, fontSize = 13.sp)
                        }
                    } else if (isGridView) {
                        LazyVerticalGrid(
                            columns = GridCells.Fixed(2),
                            modifier = Modifier.weight(1f),
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            items(displayList) { p ->
                                ParagraphGridItem(
                                    paragraph = p,
                                    favorites = favorites,
                                    recents = recents,
                                    OrangeAccent = OrangeAccent,
                                    CardBackground = CardBackground,
                                    onSelect = { viewModel.startPracticeSession(p) },
                                    onFavToggle = { viewModel.toggleFavorite(p.id, it) },
                                    onDuplicate = { viewModel.duplicateParagraph(p) },
                                    onDelete = { viewModel.deleteParagraph(p.id) }
                                )
                            }
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            items(displayList) { p ->
                                ParagraphListItem(
                                    paragraph = p,
                                    favorites = favorites,
                                    recents = recents,
                                    OrangeAccent = OrangeAccent,
                                    CardBackground = CardBackground,
                                    onSelect = { viewModel.startPracticeSession(p) },
                                    onFavToggle = { viewModel.toggleFavorite(p.id, it) },
                                    onDuplicate = { viewModel.duplicateParagraph(p) },
                                    onDelete = { viewModel.deleteParagraph(p.id) }
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    // Modal dialog for paragraph creation
    if (showCreateDialog) {
        var newTitle by remember { mutableStateOf("") }
        var newContent by remember { mutableStateOf("") }
        var newCategory by remember { mutableStateOf("Applications") }
        var newDifficulty by remember { mutableStateOf("Medium") }
        var newLanguage by remember { mutableStateOf("English") }

        AlertDialog(
            onDismissRequest = { showCreateDialog = false },
            containerColor = CardBackground,
            title = { Text("Create Typing Paragraph", color = Color.White, fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedTextField(
                        value = newTitle,
                        onValueChange = { newTitle = it },
                        label = { Text("Title", color = Color.Gray) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = TextFieldDefaults.outlinedTextFieldColors(textColor = Color.White, focusedBorderColor = OrangeAccent)
                    )

                    OutlinedTextField(
                        value = newContent,
                        onValueChange = { newContent = it },
                        label = { Text("Paste Paragraph Text", color = Color.Gray) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(140.dp),
                        colors = TextFieldDefaults.outlinedTextFieldColors(textColor = Color.White, focusedBorderColor = OrangeAccent)
                    )

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = {
                                clipboardManager.getText()?.text?.let {
                                    newContent = it
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color.DarkGray),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Clipboard Paste", color = Color.White, fontSize = 11.sp)
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newTitle.isNotBlank() && newContent.isNotBlank()) {
                            viewModel.createCustomParagraph(
                                title = newTitle,
                                content = newContent,
                                category = newCategory,
                                difficulty = newDifficulty,
                                language = newLanguage,
                                tags = "Custom, Practice",
                                folderId = selectedFolderId
                            )
                            showCreateDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = OrangeAccent)
                ) {
                    Text("Save Document", color = Color.Black, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showCreateDialog = false }) {
                    Text("Cancel", color = Color.LightGray)
                }
            }
        )
    }

    // Modal dialog for folder creation
    if (showFolderDialog) {
        var folderName by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { showFolderDialog = false },
            containerColor = CardBackground,
            title = { Text("Create New Folder", color = Color.White, fontWeight = FontWeight.Bold) },
            text = {
                OutlinedTextField(
                    value = folderName,
                    onValueChange = { folderName = it },
                    label = { Text("Folder Name", color = Color.Gray) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = TextFieldDefaults.outlinedTextFieldColors(textColor = Color.White, focusedBorderColor = OrangeAccent)
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (folderName.isNotBlank()) {
                            viewModel.createFolder(folderName)
                            showFolderDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = OrangeAccent)
                ) {
                    Text("Create", color = Color.Black, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showFolderDialog = false }) {
                    Text("Cancel", color = Color.LightGray)
                }
            }
        )
    }
}

@Composable
fun ParagraphGridItem(
    paragraph: ParagraphEntity,
    favorites: List<FavoriteEntity>,
    recents: List<RecentEntity>,
    OrangeAccent: Color,
    CardBackground: Color,
    onSelect: () -> Unit,
    onFavToggle: (Boolean) -> Unit,
    onDuplicate: () -> Unit,
    onDelete: () -> Unit
) {
    val isFav = favorites.any { it.paragraphId == paragraph.id }
    val record = recents.find { it.paragraphId == paragraph.id }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(CardBackground)
            .border(1.dp, Color.DarkGray, RoundedCornerShape(12.dp))
            .clickable { onSelect() }
            .padding(12.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = paragraph.category,
                color = OrangeAccent,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold
            )

            IconButton(
                onClick = { onFavToggle(!isFav) },
                modifier = Modifier.size(24.dp)
            ) {
                Icon(
                    imageVector = if (isFav) Icons.Default.Star else Icons.Default.StarBorder,
                    contentDescription = "Favorite",
                    tint = if (isFav) OrangeAccent else Color.Gray,
                    modifier = Modifier.size(16.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = paragraph.title,
            color = Color.White,
            fontWeight = FontWeight.Bold,
            fontSize = 13.sp,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = "${paragraph.wordCount} words • ${paragraph.difficulty}",
            color = Color.Gray,
            fontSize = 11.sp
        )

        Spacer(modifier = Modifier.height(10.dp))

        if (record != null) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.Black.copy(alpha = 0.2f), RoundedCornerShape(6.dp))
                    .padding(6.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Best WPM:", color = Color.Gray, fontSize = 9.sp)
                    Text("${record.bestWpm.toInt()} WPM", color = Color.LightGray, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Best Acc:", color = Color.Gray, fontSize = 9.sp)
                    Text("${record.bestAccuracy.toInt()}%", color = Color.LightGray, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                }
            }
        } else {
            Text(
                text = "Not Practiced Yet",
                color = Color.DarkGray,
                fontSize = 10.sp,
                fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
            )
        }

        if (paragraph.isCustom) {
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Copy",
                    color = Color.Gray,
                    fontSize = 10.sp,
                    modifier = Modifier
                        .clickable { onDuplicate() }
                        .padding(horizontal = 6.dp)
                )
                Text(
                    text = "Delete",
                    color = Color.Red,
                    fontSize = 10.sp,
                    modifier = Modifier
                        .clickable { onDelete() }
                        .padding(horizontal = 6.dp)
                )
            }
        }
    }
}

@Composable
fun ParagraphListItem(
    paragraph: ParagraphEntity,
    favorites: List<FavoriteEntity>,
    recents: List<RecentEntity>,
    OrangeAccent: Color,
    CardBackground: Color,
    onSelect: () -> Unit,
    onFavToggle: (Boolean) -> Unit,
    onDuplicate: () -> Unit,
    onDelete: () -> Unit
) {
    val isFav = favorites.any { it.paragraphId == paragraph.id }
    val record = recents.find { it.paragraphId == paragraph.id }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(CardBackground)
            .border(1.dp, Color.DarkGray, RoundedCornerShape(12.dp))
            .clickable { onSelect() }
            .padding(14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = paragraph.category,
                    color = OrangeAccent,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.width(8.dp))
                if (paragraph.exam != null) {
                    Text(
                        text = "• ${paragraph.exam}",
                        color = Color.LightGray,
                        fontSize = 10.sp
                    )
                }
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = paragraph.title,
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "${paragraph.wordCount} words • ${paragraph.difficulty} • ${paragraph.language}",
                color = Color.Gray,
                fontSize = 11.sp
            )
        }

        Row(verticalAlignment = Alignment.CenterVertically) {
            if (record != null) {
                Column(
                    horizontalAlignment = Alignment.End,
                    modifier = Modifier.padding(end = 12.dp)
                ) {
                    Text("${record.bestWpm.toInt()} WPM", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text("${record.bestAccuracy.toInt()}% Acc", color = Color.Gray, fontSize = 10.sp)
                }
            }

            IconButton(onClick = { onFavToggle(!isFav) }) {
                Icon(
                    imageVector = if (isFav) Icons.Default.Star else Icons.Default.StarBorder,
                    contentDescription = "Favorite",
                    tint = if (isFav) OrangeAccent else Color.Gray,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}

@Composable
fun KotlinPracticeSession(
    paragraph: ParagraphEntity,
    viewModel: ParagraphHubViewModel,
    onCancel: () -> Unit,
    onComplete: (Double, Double, Long) -> Unit
) {
    // Standard modular typing session UI container
    var typedText by remember { mutableStateOf("") }
    var timeElapsedSeconds by remember { mutableStateOf(0L) }

    LaunchedEffect(Unit) {
        while (true) {
            kotlinx.coroutines.delay(1000L)
            timeElapsedSeconds++
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF121214))
            .padding(16.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Practice: ${paragraph.title}",
                    style = MaterialTheme.typography.titleMedium,
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
                Button(
                    onClick = onCancel,
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Red.copy(alpha = 0.2f))
                ) {
                    Text("Exit", color = Color.Red, fontSize = 11.sp)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Reference Paragraph
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF1E1E24), RoundedCornerShape(12.dp))
                    .padding(16.dp)
                    .border(1.dp, Color.DarkGray, RoundedCornerShape(12.dp))
            ) {
                Text(
                    text = paragraph.content,
                    color = Color.LightGray,
                    fontSize = 15.sp,
                    lineHeight = 22.sp
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Text Input area
            OutlinedTextField(
                value = typedText,
                onValueChange = { typedText = it },
                placeholder = { Text("Start typing the passage above...", color = Color.Gray) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(140.dp),
                colors = TextFieldDefaults.outlinedTextFieldColors(
                    textColor = Color.White,
                    containerColor = Color(0xFF1E1E24),
                    focusedBorderColor = Color(0xFFFF9800)
                )
            )
        }

        // Dashboard submit control
        Button(
            onClick = {
                val words = typedText.trim().split("\\s+".toRegex()).size
                val actualSeconds = maxOf(1L, timeElapsedSeconds)
                val wpm = (words / (actualSeconds / 60.0))
                onComplete(wpm, 98.0, actualSeconds)
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF9800)),
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
        ) {
            Text("Complete Paragraph Run", color = Color.Black, fontWeight = FontWeight.Bold)
        }
    }
}
