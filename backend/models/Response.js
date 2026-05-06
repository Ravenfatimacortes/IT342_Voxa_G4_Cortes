const { supabase } = require('../config/database');

class Response {
  static async create(responseData) {
    const { surveyId, userId, submittedAt = new Date(), isCompleted = true, completionTime } = responseData;
    
    const { data, error } = await supabase
      .from('user_responses')
      .insert([
        {
          survey_id: surveyId,
          user_id: userId,
          submitted_at: submittedAt,
          is_completed: isCompleted,
          completion_time: completionTime
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return this.formatResponse(data);
  }
  
  static async findById(id, includeAnswers = false) {
    let query = supabase.from('user_responses').select('*');
    
    if (includeAnswers) {
      query = query.select(`
        *,
        answers (*)
      `);
    }
    
    const { data, error } = await query.eq('id', id).single();
    
    if (error) return null;
    return this.formatResponse(data);
  }
  
  static async findByUserId(userId, includeSurvey = false) {
    let query = supabase.from('user_responses').select('*');
    
    if (includeSurvey) {
      query = query.select(`
        *,
        surveys (*)
      `);
    }
    
    const { data, error } = await query
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    return data.map(response => this.formatResponse(response));
  }
  
  static async findBySurveyId(surveyId, includeUser = false, includeAnswers = false) {
    let selectQuery = '*';
    
    if (includeUser && includeAnswers) {
      selectQuery = `
        *,
        users (*),
        answers (*)
      `;
    } else if (includeUser) {
      selectQuery = `
        *,
        users (*)
      `;
    } else if (includeAnswers) {
      selectQuery = `
        *,
        answers (*)
      `;
    }
    
    const { data, error } = await supabase
      .from('user_responses')
      .select(selectQuery)
      .eq('survey_id', surveyId)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    return data.map(response => this.formatResponse(response));
  }
  
  static async findBySurveyAndUser(surveyId, userId) {
    const { data, error } = await supabase
      .from('user_responses')
      .select('*')
      .eq('survey_id', surveyId)
      .eq('user_id', userId)
      .single();
    
    if (error) return null;
    return this.formatResponse(data);
  }
  
  static async update(id, updateData) {
    const updateFields = {};
    
    if (updateData.submittedAt !== undefined) updateFields.submitted_at = updateData.submittedAt;
    if (updateData.isCompleted !== undefined) updateFields.is_completed = updateData.isCompleted;
    if (updateData.completionTime !== undefined) updateFields.completion_time = updateData.completionTime;
    
    const { data, error } = await supabase
      .from('user_responses')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.formatResponse(data);
  }
  
  static async delete(id) {
    const { error } = await supabase
      .from('user_responses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
  
  static formatResponse(responseData) {
    if (!responseData) return null;
    
    const formattedResponse = {
      id: responseData.id,
      surveyId: responseData.survey_id,
      userId: responseData.user_id,
      submittedAt: responseData.submitted_at,
      isCompleted: responseData.is_completed,
      completionTime: responseData.completion_time,
      createdAt: responseData.created_at,
      updatedAt: responseData.updated_at
    };
    
    // Add related data if it exists
    if (responseData.answers) {
      formattedResponse.answers = responseData.answers.map(a => Answer.formatAnswer(a));
    }
    
    if (responseData.users) {
      formattedResponse.user = User.formatUser(responseData.users);
    }
    
    if (responseData.surveys) {
      formattedResponse.survey = Survey.formatSurvey(responseData.surveys);
    }
    
    return formattedResponse;
  }
}

class Answer {
  static async create(answerData) {
    const { responseId, questionId, answerText, answerOptions, rating } = answerData;
    
    const { data, error } = await supabase
      .from('answers')
      .insert([
        {
          response_id: responseId,
          question_id: questionId,
          answer_text: answerText,
          answer_options: answerOptions,
          rating
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return this.formatAnswer(data);
  }
  
  static async findByResponseId(responseId, includeQuestion = false) {
    let query = supabase.from('answers').select('*');
    
    if (includeQuestion) {
      query = query.select(`
        *,
        questions (*)
      `);
    }
    
    const { data, error } = await query
      .eq('response_id', responseId)
      .order('id', { ascending: true });
    
    if (error) throw error;
    return data.map(answer => this.formatAnswer(answer));
  }
  
  static async findByQuestionId(questionId, includeResponse = false) {
    let query = supabase.from('answers').select('*');
    
    if (includeResponse) {
      query = query.select(`
        *,
        responses (*)
      `);
    }
    
    const { data, error } = await query
      .eq('question_id', questionId)
      .order('id', { ascending: true });
    
    if (error) throw error;
    return data.map(answer => this.formatAnswer(answer));
  }
  
  static async update(id, updateData) {
    const updateFields = {};
    
    if (updateData.answerText !== undefined) updateFields.answer_text = updateData.answerText;
    if (updateData.answerOptions !== undefined) updateFields.answer_options = updateData.answerOptions;
    if (updateData.rating !== undefined) updateFields.rating = updateData.rating;
    
    const { data, error } = await supabase
      .from('answers')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.formatAnswer(data);
  }
  
  static async delete(id) {
    const { error } = await supabase
      .from('answers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
  
  static async deleteByResponseId(responseId) {
    const { error } = await supabase
      .from('answers')
      .delete()
      .eq('response_id', responseId);
    
    if (error) throw error;
    return true;
  }
  
  static formatAnswer(answerData) {
    if (!answerData) return null;
    
    const formattedAnswer = {
      id: answerData.id,
      responseId: answerData.response_id,
      questionId: answerData.question_id,
      answerText: answerData.answer_text,
      answerOptions: answerData.answer_options,
      rating: answerData.rating,
      createdAt: answerData.created_at,
      updatedAt: answerData.updated_at
    };
    
    // Add related data if it exists
    if (answerData.questions) {
      formattedAnswer.question = Question.formatQuestion(answerData.questions);
    }
    
    if (answerData.responses) {
      formattedAnswer.response = Response.formatResponse(answerData.responses);
    }
    
    return formattedAnswer;
  }
}

module.exports = { Response, Answer };
