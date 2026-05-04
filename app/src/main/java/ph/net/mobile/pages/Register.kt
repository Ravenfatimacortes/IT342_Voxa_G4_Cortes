package ph.net.mobile.pages

import android.animation.ObjectAnimator
import android.animation.PropertyValuesHolder
import android.animation.ValueAnimator
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.view.animation.AccelerateDecelerateInterpolator
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import ph.net.mobile.R
import ph.net.mobile.repository.AuthRepository
import ph.net.mobile.utils.TiledDrawable

class Register : AppCompatActivity() {

    private lateinit var fullNameEditText: EditText
    private lateinit var emailEditText: EditText
    private lateinit var passwordEditText: EditText
    private lateinit var confirmPasswordEditText: EditText
    private lateinit var roleSpinner: Spinner
    private lateinit var registerButton: Button
    private lateinit var loginText: TextView
    private lateinit var authRepository: AuthRepository
    private lateinit var sharedPreferences: SharedPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        authRepository = AuthRepository()
        sharedPreferences = getSharedPreferences("AuthPrefs", Context.MODE_PRIVATE)

        setupUI()
        startOrbAnimations()
        setupTiledBackground()
    }

    private fun setupTiledBackground() {
        val waveBackground = findViewById<View>(R.id.waveBackground)
        waveBackground.background = TiledDrawable.create(this, R.drawable.ic_wave_pattern)
    }

    private fun setupUI() {
        fullNameEditText        = findViewById(R.id.fullNameEditText)
        emailEditText           = findViewById(R.id.emailEditText)
        passwordEditText        = findViewById(R.id.passwordEditText)
        confirmPasswordEditText = findViewById(R.id.confirmPasswordEditText)
        roleSpinner             = findViewById(R.id.roleSpinner)
        registerButton          = findViewById(R.id.registerButton)
        loginText               = findViewById(R.id.loginText)

        // Role spinner — "Student" and "Faculty"
        val roles = arrayOf("Student", "Faculty")
        val adapter = object : ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, roles) {
            override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
                val view = super.getView(position, convertView, parent) as TextView
                view.setTextColor(Color.WHITE)
                return view
            }
            override fun getDropDownView(position: Int, convertView: View?, parent: ViewGroup): View {
                val view = super.getDropDownView(position, convertView, parent) as TextView
                view.setTextColor(Color.WHITE)
                view.setBackgroundColor(ContextCompat.getColor(context, R.color.input_bg_dark))
                return view
            }
        }
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        roleSpinner.adapter = adapter

        registerButton.setOnClickListener { performRegister() }
        loginText.setOnClickListener { finish() }
    }

    private fun performRegister() {
        val fullName        = fullNameEditText.text.toString().trim()
        val email           = emailEditText.text.toString().trim()
        val password        = passwordEditText.text.toString().trim()
        val confirmPassword = confirmPasswordEditText.text.toString().trim()
        val role            = roleSpinner.selectedItem.toString() // "Student" or "Teacher"

        // Validation
        if (fullName.isEmpty() || email.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
            Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
            return
        }
        if (fullName.length < 2) {
            Toast.makeText(this, "Full name must be at least 2 characters", Toast.LENGTH_SHORT).show()
            return
        }
        if (password != confirmPassword) {
            Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
            return
        }
        if (password.length < 6) {
            Toast.makeText(this, "Password must be at least 6 characters", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            try {
                registerButton.isEnabled = false
                val result = authRepository.register(fullName, email, password, role)

                result.fold(
                    onSuccess = { response ->
                        if (response.success && response.token != null) {
                            Toast.makeText(this@Register, "Registration successful!", Toast.LENGTH_SHORT).show()

                            // Save auth data immediately — no need for a second login call
                            val savedRole = response.user?.role?.takeIf { it.isNotEmpty() }
                                ?: role.lowercase()

                            sharedPreferences.edit()
                                .putString("auth_token", response.token)
                                .putString("user_id",    response.user?.id ?: "")
                                .putString("user_email", response.user?.email ?: email)
                                .putString("user_name",  response.user?.fullName
                                    ?: "${response.user?.firstName} ${response.user?.lastName}".trim()
                                    ?: fullName)
                                .putString("user_role",  savedRole)
                                .apply()

                            // Navigate directly to the right dashboard
                            val intent = when {
                                savedRole.equals("teacher", ignoreCase = true) ||
                                savedRole.equals("faculty", ignoreCase = true) ->
                                    Intent(this@Register, TeacherDashboard::class.java)
                                else ->
                                    Intent(this@Register, StudentDashboard::class.java)
                            }                            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                            startActivity(intent)
                        } else {
                            Toast.makeText(
                                this@Register,
                                response.error ?: "Registration failed",
                                Toast.LENGTH_LONG
                            ).show()
                        }
                    },
                    onFailure = { error ->
                        Toast.makeText(
                            this@Register,
                            "Registration failed: ${error.message}",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                )
            } catch (e: Exception) {
                Toast.makeText(this@Register, "Error: ${e.message}", Toast.LENGTH_LONG).show()
            } finally {
                registerButton.isEnabled = true
            }
        }
    }

    private fun startOrbAnimations() {
        animateOrb(findViewById(R.id.orb1), 30000L,  100f, -100f)
        animateOrb(findViewById(R.id.orb2), 40000L, -120f,   80f)
        animateOrb(findViewById(R.id.orb3), 50000L,   60f,  160f)
    }

    private fun animateOrb(view: View, duration: Long, deltaX: Float, deltaY: Float) {
        val pvhX      = PropertyValuesHolder.ofFloat(View.TRANSLATION_X, 0f, deltaX, 0f)
        val pvhY      = PropertyValuesHolder.ofFloat(View.TRANSLATION_Y, 0f, deltaY, 0f)
        val pvhScaleX = PropertyValuesHolder.ofFloat(View.SCALE_X, 1f, 1.4f, 1f)
        val pvhScaleY = PropertyValuesHolder.ofFloat(View.SCALE_Y, 1f, 1.4f, 1f)

        ObjectAnimator.ofPropertyValuesHolder(view, pvhX, pvhY, pvhScaleX, pvhScaleY).apply {
            this.duration = duration
            repeatCount   = ValueAnimator.INFINITE
            repeatMode    = ValueAnimator.REVERSE
            interpolator  = AccelerateDecelerateInterpolator()
            start()
        }
    }
}
