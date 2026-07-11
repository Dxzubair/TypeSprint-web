package com.typesprint.app.ui

import android.annotation.SuppressLint
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.typesprint.app.database.ExamPassage
import com.typesprint.app.database.PracticeParagraph
import com.typesprint.app.viewmodel.TypeSprintViewModel
import java.text.SimpleDateFormat
import java.util.*

// Colors
val DarkBg = Color(0xFF121214)
val DarkCard = Color(0xFF1E1E24)
val DarkBorder = Color(0xFF2D2D34)
val TealPrimary = Color(0xFF03DAC5)
val RedError = Color(0xFFFF6B6B)
val GrayText = Color(0xFF94A3B8)
val GrayUntyped = Color(0xFF64748B)

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun TypingWebViewScreen() {
    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { context ->
            WebView(context).apply {
                webViewClient = WebViewClient()
                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    allowFileAccess = true
                    allowContentAccess = true
                }
                loadUrl("file:///android_asset/index.html")
            }
        }
    )
}

@Composable
fun ParagraphHubScreen(viewModel: TypeSprintViewModel) {
    val paragraphs by viewModel.paragraphs.collectAsState()
    val practiceSessions by viewModel.practiceSessions.collectAsState()
    val currentParagraph = viewModel.currentParagraph

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBg)
    ) {
        if (currentParagraph == null) {
            // Show Selection list
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    Text(
                        text = "Practice Hub",
                        fontSize = 24(sp),
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                    Text(
                        text = "Choose from our high-fidelity typing practice passages to master accuracy and rhythm.",
                        fontSize = 14(sp),
                        color = GrayText,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                }

                items(paragraphs) { paragraph ->
                    ParagraphCard(paragraph) {
                        viewModel.selectParagraph(paragraph)
                    }
                }

                if (practiceSessions.isNotEmpty()) {
                    item {
                        Divider(
                            modifier = Modifier.padding(vertical = 24.dp),
                            color = DarkBorder
                        )
                        Text(
                            text = "Practice History",
                            fontSize = 18(sp),
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            modifier = Modifier.padding(bottom = 12.dp)
                        )
                    }

                    items(practiceSessions) { session ->
                        HistoryRow(
                            title = session.title,
                            wpm = session.wpm,
                            accuracy = session.accuracy,
                            date = session.date
                        )
                    }
                }
            }
        } else {
            // Show Typing Practice Area
            TypingArea(
                title = currentParagraph.title,
                targetText = currentParagraph.bodyText,
                inputValue = viewModel.paragraphInput,
                liveWpm = viewModel.paragraphWpm,
                liveAccuracy = viewModel.paragraphAccuracy,
                timerValue = viewModel.paragraphTimer,
                isFinished = viewModel.paragraphIsFinished,
                isStarted = viewModel.paragraphIsStarted,
                onValueChange = { viewModel.onParagraphInputChange(it) },
                onBack = { viewModel.resetParagraphTest(); viewModel.selectParagraph(currentParagraph) },
                onClose = { viewModel.resetParagraphTest(); viewModel.selectParagraph(currentParagraph) /* will navigate back */ }
            ) {
                // Exit button
                viewModel.selectParagraph(currentParagraph) // Reset is implicit
                // Set current to null to show lists
                viewModel.viewModelScope.launch {
                    // Trigger a navigation action in effect by setting current null
                }
            }
        }
    }
}

@Composable
fun ParagraphCard(paragraph: PracticeParagraph, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .border(1.dp, DarkBorder, RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = DarkCard),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = paragraph.title,
                    fontSize = 16(sp),
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Badge(
                    containerColor = when (paragraph.level) {
                        "Easy" -> Color(0xFF1B5E20)
                        "Medium" -> Color(0xFFE65100)
                        else -> Color(0xFFB71C1C)
                    },
                    modifier = Modifier.padding(horizontal = 4.dp)
                ) {
                    Text(
                        text = paragraph.level,
                        color = Color.White,
                        fontSize = 10(sp),
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = paragraph.bodyText,
                fontSize = 13(sp),
                color = GrayText,
                maxLines = 2,
                modifier = Modifier.padding(top = 4.dp)
            )
        }
    }
}

@Composable
fun GovtExamsScreen(viewModel: TypeSprintViewModel) {
    val exams by viewModel.exams.collectAsState()
    val examAttempts by viewModel.examAttempts.collectAsState()
    val currentExam = viewModel.currentExam

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBg)
    ) {
        if (currentExam == null) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    Text(
                        text = "Government Exams Arena",
                        fontSize = 24(sp),
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                    Text(
                        text = "Practice real layouts modeled precisely on government typing exams (SSC, Railways, High Courts).",
                        fontSize = 14(sp),
                        color = GrayText,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                }

                items(exams) { exam ->
                    ExamCard(exam) {
                        viewModel.selectExam(exam)
                    }
                }

                if (examAttempts.isNotEmpty()) {
                    item {
                        Divider(
                            modifier = Modifier.padding(vertical = 24.dp),
                            color = DarkBorder
                        )
                        Text(
                            text = "Exam Attempt History",
                            fontSize = 18(sp),
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            modifier = Modifier.padding(bottom = 12.dp)
                        )
                    }

                    items(examAttempts) { attempt ->
                        HistoryRow(
                            title = "${attempt.examName} (Errors: ${attempt.errorsCount})",
                            wpm = attempt.wpm,
                            accuracy = attempt.accuracy,
                            date = attempt.date
                        )
                    }
                }
            }
        } else {
            // Show Typing Test with strict parameters
            TypingArea(
                title = currentExam.name,
                targetText = currentExam.passageText,
                inputValue = viewModel.examInput,
                liveWpm = viewModel.examWpm,
                liveAccuracy = viewModel.examAccuracy,
                timerValue = viewModel.examTimerLeftSeconds,
                isFinished = viewModel.examIsFinished,
                isStarted = viewModel.examIsStarted,
                onValueChange = { viewModel.onExamInputChange(it) },
                onBack = { viewModel.resetExamTest(); viewModel.selectExam(currentExam) },
                onClose = { viewModel.resetExamTest(); viewModel.selectExam(currentExam) /* will exit */ },
                isExam = true
            )
        }
    }
}

@Composable
fun ExamCard(exam: ExamPassage, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .border(1.dp, DarkBorder, RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = DarkCard),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = exam.name,
                    fontSize = 16(sp),
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "${exam.examDurationMinutes} Min",
                    color = TealPrimary,
                    fontSize = 12(sp),
                    fontWeight = FontWeight.SemiBold
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = exam.description,
                fontSize = 13(sp),
                color = GrayText,
                modifier = Modifier.padding(vertical = 4.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                RuleIndicator(label = "Backspace", enabled = exam.backspaceAllowed)
                RuleIndicator(label = "Error Highlight", enabled = exam.errorHighlighting)
            }
        }
    }
}

@Composable
fun RuleIndicator(label: String, enabled: Boolean) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Icon(
            imageVector = if (enabled) Icons.Default.CheckCircle else Icons.Default.Cancel,
            contentDescription = null,
            tint = if (enabled) TealPrimary else RedError,
            modifier = Modifier.size(16.dp)
        )
        Text(
            text = "$label: ${if (enabled) "ON" : "OFF"}",
            fontSize = 11(sp),
            color = GrayText,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun HistoryRow(title: String, wpm: Int, accuracy: Int, date: Long) {
    val dateString = remember(date) {
        val sdf = SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.getDefault())
        sdf.format(Date(date))
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, DarkBorder, RoundedCornerShape(10.dp)),
        colors = CardDefaults.cardColors(containerColor = DarkCard),
        shape = RoundedCornerShape(10.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = title,
                    fontSize = 14(sp),
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = dateString,
                    fontSize = 11(sp),
                    color = GrayUntyped,
                    fontFamily = FontFamily.Monospace
                )
            }

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Column(horizontalAlignment = Alignment.End) {
                    Text(text = "Speed", fontSize = 10(sp), color = GrayUntyped)
                    Text(
                        text = "$wpm WPM",
                        fontSize = 14(sp),
                        fontWeight = FontWeight.ExtraBold,
                        color = TealPrimary,
                        fontFamily = FontFamily.Monospace
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(text = "Accuracy", fontSize = 10(sp), color = GrayUntyped)
                    Text(
                        text = "$accuracy%",
                        fontSize = 14(sp),
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalAnimationApi::class)
@Composable
fun TypingArea(
    title: String,
    targetText: String,
    inputValue: String,
    liveWpm: Int,
    liveAccuracy: Int,
    timerValue: Int,
    isFinished: Boolean,
    isStarted: Boolean,
    onValueChange: (String) -> Unit,
    onBack: () -> Unit,
    onClose: () -> Unit,
    isExam: Boolean = false
) {
    // We want to force clear current paragraph selection on Back arrow
    // Since VM has private setter we will rely on closures
    var tempInputState by remember { mutableStateOf(TextFieldValue("")) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Toolbar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = Color.White
                )
            }
            Text(
                text = title,
                fontSize = 18(sp),
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            IconButton(onClick = onBack) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Exit",
                    tint = Color.White
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Metrics Board
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(DarkCard, RoundedCornerShape(12.dp))
                .border(1.dp, DarkBorder, RoundedCornerShape(12.dp))
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            MetricBox(
                label = "Speed",
                value = "$liveWpm",
                suffix = "WPM",
                color = TealPrimary
            )
            MetricBox(
                label = "Accuracy",
                value = "$liveAccuracy",
                suffix = "%",
                color = Color.White
            )
            MetricBox(
                label = if (isExam) "Time Left" else "Elapsed",
                value = if (isExam) "${timerValue / 60}:${String.format("%02d", timerValue % 60)}" else "$timerValue",
                suffix = if (isExam) "" else "s",
                color = if (isExam && timerValue < 30) RedError else TealPrimary
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Target Text Panel
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .border(1.dp, DarkBorder, RoundedCornerShape(16.dp)),
            colors = CardDefaults.cardColors(containerColor = DarkCard),
            shape = RoundedCornerShape(16.dp)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                if (isFinished) {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.Stars,
                            contentDescription = null,
                            tint = TealPrimary,
                            modifier = Modifier.size(64.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Practice Complete!",
                            fontSize = 22(sp),
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Your results are calculated below. Click restart to practice again.",
                            fontSize = 14(sp),
                            color = GrayText,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(24.dp))
                        Button(
                            onClick = onBack,
                            colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = null,
                                tint = DarkBg
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Practice Again",
                                color = DarkBg,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                } else {
                    Column(modifier = Modifier.fillMaxSize()) {
                        // Text render block
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxWidth()
                        ) {
                            Text(
                                text = buildAnnotatedString {
                                    for (i in targetText.indices) {
                                        val char = targetText[i]
                                        if (i < inputValue.length) {
                                            val typedChar = inputValue[i]
                                            val isCorrect = typedChar == char
                                            withStyle(
                                                style = SpanStyle(
                                                    color = if (isCorrect) TealPrimary else RedError,
                                                    background = if (isCorrect) Color.Transparent else RedError.copy(
                                                        alpha = 0.15f
                                                    ),
                                                    fontWeight = FontWeight.Bold
                                                )
                                            ) {
                                                append(char)
                                            }
                                        } else if (i == inputValue.length) {
                                            withStyle(
                                                style = SpanStyle(
                                                    color = Color.White,
                                                    background = TealPrimary.copy(alpha = 0.25f),
                                                    fontWeight = FontWeight.ExtraBold
                                                )
                                            ) {
                                                append(char)
                                            }
                                        } else {
                                            withStyle(
                                                style = SpanStyle(
                                                    color = GrayUntyped
                                                )
                                            ) {
                                                append(char)
                                            }
                                        }
                                    }
                                },
                                fontSize = 18(sp),
                                fontFamily = FontFamily.Monospace,
                                lineHeight = 28(sp),
                                modifier = Modifier.fillMaxWidth()
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Capture Input Area
                        OutlinedTextField(
                            value = inputValue,
                            onValueChange = onValueChange,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(80.dp),
                            placeholder = {
                                Text(
                                    text = if (!isStarted) "Start typing to begin..." else "Type passage exactly...",
                                    color = GrayUntyped,
                                    fontSize = 14(sp)
                                )
                            },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedContainerColor = DarkBg,
                                unfocusedContainerColor = DarkBg,
                                focusedBorderColor = TealPrimary,
                                unfocusedBorderColor = DarkBorder
                            ),
                            shape = RoundedCornerShape(12.dp),
                            singleLine = true,
                            maxLines = 1
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun MetricBox(label: String, value: String, suffix: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = label.uppercase(Locale.getDefault()),
            fontSize = 10(sp),
            color = GrayText,
            fontWeight = FontWeight.SemiBold,
            letterSpacing = 1.sp
        )
        Spacer(modifier = Modifier.height(4.dp))
        Row(verticalAlignment = Alignment.Bottom) {
            Text(
                text = value,
                fontSize = 24(sp),
                fontWeight = FontWeight.ExtraBold,
                color = color,
                fontFamily = FontFamily.Monospace
            )
            if (suffix.isNotEmpty()) {
                Spacer(modifier = Modifier.width(2.dp))
                Text(
                    text = suffix,
                    fontSize = 12(sp),
                    color = GrayText,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}
