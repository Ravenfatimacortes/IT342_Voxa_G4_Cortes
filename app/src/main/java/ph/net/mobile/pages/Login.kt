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
import ph.net.mobile.models.BackendUser
import ph.net.mobile.repository.AuthRepository
import ph.net.mobile.utils.TiledDrawable

class Login : AppCompatActivity() {

    private lateinit var emailEditText: EditText
    private lateinit var passwordEditText: EditText
    private lateinit var loginButton: Button
    private lateinit var registerText: TextView
    private lateinit var authRepository: AuthRepository
    private lateinit var sharedPreferences: SharedPreferences

    // Role passed back from Register so we can navigate correctly right after sign-up
    private var pendingRole: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        authRepository = AuthRepository()
        sharedPreferences = getSharedPreferences("AuthPrefs", Context.MODE_PRIVATE)

        setupUI()
        startOrbAnimations()
        setupTiledBackground()
        checkLoginStatus()
    }

    // ── Already-logged-in check ───────────────────────────────────────────────

    private fun checkLoginStatus() {
        val token = sharedPreferences.getString("auth_token", null) ?: return

        if (token == "mock_admin_token") {
            startActivity(Intent(this, AdminDashboard::class.java))
            finish()
            return
        }

        val savedRole = sharedPreferences.getString("user_role", "student") ?: "student"
        startActivity(dashboardIntent(savedRole))
        finish()
    }

    // ── Register launcher ─────────────────────────────────────────────────────

    private val registerLauncher =
        registerForActivityResult(
            androidx.activity.result.contract.ActivityResultContracts.StartActivityForResult()
        ) { result ->
            if (result.resultCode == RESULT_OK) {
                val data = result.data
                val email    = data?.getStringExtra("email")
                val password = data?.getStringExtra("password")
                val role     = data?.getStringExtra("role")

                if (email != null && password != null) {
                    pendingRole = role          // fallback in case login response is slow
                    emailEditText.setText(email)
                    passwordEditText.setText(password)
                    performLogin()
                }
            }
        }

    // ── UI setup ──────────────────────────────────────────────────────────────

    private fun setupUI() {
        emailEditText  = findViewById(R.id.emailEditText)
        passwordEditText = findViewById(R.id.passwordEditText)
        loginButton    = findViewById(R.id.loginButton)
        registerText   = findViewById(R.id.registerText)

        loginButton.setOnClickListener { performLogin() }
        registerText.setOnClickListener {
            registerLauncher.launch(Intent(this, Register::class.java))
        }
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    private fun performLogin() {
        val email    = emailEditText.text.toString().trim()
        val password = passwordEditText.text.toString().trim()

        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
            return
        }

        // Hardcoded admin shortcut
        if (email == "admin" && password == "password123") {
            sharedPreferences.edit()
                .putString("auth_token", "mock_admin_token")
                .putString("user_id",    "admin-001")
                .putString("user_email", "admin")
                .putString("user_name",  "Super Admin")
                .putString("user_role",  "admin")
                .apply()
            Toast.makeText(this, "Login successful!", Toast.LENGTH_SHORT).show()
            startActivity(Intent(this, AdminDashboard::class.java))
            finish()
            return
        }

        lifecycleScope.launch {
            try {
                loginButton.isEnabled = false
                val result = authRepository.login(email, password)

                result.fold(
                    onSuccess = { response ->
                        if (response.success && response.token != null) {
                            Toast.makeText(this@Login, "Login successful!", Toast.LENGTH_SHORT).show()
                            saveAuthData(response.token, response.user)
                            navigateToMain(response.user?.role)
                        } else {
                            Toast.makeText(this@Login, response.error ?: "Login failed", Toast.LENGTH_LONG).show()
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

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun saveAuthData(token: String, user: BackendUser?) {
        val roleToSave = user?.role?.takeIf { it.isNotEmpty() }
            ?: pendingRole?.lowercase()
            ?: "student"

        sharedPreferences.edit()
            .putString("auth_token", token)
            .putString("user_id",    user?.id ?: "")
            .putString("user_email", user?.email ?: "")
            .putString("user_name",  user?.fullName ?: "${user?.firstName} ${user?.lastName}".trim())
            .putString("user_role",  roleToSave)
            .apply()
    }

    private fun navigateToMain(roleFromResponse: String?) {
        // Prefer the role the backend returned; fall back to what Register passed us
        val role = roleFromResponse?.takeIf { it.isNotEmpty() }
            ?: pendingRole?.lowercase()
            ?: "student"
        pendingRole = null

        startActivity(dashboardIntent(role))
        finish()
    }

    private fun dashboardIntent(role: String): Intent = when {
        role.equals("admin",   ignoreCase = true) -> Intent(this, AdminDashboard::class.java)
        role.equals("teacher", ignoreCase = true) ||
        role.equals("faculty", ignoreCase = true) -> Intent(this, TeacherDashboard::class.java)
        else                                       -> Intent(this, StudentDashboard::class.java)
    }

    // ── Animations ────────────────────────────────────────────────────────────

    private fun startOrbAnimations() {
        animateOrb(findViewById(R.id.orb1), 30000L,  100f, -100f)
        animateOrb(findViewById(R.id.orb2), 40000L, -120f,   80f)
        animateOrb(findViewById(R.id.orb3), 50000L,   60f,  160f)
    }

    private fun setupTiledBackground() {
        findViewById<View>(R.id.waveBackground).background =
            TiledDrawable.create(this, R.drawable.ic_wave_pattern)
    }

    private fun animateOrb(view: View, duration: Long, deltaX: Float, deltaY: Float) {
        val pvhX      = PropertyValuesHolder.ofFloat(View.TRANSLATION_X, 0f, deltaX, 0f)
        val pvhY      = PropertyValuesHolder.ofFloat(View.TRANSLATION_Y, 0f, deltaY, 0f)
        val pvhScaleX = PropertyValuesHolder.ofFloat(View.SCALE_X, 1f, 1.5f, 1f)
        val pvhScaleY = PropertyValuesHolder.ofFloat(View.SCALE_Y, 1f, 1.5f, 1f)

        ObjectAnimator.ofPropertyValuesHolder(view, pvhX, pvhY, pvhScaleX, pvhScaleY).apply {
            this.duration = duration
            repeatCount   = ValueAnimator.INFINITE
            repeatMode    = ValueAnimator.REVERSE
            interpolator  = AccelerateDecelerateInterpolator()
            start()
        }
    }
}
