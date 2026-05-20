package ph.net.mobile.pages

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.view.View
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.launch
import ph.net.mobile.R
import ph.net.mobile.adapters.ResponseAdapter
import ph.net.mobile.network.RetrofitClient

class ViewResponsesActivity : AppCompatActivity() {

    private lateinit var responsesRecyclerView: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var emptyStateText: TextView
    private lateinit var surveyTitleText: TextView
    private lateinit var backButton: ImageButton
    private lateinit var btnExport: ImageButton

    private lateinit var adapter: ResponseAdapter
    private lateinit var sharedPreferences: SharedPreferences
    private var surveyId: String? = null
    private var currentResponses: List<ph.net.mobile.models.UserResponse> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_view_responses)

        sharedPreferences = getSharedPreferences("AuthPrefs", Context.MODE_PRIVATE)
        surveyId = intent.getStringExtra("SURVEY_ID")
        val surveyTitle = intent.getStringExtra("SURVEY_TITLE") ?: "Responses"

        initViews()
        surveyTitleText.text = surveyTitle
        setupRecyclerView()
        
        if (surveyId != null) {
            loadResponses(surveyId!!)
        } else {
            Toast.makeText(this, "No survey ID provided", Toast.LENGTH_SHORT).show()
            finish()
        }
    }

    private fun initViews() {
        responsesRecyclerView = findViewById(R.id.responsesRecyclerView)
        progressBar = findViewById(R.id.progressBar)
        emptyStateText = findViewById(R.id.emptyStateText)
        surveyTitleText = findViewById(R.id.surveyTitleText)
        backButton = findViewById(R.id.backButton)
        btnExport = findViewById(R.id.btnExport)

        backButton.setOnClickListener { finish() }
        btnExport.setOnClickListener { exportToCSV() }
    }

    private fun exportToCSV() {
        if (currentResponses.isEmpty()) {
            Toast.makeText(this, "No responses to export", Toast.LENGTH_SHORT).show()
            return
        }

        val csvBuilder = StringBuilder()
        csvBuilder.append("Respondent,Email,Submission Date,Answers\n")

        for (response in currentResponses) {
            val answers = response.answers.joinToString("; ") { it.answer }
            csvBuilder.append("${response.userId.fullName},${response.userId.email},${response.submittedAt},\"$answers\"\n")
        }

        val fileName = "Responses_${surveyTitleText.text}_${System.currentTimeMillis()}.csv"
        try {
            val fileOut = openFileOutput(fileName, Context.MODE_PRIVATE)
            fileOut.write(csvBuilder.toString().toByteArray())
            fileOut.close()
            
            Toast.makeText(this, "Exported to $fileName", Toast.LENGTH_LONG).show()
            
            // Share the file
            val file = java.io.File(filesDir, fileName)
            val uri = androidx.core.content.FileProvider.getUriForFile(
                this,
                "${packageName}.provider",
                file
            )
            val intent = Intent(Intent.ACTION_SEND)
            intent.type = "text/csv"
            intent.putExtra(Intent.EXTRA_STREAM, uri)
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            startActivity(Intent.createChooser(intent, "Share CSV"))
            
        } catch (e: Exception) {
            Toast.makeText(this, "Export failed: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupRecyclerView() {
        adapter = ResponseAdapter(emptyList())
        responsesRecyclerView.layoutManager = LinearLayoutManager(this)
        responsesRecyclerView.adapter = adapter
    }

    private fun loadResponses(id: String) {
        val token = sharedPreferences.getString("auth_token", "") ?: ""
        
        lifecycleScope.launch {
            progressBar.visibility = View.VISIBLE
            emptyStateText.visibility = View.GONE
            
            try {
                val response = RetrofitClient.surveyApi.getSurveyResponses("Bearer $token", id)
                if (response.isSuccessful) {
                    currentResponses = response.body()?.responses ?: emptyList()
                    adapter.updateData(currentResponses)
                    
                    if (currentResponses.isEmpty()) {
                        emptyStateText.visibility = View.VISIBLE
                    }
                } else {
                    Toast.makeText(this@ViewResponsesActivity, "Error: ${response.message()}", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@ViewResponsesActivity, "Failed to load responses", Toast.LENGTH_SHORT).show()
            } finally {
                progressBar.visibility = View.GONE
            }
        }
    }
}