package com.typesprint.app.exam_hub

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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExamHubScreen(
    viewModel: ExamHubViewModel,
    modifier: Modifier = Modifier
) {
    val examRules by viewModel.examRules.collectAsState()
    val passages by viewModel.passages.collectAsState()
    val attempts by viewModel.attempts.collectAsState()
    val targetExam by viewModel.targetExam.collectAsState()
    val targetExamId by viewModel.targetExamId.collectAsState()
    val readinessScore by viewModel.readinessScore.collectAsState()
    val aiRecommendation by viewModel.aiRecommendation.collectAsState()

    val isExamRunning by viewModel.isExamRunning.collectAsState()
    val activeExam by viewModel.activeExam.collectAsState()
    val activePassage by viewModel.activePassage.collectAsState()
    val lastResult by viewModel.lastResult.collectAsState()

    var showExamSelector by remember { mutableStateOf(false) }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        if (isExamRunning && activeExam != null && activePassage != null) {
            MockTestEngineView(
                exam = activeExam!!,
                passage = activePassage!!,
                onCancel = { viewModel.cancelExam() },
                onSubmit = { text, mins -> viewModel.submitExam(text, mins) }
            )
        } else if (lastResult != null) {
            EvaluationResultView(
                result = lastResult!!,
                onDismiss = { viewModel.dismissResult() }
            )
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header Banner
                item {
                    ExamHubHeader(
                        targetExam = targetExam,
                        readinessScore = readinessScore,
                        onSelectExamClick = { showExamSelector = true }
                    )
                }

                // AI Exam Coach advice
                if (aiRecommendation != null) {
                    item {
                        AiCoachRecommendationCard(recommendation = aiRecommendation!!)
                    }
                }

                // Official Exams list
                item {
                    Text(
                        text = "Official Government Exams",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                }

                items(examRules) { rule ->
                    ExamRuleRow(
                        rule = rule,
                        isTarget = rule.examId == targetExamId,
                        onSelectTarget = { viewModel.setTargetExam(rule.examId) },
                        onStartMock = {
                            val passage = passages.filter { p -> 
                                p.language.lowercase() == rule.language.lowercase() 
                            }.randomOrNull() ?: TypingPassageEntity(
                                id = "fallback",
                                title = "Fallback Passage",
                                category = "General",
                                difficulty = "Medium",
                                language = rule.language,
                                wordCount = 120,
                                estimatedWpm = 35,
                                estimatedDuration = 300,
                                content = "Government exams require persistent typing speed and absolute visual and tactile coordination."
                            )
                            viewModel.startMockExam(rule, passage)
                        }
                    )
                }

                // Practice History logs
                if (attempts.isNotEmpty()) {
                    item {
                        Text(
                            text = "Your Exam Practice History",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }

                    items(attempts.take(5)) { attempt ->
                        HistoryCard(attempt = attempt)
                    }
                }
            }
        }

        // Dropdown Sheet for Target Exams
        if (showExamSelector) {
            AlertDialog(
                onDismissRequest = { showExamSelector = false },
                title = { Text("Choose Target Typing Exam") },
                text = {
                    Box(modifier = Modifier.height(300.dp)) {
                        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(examRules) { rule ->
                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable {
                                            viewModel.setTargetExam(rule.examId)
                                            showExamSelector = false
                                        },
                                    colors = CardDefaults.cardColors(
                                        containerColor = if (rule.examId == targetExamId) 
                                            MaterialTheme.colorScheme.primaryContainer 
                                        else MaterialTheme.colorScheme.surfaceVariant
                                    )
                                ) {
                                    Row(
                                        modifier = Modifier.padding(12.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(rule.examName, fontWeight = FontWeight.Bold)
                                            Text(rule.organization, style = MaterialTheme.typography.bodySmall)
                                        }
                                        if (rule.examId == targetExamId) {
                                            Icon(Icons.Default.Check, contentDescription = "Active")
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                confirmButton = {
                    TextButton(onClick = { showExamSelector = false }) {
                        Text("Done")
                    }
                }
            )
        }
    }
}

@Composable
fun ExamHubHeader(
    targetExam: ExamRuleEntity?,
    readinessScore: Int,
    onSelectExamClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Government Exam Hub",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Simulate real TCS iON configurations and official exam calculation patterns.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Target Preparation", style = MaterialTheme.typography.bodySmall)
                    Text(
                        text = targetExam?.examName ?: "No Exam Selected",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Button(
                        onClick = onSelectExamClick,
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text("Switch Exam", fontSize = 12.sp)
                    }
                }

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .background(
                            brush = Brush.radialGradient(
                                colors = listOf(Color(0xFFE0F7FA), Color(0xFFB2EBF2))
                            ),
                            shape = RoundedCornerShape(12.dp)
                        )
                        .padding(16.dp)
                ) {
                    Text(
                        text = "$readinessScore%",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFF006064)
                    )
                    Text("Readiness Score", fontSize = 10.sp, color = Color(0xFF006064))
                }
            }
        }
    }
}

@Composable
fun AiCoachRecommendationCard(recommendation: AiRecommendationEngine.Recommendation) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.tertiaryContainer
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Star,
                    contentDescription = "AI Recommendation",
                    tint = MaterialTheme.colorScheme.tertiary
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "AI Exam Coach Diagnostics",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onTertiaryContainer
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Estimated Success Chance: ${recommendation.estimatedSuccess}",
                fontWeight = FontWeight.SemiBold,
                fontSize = 14.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Weak Key Focus: ${recommendation.weakKeys} (Avoid pinky over-stretches)",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "Best Practice Drill: ${recommendation.bestLesson}",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(8.dp))
            Divider(color = MaterialTheme.colorScheme.onTertiaryContainer.copy(alpha = 0.1f))
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Daily Goal: ${recommendation.dailyTarget}",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.primary
            )
        }
    }
}

@Composable
fun ExamRuleRow(
    rule: ExamRuleEntity,
    isTarget: Boolean,
    onSelectTarget: () -> Unit,
    onStartMock: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(
                width = if (isTarget) 2.dp else 0.dp,
                color = if (isTarget) MaterialTheme.colorScheme.primary else Color.Transparent,
                shape = RoundedCornerShape(12.dp)
            ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = rule.examName,
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = "${rule.organization} • ${rule.postName}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Box(
                    modifier = Modifier
                        .background(
                            color = if (rule.difficulty == "Hard") Color(0xFFFFEBEE) else Color(0xFFE8F5E9),
                            shape = RoundedCornerShape(8.dp)
                        )
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = rule.difficulty,
                        color = if (rule.difficulty == "Hard") Color(0xFFC62828) else Color(0xFF2E7D32),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Target Speed", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("${rule.requiredWpm} WPM", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
                Column {
                    Text("Min Accuracy", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("${rule.requiredAccuracy}%", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
                Column {
                    Text("Evaluation Pattern", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(rule.typingMethod, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedButton(
                    onClick = onSelectTarget,
                    modifier = Modifier.weight(1f),
                    enabled = !isTarget
                ) {
                    Text(if (isTarget) "Target Active" else "Set Target")
                }

                Button(
                    onClick = onStartMock,
                    modifier = Modifier.weight(1.2f)
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = "Start")
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Start Mock Test")
                }
            }
        }
    }
}

@Composable
fun MockTestEngineView(
    exam: ExamRuleEntity,
    passage: TypingPassageEntity,
    onCancel: () -> Unit,
    onSubmit: (String, Double) -> Unit
) {
    var textInput by remember { mutableStateOf("") }
    var timeRemaining by remember { mutableStateOf(exam.duration * 60) }
    val initialTime = exam.duration * 60

    LaunchedEffect(Unit) {
        while (timeRemaining > 0) {
            delay(1000)
            timeRemaining -= 1
        }
        val mins = (initialTime - timeRemaining) / 60.0
        onSubmit(textInput, if (mins > 0) mins else 0.1)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.surface)
            .padding(16.dp)
    ) {
        // Active test header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onCancel) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Exit")
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(exam.examName, fontWeight = FontWeight.Bold)
                Text(
                    text = "Remaining: ${timeRemaining / 60}:${String.format("%02d", timeRemaining % 60)}",
                    color = MaterialTheme.colorScheme.error,
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 18.sp
                )
            }

            Button(onClick = {
                val mins = (initialTime - timeRemaining) / 60.0
                onSubmit(textInput, if (mins > 0) mins else 0.1)
            }) {
                Text("Submit")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Reference Passage Box
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1.2f),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                Text(
                    text = passage.content,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 15.sp,
                    lineHeight = 22.sp,
                    color = Color.Black
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Typing Input Box
        OutlinedTextField(
            value = textInput,
            onValueChange = { textInput = it },
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            placeholder = { Text("Start typing the passage here exactly as shown above...") },
            textStyle = LocalTextStyle.current.copy(fontFamily = FontFamily.Monospace, fontSize = 15.sp)
        )
    }
}

@Composable
fun EvaluationResultView(
    result: ResultEngine.EvaluationResult,
    onDismiss: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = if (result.isPass) Icons.Default.CheckCircle else Icons.Default.Warning,
            contentDescription = "Status",
            tint = if (result.isPass) Color(0xFF2E7D32) else Color(0xFFC62828),
            modifier = Modifier.size(72.dp)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = if (result.isPass) "EXAM PASSED" else "EXAM FAILED",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.ExtraBold,
            color = if (result.isPass) Color(0xFF2E7D32) else Color(0xFFC62828)
        )

        Spacer(modifier = Modifier.height(24.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            MetricResultItem(label = "Net Speed", value = "${result.netWpm} WPM")
            MetricResultItem(label = "Accuracy", value = "${result.accuracy}%")
            MetricResultItem(label = "Mistakes", value = "${result.mistakes}")
        }

        Spacer(modifier = Modifier.height(32.dp))

        Card(modifier = Modifier.fillMaxWidth()) {
            Text(
                text = result.remarks,
                modifier = Modifier.padding(16.dp),
                textAlign = TextAlign.Center,
                fontSize = 13.sp
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = onDismiss,
            modifier = Modifier.fillMaxWidth(0.6f)
        ) {
            Text("Back to Hub")
        }
    }
}

@Composable
fun MetricResultItem(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, fontSize = 20.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun HistoryCard(attempt: ExamAttemptEntity) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(attempt.examName, fontWeight = FontWeight.Bold)
                Text(attempt.date, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }

            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Column(horizontalAlignment = Alignment.End) {
                    Text("${attempt.wpm} WPM", fontWeight = FontWeight.SemiBold)
                    Text("${attempt.accuracy}% Acc", fontSize = 12.sp)
                }

                Box(
                    modifier = Modifier
                        .background(
                            color = if (attempt.isPass) Color(0xFFE8F5E9) else Color(0xFFFFEBEE),
                            shape = RoundedCornerShape(8.dp)
                        )
                        .padding(horizontal = 8.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = if (attempt.isPass) "PASS" else "FAIL",
                        color = if (attempt.isPass) Color(0xFF2E7D32) else Color(0xFFC62828),
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}
