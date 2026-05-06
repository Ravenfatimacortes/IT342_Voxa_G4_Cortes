const { supabaseAdmin } = require('../config/database');

class FirstFacultyService {
  static async getFirstFacultyId() {
    try {
      // Cache the first faculty ID to avoid repeated database queries
      if (this._firstFacultyId) {
        return this._firstFacultyId;
      }

      // Get the first registered faculty account
      const { data: firstFaculty, error } = await supabaseAdmin
        .from('users')
        .select('id, email, created_at')
        .eq('role', 'teacher')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error || !firstFaculty) {
        console.log('No faculty account found yet');
        return null;
      }

      // Cache the result
      this._firstFacultyId = firstFaculty.id;
      console.log(`First faculty account identified: ${firstFaculty.email} (${firstFaculty.id})`);
      
      return firstFaculty.id;
    } catch (error) {
      console.error('Error getting first faculty ID:', error);
      return null;
    }
  }

  static async isFirstFacultySurvey(surveyCreatorId) {
    const firstFacultyId = await this.getFirstFacultyId();
    return firstFacultyId && surveyCreatorId === firstFacultyId;
  }

  static async getFirstFacultySurveys() {
    try {
      const firstFacultyId = await this.getFirstFacultyId();
      
      if (!firstFacultyId) {
        return [];
      }

      const { data: surveys, error } = await supabaseAdmin
        .from('surveys')
        .select(`
          *,
          users!surveys_created_by_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .eq('created_by', firstFacultyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting first faculty surveys:', error);
        return [];
      }

      return surveys || [];
    } catch (error) {
      console.error('Error in getFirstFacultySurveys:', error);
      return [];
    }
  }

  // Clear cache (useful for testing or when faculty accounts change)
  static clearCache() {
    this._firstFacultyId = null;
  }
}

module.exports = FirstFacultyService;
