// Debug script to test profile update functionality
const { supabaseAdmin } = require('./config/database');

async function debugProfileUpdate() {
  try {
    console.log('=== PROFILE UPDATE DEBUG ===');
    
    // Test 1: Check if profile_pictures table exists
    console.log('\n1. Checking profile_pictures table...');
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'profile_pictures');
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
    } else {
      console.log('profile_pictures table exists:', tables.length > 0);
    }
    
    // Test 2: Check if users table has bio column
    console.log('\n2. Checking users table columns...');
    const { data: columns, error: columnsError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'users')
      .eq('column_name', 'bio');
    
    if (columnsError) {
      console.error('Error checking columns:', columnsError);
    } else {
      console.log('bio column exists:', columns.length > 0);
    }
    
    // Test 3: Try to select from profile_pictures
    console.log('\n3. Testing profile_pictures query...');
    try {
      const { data: pictures, error: picturesError } = await supabaseAdmin
        .from('profile_pictures')
        .select('*')
        .limit(1);
      
      if (picturesError) {
        console.error('Error querying profile_pictures:', picturesError);
      } else {
        console.log('profile_pictures query successful, rows:', pictures.length);
      }
    } catch (err) {
      console.error('Exception querying profile_pictures:', err.message);
    }
    
    // Test 4: Try to insert a test record
    console.log('\n4. Testing profile_pictures insert...');
    try {
      const testData = {
        user_id: 1, // Use a test user ID
        file_name: 'test.jpg',
        file_path: 'data:image/jpeg;base64,test',
        file_size: 100,
        mime_type: 'image/jpeg',
        is_active: true
      };
      
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('profile_pictures')
        .insert([testData])
        .select()
        .single();
      
      if (insertError) {
        console.error('Error inserting into profile_pictures:', insertError);
      } else {
        console.log('profile_pictures insert successful:', insertData.id);
        
        // Clean up test record
        await supabaseAdmin
          .from('profile_pictures')
          .delete()
          .eq('id', insertData.id);
      }
    } catch (err) {
      console.error('Exception inserting into profile_pictures:', err.message);
    }
    
    console.log('\n=== DEBUG COMPLETE ===');
    
  } catch (error) {
    console.error('Debug script error:', error);
  }
}

debugProfileUpdate().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Debug script failed:', error);
  process.exit(1);
});
