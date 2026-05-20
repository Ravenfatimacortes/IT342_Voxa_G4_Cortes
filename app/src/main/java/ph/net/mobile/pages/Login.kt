package ph.net.mobile.pages

import android.animation.ObjectAnimator
import android.animation.PropertyValuesHolder
import android.animation.ValueAnimator
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import ph.net.mobile.R
import ph.net.mobile.models.AuthResponse
import ph.net.mobile.models.User
import ph.net.mobile.repository.AuthRepository
import ph.net.mobile.utils.TiledDrawable

class Login : AppCompatActivity() {
    
    private lateinit var emailEditText: EditText
    private lateinit var passwordEditText: EditText
    private lateinit var loginButton: Button
    private lateinit var registerText: TextView
    private lateinit var authRepository: AuthRepository
    private lateinit var sharedPreferences: SharedPreferences
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)
        
        // Initialize repository and shared preferences
        authRepository = AuthRepository()
        sharedPreferences = getSharedPreferences("AuthPrefs", Context.MODE_PRIVATE)
        
        // Setup UI components
        setupUI()
        
        // Start background animations
        startOrbAnimations()
        
        // Setup Tiled Background
        setupTiledBackground()
        
        // Check if user is already logged in
        checkLoginStatus()
    }

    private fun startOrbAnimations() {
        val orb1 = findViewById<View>(R.id.orb1)
        val orb2 = findViewById<View>(R.id.orb2)
        val orb3 = findViewById<View>(R.id.orb3)

        animateOrb(orb1, 30000L, 100f, -100f)
        animateOrb(orb2, 40000L, -120f, 80f)
        animateOrb(orb3, 50000L, 60f, 160f)
    }

    private fun setupTiledBackground() {
        val waveBackground = findViewById<View>(R.id.waveBackground)
        waveBackground.background = TiledDrawable.create(this, R.drawable.ic_wave_pattern)
    }

    private fun animateOrb(view: View, duration: Long, deltaX: Float, deltaY: Float) {
        val pvhX = PropertyValuesHolder.ofFloat(View.TRANSLATION_X, 0f, deltaX, 0f)
        val pvhY = PropertyValuesHolder.ofFloat(View.TRANSLATION_Y, 0f, deltaY, 0f)
        val pvhScaleX = PropertyValuesHolder.ofFloat(View.SCALE_X, 1f, 1.5f, 1f)
        val pvhScaleY = PropertyValuesHolder.ofFloat(View.SCALE_Y, 1f, 1.5f, 1f)

        ObjectAnimator.ofPropertyValuesHolder(view, pvhX, pvhY, pvhScaleX, pvhScaleY).apply {
            this.duration = duration
            repeatCount = ValueAnimator.INFINITE
            repeatMode = ValueAnimator.REVERSE
            interpolator = AccelerateDecelerateInterpolator()
            start()
        }
    }
    
    private fun checkLoginStatus() {
        val token = sharedPreferences.getString("auth_token", null)
        if (token != null) {
            if (token == "mock_admin_token") {
                val intent = Intent(this, AdminDashboard::class.java)
                startActivity(intent)
                finish()
                return
            }

            // Verify token with backend
            lifecycleScope.launch {
                val result = authRepository.verifyToken(token)
                if (result.isSuccess) {
                    // Token is valid, navigate to main activity
                    val user = result.getOrNull()?.actualUser
                    navigateToMain(user)
                } else {
                    // Token is invalid, clear it and show login
                    clearAuthData()
                }
            }
        }
    }
    
    private val registerLauncher = registerForActivityResult(androidx.activity.result.contract.ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == RESULT_OK) {
            val data = result.data
            val email = data?.getStringExtra("email")
            val password = data?.getStringExtra("password")
            
            if (email != null && password != null) {
                emailEditText.setText(email)
                passwordEditText.setText(password)
                performLogin()
            }
        }
    }

    private fun setupUI() {
        // Initialize UI components
        emailEditText = findViewById(R.id.emailEditText)
        passwordEditText = findViewById(R.id.passwordEditText)
        loginButton = findViewById(R.id.loginButton)
        registerText = findViewById(R.id.registerText)
        
        loginButton.setOnClickListener {
            performLogin()
        }

        registerText.setOnClickListener {
            val intent = Intent(this, Register::class.java)
            registerLauncher.launch(intent)
        }
    }
    
    private fun performLogin() {
        val email = emailEditText.text.toString().trim()
        val password = passwordEditText.text.toString().trim()
        
        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
            return
        }

        // Hardcoded Admin Access
        if (email == "admin" && password == "password123") {
            val editor = sharedPreferences.edit()
            editor.putString("auth_token", "mock_admin_token")
            editor.putString("user_id", "admin-001")
            editor.putString("user_email", "admin")
            editor.putString("user_name", "Super Admin")
            editor.putString("user_role", "Admin")
            editor.apply()

            Toast.makeText(this, "Login successful!", Toast.LENGTH_SHORT).show()
            val intent = Intent(this, AdminDashboard::class.java)
            startActivity(intent)
            finish()
            return
        }
        
        lifecycleScope.launch {
            try {
                loginButton.isEnabled = false
                val result = authRepository.login(email, password)
                
                result.fold(
                    onSuccess = { response ->
                        if (response.success && response.accessToken != null) {
                            Toast.makeText(this@Login, "Login successful!", Toast.LENGTH_SHORT).show()
                            saveAuthData(response.accessToken, response.actualUser)
                            navigateToMain(response.actualUser)
                        } else {
                            Toast.makeText(this@Login, response.message, Toast.LENGTH_LONG).show()
                        }
                    },
                    onFailure = { error ->
                        Toast.makeText(this@Login, "Login failed: ${error.message}", Toast.LENGTH_LONG).show()
                    }
                )
            } catch (e: Exception) {
                Toast.makeText(this@Login, "Network error: ${e.message}", Toast.LENGTH_LONG).show()
            } finally {
                loginButton.isEnabled = true
            }
        }
    }
    
    private fun saveAuthData(token: String, user: User?) {
        val editor = sharedPreferences.edit()
        editor.putString("auth_token", token)
        user?.let {
            editor.putString("user_id", it.id)
            editor.putString("user_email", it.email)
            editor.putString("user_name", it.name)
            editor.putString("user_role", it.role)
        }
        editor.apply()
    }
    
    private fun clearAuthData() {
        val editor = sharedPreferences.edit()
        editor.remove("auth_token")
        editor.remove("user_id")
        editor.remove("user_email")
        editor.remove("user_name")
        editor.apply()
    }
    
    private fun navigateToMain(user: User?) {
        val role = user?.role ?: "Student"
        val intent = when {
            role.equals("Admin", ignoreCase = true) -> Intent(this, AdminDashboard::class.java)
            role.equals("Teacher", ignoreCase = true) -> Intent(this, TeacherDashboard::class.java)
            else -> Intent(this, StudentDashboard::class.java)
        }
        startActivity(intent)
        finish()
    }
}