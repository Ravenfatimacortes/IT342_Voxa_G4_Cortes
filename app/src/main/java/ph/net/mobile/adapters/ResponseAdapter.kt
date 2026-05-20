package ph.net.mobile.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import ph.net.mobile.R
import ph.net.mobile.models.UserResponse
import java.text.SimpleDateFormat
import java.util.*

class ResponseAdapter(private var responses: List<UserResponse>) :
    RecyclerView.Adapter<ResponseAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val name: TextView = view.findViewById(R.id.respondentName)
        val email: TextView = view.findViewById(R.id.respondentEmail)
        val date: TextView = view.findViewById(R.id.submissionDate)
        val summary: TextView = view.findViewById(R.id.summaryText)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_response, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val response = responses[position]
        holder.name.text = response.userId.fullName
        holder.email.text = response.userId.email
        holder.summary.text = "${response.answers.size} answers provided"

        try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
            val outputFormat = SimpleDateFormat("MMM dd, yyyy", Locale.US)
            val date = inputFormat.parse(response.submittedAt)
            if (date != null) {
                holder.date.text = outputFormat.format(date)
            } else {
                holder.date.text = "Recent"
            }
        } catch (e: Exception) {
            holder.date.text = "Recent"
        }
    }

    override fun getItemCount() = responses.size

    fun updateData(newResponses: List<UserResponse>) {
        responses = newResponses
        notifyDataSetChanged()
    }
}