package ph.net.mobile.pages

import android.animation.ObjectAnimator
import android.animation.PropertyValuesHolder
import android.animation.ValueAnimator
import android.content.Intent
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

    private lateinit var emailEditText: EditText
    private lateinit var passwordEditText: EditText
    private lateinit var confirmPasswordEditText: EditText
    private lateinit var roleSpinner: Spinner
    private lateinit var registerButton: Button
    private lateinit var loginText: TextView
    private lateinit var authRepository: AuthRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        authRepository = AuthRepository()

        setupUI()
        startOrbAnimations()
        setupTiledBackground()
    }

    private fun setupTiledBackground() {
        val waveBackground = findViewById<View>(R.id.waveBackground)
        waveBackground.background = TiledDrawable.create(this, R.drawable.ic_wave_pattern)
    }

    private fun setupUI() {
        emailEditText = findViewById(R.id.emailEditText)
        passwordEditText = findViewById(R.id.passwordEditText)
        confirmPasswordEditText = findViewById(R.id.confirmPasswordEditText)
        roleSpinner = findViewById(R.id.roleSpinner)
        registerButton = findViewById(R.id.registerButton)
        loginText = findViewById(R.id.loginText)

        // Setup Role Spinner
        val roles = arrayOf("Student", "Teacher")
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

        registerButton.setOnClickListener {
            performRegister()
        }

        loginText.setOnClickListener {
            finish() // Go back to Log in
        }
    }

    private fun startOrbAnimations() {
        val orb1 = findViewById<View>(R.id.orb1)
        val orb2 = findViewById<View>(R.id.orb2)
        val orb3 = findViewById<View>(R.id.orb3)

        animateOrb(orb1, 30000L, 100f, -100f)
        animateOrb(orb2, 40000L, -120f, 80f)
        animateOrb(orb3, 50000L, 60f, 160f)
    }

    private fun animateOrb(view: View, duration: Long, deltaX: Float, deltaY: Float) {
        val pvhX = PropertyValuesHolder.ofFloat(View.TRANSLATION_X, 0f, deltaX, 0f)
        val pvhY = PropertyValuesHolder.ofFloat(View.TRANSLATION_Y, 0f, deltaY, 0f)
        val pvhScaleX = PropertyValuesHolder.ofFloat(View.SCALE_X, 1f, 1.4f, 1f)
        val pvhScaleY = PropertyValuesHolder.ofFloat(View.SCALE_Y, 1f, 1.4f, 1f)

        ObjectAnimator.ofPropertyValuesHolder(view, pvhX, pvhY, pvhScaleX, pvhScaleY).apply {
            this.duration = duration
            repeatCount = ValueAnimator.INFINITE
            repeatMode = ValueAnimator.REVERSE
            interpolator = AccelerateDecelerateInterpolator()
            start()
        }
    }

    private fun performRegister() {
        val email = emailEditText.text.toString().trim()
        val password = passwordEditText.text.toString().trim()
        val confirmPassword = confirmPasswordEditText.text.toString().trim()
        val role = roleSpinner.selectedItem.toString()

        if (email.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
            Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
            return
        }

        if (password != confirmPassword) {
            Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            try {
                registerButton.isEnabled = false
                // Using email prefix as a temporary name since full name was removed
                val tempName = email.substringBefore("@")
                val result = authRepository.register(tempName, email, password, role)
                
                result.fold(
                    onSuccess = { response ->
                        if (response.success) {
                            Toast.makeText(this@Register, "Registration successful!", Toast.LENGTH_SHORT).show()
                            val intent = Intent().apply {
                                putExtra("email", email)
                                putExtra("password", password)
                            }
                            setResult(RESULT_OK, intent)
                            finish()
                        } else {
                            Toast.makeText(this@Register, response.message, Toast.LENGTH_LONG).show()
                        }
                    },
                    onFailure = { error ->
                        Toast.makeText(this@Register, "Registration failed: ${error.message}", Toast.LENGTH_LONG).show()
                    }
                )
            } catch (e: Exception) {
                Toast.makeText(this@Register, "Error: ${e.message}", Toast.LENGTH_LONG).show()
            } finally {
                registerButton.isEnabled = true
            }
        }
    }
}
