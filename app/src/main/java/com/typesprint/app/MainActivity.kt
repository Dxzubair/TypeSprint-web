package com.typesprint.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.Keyboard
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.lifecycle.lifecycleScope
import com.typesprint.app.database.TypeSprintDatabase
import com.typesprint.app.database.TypeSprintRepository
import com.typesprint.app.ui.DarkBg
import com.typesprint.app.ui.DarkCard
import com.typesprint.app.ui.GovtExamsScreen
import com.typesprint.app.ui.ParagraphHubScreen
import com.typesprint.app.ui.TealPrimary
import com.typesprint.app.ui.TypingWebViewScreen
import com.typesprint.app.viewmodel.TypeSprintViewModel
import com.typesprint.app.viewmodel.TypeSprintViewModelFactory

class MainActivity : ComponentActivity() {

    private val database by lazy { TypeSprintDatabase.getDatabase(this, lifecycleScope) }
    private val repository by lazy { TypeSprintRepository(database.dao()) }

    private val viewModel: TypeSprintViewModel by viewModels {
        TypeSprintViewModelFactory(repository)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = DarkBg,
                    surface = DarkCard,
                    primary = TealPrimary
                )
            ) {
                var selectedTab by remember { mutableIntStateOf(0) }

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        NavigationBar(
                            containerColor = DarkCard,
                            contentColor = Color.White
                        ) {
                            NavigationBarItem(
                                selected = selectedTab == 0,
                                onClick = { selectedTab = 0 },
                                icon = { Icon(Icons.Default.Keyboard, contentDescription = "Web Typing") },
                                label = { Text("Web Practice") },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = DarkBg,
                                    selectedTextColor = TealPrimary,
                                    indicatorColor = TealPrimary,
                                    unselectedIconColor = Color.White.copy(alpha = 0.6f),
                                    unselectedTextColor = Color.White.copy(alpha = 0.6f)
                                )
                            )
                            NavigationBarItem(
                                selected = selectedTab == 1,
                                onClick = { selectedTab = 1 },
                                icon = { Icon(Icons.Default.Assignment, contentDescription = "Paragraph Hub") },
                                label = { Text("Paragraph Hub") },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = DarkBg,
                                    selectedTextColor = TealPrimary,
                                    indicatorColor = TealPrimary,
                                    unselectedIconColor = Color.White.copy(alpha = 0.6f),
                                    unselectedTextColor = Color.White.copy(alpha = 0.6f)
                                )
                            )
                            NavigationBarItem(
                                selected = selectedTab == 2,
                                onClick = { selectedTab = 2 },
                                icon = { Icon(Icons.Default.School, contentDescription = "Govt Exams") },
                                label = { Text("Govt Exams") },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = DarkBg,
                                    selectedTextColor = TealPrimary,
                                    indicatorColor = TealPrimary,
                                    unselectedIconColor = Color.White.copy(alpha = 0.6f),
                                    unselectedTextColor = Color.White.copy(alpha = 0.6f)
                                )
                            )
                        }
                    }
                ) { innerPadding ->
                    Surface(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding),
                        color = DarkBg
                    ) {
                        when (selectedTab) {
                            0 -> TypingWebViewScreen()
                            1 -> ParagraphHubScreen(viewModel)
                            2 -> GovtExamsScreen(viewModel)
                        }
                    }
                }
            }
        }
    }
}
