package ph.net.mobile.config

object ApiConfig {
    // 10.0.2.2 = host machine localhost when running on Android emulator
    // If using a physical device, change this to your PC's local IP e.g. "http://192.168.1.x:5000"
    const val BASE_URL = "http://10.0.2.2:5000"
    const val SUPABASE_URL = "https://bxuqpflqfhznlvvrsbas.supabase.co/"
    const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dXFwZmxxZmh6bmx2dnJzYmFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5ODM3MTQsImV4cCI6MjA5MTU1OTcxNH0.yLWdAIg6T0FAFkYg15E4qxE7i6ZMg15WMuwDVTJhUdY"
    const val GOOGLE_CLIENT_ID = "382833486797-0ql6h7f1fk26ke4jq1tvc723q1pk4j2e.apps.googleusercontent.com"
}
