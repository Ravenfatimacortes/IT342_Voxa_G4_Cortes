const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function runFix() {
  try {
    console.log('Running profile update fix...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'fix_profile_update.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('Executing SQL:', sql);
    
    // Try to execute the SQL using Supabase's rpc function
    // Note: This might not work depending on your Supabase configuration
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      console.log('\n=== MANUAL INSTRUCTIONS ===');
      console.log('Please run the following SQL manually in your Supabase dashboard:');
      console.log('1. Go to your Supabase project');
      console.log('2. Navigate to the SQL Editor');
      console.log('3. Copy and paste the contents of fix_profile_update.sql');
      console.log('4. Run the SQL');
      console.log('\nOr use the Supabase CLI with:');
      console.log('supabase db push --file fix_profile_update.sql');
      return;
    }
    
    console.log('SQL executed successfully!');
    
    // Test if the table was created
    const { data: testData, error: testError } = await supabaseAdmin
      .from('profile_activity_log')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Table test failed:', testError);
    } else {
      console.log('✅ Table created and tested successfully!');
      console.log('Profile update should now work.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

runFix();
