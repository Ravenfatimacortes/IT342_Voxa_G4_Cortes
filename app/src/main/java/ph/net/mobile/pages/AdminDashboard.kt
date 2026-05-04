package ph.net.mobile.pages

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import ph.net.mobile.R

class AdminDashboard : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_admin_dashboard)

        setupUserInfo()
        setupRecentUsers()
        setupActivityLog()
    }

    private fun setupActivityLog() {
        val container = findViewById<LinearLayout>(R.id.activityLogContainer)
        val inflater = LayoutInflater.from(this)

        val logs = listOf(
            LogItem("5 alerts require admin review", "Just now", R.drawable.bg_dot_orange),
            LogItem("New user Ana Lopez registered as Student", "14 min ago", R.drawable.bg_dot_blue),
            LogItem("End-of-Term Evaluation reached 84 responses", "1 hour ago", R.drawable.bg_dot_green),
            LogItem("Carlo Bautista account suspended by admin", "2 hours ago", R.drawable.bg_dot_orange),
            LogItem("Role permissions updated for Faculty group", "3 hours ago", R.drawable.bg_dot_blue)
        )

        for (log in logs) {
            val itemView = inflater.inflate(R.layout.item_activity_log, container, false)
            val dot = itemView.findViewById<View>(R.id.logDot)
            val text = itemView.findViewById<TextView>(R.id.logText)
            val time = itemView.findViewById<TextView>(R.id.logTime)

            dot.setBackgroundResource(log.dotRes)
            text.text = log.text
            time.text = log.time

            container.addView(itemView)
        }
    }

    data class LogItem(val text: String, val time: String, val dotRes: Int)

    private fun setupUserInfo() {
        val sharedPrefs = getSharedPreferences("AuthPrefs", Context.MODE_PRIVATE)
        val name = sharedPrefs.getString("user_name", "Super Admin") ?: "Super Admin"

        val tvName = findViewById<TextView>(R.id.adminName)
        val tvInitials = findViewById<TextView>(R.id.adminInitials)

        tvName.text = name
        tvInitials.text = getInitials(name)
    }

    private fun getInitials(name: String): String {
        val parts = name.split(" ")
        return when {
            parts.size >= 2 -> "${parts[0][0]}${parts[1][0]}".uppercase()
            parts.isNotEmpty() -> "${parts[0][0]}".uppercase()
            else -> "SA"
        }
    }

    private fun setupRecentUsers() {
        val container = findViewById<LinearLayout>(R.id.recentUsersContainer)
        val inflater = LayoutInflater.from(this)

        val users = listOf(
            UserItem("Juan Santos", "2021-10342 • Engineering", "Student", "Active"),
            UserItem("Dr. Maria Reyes", "FAC-00124 • Engineering", "Faculty", "Active"),
            UserItem("Carlo Bautista", "2023-00124 • Science", "Student", "Suspended"),
            UserItem("Super Admin", "ADM-00001 • System", "Admin", "Active")
        )

        for (user in users) {
            val itemView = inflater.inflate(R.layout.item_recent_user, container, false)
            
            val tvInitials = itemView.findViewById<TextView>(R.id.userInitials)
            val tvName = itemView.findViewById<TextView>(R.id.userName)
            val tvDetails = itemView.findViewById<TextView>(R.id.userDetails)
            val tvRole = itemView.findViewById<TextView>(R.id.userRoleTag)
            val tvStatus = itemView.findViewById<TextView>(R.id.userStatusTag)

            tvInitials.text = getInitials(user.name)
            tvName.text = user.name
            tvDetails.text = user.details
            tvRole.text = user.role
            
            // Adjust Role Styling
            when (user.role) {
                "Faculty" -> tvRole.setTextColor(getColor(R.color.stat_purple))
                "Admin" -> tvRole.setTextColor(getColor(R.color.urgent_red))
            }

            tvStatus.text = user.status
            if (user.status == "Suspended") {
                tvStatus.setBackgroundResource(R.drawable.bg_suspended_tag)
                tvStatus.setTextColor(getColor(R.color.suspended_orange))
            } else {
                tvStatus.setBackgroundResource(R.drawable.bg_active_tag)
                tvStatus.setTextColor(getColor(R.color.active_green))
            }

            container.addView(itemView)
        }
    }

    data class UserItem(val name: String, val details: String, val role: String, val status: String)
}