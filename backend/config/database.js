const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Service role client bypasses RLS policies
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const connectDB = async () => {
  try {
    // Test connection by checking if we can access the database
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('Database connection error:', error);
      console.log('WARNING: Could not connect to Supabase. Please check your configuration!');
      return supabase;
    }
    
    console.log('Supabase Connected Successfully');
    return supabase;
  } catch (error) {
    console.error('Database connection error:', error);
    console.log('WARNING: Could not connect to Supabase. Please check your configuration!');
    return supabase;
  }
};

module.exports = { supabase, supabaseAdmin, connectDB, sequelize: null, DataTypes: null };
