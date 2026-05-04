package ph.net.mobile.pages

import android.content.Context
import android.content.SharedPreferences
import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import ph.net.mobile.R

class TeacherDashboard : AppCompatActivity() {

    private lateinit var sharedPreferences: SharedPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_teacher_dashboard)

        sharedPreferences = getSharedPreferences("AuthPrefs", Context.MODE_PRIVATE)
        setupUI()
    }

    private fun setupUI() {
        val userNameText = findViewById<TextView>(R.id.userNameText)
        val userInitialsText = findViewById<TextView>(R.id.userInitials)

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