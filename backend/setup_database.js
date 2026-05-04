const { supabaseAdmin } = require('./config/database');

async function setupDatabase() {
  try {
    console.log('Setting up database functions...');

    // Create the increment_response_count function
    const { error: functionError } = await supabaseAdmin.rpc('increment_response_count', { 
      survey_id_param: 1 
    });

    if (functionError && functionError.message.includes('function increment_response_count')) {
      console.log('Function does not exist, please run the database_functions.sql file manually');
      console.log('You can run it in your Supabase SQL editor:');
      console.log('1. Go to your Supabase project');
      console.log('2. Click on SQL Editor');
      console.log('3. Create a new query');
      console.log('4. Copy and paste the contents of database_functions.sql');
      console.log('5. Run the query');
    } else {
      console.log('Database function exists or was created successfully');
    }

    // Test basic connectivity
    const { data, error } = await supabaseAdmin
      .from('surveys')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Database connectivity error:', error);
    } else {
      console.log('Database connectivity verified');
    }

  } catch (error) {
    console.error('Setup error:', error);
  }
}

setupDatabase();
