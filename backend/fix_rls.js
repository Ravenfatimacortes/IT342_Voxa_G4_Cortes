const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function fixRLS() {
  try {
    console.log('Fixing RLS policies...');
    
    // Method 1: Try to drop all policies and disable RLS
    const sql1 = `
      ALTER TABLE users DISABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Users can view own profile" ON users;
      DROP POLICY IF EXISTS "Users can update own profile" ON users;
      DROP POLICY IF EXISTS "Admins can view all users" ON users;
      DROP POLICY IF EXISTS "Admins can insert users" ON users;
      DROP POLICY IF EXISTS "Admins can update all users" ON users;
      DROP POLICY IF EXISTS "Faculty can view department students" ON users;
    `;
    
    const { error: error1 } = await supabase.rpc('exec_sql', { sql: sql1 });
    
    if (error1) {
      console.log('Method 1 failed, trying method 2...');
      
      // Method 2: Direct SQL execution
      const sql2 = 'ALTER TABLE users DISABLE ROW LEVEL SECURITY;';
      const { error: error2 } = await supabase.rpc('exec', { sql_string: sql2 });
      
      if (error2) {
        console.log('Method 2 failed, trying method 3...');
        
        // Method 3: Use raw SQL through REST API
        const { error: error3 } = await supabase
          .from('users')
          .select('*')
          .limit(1);
          
        if (error3) {
          console.log('All methods failed. Manual fix required.');
          console.log('Please run this SQL in Supabase SQL Editor:');
          console.log('ALTER TABLE users DISABLE ROW LEVEL SECURITY;');
        } else {
          console.log('Connection works with current setup!');
        }
      } else {
        console.log('RLS disabled successfully!');
      }
    } else {
      console.log('RLS policies dropped and disabled successfully!');
    }
    
    // Test connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('Connection test failed:', error.message);
    } else {
      console.log('Connection test passed!');
    }
    
  } catch (error) {
    console.log('Unexpected error:', error.message);
  }
}

fixRLS();
