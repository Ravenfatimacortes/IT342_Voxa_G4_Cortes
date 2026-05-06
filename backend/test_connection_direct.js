require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  try {
    console.log('Testing direct Supabase connection...');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing environment variables');
      console.log('SUPABASE_URL:', supabaseUrl ? '✓' : '❌');
      console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '❌');
      return false;
    }
    
    // Create admin client (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('✅ Configuration loaded');
    
    // Test connection
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful with service role key');
    console.log('✅ Database tables are accessible');
    
    // Test table existence
    const tables = ['users', 'surveys', 'questions', 'responses', 'answers', 'comments', 'likes'];
    
    for (const table of tables) {
      const { error: tableError } = await supabaseAdmin
        .from(table)
        .select('count')
        .limit(1);
      
      if (tableError) {
        console.log(`❌ Table '${table}' not accessible:`, tableError.message);
      } else {
        console.log(`✅ Table '${table}' accessible`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🔧 DIAGNOSIS: The issue is with RLS policies, not database connection.');
    console.log('📋 SOLUTION: Execute the fix_rls_recursion.sql script in your Supabase SQL editor');
    console.log('🌐 Go to: https://supabase.com/dashboard/project/bxuqpflqfhznlvvrsbas/sql');
    console.log('\n📝 STEPS:');
    console.log('1. Open the Supabase dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy and paste the contents of fix_rls_recursion.sql');
    console.log('4. Run the script');
    console.log('5. Restart your backend server');
  } else {
    console.log('\n❌ CRITICAL: Basic database connection failed');
  }
});
