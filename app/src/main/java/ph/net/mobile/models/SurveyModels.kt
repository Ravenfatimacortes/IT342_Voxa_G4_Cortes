package ph.net.mobile.models

import com.google.gson.annotations.SerializedName

data class Survey(
    @SerializedName("_id")
    val id: String,
    val title: String,
    val description: String?,
    val status: String, // "PUBLISHED", "DRAFT", "CLOSED"
    val questions: List<Question>,
    val responseCount: Int,
    val createdAt: String
)

data class Question(
    val questionText: String,
    val type: String, // "SHORT_ANSWER", "MULTIPLE_CHOICE"
    val required: Boolean,
    val order: Int,
    val options: List<String>? = null
)

data class CreateSurveyRequest(
    val title: String,
    val description: String,
    val questions: List<Question>
)

data class CreateSurveyResponse(
    val message: String,
    val survey: Survey
)

data class SurveyDetailResponse(
    val survey: Survey
)

data class SurveyResponsesList(
    val survey: Survey,
    val responses: List<UserResponse>,
    val pagination: Pagination
)

data class UserResponse(
    @SerializedName("_id")
    val id: String,
    val userId: UserInfo,
    val answers: List<Answer>,
    val submittedAt: String,
    val completionTime: Int
)

data class UserInfo(
    @SerializedName("_id")
    val id: String,
    val fullName: String,
    val email: String
)

data class Answer(
    val questionId: String,
    val answer: String
)

data class Pagination(
    val current: Int,
    val pages: Int,
    val total: Int
)

data class SurveyResponse(
    val surveys: List<Survey>,
    val total: Int
)

data class DashboardStats(
    val totalSurveys: Int,
    val publishedSurveys: Int,
    val totalResponses: Int,
    val recentActivity: List<Survey>
)
