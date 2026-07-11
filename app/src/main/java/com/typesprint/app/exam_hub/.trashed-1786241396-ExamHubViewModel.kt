package com.typesprint.app.exam_hub

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class ExamHubViewModel(application: Application, private val repository: ExamHubRepository) : AndroidViewModel(application) {

    // Target Exam state
    private val _targetExamId = MutableStateFlow("jkssb-jr-ast")
    val targetExamId: StateFlow<String> = _targetExamId.asStateFlow()

    // Screen States
    val examRules: StateFlow<List<ExamRuleEntity>> = repository.examRules
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val passages: StateFlow<List<TypingPassageEntity>> = repository.passages
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val attempts: StateFlow<List<ExamAttemptEntity>> = repository.attempts
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Calculated stats
    val targetExam: StateFlow<ExamRuleEntity?> = combine(examRules, targetExamId) { rules, id ->
        rules.find { it.examId == id }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val readinessScore: StateFlow<Int> = combine(attempts, targetExam) { history, target ->
        if (target == null) 20
        else {
            val relevant = history.filter { it.examId == target.examId }
            ReadinessCalculator.calculateReadiness(relevant, target.requiredWpm, target.requiredAccuracy)
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 20)

    val aiRecommendation: StateFlow<AiRecommendationEngine.Recommendation?> = combine(attempts, targetExam) { history, target ->
        if (target == null) null
        else {
            val relevant = history.filter { it.examId == target.examId }
            AiRecommendationEngine.getRecommendations(relevant, target.requiredWpm, target.examName)
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    // Current Exam Session (Live State)
    private val _activeExam = MutableStateFlow<ExamRuleEntity?>(null)
    val activeExam: StateFlow<ExamRuleEntity?> = _activeExam.asStateFlow()

    private val _activePassage = MutableStateFlow<TypingPassageEntity?>(null)
    val activePassage: StateFlow<TypingPassageEntity?> = _activePassage.asStateFlow()

    private val _isExamRunning = MutableStateFlow(false)
    val isExamRunning: StateFlow<Boolean> = _isExamRunning.asStateFlow()

    private val _lastResult = MutableStateFlow<ResultEngine.EvaluationResult?>(null)
    val lastResult: StateFlow<ResultEngine.EvaluationResult?> = _lastResult.asStateFlow()

    init {
        viewModelScope.launch {
            repository.seedDatabaseIfEmpty()
        }
    }

    fun setTargetExam(examId: String) {
        _targetExamId.value = examId
    }

    fun startMockExam(exam: ExamRuleEntity, passage: TypingPassageEntity) {
        _activeExam.value = exam
        _activePassage.value = passage
        _lastResult.value = null
        _isExamRunning.value = true
    }

    fun submitExam(typedText: String, durationMinutes: Double) {
        val exam = _activeExam.value ?: return
        val passage = _activePassage.value ?: return

        val evaluation = ResultEngine.evaluate(
            typedText = typedText,
            referenceText = passage.content,
            examId = exam.examId,
            requiredWpm = exam.requiredWpm,
            requiredAccuracy = exam.requiredAccuracy,
            timeSpentMinutes = durationMinutes
        )

        _lastResult.value = evaluation
        _isExamRunning.value = false

        // Save Attempt to room
        viewModelScope.launch {
            val weakKeysList = listOf("Q", "Z", "X", "P").shuffled().take(2).joinToString(", ")
            val weakFingersList = listOf("Left Pinky", "Right Pinky").shuffled().take(1).joinToString(", ")

            val entity = ExamAttemptEntity(
                examId = exam.examId,
                examName = exam.examName,
                date = "Today",
                wpm = evaluation.netWpm,
                accuracy = evaluation.accuracy,
                mistakes = evaluation.mistakes,
                isPass = evaluation.isPass,
                readinessScore = (evaluation.netWpm / exam.requiredWpm * 100).toInt().coerceAtMost(100),
                timeSpentSeconds = (durationMinutes * 60).toInt(),
                weakKeys = weakKeysList,
                weakFingers = weakFingersList
            )
            repository.saveAttempt(entity)
        }
    }

    fun cancelExam() {
        _isExamRunning.value = false
        _activeExam.value = null
        _activePassage.value = null
    }

    fun dismissResult() {
        _lastResult.value = null
        _activeExam.value = null
        _activePassage.value = null
    }

    fun triggerRuleSyncFromServer(rulesJson: String) {
        viewModelScope.launch {
            repository.updateDatabaseFromCloud(rulesJson)
        }
    }

    fun clearHistory() {
        viewModelScope.launch {
            repository.clearAttempts()
        }
    }
}
