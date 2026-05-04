require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function addProfilePictureColumn() {
  try {
    console.log('=== Adding Profile Picture Column ===');
    
    // Add profile_picture column to users table
    const { data, error } = await supabaseAdmin.rpc('add_column_if_not_exists', {
      table_name: 'users',
      column_name: 'profile_picture',
      column_type: 'text'
    });
    
    if (error) {
      console.log('❌ Error adding column:', error.message);
      
      // Try alternative approach with raw SQL
      console.log('Trying direct SQL approach...');
      
      // For Supabase, we can use the SQL editor or the REST API
      // Let's try a simple update first to see if the column exists
      const { data: testUpdate, error: testError } = await supabaseAdmin
        .from('users')
        .update({ profile_picture: null })
        .eq('id', 39)
        .select()
        .single();
      
      if (testError && testError.message.includes('column')) {
        console.log('❌ Column does not exist. Please add it manually via Supabase dashboard:');
        console.log('1. Go to Supabase dashboard');
        console.log('2. Select your project');
        console.log('3. Go to Table Editor > users');
        console.log('4. Add new column: profile_picture (type: text)');
        return;
      }
      
      console.log('✅ Column update test passed');
    } else {
      console.log('✅ Column added successfully');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

addProfilePictureColumn();
