package ph.net.mobile.pages

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.widget.Button
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import ph.net.mobile.R

class ProfileActivity : AppCompatActivity() {

    private lateinit var sharedPreferences: SharedPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)

        sharedPreferences = getSharedPreferences("AuthPrefs", Context.MODE_PRIVATE)

        val backButton = findViewById<ImageButton>(R.id.backButton)
        val userInitialsLarge = findViewById<TextView>(R.id.userInitialsLarge)
        val profileName = findViewById<TextView>(R.id.profileName)
        val profileEmail = findViewById<TextView>(R.id.profileEmail)
        val btnLogout = findViewById<Button>(R.id.btnLogout)
        val btnEditProfile = findViewById<LinearLayout>(R.id.btnEditProfile)

        val fullName = sharedPreferences.getString("user_name", "Professor") ?: "Professor"
        val email = sharedPreferences.getString("user_email", "professor@voxa.edu") ?: "professor@voxa.edu"

        profileName.text = fullName
        profileEmail.text = email
        userInitialsLarge.text = getInitials(fullName)

        backButton.setOnClickListener { finish() }

        btnLogout.setOnClickListener {
            logout()
        }
        
        btnEditProfile.setOnClickListener {
            // Implementation for editing profile would go here
        }
    }

    private fun logout() {
        sharedPreferences.edit().clear().apply()
        val intent = Intent(this, Login::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
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
