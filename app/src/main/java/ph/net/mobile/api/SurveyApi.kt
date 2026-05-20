package ph.net.mobile.api

import ph.net.mobile.models.*
import retrofit2.Response
import retrofit2.http.*

interface SurveyApi {
    @GET("api/v1/admin/surveys")
    suspend fun getAdminSurveys(
        @Header("Authorization") token: String,
        @Query("limit") limit: Int? = null,
        @Query("sort") sort: String? = null
    ): Response<SurveyResponse>

    @POST("api/v1/admin/surveys")
    suspend fun createSurvey(
        @Header("Authorization") token: String,
        @Body request: CreateSurveyRequest
    ): Response<CreateSurveyResponse>

    @POST("api/v1/admin/surveys/{id}/publish")
    suspend fun publishSurvey(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Response<CreateSurveyResponse>

    @GET("api/v1/admin/surveys/{id}/responses")
    suspend fun getSurveyResponses(
        @Header("Authorization") token: String,
        @Path("id") id: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 10
    ): Response<SurveyResponsesList>

    @GET("api/v1/admin/surveys/{id}")
    suspend fun getSurveyById(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Response<SurveyDetailResponse>

    @PUT("api/v1/admin/surveys/{id}")
    suspend fun updateSurvey(
        @Header("Authorization") token: String,
        @Path("id") id: String,
        @Body request: CreateSurveyRequest
    ): Response<CreateSurveyResponse>

    @DELETE("api/v1/admin/surveys/{id}")
    suspend fun deleteSurvey(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Response<Unit>

    @GET("api/v1/admin/surveys")
    suspend fun searchSurveys(
        @Header("Authorization") token: String,
        @Query("search") query: String
    ): Response<SurveyResponse>
}
