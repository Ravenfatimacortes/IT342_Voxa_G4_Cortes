package ph.net.mobile.pages

import android.content.Context
import android.content.SharedPreferences
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import ph.net.mobile.R
import ph.net.mobile.models.CreateSurveyRequest
import ph.net.mobile.models.Question
import ph.net.mobile.network.RetrofitClient

class CreateSurveyActivity : AppCompatActivity() {

    private lateinit var sharedPreferences: SharedPreferences
    private lateinit var questionsContainer: LinearLayout
    private val questionViews = mutableListOf<View>()
    private var surveyId: String? = null
    private var isEdit = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_create_survey)

        sharedPreferences = getSharedPreferences("AuthPrefs", Context.MODE_PRIVATE)
        questionsContainer = findViewById(R.id.questionsContainer)

        surveyId = intent.getStringExtra("SURVEY_ID")
        isEdit = intent.getBooleanExtra("IS_EDIT", false)

        if (isEdit && surveyId != null) {
            findViewById<TextView>(R.id.headerTitle).text = "Edit Survey"
            loadSurveyData(surveyId!!)
        }

        findViewById<ImageButton>(R.id.backButton).setOnClickListener { finish() }
        findViewById<Button>(R.id.btnAddQuestion).setOnClickListener { addQuestion() }
        findViewById<Button>(R.id.btnPublish).setOnClickListener { submitSurvey(publish = true) }
        findViewById<Button>(R.id.btnSaveDraft).setOnClickListener { submitSurvey(publish = false) }

        // Add first question by default
        addQuestion()
    }

    private fun addQuestion() {
        val inflater = LayoutInflater.from(this)
        val questionView = inflater.inflate(R.layout.item_question_editor, questionsContainer, false)
        
        val tvNumber = questionView.findViewById<TextView>(R.id.tvQuestionNumber)
        val btnRemove = questionView.findViewById<ImageButton>(R.id.btnRemoveQuestion)
        val spinnerType = questionView.findViewById<Spinner>(R.id.spinnerQuestionType)
        val btnAddOption = questionView.findViewById<Button>(R.id.btnAddOption)
        val optionsContainer = questionView.findViewById<LinearLayout>(R.id.optionsContainer)

        val questionNumber = questionViews.size + 1
        tvNumber.text = "Question $questionNumber"

        // Setup Spinner
        val adapter = ArrayAdapter.createFromResource(
            this,
            R.array.question_types,
            android.R.layout.simple_spinner_item
        )
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerType.adapter = adapter

        spinnerType.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                if (position == 1) { // MULTIPLE_CHOICE
                    btnAddOption.visibility = View.VISIBLE
                    optionsContainer.visibility = View.VISIBLE
                    if (optionsContainer.childCount == 0) {
                        addOption(optionsContainer)
                        addOption(optionsContainer)
                    }
                } else {
                    btnAddOption.visibility = View.GONE
                    optionsContainer.visibility = View.GONE
                }
            }
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        btnAddOption.setOnClickListener { addOption(optionsContainer) }

        btnRemove.setOnClickListener {
            if (questionViews.size > 1) {
                questionsContainer.removeView(questionView)
                questionViews.remove(questionView)
                updateQuestionNumbers()
            } else {
                Toast.makeText(this, "At least one question is required", Toast.LENGTH_SHORT).show()
            }
        }

        questionViews.add(questionView)
        questionsContainer.addView(questionView)
    }

    private fun addOption(container: LinearLayout) {
        val inflater = LayoutInflater.from(this)
        val optionView = inflater.inflate(R.layout.item_option_editor, container, false)
        val btnRemove = optionView.findViewById<ImageButton>(R.id.btnRemoveOption)
        
        btnRemove.setOnClickListener {
            if (container.childCount > 2) {
                container.removeView(optionView)
            } else {
                Toast.makeText(this, "At least two options are required", Toast.LENGTH_SHORT).show()
            }
        }
        
        container.addView(optionView)
    }

    private fun updateQuestionNumbers() {
        questionViews.forEachIndexed { index, view ->
            view.findViewById<TextView>(R.id.tvQuestionNumber).text = "Question ${index + 1}"
        }
    }

    private fun loadSurveyData(id: String) {
        val token = sharedPreferences.getString("auth_token", "") ?: ""
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.surveyApi.getSurveyById("Bearer $token", id)
                if (response.isSuccessful && response.body() != null) {
                    val survey = response.body()!!.survey
                    findViewById<EditText>(R.id.etSurveyTitle).setText(survey.title)
                    findViewById<EditText>(R.id.etSurveyDescription).setText(survey.description)
                    
                    questionsContainer.removeAllViews()
                    questionViews.clear()
                    
                    survey.questions.sortedBy { it.order }.forEach { question ->
                        addQuestionFromData(question)
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(this@CreateSurveyActivity, "Failed to load survey", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun addQuestionFromData(question: ph.net.mobile.models.Question) {
        addQuestion()
        val view = questionViews.last()
        view.findViewById<EditText>(R.id.etQuestionText).setText(question.questionText)
        val spinner = view.findViewById<Spinner>(R.id.spinnerQuestionType)
        if (question.type == "MULTIPLE_CHOICE") {
            spinner.setSelection(1)
            val container = view.findViewById<LinearLayout>(R.id.optionsContainer)
            container.removeAllViews()
            question.options?.forEach { optionText ->
                addOptionWithText(container, optionText)
            }
        } else {
            spinner.setSelection(0)
        }
        view.findViewById<CheckBox>(R.id.cbRequired).isChecked = question.required
    }

    private fun addOptionWithText(container: LinearLayout, text: String) {
        addOption(container)
        val view = container.getChildAt(container.childCount - 1)
        view.findViewById<EditText>(R.id.etOptionText).setText(text)
    }

    private fun submitSurvey(publish: Boolean) {
        val title = findViewById<EditText>(R.id.etSurveyTitle).text.toString()
        val description = findViewById<EditText>(R.id.etSurveyDescription).text.toString()

        if (title.isBlank()) {
            Toast.makeText(this, "Title is required", Toast.LENGTH_SHORT).show()
            return
        }

        val questions = mutableListOf<Question>()
        for (i in questionViews.indices) {
            val view = questionViews[i]
            val text = view.findViewById<EditText>(R.id.etQuestionText).text.toString()
            val type = if (view.findViewById<Spinner>(R.id.spinnerQuestionType).selectedItemPosition == 0) "SHORT_ANSWER" else "MULTIPLE_CHOICE"
            val required = view.findViewById<CheckBox>(R.id.cbRequired).isChecked
            
            if (text.isBlank()) {
                Toast.makeText(this, "Question ${i + 1} text is required", Toast.LENGTH_SHORT).show()
                return
            }

            val options = mutableListOf<String>()
            if (type == "MULTIPLE_CHOICE") {
                val container = view.findViewById<LinearLayout>(R.id.optionsContainer)
                for (j in 0 until container.childCount) {
                    val optView = container.getChildAt(j)
                    val optText = optView.findViewById<EditText>(R.id.etOptionText).text.toString()
                    if (optText.isNotBlank()) {
                        options.add(optText)
                    }
                }
                if (options.size < 2) {
                    Toast.makeText(this, "Question ${i + 1} needs at least 2 options", Toast.LENGTH_SHORT).show()
                    return
                }
            }

            questions.add(Question(text, type, required, i, if (options.isEmpty()) null else options))
        }

        val token = sharedPreferences.getString("auth_token", "") ?: ""
        val request = CreateSurveyRequest(title, description, questions)

        lifecycleScope.launch {
            try {
                val response = if (isEdit && surveyId != null) {
                    RetrofitClient.surveyApi.updateSurvey("Bearer $token", surveyId!!, request)
                } else {
                    RetrofitClient.surveyApi.createSurvey("Bearer $token", request)
                }
                
                if (response.isSuccessful && response.body() != null) {
                    val currentSurveyId = response.body()!!.survey.id
                    if (publish) {
                        val publishResp = RetrofitClient.surveyApi.publishSurvey("Bearer $token", currentSurveyId)
                        if (publishResp.isSuccessful) {
                            Toast.makeText(this@CreateSurveyActivity, "Survey published!", Toast.LENGTH_SHORT).show()
                            finish()
                        } else {
                            Toast.makeText(this@CreateSurveyActivity, "Failed to publish", Toast.LENGTH_SHORT).show()
                        }
                    } else {
                        Toast.makeText(this@CreateSurveyActivity, "Saved as draft", Toast.LENGTH_SHORT).show()
                        finish()
                    }
                } else {
                    Toast.makeText(this@CreateSurveyActivity, "Error: ${response.message()}", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@CreateSurveyActivity, "Network error", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
