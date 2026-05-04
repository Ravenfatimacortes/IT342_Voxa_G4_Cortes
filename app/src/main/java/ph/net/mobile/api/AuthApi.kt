package ph.net.mobile.api

import ph.net.mobile.models.*
import retrofit2.Response
import retrofit2.http.*

interface AuthApi {

    @POST("api/v1/auth/register")
    suspend fun register(
        @Body registerRequest: BackendRegisterRequest
    ): Response<BackendAuthResponse>

    @POST("api/v1/auth/login")
    suspend fun login(
        @Body loginRequest: LoginRequest
    ): Response<BackendAuthResponse>
}
