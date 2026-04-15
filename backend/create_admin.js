const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SUPABASE_SERVICE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminAccount() {
  try {
    console.log('Creating admin account...');
    
    // Hash the password
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if admin already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin')
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing admin:', checkError);
      return;
    }
    
    if (existingAdmin) {
      console.log('Admin account already exists. Updating password...');
      
      // Update existing admin password
      const { data, error } = await supabase
        .from('users')
        .update({ 
          password: hashedPassword,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', 'admin')
        .select();
      
      if (error) {
        console.error('Error updating admin:', error);
        return;
      }
      
      console.log('Admin account updated successfully!');
      console.log('Email: admin');
      console.log('Password: password123');
    } else {
      // Create new admin account
      const { data, error } = await supabase
        .from('users')
        .insert({
          first_name: 'System',
          last_name: 'Administrator',
          email: 'admin',
          password: hashedPassword,
          role: 'admin',
          student_id: null,
          department: 'System Administration',
          is_active: true
        })
        .select();
      
      if (error) {
        console.error('Error creating admin:', error);
        return;
      }
      
      console.log('Admin account created successfully!');
      console.log('Email: admin');
      console.log('Password: password123');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
createAdminAccount();
