package com.typesprint.app.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        PracticeParagraph::class,
        ExamPassage::class,
        PracticeSession::class,
        ExamAttempt::class
    ],
    version = 1,
    exportSchema = false
)
abstract class TypeSprintDatabase : RoomDatabase() {
    abstract fun dao(): TypeSprintDao

    companion object {
        @Volatile
        private var INSTANCE: TypeSprintDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): TypeSprintDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    TypeSprintDatabase::class.java,
                    "typesprint_database"
                )
                    .addCallback(TypeSprintDatabaseCallback(scope))
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }

    private class TypeSprintDatabaseCallback(
        private val scope: CoroutineScope
    ) : RoomDatabase.Callback() {
        override fun onCreate(db: SupportSQLiteDatabase) {
            super.onCreate(db)
            INSTANCE?.let { database ->
                scope.launch(Dispatchers.IO) {
                    populateInitialData(database.dao())
                }
            }
        }

        private suspend fun populateInitialData(dao: TypeSprintDao) {
            // Seed Practice Paragraphs
            val paragraphs = listOf(
                PracticeParagraph(
                    title = "The Quick Brown Fox",
                    bodyText = "The quick brown fox jumps over the lazy dog. Try typing this sentence as fast as possible while keeping your errors under control. Focus on muscle memory and accuracy first.",
                    level = "Easy"
                ),
                PracticeParagraph(
                    title = "Android Operating System",
                    bodyText = "Android is a mobile operating system based on a modified version of the Linux kernel and other open-source software, designed primarily for touchscreen mobile devices.",
                    level = "Medium"
                ),
                PracticeParagraph(
                    title = "Quantum Physics Mechanics",
                    bodyText = "Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles. It is the foundation of chemistry.",
                    level = "Hard"
                )
            )
            dao.insertParagraphs(paragraphs)

            // Seed Govt Exam Passages
            val exams = listOf(
                ExamPassage(
                    name = "SSC CHSL Speed Test",
                    passageText = "The Indian constitutional framework is a model of federal division of powers between the union and state legislative authorities, establishing supreme legal authority in a written system.",
                    examDurationMinutes = 10,
                    backspaceAllowed = true,
                    errorHighlighting = false,
                    description = "Models the Staff Selection Commission Higher Secondary Level skill evaluation. Allows backspace correction, but error highlighting is disabled."
                ),
                ExamPassage(
                    name = "RRB NTPC Typist Grade II",
                    passageText = "Efficient transportation networks are critical backbones of economic infrastructure, accelerating logistical flow and optimizing resource allocation across diverse geographical sectors.",
                    examDurationMinutes = 10,
                    backspaceAllowed = false,
                    errorHighlighting = false,
                    description = "Railway Recruitment Board skill standard. Backspace is completely locked, mimicking rigorous state typist criteria."
                ),
                ExamPassage(
                    name = "HC Clerk Exam Format",
                    passageText = "The judicial administration system upholds constitutional safeguards, rendering objective determinations based on statutory rules, precedents, and arguments advanced.",
                    examDurationMinutes = 5,
                    backspaceAllowed = true,
                    errorHighlighting = true,
                    description = "High Court Clerk standard practice module. Tight five-minute timeline with active error highlighting support."
                )
            )
            dao.insertExams(exams)
        }
    }
}
