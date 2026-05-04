package ph.net.mobile.network

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import ph.net.mobile.api.AuthApi
import ph.net.mobile.api.PostApi
import ph.net.mobile.config.ApiConfig
import java.util.concurrent.TimeUnit

object RetrofitClient {

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    // Single backend Retrofit instance — all API calls go through the Node backend
    private val backendRetrofit = Retrofit.Builder()
        .baseUrl(ApiConfig.BASE_URL + "/")
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val authApi: AuthApi = backendRetrofit.create(AuthApi::class.java)
    val postApi: PostApi = backendRetrofit.create(PostApi::class.java)
}
