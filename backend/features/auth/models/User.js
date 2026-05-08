const bcrypt = require('bcryptjs');
const { supabase, supabaseAdmin } = require('../../../config/database');

class User {
  static async create(userData) {
    const { firstName, lastName, email, password, role = 'student', studentId, department } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email,
          password: hashedPassword,
          role,
          student_id: studentId,
          department
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    return this.formatUser(data);
  }
  
  static async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return this.formatUser(data);
  }
  
  static async findByEmail(email) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) return null;
    return this.formatUser(data);
  }
  
  static async findByStudentId(studentId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('student_id', studentId)
      .single();
    
    if (error) return null;
    return this.formatUser(data);
  }
  
  static async update(id, updateData) {
    const updateFields = {};
    
    if (updateData.firstName) updateFields.first_name = updateData.firstName;
    if (updateData.lastName) updateFields.last_name = updateData.lastName;
    if (updateData.email) updateFields.email = updateData.email;
    if (updateData.studentId) updateFields.student_id = updateData.studentId;
    if (updateData.department) updateFields.department = updateData.department;
    if (updateData.role) updateFields.role = updateData.role;
    
    // Handle password update separately
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(updateData.password, salt);
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.formatUser(data);
  }
  
  static async findAll(filters = {}) {
    let query = supabase.from('users').select('*');
    
    if (filters.role) {
      query = query.eq('role', filters.role);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data.map(user => this.formatUser(user));
  }
  
  static async delete(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
  
  static formatUser(userData) {
    if (!userData) return null;
    
    return {
      id: userData.id,
      firstName: userData.first_name,
      lastName: userData.last_name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      studentId: userData.student_id,
      department: userData.department,
      profilePicture: userData.profile_picture,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
      // Instance methods
      comparePassword: async function(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
      },
      getFullName: function() {
        return `${this.firstName} ${this.lastName}`;
      }
    };
  }
}

module.exports = User;
