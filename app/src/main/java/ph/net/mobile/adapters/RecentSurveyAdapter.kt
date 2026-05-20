package ph.net.mobile.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import ph.net.mobile.R
import ph.net.mobile.models.Survey
import java.text.SimpleDateFormat
import java.util.*

class RecentSurveyAdapter(
    private var surveys: List<Survey>,
    private val onItemClick: ((Survey) -> Unit)? = null,
    private val onEditClick: ((Survey) -> Unit)? = null,
    private val onDeleteClick: ((Survey) -> Unit)? = null
) : RecyclerView.Adapter<RecentSurveyAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val root: View = view
        val title: TextView = view.findViewById(R.id.surveyTitle)
        val date: TextView = view.findViewById(R.id.surveyDate)
        val status: TextView = view.findViewById(R.id.surveyStatus)
        val responseCount: TextView = view.findViewById(R.id.responseCount)
        val btnEdit: ImageButton = view.findViewById(R.id.btnEdit)
        val btnDelete: ImageButton = view.findViewById(R.id.btnDelete)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_recent_survey, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val survey = surveys[position]
        holder.title.text = survey.title
        holder.status.text = survey.status
        holder.responseCount.text = "${survey.responseCount} Responses"
        
        holder.root.setOnClickListener {
            onItemClick?.invoke(survey)
        }

        if (onEditClick != null) {
            holder.btnEdit.visibility = View.VISIBLE
            holder.btnEdit.setOnClickListener { onEditClick.invoke(survey) }
        } else {
            holder.btnEdit.visibility = View.GONE
        }

        if (onDeleteClick != null) {
            holder.btnDelete.visibility = View.VISIBLE
            holder.btnDelete.setOnClickListener { onDeleteClick.invoke(survey) }
        } else {
            holder.btnDelete.visibility = View.GONE
        }
        
        // Simple date formatting
        try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
            val outputFormat = SimpleDateFormat("MMM dd, yyyy", Locale.US)
            val date = inputFormat.parse(survey.createdAt)
            holder.date.text = "Created on ${outputFormat.format(date)}"
        } catch (e: Exception) {
            holder.date.text = "Created recently"
        }
    }

    override fun getItemCount() = surveys.size

    fun updateData(newSurveys: List<Survey>) {
        surveys = newSurveys
        notifyDataSetChanged()
    }
}
