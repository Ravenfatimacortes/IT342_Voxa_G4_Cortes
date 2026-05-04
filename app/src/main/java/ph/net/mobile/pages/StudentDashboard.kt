package ph.net.mobile.pages

import android.content.SharedPreferences
import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import ph.net.mobile.R

class StudentDashboard : AppCompatActivity() {

    private lateinit var userNameText: TextView
    private lateinit var userInitials: TextView
    private lateinit var sharedPreferences: SharedPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_student_dashboard)

        sharedPreferences = getSharedPreferences("AuthPrefs", MODE_PRIVATE)
        
        userNameText = findViewById(R.id.userNameText)
        userInitials = findViewById(R.id.userInitials)

        loadUserData()
    }

    private fun loadUserData() {
        val name = sharedPreferences.getString("user_name", "User")
        userNameText.text = name
        
        // Generate initials
        if (!name.isNullOrEmpty()) {
            val initials = name.split(" ")
                .filter { it.isNotEmpty() }
                .map { it[0].uppercaseChar() }
                .take(2)
                .joinToString("")
            userInitials.text = initials
        }
    }
}