package com.typesprint.app.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.typesprint.app.database.*
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class TypeSprintViewModel(private val repository: TypeSprintRepository) : ViewModel() {

    // Database flows
    val paragraphs: StateFlow<List<PracticeParagraph>> = repository.allParagraphs
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val exams: StateFlow<List<ExamPassage>> = repository.allExams
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val practiceSessions: StateFlow<List<PracticeSession>> = repository.allPracticeSessions
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val examAttempts: StateFlow<List<ExamAttempt>> = repository.allExamAttempts
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())


    // --- PARAGRAPH HUB STATE & LOGIC ---
    var currentParagraph by mutableStateOf<PracticeParagraph?>(null)
        private set
    var paragraphInput by mutableStateOf("")
        private set
    var paragraphTimer by mutableStateOf(0)
        private set
    var paragraphIsStarted by mutableStateOf(false)
        private set
    var paragraphIsFinished by mutableStateOf(false)
        private set
    var paragraphWpm by mutableStateOf(0)
        private set
    var paragraphAccuracy by mutableStateOf(100)
        private set

    private var paragraphTimerJob: Job? = null
    private var paragraphStartTime: Long = 0

    fun selectParagraph(paragraph: PracticeParagraph) {
        currentParagraph = paragraph
        resetParagraphTest()
    }

    fun onParagraphInputChange(input: String) {
        val target = currentParagraph?.bodyText ?: return
        if (paragraphIsFinished) return

        if (!paragraphIsStarted) {
            paragraphIsStarted = true
            paragraphStartTime = System.currentTimeMillis()
            startParagraphTimer()
        }

        if (input.length <= target.length) {
            paragraphInput = input

            // Calculate live accuracy
            var correct = 0
            for (i in input.indices) {
                if (input[i] == target[i]) correct++
            }
            paragraphAccuracy = if (input.isNotEmpty()) (correct * 100) / input.length else 100

            // If finished
            if (input.length == target.length) {
                finishParagraphTest(correct, target.length)
            }
        }
    }

    private fun startParagraphTimer() {
        paragraphTimerJob?.cancel()
        paragraphTimerJob = viewModelScope.launch {
            while (paragraphIsStarted && !paragraphIsFinished) {
                delay(500)
                val elapsed = (System.currentTimeMillis() - paragraphStartTime) / 1000f
                paragraphTimer = elapsed.toInt()

                if (elapsed > 1 && paragraphInput.isNotEmpty()) {
                    val words = paragraphInput.length / 5.0
                    paragraphWpm = ((words / elapsed) * 60).toInt()
                }
            }
        }
    }

    private fun finishParagraphTest(correct: Int, total: Int) {
        paragraphIsFinished = true
        paragraphTimerJob?.cancel()
        val finalTime = (System.currentTimeMillis() - paragraphStartTime) / 1000f
        val finalWpm = if (finalTime > 0) (((total / 5.0) / finalTime) * 60).toInt() else 0
        val finalAcc = if (total > 0) (correct * 100) / total else 100

        paragraphWpm = finalWpm
        paragraphAccuracy = finalAcc

        // Save session history
        viewModelScope.launch {
            repository.insertPracticeSession(
                PracticeSession(
                    title = currentParagraph?.title ?: "Unknown Practice",
                    wpm = finalWpm,
                    accuracy = finalAcc
                )
            )
        }
    }

    fun resetParagraphTest() {
        paragraphInput = ""
        paragraphTimer = 0
        paragraphIsStarted = false
        paragraphIsFinished = false
        paragraphWpm = 0
        paragraphAccuracy = 100
        paragraphTimerJob?.cancel()
    }


    // --- EXAM HUB STATE & LOGIC ---
    var currentExam by mutableStateOf<ExamPassage?>(null)
        private set
    var examInput by mutableStateOf("")
        private set
    var examTimerLeftSeconds by mutableStateOf(0)
        private set
    var examIsStarted by mutableStateOf(false)
        private set
    var examIsFinished by mutableStateOf(false)
        private set
    var examWpm by mutableStateOf(0)
        private set
    var examAccuracy by mutableStateOf(100)
        private set
    var examErrorsCount by mutableStateOf(0)
        private set

    private var examTimerJob: Job? = null
    private var examStartTime: Long = 0

    fun selectExam(exam: ExamPassage) {
        currentExam = exam
        resetExamTest()
    }

    fun onExamInputChange(input: String) {
        val exam = currentExam ?: return
        val target = exam.passageText
        if (examIsFinished) return

        // Check if backspace restriction is enabled
        if (!exam.backspaceAllowed && input.length < examInput.length) {
            // Prevent backspace deletion
            return
        }

        if (!examIsStarted) {
            examIsStarted = true
            examStartTime = System.currentTimeMillis()
            examTimerLeftSeconds = exam.examDurationMinutes * 60
            startExamTimer()
        }

        if (input.length <= target.length) {
            examInput = input

            // Calculate accuracy and errors
            var correct = 0
            var errors = 0
            for (i in input.indices) {
                if (input[i] == target[i]) {
                    correct++
                } else {
                    errors++
                }
            }
            examErrorsCount = errors
            examAccuracy = if (input.isNotEmpty()) (correct * 100) / input.length else 100

            // If finished
            if (input.length == target.length) {
                finishExamTest()
            }
        }
    }

    private fun startExamTimer() {
        examTimerJob?.cancel()
        examTimerJob = viewModelScope.launch {
            while (examIsStarted && !examIsFinished && examTimerLeftSeconds > 0) {
                delay(1000)
                examTimerLeftSeconds--

                val elapsed = (System.currentTimeMillis() - examStartTime) / 1000f
                if (elapsed > 1 && examInput.isNotEmpty()) {
                    val words = examInput.length / 5.0
                    examWpm = ((words / elapsed) * 60).toInt()
                }

                if (examTimerLeftSeconds <= 0) {
                    finishExamTest()
                }
            }
        }
    }

    private fun finishExamTest() {
        examIsFinished = true
        examTimerJob?.cancel()

        val exam = currentExam ?: return
        val targetLength = examInput.length
        val elapsed = (System.currentTimeMillis() - examStartTime) / 1000f

        var correct = 0
        var errors = 0
        for (i in examInput.indices) {
            if (examInput[i] == exam.passageText[i]) {
                correct++
            } else {
                errors++
            }
        }

        val finalWpm = if (elapsed > 0) (((targetLength / 5.0) / elapsed) * 60).toInt() else 0
        val finalAcc = if (targetLength > 0) (correct * 100) / targetLength else 100

        examWpm = finalWpm
        examAccuracy = finalAcc
        examErrorsCount = errors

        // Save attempt history
        viewModelScope.launch {
            repository.insertExamAttempt(
                ExamAttempt(
                    examName = exam.name,
                    wpm = finalWpm,
                    accuracy = finalAcc,
                    errorsCount = errors
                )
            )
        }
    }

    fun resetExamTest() {
        examInput = ""
        examTimerLeftSeconds = (currentExam?.examDurationMinutes ?: 10) * 60
        examIsStarted = false
        examIsFinished = false
        examWpm = 0
        examAccuracy = 100
        examErrorsCount = 0
        examTimerJob?.cancel()
    }
}

class TypeSprintViewModelFactory(private val repository: TypeSprintRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(TypeSprintViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return TypeSprintViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
