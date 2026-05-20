package ph.net.mobile.pages

import android.content.Intent
import android.content.SharedPreferences
import android.graphics.Typeface
import android.os.Bundle
import android.view.View
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.ActionBarDrawerToggle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.GravityCompat
import androidx.drawerlayout.widget.DrawerLayout
import ph.net.mobile.R

class StudentDashboard : AppCompatActivity() {

    private lateinit var userNameText: TextView
    private lateinit var topBarUserName: TextView
    private lateinit var userInitialsCircle: TextView
    private lateinit var greetingText: TextView
    private lateinit var bannerSubtitle: TextView
    private lateinit var sharedPreferences: SharedPreferences
    private lateinit var drawerLayout: DrawerLayout
    
    // Tab Views
    private lateinit var tabFeed: TextView
    private lateinit var tabAvailable: TextView
    private lateinit var tabCompleted: TextView

    // Tab Containers & Indicators
    private lateinit var tabFeedContainer: View
    private lateinit var tabAvailableContainer: View
    private lateinit var tabCompletedContainer: View
    private lateinit var indicatorFeed: View
    private lateinit var indicatorAvailable: View
    private lateinit var indicatorCompleted: View

    // Tab Contents
    private lateinit var feedContent: View
    private lateinit var surveysContent: View
    
    // Feed Elements
    private lateinit var feedUserInitials: TextView
    private lateinit var postPlaceholder: TextView
    
    // Stats
    private lateinit var pendingCount: TextView
    private lateinit var completedCount: TextView
    private lateinit var responseRateText: TextView
    
    // Drawer elements
    private lateinit var drawerUserName: TextView
    private lateinit var drawerUserRole: TextView
    private lateinit var drawerLogout: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_student_dashboard)

        sharedPreferences = getSharedPreferences("AuthPrefs", MODE_PRIVATE)
        
        // Initialize views
        userNameText = findViewById(R.id.userNameText)
        topBarUserName = findViewById(R.id.topBarUserName)
        userInitialsCircle = findViewById(R.id.userInitialsCircle)
        greetingText = findViewById(R.id.greetingText)
        bannerSubtitle = findViewById(R.id.bannerSubtitle)
        drawerLayout = findViewById(R.id.drawerLayout)
        
        pendingCount = findViewById(R.id.pendingCount)
        completedCount = findViewById(R.id.completedCount)
        responseRateText = findViewById(R.id.responseRateText)
        
        tabFeed = findViewById(R.id.tabFeed)
        tabAvailable = findViewById(R.id.tabAvailable)
        tabCompleted = findViewById(R.id.tabCompleted)

        tabFeedContainer = findViewById(R.id.tabFeedContainer)
        tabAvailableContainer = findViewById(R.id.tabAvailableContainer)
        tabCompletedContainer = findViewById(R.id.tabCompletedContainer)

        indicatorFeed = findViewById(R.id.indicatorFeed)
        indicatorAvailable = findViewById(R.id.indicatorAvailable)
        indicatorCompleted = findViewById(R.id.indicatorCompleted)

        feedContent = findViewById(R.id.feedContent)
        surveysContent = findViewById(R.id.surveysContent)

        feedUserInitials = findViewById(R.id.feedUserInitials)
        postPlaceholder = findViewById(R.id.postPlaceholder)
        
        // Initialize drawer elements
        drawerUserName = findViewById(R.id.drawerUserName)
        drawerUserRole = findViewById(R.id.drawerUserRole)
        drawerLogout = findViewById(R.id.drawerLogout)
        
        setupDrawer()
        setupTabListener()
        setupNavigationListeners()
        loadUserData()
    }

    private fun loadUserData() {
        val fullEmail = sharedPreferences.getString("user_email", "") ?: ""
        val derivedName = if (fullEmail.isNotEmpty()) fullEmail.substringBefore("@") else "User"
        val name = sharedPreferences.getString("user_name", derivedName) ?: derivedName
        
        userNameText.text = name
        topBarUserName.text = name.split(" ").firstOrNull() ?: name
        postPlaceholder.text = "What's on your mind, ${name.split(" ").firstOrNull() ?: name}?"
        
        // Update drawer user info
        drawerUserName.text = name
        drawerUserRole.text = "Student"
        
        // Generate initials for the circle
        if (name.isNotEmpty()) {
            val initials = name.split(" ")
                .filter { it.isNotEmpty() }
                .map { it[0].uppercaseChar() }
                .take(2)
                .joinToString("")
            userInitialsCircle.text = initials
            feedUserInitials.text = initials.take(1)
        }
    }
    
    private fun setupDrawer() {
        // Since we have a custom header, we'll use a hidden toggle or just open it via logic if needed
        // For now, let's just make sure the drawer can be opened if there was a button
        findViewById<View>(R.id.userPill).setOnClickListener {
            drawerLayout.openDrawer(GravityCompat.START)
        }
    }
    
    private fun setupTabListener() {
        val containers = listOf(tabFeedContainer, tabAvailableContainer, tabCompletedContainer)
        val indicators = listOf(indicatorFeed, indicatorAvailable, indicatorCompleted)
        val tabTexts = listOf(tabFeed, tabAvailable, tabCompleted)
        
        containers.forEachIndexed { index, view ->
            view.setOnClickListener {
                updateTabSelection(index, indicators, tabTexts)
                when (index) {
                    0 -> {
                        feedContent.visibility = View.VISIBLE
                        surveysContent.visibility = View.GONE
                    }
                    1 -> {
                        feedContent.visibility = View.GONE
                        surveysContent.visibility = View.VISIBLE
                        findViewById<TextView>(R.id.emptyStateTitle).text = "No available surveys"
                    }
                    2 -> {
                        feedContent.visibility = View.GONE
                        surveysContent.visibility = View.VISIBLE
                        findViewById<TextView>(R.id.emptyStateTitle).text = "No completed surveys"
                    }
                }
            }
        }
    }

    private fun updateTabSelection(selectedIndex: Int, indicators: List<View>, tabTexts: List<TextView>) {
        tabTexts.forEachIndexed { index, textView ->
            if (index == selectedIndex) {
                textView.setTextColor(ContextCompat.getColor(this, R.color.white))
                textView.setTypeface(null, Typeface.BOLD)
                indicators[index].visibility = View.VISIBLE
            } else {
                textView.setTextColor(ContextCompat.getColor(this, R.color.text_secondary))
                textView.setTypeface(null, Typeface.NORMAL)
                indicators[index].visibility = View.GONE
            }
        }
    }
    
    private fun setupNavigationListeners() {
        // Bottom navigation
        findViewById<View>(R.id.navDashboard).setOnClickListener {
            // Dashboard already selected
        }
        
        findViewById<View>(R.id.navSurveys).setOnClickListener {
            showToast("Responses feature coming soon")
        }
        
        findViewById<View>(R.id.navProfile).setOnClickListener {
            showToast("Profile feature coming soon")
        }
        
        findViewById<ImageView>(R.id.notificationBell).setOnClickListener {
            showToast("Notifications coming soon")
        }
        
        // Drawer navigation
        findViewById<View>(R.id.drawerDashboard).setOnClickListener {
            drawerLayout.closeDrawer(GravityCompat.START)
        }
        
        findViewById<View>(R.id.drawerMyResponses).setOnClickListener {
            drawerLayout.closeDrawer(GravityCompat.START)
            showToast("My Responses feature coming soon")
        }
        
        findViewById<View>(R.id.drawerProfile).setOnClickListener {
            drawerLayout.closeDrawer(GravityCompat.START)
            showToast("Profile feature coming soon")
        }
        
        drawerLogout.setOnClickListener {
            logout()
        }
    }
    
    private fun logout() {
        sharedPreferences.edit().clear().apply()
        val intent = Intent(this, Login::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
    
    private fun showToast(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }
    
    override fun onBackPressed() {
        if (drawerLayout.isDrawerOpen(GravityCompat.START)) {
            drawerLayout.closeDrawer(GravityCompat.START)
        } else {
            @Suppress("DEPRECATION")
            super.onBackPressed()
        }
    }
}
