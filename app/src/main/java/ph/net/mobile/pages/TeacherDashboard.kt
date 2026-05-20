package ph.net.mobile.pages

import android.content.Context
import android.content.SharedPreferences
import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import ph.net.mobile.R
import ph.net.mobile.network.RetrofitClient
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import ph.net.mobile.adapters.RecentSurveyAdapter
import ph.net.mobile.models.Survey
import android.content.Intent
import android.widget.LinearLayout
import android.view.View
import android.widget.ImageView
import android.widget.Toast

class TeacherDashboard : AppCompatActivity() {

    private lateinit var sharedPreferences: SharedPreferences
    private lateinit var recentSurveyAdapter: RecentSurveyAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_teacher_dashboard)

        sharedPreferences = getSharedPreferences("AuthPrefs", Context.MODE_PRIVATE)
        setupUI()
        fetchDashboardData()
    }

    private fun fetchDashboardData() {
        val token = sharedPreferences.getString("auth_token", "") ?: ""
        if (token.isEmpty()) return

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.surveyApi.getAdminSurveys("Bearer $token", limit = 5)
                
                if (response.isSuccessful && response.body() != null) {
                    val surveys = response.body()!!.surveys
                    updateStats(surveys)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun updateStats(surveys: List<Survey>) {
        val totalSurveys = surveys.size
        val publishedSurveys = surveys.count { it.status == "PUBLISHED" }
        val totalResponses = surveys.sumOf { it.responseCount }
        val avgResponses = if (totalSurveys > 0) totalResponses / totalSurveys else 0

        findViewById<TextView>(R.id.totalSurveysCount).text = totalSurveys.toString()
        findViewById<TextView>(R.id.publishedCount).text = publishedSurveys.toString()
        findViewById<TextView>(R.id.totalResponsesCount).text = totalResponses.toString()
        findViewById<TextView>(R.id.avgResponsesCount).text = avgResponses.toString()
        
        // Update recent surveys list visibility
        val emptyState = findViewById<android.view.View>(R.id.emptyStateRecent)
        val recyclerView = findViewById<RecyclerView>(R.id.recentSurveysRecyclerView)
        
        if (surveys.isEmpty()) {
            emptyState.visibility = android.view.View.VISIBLE
            recyclerView.visibility = android.view.View.GONE
        } else {
            emptyState.visibility = android.view.View.GONE
            recyclerView.visibility = android.view.View.VISIBLE
            recentSurveyAdapter.updateData(surveys.take(5))
        }
    }

    private fun setupUI() {
        val userNameText = findViewById<TextView>(R.id.userNameText)
        val userInitialsText = findViewById<TextView>(R.id.userInitials)
        val recyclerView = findViewById<RecyclerView>(R.id.recentSurveysRecyclerView)

        recentSurveyAdapter = RecentSurveyAdapter(
            emptyList(),
            onItemClick = { survey ->
                val intent = Intent(this, ViewResponsesActivity::class.java)
                intent.putExtra("SURVEY_ID", survey.id)
                intent.putExtra("SURVEY_TITLE", survey.title)
                startActivity(intent)
            }
        )
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = recentSurveyAdapter

        findViewById<LinearLayout>(R.id.actionManageSurveys).setOnClickListener {
            startActivity(Intent(this, ManageSurveysActivity::class.java))
        }

        findViewById<TextView>(R.id.viewAllSurveys).setOnClickListener {
            startActivity(Intent(this, ManageSurveysActivity::class.java))
        }

        findViewById<LinearLayout>(R.id.actionCreateSurvey).setOnClickListener {
            startActivity(Intent(this, CreateSurveyActivity::class.java))
        }

        findViewById<LinearLayout>(R.id.actionViewResponses).setOnClickListener {
            startActivity(Intent(this, ManageSurveysActivity::class.java))
        }

        findViewById<LinearLayout>(R.id.userPill).setOnClickListener {
            startActivity(Intent(this, ProfileActivity::class.java))
        }

        findViewById<LinearLayout>(R.id.navResponses).setOnClickListener {
            startActivity(Intent(this, ManageSurveysActivity::class.java))
        }

        findViewById<LinearLayout>(R.id.navProfile).setOnClickListener {
            startActivity(Intent(this, ProfileActivity::class.java))
        }

        findViewById<ImageView>(R.id.notificationBell).setOnClickListener {
            Toast.makeText(this, "No new notifications", Toast.LENGTH_SHORT).show()
        }

        val fullName = sharedPreferences.getString("user_name", "Professor") ?: "Professor"
        userNameText.text = fullName
        userInitialsText.text = getInitials(fullName)
    }

    private fun getInitials(name: String): String {
        if (name.isBlank()) return "P"
        val parts = name.trim().split("\\s+".toRegex())
        return if (parts.size >= 2) {
            "${parts[0][0]}${parts[1][0]}".uppercase()
        } else {
            parts[0][0].toString().uppercase()
        }
    }
}