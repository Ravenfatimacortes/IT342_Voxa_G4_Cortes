const { supabase } = require('../../../config/database');

class Survey {
  static async create(surveyData) {
    const { title, description, createdBy, status = 'PUBLISHED', targetAudience, startDate, endDate } = surveyData;
    
    const { data, error } = await supabase
      .from('surveys')
      .insert([
        {
          title,
          description,
          created_by: createdBy,
          status,
          target_audience: targetAudience,
          start_date: startDate,
          end_date: endDate
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return this.formatSurvey(data);
  }
  
  static async findById(id, includeQuestions = false) {
    let query = supabase.from('surveys').select('*');
    
    if (includeQuestions) {
      query = query.select(`
        *,
        questions (*)
      `);
    }
    
    const { data, error } = await query.eq('id', id).single();
    
    if (error) return null;
    return this.formatSurvey(data);
  }
  
  static async findAll(filters = {}) {
    let query = supabase.from('surveys').select('*');
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.createdBy) {
      query = query.eq('created_by', filters.createdBy);
    }
    
    if (filters.includeQuestions) {
      query = query.select(`
        *,
        questions (*)
      `);
    }
    
    // Add ordering
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data.map(survey => this.formatSurvey(survey));
  }
  
  static async update(id, updateData) {
    const updateFields = {};
    
    if (updateData.title !== undefined) updateFields.title = updateData.title;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.status !== undefined) updateFields.status = updateData.status;
    if (updateData.targetAudience !== undefined) updateFields.target_audience = updateData.targetAudience;
    if (updateData.startDate !== undefined) updateFields.start_date = updateData.startDate;
    if (updateData.endDate !== undefined) updateFields.end_date = updateData.endDate;
    
    const { data, error } = await supabase
      .from('surveys')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.formatSurvey(data);
  }
  
  static async delete(id) {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
  
  static async incrementResponseCount(id) {
    const { data, error } = await supabase.rpc('increment_response_count', { 
      survey_id: id 
    });
    
    if (error) {
      // Fallback to manual increment if RPC doesn't exist
      const { data: surveyData, error: fetchError } = await supabase
        .from('surveys')
        .select('response_count')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { error: updateError } = await supabase
        .from('surveys')
        .update({ response_count: surveyData.response_count + 1 })
        .eq('id', id);
      
      if (updateError) throw updateError;
    }
    
    return true;
  }
  
  static async getPublishedSurveys() {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(survey => this.formatSurvey(survey));
  }
  
  static formatSurvey(surveyData) {
    if (!surveyData) return null;
    
    const formattedSurvey = {
      id: surveyData.id,
      title: surveyData.title,
      description: surveyData.description,
      createdBy: surveyData.created_by,
      status: surveyData.status,
      responseCount: surveyData.response_count,
      targetAudience: surveyData.target_audience,
      startDate: surveyData.start_date,
      endDate: surveyData.end_date,
      createdAt: surveyData.created_at,
      updatedAt: surveyData.updated_at
    };
    
    // Add questions if they exist
    if (surveyData.questions) {
      formattedSurvey.questions = surveyData.questions.map(q => Question.formatQuestion(q));
    }
    
    // Add instance method
    formattedSurvey.incrementResponseCount = async function() {
      return await Survey.incrementResponseCount(this.id);
    };
    
    return formattedSurvey;
  }
}

class Question {
  static async create(questionData) {
    const { surveyId, text, type, order, options } = questionData;
    
    const { data, error } = await supabase
      .from('questions')
      .insert([
        {
          survey_id: surveyId,
          text,
          type,
          order,
          options
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return this.formatQuestion(data);
  }
  
  static async findBySurveyId(surveyId) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('survey_id', surveyId)
      .order('order', { ascending: true });
    
    if (error) throw error;
    return data.map(question => this.formatQuestion(question));
  }
  
  static async update(id, updateData) {
    const updateFields = {};
    
    if (updateData.text !== undefined) updateFields.text = updateData.text;
    if (updateData.type !== undefined) updateFields.type = updateData.type;
    if (updateData.order !== undefined) updateFields.order = updateData.order;
    if (updateData.options !== undefined) updateFields.options = updateData.options;
    
    const { data, error } = await supabase
      .from('questions')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.formatQuestion(data);
  }
  
  static async delete(id) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
  
  static async deleteBySurveyId(surveyId) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('survey_id', surveyId);
    
    if (error) throw error;
    return true;
  }
  
  static formatQuestion(questionData) {
    if (!questionData) return null;
    
    return {
      id: questionData.id,
      surveyId: questionData.survey_id,
      text: questionData.text,
      type: questionData.type,
      order: questionData.order,
      options: questionData.options,
      createdAt: questionData.created_at,
      updatedAt: questionData.updated_at
    };
  }
}

module.exports = { Survey, Question };
