package ph.net.mobile.models

import com.google.gson.annotations.SerializedName

// ── Backend request models ────────────────────────────────────────────────────

data class LoginRequest(
    val email: String,
    val password: String
)

/** Sent to POST /api/v1/auth/register */
data class BackendRegisterRequest(
    @SerializedName("fullName") val fullName: String,
    val email: String,
    val password: String,
    val role: String          // "Student" or "Teacher"
)

// ── Backend response models ───────────────────────────────────────────────────

/** Returned by both /register and /login on the backend */
data class BackendAuthResponse(
    val message: String?,
    val token: String?,
    val error: String?,
    val user: BackendUser?
) {
    val success: Boolean get() = token != null
}

data class BackendUser(
    val id: String,
    @SerializedName("firstName") val firstName: String?,
    @SerializedName("lastName")  val lastName: String?,
    @SerializedName("fullName")  val fullName: String?,
    val email: String,
    val role: String?           // "student" / "teacher" / "faculty" / "admin"
)

// ── Legacy Supabase models (kept for reference, no longer used for auth) ──────

data class RegisterRequest(
    val email: String,
    val password: String,
    val data: Map<String, String>? = null
)

data class AuthResponse(
    @SerializedName("access_token")  val accessToken: String?,
    @SerializedName("token_type")    val tokenType: String?,
    @SerializedName("user")          val user: User?,
    val id: String?,
    val email: String?,
    @SerializedName("user_metadata") val userMetadata: Map<String, String>?,
    @SerializedName("created_at")    val createdAt: String?,
    val msg: String?,
    val error: String?,
    @SerializedName("error_description") val errorDescription: String?
) {
    val success: Boolean get() = accessToken != null || user != null || id != null
    val message: String  get() = msg ?: errorDescription ?: error ?: "Unknown error"
    val actualUser: User? get() = user ?: if (id != null && email != null) {
        User(id, email, userMetadata, createdAt ?: "")
    } else null
}

data class User(
    val id: String,
    val email: String,
    @SerializedName("user_metadata") val userMetadata: Map<String, String>?,
    @SerializedName("created_at")    val createdAt: String
) {
    val name: String get() = userMetadata?.get("full_name") ?: ""
    val role: String get() = userMetadata?.get("role") ?: ""
}

data class GoogleAuthRequest(val idToken: String)
