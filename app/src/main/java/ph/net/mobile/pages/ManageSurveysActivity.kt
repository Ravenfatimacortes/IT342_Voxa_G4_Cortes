package ph.net.mobile.pages

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import ph.net.mobile.R
import ph.net.mobile.adapters.RecentSurveyAdapter
import ph.net.mobile.api.SurveyApi
import ph.net.mobile.models.Survey
import ph.net.mobile.network.RetrofitClient

class ManageSurveysActivity : AppCompatActivity() {

    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var surveysRecyclerView: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var emptyStateText: TextView
    private lateinit var backButton: ImageButton
    private lateinit var searchEditText: EditText
    
    private lateinit var adapter: RecentSurveyAdapter
    private lateinit var surveyApi: SurveyApi
    private lateinit var sharedPreferences: SharedPreferences
    private var searchJob: Job? = null
    private var allSurveys = listOf<Survey>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_manage_surveys)

        sharedPreferences = getSharedPreferences("AuthPrefs", Context.MODE_PRIVATE)
        surveyApi = RetrofitClient.surveyApi

        initViews()
        setupRecyclerView()
        loadSurveys()
    }

    private fun initViews() {
        swipeRefresh = findViewById(R.id.swipeRefresh)
        surveysRecyclerView = findViewById(R.id.surveysRecyclerView)
        progressBar = findViewById(R.id.progressBar)
        emptyStateText = findViewById(R.id.emptyStateText)
        backButton = findViewById(R.id.backButton)
        searchEditText = findViewById(R.id.searchEditText)

        backButton.setOnClickListener { finish() }
        
        swipeRefresh.setOnRefreshListener {
            loadSurveys()
        }

        searchEditText.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                filterSurveys(s.toString())
            }
            override fun afterTextChanged(s: Editable?) {}
        })
    }

    private fun filterSurveys(query: String) {
        val filtered = allSurveys.filter { 
            it.title.contains(query, ignoreCase = true) || 
            it.description?.contains(query, ignoreCase = true) == true 
        }
        adapter.updateData(filtered)
        emptyStateText.visibility = if (filtered.isEmpty()) View.VISIBLE else View.GONE
    }

    private fun setupRecyclerView() {
        adapter = RecentSurveyAdapter(
            emptyList(),
            onItemClick = { survey ->
                // Navigate to responses for this survey
                val intent = Intent(this, ViewResponsesActivity::class.java)
                intent.putExtra("SURVEY_ID", survey.id)
                intent.putExtra("SURVEY_TITLE", survey.title)
                startActivity(intent)
            },
            onEditClick = { survey ->
                // Implementation for editing (reusing CreateSurveyActivity)
                val intent = Intent(this, CreateSurveyActivity::class.java)
                intent.putExtra("SURVEY_ID", survey.id)
                intent.putExtra("IS_EDIT", true)
                startActivity(intent)
            },
            onDeleteClick = { survey ->
                showDeleteConfirmation(survey)
            }
        )
        surveysRecyclerView.layoutManager = LinearLayoutManager(this)
        surveysRecyclerView.adapter = adapter
    }

    private fun showDeleteConfirmation(survey: ph.net.mobile.models.Survey) {
        AlertDialog.Builder(this)
            .setTitle("Delete Survey")
            .setMessage("Are you sure you want to delete '${survey.title}'? This action cannot be undone.")
            .setPositiveButton("Delete") { _, _ ->
                deleteSurvey(survey.id)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun deleteSurvey(id: String) {
        val token = sharedPreferences.getString("auth_token", "") ?: ""
        lifecycleScope.launch {
            try {
                val response = surveyApi.deleteSurvey("Bearer $token", id)
                if (response.isSuccessful) {
                    Toast.makeText(this@ManageSurveysActivity, "Survey deleted", Toast.LENGTH_SHORT).show()
                    loadSurveys()
                } else {
                    Toast.makeText(this@ManageSurveysActivity, "Failed to delete survey", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@ManageSurveysActivity, "Network error", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun loadSurveys() {
        val token = sharedPreferences.getString("auth_token", "") ?: ""
        if (token.isEmpty()) {
            Toast.makeText(this, "Session expired", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            progressBar.visibility = View.VISIBLE
            emptyStateText.visibility = View.GONE
            
            try {
                val response = surveyApi.getAdminSurveys("Bearer $token")
                if (response.isSuccessful) {
                    allSurveys = response.body()?.surveys ?: emptyList()
                    adapter.updateData(allSurveys)
                    
                    if (allSurveys.isEmpty()) {
                        emptyStateText.visibility = View.VISIBLE
                    }
                } else {
                    Toast.makeText(this@ManageSurveysActivity, "Error: ${response.message()}", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@ManageSurveysActivity, "Failed to load surveys", Toast.LENGTH_SHORT).show()
            } finally {
                progressBar.visibility = View.GONE
                swipeRefresh.isRefreshing = false
            }
        }
    }
}