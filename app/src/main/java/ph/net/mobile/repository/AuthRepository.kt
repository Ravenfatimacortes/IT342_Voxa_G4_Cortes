package ph.net.mobile.repository

import com.google.gson.Gson
import ph.net.mobile.api.AuthApi
import ph.net.mobile.models.*
import ph.net.mobile.network.RetrofitClient

class AuthRepository {

    private val authApi = RetrofitClient.authApi
    private val gson = Gson()

    suspend fun login(email: String, password: String): Result<BackendAuthResponse> {
        return try {
            val response = authApi.login(LoginRequest(email, password))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                val errorBody = response.errorBody()?.string()
                val errorResponse = try {
                    gson.fromJson(errorBody, BackendAuthResponse::class.java)
                } catch (e: Exception) { null }
                val message = errorResponse?.error ?: "Login failed: ${response.code()}"
                Result.failure(Exception(message))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(
        name: String,
        email: String,
        password: String,
        role: String
    ): Result<BackendAuthResponse> {
        return try {
            val response = authApi.register(
                BackendRegisterRequest(
                    fullName = name,
                    email = email,
                    password = password,
                    role = role
                )
            )
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                val errorBody = response.errorBody()?.string()
                val errorResponse = try {
                    gson.fromJson(errorBody, BackendAuthResponse::class.java)
                } catch (e: Exception) { null }
                val message = errorResponse?.error ?: "Registration failed: ${response.code()}"
                Result.failure(Exception(message))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
