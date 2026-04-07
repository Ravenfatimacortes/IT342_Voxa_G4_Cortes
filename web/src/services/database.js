import { supabase } from '../supabase';

// Survey operations
export const surveyService = {
  // Get all available surveys for students
  getAvailableSurveys: async () => {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get survey by ID
  getSurveyById: async (id) => {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new survey (faculty/admin only)
  createSurvey: async (surveyData) => {
    const { data, error } = await supabase
      .from('surveys')
      .insert([surveyData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update survey
  updateSurvey: async (id, surveyData) => {
    const { data, error } = await supabase
      .from('surveys')
      .update(surveyData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete survey
  deleteSurvey: async (id) => {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get all surveys (faculty/admin)
  getAllSurveys: async () => {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Publish survey
  publishSurvey: async (id) => {
    const { data, error } = await supabase
      .from('surveys')
      .update({ is_published: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Unpublish survey
  unpublishSurvey: async (id) => {
    const { data, error } = await supabase
      .from('surveys')
      .update({ is_published: false })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Response operations
export const responseService = {
  // Submit survey response
  submitResponse: async (responseData) => {
    const { data, error } = await supabase
      .from('responses')
      .insert([responseData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get user's responses
  getUserResponses: async (userId) => {
    const { data, error } = await supabase
      .from('responses')
      .select('*, surveys(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get response by ID
  getResponseById: async (id) => {
    const { data, error } = await supabase
      .from('responses')
      .select('*, surveys(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get all responses for a survey (faculty/admin)
  getSurveyResponses: async (surveyId) => {
    const { data, error } = await supabase
      .from('responses')
      .select('*, users(*)')
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get specific response for a survey (faculty/admin)
  getSurveyResponseById: async (surveyId, userId) => {
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .eq('survey_id', surveyId)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }
};

// User profile operations
export const userService = {
  // Update user profile
  updateProfile: async (userId, profileData) => {
    const { data, error } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Change password
  changePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
  }
};
