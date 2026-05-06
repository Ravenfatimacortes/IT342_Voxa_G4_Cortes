const { supabaseAdmin } = require('./config/database');

async function testConnection() {
  try {
    console.log('Testing connection with service role key (bypasses RLS)...');
    
    // Test with admin client (bypasses RLS)
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
  } else {
    console.log('\n❌ CRITICAL: Basic database connection failed');
  }
});
